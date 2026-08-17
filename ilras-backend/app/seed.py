"""
Seed the SQLite database with the same dummy pilot data used across
every prior sprint deliverable (Sprint 0-4), for continuity.
"""
from .database import Base, engine, SessionLocal
from .models import District, DimensionScore, Indicator

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

INDICATORS = [
    {"dimension_key": "infrastructure", "title": "Rasio Elektrifikasi Desa", "source": "BPS Podes", "updated": "Jun 2026", "confidence": "high"},
    {"dimension_key": "infrastructure", "title": "Cakupan Air Bersih", "source": "Data PUPR (proksi kabupaten)", "updated": "Mar 2026", "confidence": "medium"},
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
        for ind in INDICATORS:
            db.add(Indicator(**ind))
        db.commit()
        print(f"Seeded {len(DISTRICTS)} districts, {len(INDICATORS)} indicators.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
