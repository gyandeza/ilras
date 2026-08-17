from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import District
from ..schemas import RecommendationOut, SwotOut, InvestmentTierOut
from .. import ilri
from .districts import _to_dims_dict

router = APIRouter(prefix="/api/districts", tags=["recommendation"])


@router.get("/{district_id}/recommendation", response_model=RecommendationOut)
def get_recommendation(district_id: str, db: Session = Depends(get_db)):
    district = db.get(District, district_id)
    if not district:
        raise HTTPException(status_code=404, detail=f'Kecamatan "{district_id}" tidak ditemukan')

    dims = _to_dims_dict(district)
    score = ilri.calculate_score(dims)
    band = ilri.get_band(score)["label"]

    return RecommendationOut(
        district_id=district_id,
        score=score,
        band=band,
        swot=SwotOut(**ilri.generate_swot(dims)),
        investment=InvestmentTierOut(**ilri.classify_investment_tier(score)),
        methodology_version=ilri.METHODOLOGY_VERSION,
    )
