from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base


class District(Base):
    __tablename__ = "districts"

    id = Column(String, primary_key=True)  # e.g. "tapung", "siak-hulu"
    name = Column(String, nullable=False)
    kabupaten = Column(String, default="Kampar")
    provinsi = Column(String, default="Riau")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    geo_precision = Column(String, default="approximate")  # "approximate" | "surveyed"

    dimension_scores = relationship("DimensionScore", back_populates="district", cascade="all, delete-orphan")


class DimensionScore(Base):
    __tablename__ = "dimension_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_id = Column(String, ForeignKey("districts.id"), nullable=False)
    dimension_key = Column(String, nullable=False)  # connectivity, accessibility, ...
    score = Column(Float, nullable=False)  # 0-100

    district = relationship("District", back_populates="dimension_scores")


class DataSource(Base):
    """
    Registry of primary government data sources (Essential Feature #3,
    Change Request). Every indicator must trace back to a real,
    identifiable source -- never a fabricated hyperlink. `document_url`
    is deliberately nullable: if no specific, verifiable document URL
    exists, leave it null and show "dokumen belum tersedia daring"
    rather than link to a generic agency homepage.
    """
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    agency = Column(String, nullable=False)  # e.g. "BPS Kabupaten Kampar"
    document_name = Column(String, nullable=False)  # e.g. "Statistik Potensi Desa (Podes)"
    document_url = Column(String, nullable=True)  # only set if a real, specific URL was verified
    source_type = Column(String, nullable=False)  # "api" | "static" | "manual"
    contact_phone = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    last_verified_at = Column(DateTime, nullable=False)  # drives auto-computed confidence, not manually set per-indicator

    indicators = relationship("Indicator", back_populates="source")

    @property
    def confidence(self) -> str:
        """
        Auto-computed from data age, per Roadmap #4 -- not a manually
        set flag that can silently go stale. <6 months = high,
        6-12 = medium, >12 months = low.
        """
        age_days = (datetime.now(timezone.utc) - self.last_verified_at.replace(tzinfo=timezone.utc)).days
        if age_days < 182:
            return "high"
        if age_days < 365:
            return "medium"
        return "low"


class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dimension_key = Column(String, nullable=False)
    title = Column(String, nullable=False)
    source_id = Column(Integer, ForeignKey("data_sources.id"), nullable=False)

    source = relationship("DataSource", back_populates="indicators")


class AuditLog(Base):
    """
    Per Sprint 0 FR-07: every score calculation must be logged with
    timestamp, data version, and methodology version.
    """
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    district_id = Column(String, nullable=False)
    action = Column(String, nullable=False)  # "score_view" | "simulate"
    input_json = Column(Text, nullable=True)
    result_score = Column(Float, nullable=False)
    methodology_version = Column(String, nullable=False)


class GisLayerCache(Base):
    """
    Caches external GIS API responses (e.g. Overpass road queries) so
    we don't hit rate-limited third-party services on every request.
    Not tied to the ILRI scoring engine -- purely a fetch cache.
    """
    __tablename__ = "gis_layer_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_id = Column(String, nullable=False)
    layer_type = Column(String, nullable=False)  # "roads"
    geojson = Column(Text, nullable=False)
    fetched_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
