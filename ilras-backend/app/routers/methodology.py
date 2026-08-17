from fastapi import APIRouter

from ..schemas import MethodologyOut, DimensionWeightOut
from .. import ilri

router = APIRouter(prefix="/api/methodology", tags=["methodology"])


@router.get("", response_model=MethodologyOut)
def get_methodology():
    """
    Exposes the ILRI weighting methodology for transparency, per
    Constitution Section 11: "every weighting method must be transparent."
    This closes the "Explainable Score" gap properly -- not just what
    the score is, but why the weights are what they are.
    """
    return MethodologyOut(
        **ilri.METHODOLOGY,
        weights=[
            DimensionWeightOut(key=d["key"], label=d["label"], weight=round(d["weight"], 4))
            for d in ilri.DIMENSIONS
        ],
    )
