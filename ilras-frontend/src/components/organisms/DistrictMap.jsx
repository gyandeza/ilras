import { MapContainer, TileLayer, Marker, Popup, Polyline, ImageOverlay, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { getBandColor } from '../../lib/ilri.js';

function markerIcon(color, size = 26) {
  return L.divIcon({
    className: 'district-marker',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      border:3px solid #fff;box-shadow:0 2px 6px rgba(16,24,40,0.35);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const ROAD_COLORS = {
  motorway: '#B3261E',
  trunk: '#D2691E',
  primary: '#C98A1B',
  secondary: '#1B4B8F',
  tertiary: '#5B6472',
};

function FitBounds({ districts }) {
  const map = useMap();
  useEffect(() => {
    if (districts.length > 1) {
      const bounds = districts.map((d) => [d.lat, d.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [districts, map]);
  return null;
}

/**
 * @param {Array} districts - districts with {id, name, lat, lng, score, band, geo_precision}
 * @param {Function} onMarkerClick - optional, called with district id on marker click
 * @param {number} zoom - initial zoom when only one district present
 * @param {Array} roadLayers - optional, array of {districtId, geojson} for road overlays
 * @param {Array} riskLayers - optional, array of {districtId, image_url, bounds, disclaimer} for risk overlays
 * @param {Array} boundaries - optional, array of {districtId, feature, band} for real BIG boundary polygons.
 *   Districts WITHOUT a matching boundary here automatically keep showing
 *   their marker instead -- never silently hide a district.
 */
export default function DistrictMap({
  districts, onMarkerClick, zoom = 11, height = 260,
  roadLayers = [], riskLayers = [], boundaries = [],
}) {
  const valid = districts.filter((d) => d.lat != null && d.lng != null);
  if (valid.length === 0) {
    return (
      <div className="district-map__empty" style={{ height }}>
        Lokasi tidak tersedia
      </div>
    );
  }

  const center = [valid[0].lat, valid[0].lng];
  const boundaryIds = new Set(boundaries.map((b) => b.districtId));
  // A district only gets the "approximate" caveat if it has NO real
  // boundary polygon -- once BIG's boundary is loaded for a district,
  // that specific one is surveyed, even if others in the same view
  // still fall back to the marker representation.
  const hasApproximate = valid.some((d) => d.geo_precision !== 'surveyed' && !boundaryIds.has(d.id));
  const riskDisclaimer = riskLayers.find((r) => r.disclaimer)?.disclaimer;

  return (
    <div className="district-map">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%', borderRadius: 'var(--radius-card)' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {riskLayers.map((r) => (
          <ImageOverlay key={`risk-${r.districtId}`} url={r.image_url} bounds={r.bounds} opacity={0.55} />
        ))}

        {boundaries.map((b) => (
          <GeoJSON
            key={`boundary-${b.districtId}`}
            data={b.feature}
            style={{ color: getBandColor(b.band), weight: 2.5, fillOpacity: 0.12 }}
          />
        ))}

        {roadLayers.map((layer) =>
          (layer.geojson?.features ?? []).map((feature, i) => (
            <Polyline
              key={`road-${layer.districtId}-${i}`}
              positions={feature.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: ROAD_COLORS[feature.properties.highway] ?? '#5B6472',
                weight: feature.properties.highway === 'motorway' ? 3 : 2,
              }}
            >
              <Popup>{feature.properties.name || feature.properties.label}</Popup>
            </Polyline>
          ))
        )}

        {valid.length > 1 && <FitBounds districts={valid} />}
        {valid.map((d) => (
          <Marker
            key={d.id}
            position={[d.lat, d.lng]}
            icon={markerIcon(getBandColor(d.band))}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(d.id) } : undefined}
          >
            <Popup>
              <strong>{d.name}</strong>
              <br />
              Skor ILRI: {d.score?.toFixed(1)} ({d.band})
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {hasApproximate && (
        <div className="district-map__disclaimer">
          Lokasi bersifat perkiraan (titik pusat), bukan batas administratif hasil survei.
        </div>
      )}
      {boundaries.length > 0 && (
        <div className="district-map__disclaimer">
          Batas wilayah: Badan Informasi Geospasial (BIG), edisi 2022.
        </div>
      )}
      {riskDisclaimer && (
        <div className="district-map__disclaimer">{riskDisclaimer}</div>
      )}
    </div>
  );
}
