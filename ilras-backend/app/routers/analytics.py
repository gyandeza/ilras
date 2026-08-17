from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..database import get_db
from ..models import District
from ..schemas import ComparisonResponse, ComparisonEntryOut, GapOut, DimensionLeaderOut
from .. import ilri
from .districts import _to_dims_dict

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/compare", response_model=ComparisonResponse)
def compare_districts(
    ids: str = Query(None, description="Comma-separated district ids. Omit to compare all districts."),
    db: Session = Depends(get_db),
):
    if ids:
        id_list = [i.strip() for i in ids.split(",") if i.strip()]
        districts = [db.get(District, i) for i in id_list]
        missing = [i for i, d in zip(id_list, districts) if d is None]
        if missing:
            raise HTTPException(status_code=404, detail=f'Kecamatan tidak ditemukan: {", ".join(missing)}')
    else:
        districts = db.execute(select(District)).scalars().all()

    if len(districts) < 2:
        raise HTTPException(status_code=400, detail="Perbandingan memerlukan minimal 2 kecamatan")

    entries = []
    for d in districts:
        dims = _to_dims_dict(d)
        score = ilri.calculate_score(dims)
        band = ilri.get_band(score)["label"]
        gap = ilri.gap_to_next_band(score)
        entries.append({
            "district": d, "dims": dims, "score": score, "band": band, "gap": gap,
        })

    scores = [e["score"] for e in entries]
    score_spread = round(max(scores) - min(scores), 2)

    dimension_analysis = []
    for dim in ilri.DIMENSIONS:
        key = dim["key"]
        ranked = sorted(entries, key=lambda e: e["dims"].get(key, 0), reverse=True)
        leader, laggard = ranked[0], ranked[-1]
        dimension_analysis.append(DimensionLeaderOut(
            dimension_key=key,
            dimension_label=dim["label"],
            leader_id=leader["district"].id,
            leader_name=leader["district"].name,
            leader_score=leader["dims"].get(key, 0),
            laggard_id=laggard["district"].id,
            laggard_name=laggard["district"].name,
            laggard_score=laggard["dims"].get(key, 0),
            spread=round(leader["dims"].get(key, 0) - laggard["dims"].get(key, 0), 2),
        ))

    return ComparisonResponse(
        districts=[
            ComparisonEntryOut(
                id=e["district"].id,
                name=e["district"].name,
                score=e["score"],
                band=e["band"],
                dims=e["dims"],
                gap_to_next_band=GapOut(**e["gap"]) if e["gap"] else None,
            )
            for e in entries
        ],
        dimension_analysis=dimension_analysis,
        score_spread=score_spread,
        methodology_version=ilri.METHODOLOGY_VERSION,
    )
