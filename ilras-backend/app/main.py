import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import districts, simulate, analytics, methodology, recommendation

app = FastAPI(
    title="ILRAS API",
    description="Industrial Logistics Readiness Assessment System — backend API",
    version="0.1.0",
)

# Local dev origins are always allowed. Add production frontend URLs via
# the ALLOWED_ORIGINS env var (comma-separated) -- e.g. on Render:
#   ALLOWED_ORIGINS=https://ilras-frontend.onrender.com
_dev_origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:4174",
    "http://localhost:4175",
]
_extra_origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_dev_origins + _extra_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(districts.router)
app.include_router(simulate.router)
app.include_router(analytics.router)
app.include_router(methodology.router)
app.include_router(recommendation.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
