# ILRAS Frontend — Sprint 10 updated

React + Vite implementation of the Sprint 1 Design System, Sprint 2
Information Architecture, now with a real GIS layer (Sprint 6).

## Run locally

Requires the backend running first (see `ilras-backend/README.md`).

```bash
npm install
npm run dev
```

By default the frontend calls `http://localhost:8000`. To point at a
different backend, set `VITE_API_BASE_URL` in a `.env` file.

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── components/
│   ├── atoms/          ScoreRing, BandPill, Button
│   ├── molecules/       DistrictCard, DimensionBar, IndicatorItem,
│   │                     CompareBar, RecommendationItem
│   └── organisms/       Sidebar, TopBar, DistrictMap (Leaflet + OSM)
├── layout/              AppLayout (shell), DistrictContext (shared state)
├── pages/               DashboardPage, DistrictDetailPage, SimulationPage,
│                         GISExplorerPage, ComparisonPage, MethodologyPage
├── lib/
│   ├── ilri.js            display-only metadata -- scoring lives in the
│   │                       backend exclusively (see Sprint 5 notes)
│   └── dataService.js     real fetch() calls to the FastAPI backend
└── styles/tokens.css      Design tokens ported 1:1 from Sprint 1
```

## Sprint 6 notes (GIS Engine)

- `DistrictMap` uses `react-leaflet` + OpenStreetMap tiles (per
  Constitution Section 8's tech stack), with custom circle markers
  colored by readiness band instead of Leaflet's default pin icon.
- District coordinates are approximate centroids, not surveyed
  boundaries -- the map always shows a disclaimer when
  `geo_precision !== "surveyed"`.
- The "Peta" (GIS Explorer) screen is now enabled in the sidebar. It
  shows all districts, auto-fits the map to their bounds, and both
  markers and the legend navigate to District Detail on click.
- Thematic overlay layers (roads, risk zones, industrial estates) from
  Sprint 2's original IA spec are explicitly NOT included yet -- the
  GIS Explorer page says so directly, tying back to the Infrastructure
  & Logistics data-feasibility gap (RT-01) opened in Sprint 0 and never
  closed out. Don't add fake overlay data here; resolve RT-01 first.
- Perbandingan Kecamatan (Comparison), Laporan (Reports), and
  Administrasi remain disabled nav placeholders.

## Sprint 7 notes (Analytics Engine)

- "Perbandingan Kecamatan" is now enabled in the sidebar, calling the
  backend's `/api/analytics/compare` endpoint.
- Defaults to comparing all 3 pilot districts -- no district picker
  UI was built since a picker is unnecessary complexity when the full
  pilot set is only 3 districts.
- Shows per-district "gap to next readiness band" and a per-dimension
  leader/laggard table -- both computed server-side, not derived from
  raw scores client-side, keeping the single-source-of-truth rule intact.
- Laporan (Reports) and Administrasi remain disabled nav placeholders.

## Sprint 8 notes (ILRI Engine -- weighting methodology)

- "Metodologi Skoring" is now enabled in the sidebar under a new
  TRANSPARANSI section -- calls `GET /api/methodology` and displays
  the full rationale, citations, known limitations, and future path.
- All scores across the entire app shifted when the backend switched
  to equal weighting -- this is expected and correct, not a bug. If
  numbers look different from earlier screenshots in this repo's
  history, that's the methodology change working as intended.
- Laporan and Administrasi remain disabled nav placeholders.

## Sprint 9 notes (Scenario Simulation -- general what-if)

- SimulationPage now has 7 sliders (one per dimension) instead of 2
  hardcoded checkboxes. The original toll/hub scenarios are kept as
  quick-apply preset buttons, but they now correctly STACK on current
  slider state (a real bug was found and fixed here -- see backend
  README for details) rather than resetting other dimensions.
- Slider changes are debounced ~350ms before calling the backend --
  dragging a slider doesn't spam /simulate or flood the audit trail.
- Recommendations are now generated from whatever dimensions actually
  moved (top 3 by delta), not hardcoded to recognize only 2 specific
  scenarios.
- Laporan and Administrasi remain disabled nav placeholders.

## Sprint 10 notes (Recommendation Engine)

- District Detail now shows a "Rekomendasi & Prioritas Investasi"
  panel: an investment tier badge + rationale, plus a 4-quadrant SWOT
  grid, all sourced from `GET /districts/{id}/recommendation`.
- Every SWOT item cites a real number (dimension score) -- no generic
  consultant-speak filler. This was a deliberate design constraint,
  not an accident.
- Laporan and Administrasi remain disabled nav placeholders.
