from datetime import datetime, timedelta, timezone
import json

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import District, GisLayerCache
from .. import gis_layers

router = APIRouter(prefix="/api/districts", tags=["gis-layers"])

CACHE_TTL = timedelta(days=7)  # road networks don't change often; avoid hammering Overpass


@router.get("/{district_id}/layers/roads")
async def get_roads_layer(district_id: str, db: Session = Depends(get_db)):
    district = db.get(District, district_id)
    if not district:
        raise HTTPException(status_code=404, detail=f'Kecamatan "{district_id}" tidak ditemukan')
    if district.lat is None or district.lng is None:
        raise HTTPException(status_code=422, detail="Kecamatan ini tidak memiliki data lokasi")

    cached = (
        db.query(GisLayerCache)
        .filter(GisLayerCache.district_id == district_id, GisLayerCache.layer_type == "roads")
        .order_by(GisLayerCache.fetched_at.desc())
        .first()
    )
    if cached and datetime.now(timezone.utc) - cached.fetched_at.replace(tzinfo=timezone.utc) < CACHE_TTL:
        return {"geojson": json.loads(cached.geojson), "cached": True, "fetched_at": cached.fetched_at}

    try:
        geojson = await gis_layers.fetch_osm_roads(district.lat, district.lng)
    except (httpx.HTTPError, httpx.TimeoutException) as e:
        # Degrade gracefully: if we have a stale cache, serve it anyway
        # rather than showing nothing. Only fail hard if we have never
        # successfully fetched this district before.
        if cached:
            return {"geojson": json.loads(cached.geojson), "cached": True, "stale": True, "fetched_at": cached.fetched_at}
        raise HTTPException(status_code=502, detail=f"Gagal mengambil data jalan dari OpenStreetMap: {e}")

    db.add(GisLayerCache(district_id=district_id, layer_type="roads", geojson=json.dumps(geojson)))
    db.commit()

    return {"geojson": geojson, "cached": False, "fetched_at": datetime.now(timezone.utc)}


@router.get("/{district_id}/layers/risk")
def get_risk_layer(district_id: str, db: Session = Depends(get_db)):
    district = db.get(District, district_id)
    if not district:
        raise HTTPException(status_code=404, detail=f'Kecamatan "{district_id}" tidak ditemukan')
    if district.lat is None or district.lng is None:
        raise HTTPException(status_code=422, detail="Kecamatan ini tidak memiliki data lokasi")

    return gis_layers.build_risk_overlay(district.lat, district.lng)
