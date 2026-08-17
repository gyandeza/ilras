from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..database import get_db
from ..models import District, DimensionScore, Indicator, AuditLog
from ..schemas import DistrictOut, IndicatorOut
from .. import ilri

router = APIRouter(prefix="/api/districts", tags=["districts"])


def _to_dims_dict(district: District) -> dict:
    return {ds.dimension_key: ds.score for ds in district.dimension_scores}


def _to_district_out(district: District, db: Session, log_action: bool = False) -> DistrictOut:
    dims = _to_dims_dict(district)
    score = ilri.calculate_score(dims)
    band = ilri.get_band(score)

    if log_action:
        db.add(AuditLog(
            district_id=district.id,
            action="score_view",
            input_json=None,
            result_score=score,
            methodology_version=ilri.METHODOLOGY_VERSION,
        ))
        db.commit()

    return DistrictOut(
        id=district.id,
        name=district.name,
        kabupaten=district.kabupaten,
        provinsi=district.provinsi,
        dims=dims,
        score=score,
        band=band["label"],
        lat=district.lat,
        lng=district.lng,
        geo_precision=district.geo_precision,
    )


@router.get("", response_model=list[DistrictOut])
def list_districts(db: Session = Depends(get_db)):
    districts = db.execute(select(District)).scalars().all()
    return [_to_district_out(d, db) for d in districts]


@router.get("/{district_id}", response_model=DistrictOut)
def get_district(district_id: str, db: Session = Depends(get_db)):
    district = db.get(District, district_id)
    if not district:
        raise HTTPException(status_code=404, detail=f'Kecamatan "{district_id}" tidak ditemukan')
    return _to_district_out(district, db, log_action=True)


@router.get("/{district_id}/indicators", response_model=list[IndicatorOut])
def get_indicators(district_id: str, dimension: str, db: Session = Depends(get_db)):
    district = db.get(District, district_id)
    if not district:
        raise HTTPException(status_code=404, detail=f'Kecamatan "{district_id}" tidak ditemukan')
    indicators = db.execute(
        select(Indicator).where(Indicator.dimension_key == dimension)
    ).scalars().all()
    return indicators
