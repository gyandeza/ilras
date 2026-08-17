import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..database import get_db
from ..models import District, AuditLog
from ..schemas import SimulationRequest, SimulationResponse, ScenarioResult
from .. import ilri
from .districts import _to_dims_dict

router = APIRouter(prefix="/api/districts", tags=["simulation"])


@router.get("/{district_id}/presets")
def get_presets(district_id: str, db: Session = Depends(get_db)):
    """
    Returns the raw per-dimension deltas for each named preset, so the
    frontend can apply them on top of whatever the CURRENT slider
    state is (which may already include a previous preset or manual
    adjustments) -- not a base-relative absolute snapshot, which would
    silently overwrite unrelated dimensions when two presets stack.
    """
    district = db.get(District, district_id)
    if not district:
        raise HTTPException(status_code=404, detail=f'Kecamatan "{district_id}" tidak ditemukan')
    return ilri.PRESETS


@router.post("/{district_id}/simulate", response_model=SimulationResponse)
def simulate(district_id: str, payload: SimulationRequest, db: Session = Depends(get_db)):
    district = db.get(District, district_id)
    if not district:
        raise HTTPException(status_code=404, detail=f'Kecamatan "{district_id}" tidak ditemukan')

    before_dims = _to_dims_dict(district)
    before_score = ilri.calculate_score(before_dims)
    before_band = ilri.get_band(before_score)["label"]

    after_dims = ilri.apply_overrides(before_dims, payload.overrides)
    after_score = ilri.calculate_score(after_dims)
    after_band = ilri.get_band(after_score)["label"]

    # Audit trail: every simulation is logged (Sprint 0 FR-07)
    db.add(AuditLog(
        district_id=district_id,
        action="simulate",
        input_json=json.dumps(payload.overrides),
        result_score=after_score,
        methodology_version=ilri.METHODOLOGY_VERSION,
    ))
    db.commit()

    return SimulationResponse(
        district_id=district_id,
        before=ScenarioResult(dims=before_dims, score=before_score, band=before_band),
        after=ScenarioResult(dims=after_dims, score=after_score, band=after_band),
        delta=round(after_score - before_score, 2),
        methodology_version=ilri.METHODOLOGY_VERSION,
    )
