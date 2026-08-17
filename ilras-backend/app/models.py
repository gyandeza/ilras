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


class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dimension_key = Column(String, nullable=False)
    title = Column(String, nullable=False)
    source = Column(String, nullable=False)
    updated = Column(String, nullable=False)
    confidence = Column(String, nullable=False)  # high | medium | low


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
