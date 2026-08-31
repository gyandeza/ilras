from pydantic import BaseModel
from typing import Dict


class DistrictOut(BaseModel):
    id: str
    name: str
    kabupaten: str
    provinsi: str
    dims: Dict[str, float]
    score: float
    band: str
    lat: float | None = None
    lng: float | None = None
    geo_precision: str = "approximate"


class DataSourceOut(BaseModel):
    agency: str
    document_name: str
    document_url: str | None = None
    source_type: str
    contact_phone: str | None = None
    contact_email: str | None = None
    last_verified_at: object  # datetime, serialized by pydantic automatically
    confidence: str  # computed property on the ORM model, not a stored field

    class Config:
        from_attributes = True


class IndicatorOut(BaseModel):
    title: str
    source: DataSourceOut

    class Config:
        from_attributes = True


class SimulationRequest(BaseModel):
    overrides: Dict[str, float] = {}


class ScenarioResult(BaseModel):
    dims: Dict[str, float]
    score: float
    band: str


class SimulationResponse(BaseModel):
    district_id: str
    before: ScenarioResult
    after: ScenarioResult
    delta: float
    methodology_version: str


class DimensionLeaderOut(BaseModel):
    dimension_key: str
    dimension_label: str
    leader_id: str
    leader_name: str
    leader_score: float
    laggard_id: str
    laggard_name: str
    laggard_score: float
    spread: float


class GapOut(BaseModel):
    points_needed: float
    next_band: str


class ComparisonEntryOut(BaseModel):
    id: str
    name: str
    score: float
    band: str
    dims: Dict[str, float]
    gap_to_next_band: GapOut | None


class ComparisonResponse(BaseModel):
    districts: list[ComparisonEntryOut]
    dimension_analysis: list[DimensionLeaderOut]
    score_spread: float
    methodology_version: str


class DimensionWeightOut(BaseModel):
    key: str
    label: str
    weight: float


class MethodologyOut(BaseModel):
    version: str
    method: str
    method_id: str
    summary: str
    rationale: list[str]
    known_limitation: str
    future_path: str
    sources: list[str]
    weights: list[DimensionWeightOut]


class SwotDimensionOut(BaseModel):
    label: str
    score: float


class SwotThreatOut(BaseModel):
    label: str
    score: float
    interpretation: str


class SwotOut(BaseModel):
    strengths: list[SwotDimensionOut]
    weaknesses: list[SwotDimensionOut]
    threats: SwotThreatOut
    opportunity: str


class InvestmentTierOut(BaseModel):
    tier: str
    rationale: str


class RecommendationOut(BaseModel):
    district_id: str
    score: float
    band: str
    swot: SwotOut
    investment: InvestmentTierOut
    methodology_version: str


class HistoryEntryOut(BaseModel):
    timestamp: object  # datetime
    action: str  # "score_view" | "simulate"
    action_label: str  # human-readable Indonesian label
    result_score: float
    methodology_version: str
    methodology_changed: bool  # True if this entry's methodology_version differs from the immediately preceding entry
