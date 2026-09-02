"""
Seed the SQLite database with the same dummy pilot data used across
every prior sprint deliverable (Sprint 0-4), for continuity.
"""
from datetime import datetime, timezone
from .database import Base, engine, SessionLocal
from .models import District, DimensionScore, Indicator, DataSource

DISTRICTS = {
    "tapung": {
        "name": "Tapung",
        "lat": 0.5515, "lng": 101.0688, "geo_precision": "approximate",
        "dims": {"connectivity": 75, "accessibility": 60, "infrastructure": 55, "logistics": 65, "industrial": 80, "socio": 70, "risk": 85},
    },
    "siak-hulu": {
        "name": "Siak Hulu",
        "lat": 0.4200, "lng": 101.4200, "geo_precision": "approximate",
        "dims": {"connectivity": 88, "accessibility": 85, "infrastructure": 78, "logistics": 80, "industrial": 85, "socio": 82, "risk": 80},
    },
    "tambang": {
        "name": "Tambang",
        "lat": 0.4300, "lng": 101.2700, "geo_precision": "approximate",
        "dims": {"connectivity": 45, "accessibility": 35, "infrastructure": 30, "logistics": 32, "industrial": 35, "socio": 55, "risk": 48},
    },
}

# Real, verified sources -- no fabricated URLs or contact details.
# document_url is only set where a specific page was confirmed to
# exist (not a generic homepage); contact fields are only set where
# a specific phone/email was found in the source itself.
DATA_SOURCES = [
    {
        "agency": "BPS Kabupaten Kampar",
        "document_name": "Statistik Potensi Desa (Podes)",
        "document_url": "https://kamparkab.bps.go.id/id/publication.html",
        "source_type": "static",
        "contact_phone": "(0762) 20046",
        "contact_email": "bps1406@bps.go.id",
        "last_verified_at": datetime(2026, 6, 1, tzinfo=timezone.utc),
    },
    {
        "agency": "Kementerian PUPR \u2014 Satu Data PU",
        "document_name": "Kapasitas dan Layanan PDAM",
        "document_url": "https://data.pu.go.id/dataset/kapasitas-dan-layanan-pdam",
        "source_type": "api",
        "contact_phone": None,
        "contact_email": None,
        "last_verified_at": datetime(2026, 3, 1, tzinfo=timezone.utc),
    },
    {
        "agency": "OpenStreetMap Contributors",
        "document_name": "Data Jaringan Jalan (Overpass API)",
        "document_url": "https://www.openstreetmap.org/copyright",
        "source_type": "api",
        "contact_phone": None,
        "contact_email": None,
        "last_verified_at": datetime(2026, 8, 21, tzinfo=timezone.utc),
    },
    {
        "agency": "InaRisk BNPB",
        "document_name": "Indeks Risiko Bencana Indonesia (IRBI) \u2014 Bahaya Banjir",
        "document_url": "https://inarisk.bnpb.go.id/irbi",
        "source_type": "api",
        "contact_phone": None,
        "contact_email": None,
        "last_verified_at": datetime(2026, 8, 21, tzinfo=timezone.utc),
    },
    {
        "agency": "BPS Kabupaten Kampar",
        "document_name": "Kabupaten Kampar Dalam Angka 2025",
        "document_url": "https://kamparkab.bps.go.id/en/publication/2025/02/28/c2398f34858c851e102a8ba0/kabupaten-kampar-dalam-angka-2025.html",
        "source_type": "static",
        "contact_phone": "(0762) 20046",
        "contact_email": "bps1406@bps.go.id",
        "last_verified_at": datetime(2025, 2, 28, tzinfo=timezone.utc),
    },
]

INDICATORS = [
    {"dimension_key": "infrastructure", "title": "Rasio Elektrifikasi Desa", "source_index": 0},
    {"dimension_key": "infrastructure", "title": "Cakupan Air Bersih", "source_index": 1},
    {"dimension_key": "connectivity", "title": "Kepadatan Jaringan Jalan Utama", "source_index": 2},
    {"dimension_key": "risk", "title": "Indeks Bahaya Banjir", "source_index": 3},
    {"dimension_key": "socio", "title": "Kepadatan Penduduk", "source_index": 4},
    {"dimension_key": "socio", "title": "Angkatan Kerja", "source_index": 4},
]


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for district_id, data in DISTRICTS.items():
            db.add(District(
                id=district_id, name=data["name"], kabupaten="Kampar", provinsi="Riau",
                lat=data["lat"], lng=data["lng"], geo_precision=data["geo_precision"],
            ))
            for dim_key, score in data["dims"].items():
                db.add(DimensionScore(district_id=district_id, dimension_key=dim_key, score=score))

        sources = [DataSource(**s) for s in DATA_SOURCES]
        db.add_all(sources)
        db.flush()  # assign IDs before referencing them below

        for ind in INDICATORS:
            db.add(Indicator(
                dimension_key=ind["dimension_key"],
                title=ind["title"],
                source_id=sources[ind["source_index"]].id,
            ))

        db.commit()
        print(f"Seeded {len(DISTRICTS)} districts, {len(sources)} data sources, {len(INDICATORS)} indicators.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
