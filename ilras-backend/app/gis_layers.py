"""
ILRAS — GIS Thematic Layers (Change Request, post-Sprint 11)

Resolves RT-01 (opened Sprint 0, revisited here): fetches REAL road
network data from OpenStreetMap and constructs REAL risk-hazard image
overlays from BNPB's InaRisk service. Kawasan Industri (industrial
estates) is deliberately NOT included here -- see RT-01 notes in this
module's docstring for why.

IMPORTANT: this module makes outbound HTTP calls to third-party
government/OSM infrastructure at runtime. It cannot be tested from
Anthropic's sandboxed dev environment (network egress is restricted
there, same limitation as the OSM map tiles in Sprint 6) -- verify
this actually works after deploying, where the server has normal
internet access.
"""
import httpx

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
INARISK_BASE = "https://gis.bnpb.go.id/server/rest/services/inarisk"

# Only major road classes -- residential/service roads would be too
# dense to render usefully at district scale and would slow the query.
ROAD_CLASSES = ["motorway", "trunk", "primary", "secondary", "tertiary"]

ROAD_CLASS_LABELS = {
    "motorway": "Tol / Bebas Hambatan",
    "trunk": "Jalan Nasional",
    "primary": "Jalan Provinsi",
    "secondary": "Jalan Kabupaten (Sekunder)",
    "tertiary": "Jalan Kabupaten (Tersier)",
}


def district_bbox(lat: float, lng: float, buffer_deg: float = 0.08) -> tuple[float, float, float, float]:
    """
    Approximate bounding box around a district centroid. This is NOT
    a surveyed administrative boundary -- same "approximate" caveat
    that already applies to the centroid itself (Sprint 6). Returns
    (south, west, north, east).
    """
    return (lat - buffer_deg, lng - buffer_deg, lat + buffer_deg, lng + buffer_deg)


async def fetch_osm_roads(lat: float, lng: float) -> dict:
    """
    Queries Overpass API for major roads within the district's
    approximate bounding box. Returns a GeoJSON FeatureCollection.
    Raises httpx.HTTPError / httpx.TimeoutException on failure --
    callers should catch and degrade gracefully (empty layer + a
    clear "unavailable" state), not crash the whole district view.
    """
    south, west, north, east = district_bbox(lat, lng)
    class_filter = "|".join(ROAD_CLASSES)
    query = f"""
    [out:json][timeout:25];
    (
      way["highway"~"^({class_filter})$"]({south},{west},{north},{east});
    );
    out geom;
    """
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(OVERPASS_URL, data={"data": query})
        resp.raise_for_status()
        data = resp.json()

    features = []
    for element in data.get("elements", []):
        if element.get("type") != "way" or "geometry" not in element:
            continue
        highway_class = element.get("tags", {}).get("highway", "unknown")
        coords = [[pt["lon"], pt["lat"]] for pt in element["geometry"]]
        features.append({
            "type": "Feature",
            "geometry": {"type": "LineString", "coordinates": coords},
            "properties": {
                "highway": highway_class,
                "label": ROAD_CLASS_LABELS.get(highway_class, highway_class),
                "name": element.get("tags", {}).get("name"),
            },
        })

    return {"type": "FeatureCollection", "features": features}


# Flood hazard chosen as the default risk layer -- most broadly
# relevant hazard across Riau's lowland geography, and explicitly
# named in Sprint 0's indicator list for the Risk dimension. Other
# InaRisk layers (landslide, forest/land fire -- karhutla, relevant to
# Riau's peatland areas) exist at the same base URL and are a natural
# follow-up, deliberately not built into this Change Request to keep
# scope tight.
RISK_LAYER_ENDPOINT = f"{INARISK_BASE}/layer_bahaya_banjir/ImageServer/exportImage"

INARISK_DISCLAIMER = (
    "Data dan informasi ini hanya menggambarkan lokasi relatif dan tidak "
    "dapat digunakan untuk tujuan hukum atau rekayasa sipil. Sumber: InaRisk, BNPB."
)


def build_risk_overlay(lat: float, lng: float) -> dict:
    """
    Constructs an ArcGIS ImageServer exportImage URL for the district's
    approximate bounding box. Requesting bboxSR=4326/imageSR=4326
    explicitly asks the ArcGIS server to reproject into standard
    WGS84 lat/lng on its end, so the frontend can overlay it on a
    Leaflet map directly without any client-side reprojection math.
    """
    south, west, north, east = district_bbox(lat, lng)
    params = (
        f"bbox={west},{south},{east},{north}"
        "&bboxSR=4326&imageSR=4326&size=512,512&format=png32&f=image"
    )
    return {
        "image_url": f"{RISK_LAYER_ENDPOINT}?{params}",
        "bounds": [[south, west], [north, east]],  # Leaflet-style [[southLat,westLng],[northLat,eastLng]]
        "source": "InaRisk BNPB \u2014 Indeks Bahaya Banjir",
        "disclaimer": INARISK_DISCLAIMER,
    }


# --- Essential Feature #1 (Change Request): real administrative boundaries ---
#
# BIG (Badan Informasi Geospasial) publishes an official kecamatan-level
# polygon boundary service. VERIFIED directly against this exact layer's
# own field schema (not inferred from a sibling service): geometry type
# esriGeometryPolygon, spatial reference 4326 (WGS84 -- no reprojection
# needed), fields WADMKC/WADMKK/WADMPR confirmed present, SQL expressions
# and geoJSON output format both confirmed supported.
#
# Service: "Data batas wilayah administrasi kecamatan edisi tahun 2022,
# bersumber dari data batas wilayah administrasi desa/kelurahan edisi
# 2022 yang disatukan." -- BIG's own service description.
#
# NOT yet runtime-verified: the actual query response (sandbox network
# restriction prevents executing the live HTTP call, same limitation as
# every other external call in this project). Schema-level verification
# is strong, but confirm the first real query after deploying.
BIG_KECAMATAN_SERVICE = (
    "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/"
    "Administrasi_AR_Kecamatan_10K/MapServer/0/query"
)


async def fetch_kecamatan_boundary(name: str, kabupaten: str) -> dict | None:
    """
    Queries BIG for the real administrative boundary polygon of a
    kecamatan. Returns a GeoJSON Feature, or None if no match was
    found (caller should fall back to the approximate centroid+bbox
    representation already used elsewhere in the GIS module -- never
    silently show nothing where a boundary was expected).
    """
    where_clause = f"UPPER(WADMKC)=UPPER('{name}') AND UPPER(WADMKK) LIKE UPPER('%{kabupaten}%')"
    params = {
        "where": where_clause,
        "outFields": "WADMKC,WADMKK,WADMPR",
        "f": "geojson",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(BIG_KECAMATAN_SERVICE, params=params)
        resp.raise_for_status()
        data = resp.json()

    features = data.get("features", [])
    if not features:
        return None
    return features[0]
