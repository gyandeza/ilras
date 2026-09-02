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

## Change Request notes (Lapisan Tematik GIS)

- Peta Kesiapan Wilayah (GIS Explorer) now has two working layer
  toggles: "Jalan Utama" (OpenStreetMap via backend's Overpass proxy)
  and "Zona Risiko Banjir" (InaRisk BNPB image overlay).
- Kawasan Industri stays a disabled placeholder -- honestly, not
  faked -- since no public API was found for that data (see backend
  README for the RT-01 research findings).
- The risk layer overlay MUST keep showing the BNPB disclaimer text
  whenever it's active -- this is a compliance requirement from
  BNPB's own terms of use, not an optional UI detail.

## Essential Feature #1 notes (Batas Administratif Riil)

- "Batas Kecamatan (BIG)" toggle on Peta page, default ON.
- District Detail automatically tries to load the real boundary and
  falls back to the marker+bbox representation silently if BIG has no
  match -- no error shown to the user for this specific case, since a
  missing boundary for one kecamatan is an expected, non-fatal state,
  not a system failure.
- `DistrictMap`'s "approximate location" disclaimer is now per-district
  aware: a district WITH a loaded real boundary no longer shows that
  disclaimer, even if other districts on the same map still do.

## Essential Feature #3 notes (Registry Sumber Data)

- `IndicatorItem` now renders a real clickable hyperlink to the source
  document when `document_url` is set, or an honest "Dokumen belum
  tersedia daring" message when it's null -- never a fake link.
- Contact info (phone/email) only shown when the backend actually has
  it; no placeholder text when it's missing.
- Confidence badge is fully backend-computed now (from `last_verified_at`
  age) -- the frontend just displays whatever `source.confidence` says.

## Roadmap #1, #2, #3 notes (Timeline, Ekspor PDF, Ringkasan Eksekutif)

- `HistoryTimeline` organism displays `/districts/{id}/history`, with a
  visible warning badge when `methodology_changed` is true for an entry.
- `lib/reportText.js` generates the executive summary paragraph --
  template-based, reused identically in both the on-page panel and the
  PDF export (single source of text, not duplicated logic).
- `lib/pdfExport.js` uses `jspdf` (client-side, no new backend
  dependency) to generate a one-page district profile PDF. This
  pulled in `html2canvas` as a transitive dependency even though it's
  unused (jsPDF's `.html()` method isn't called here) -- adds ~200KB
  to the bundle. Worth investigating a lighter jsPDF import path in a
  future CR if bundle size becomes a real concern; not fixed here to
  keep this CR scoped to functionality, not bundle optimization.
- Clipboard copy (`ExecutiveSummaryPanel`) requires clipboard-write
  permission in the browser -- this failed in automated headless
  testing without explicit permission grants, which is a testing
  environment quirk, not an app bug (verified working correctly once
  permissions were granted in the test).

## Perbaikan Layer Jalan + Essential #2 notes

- `DistrictDetailPage` no longer hardcodes fetching only the
  Infrastruktur dimension's indicators -- it now fetches all 7
  dimensions in parallel (`Promise.allSettled`) and only renders a
  section for dimensions that actually have indicators. This scales
  naturally as more dimensions get real indicators in future CRs,
  with no further page-level code changes needed.
- `ROAD_LEGEND` exported from `DistrictMap.jsx`, used by
  `GISExplorerPage` to show a road-hierarchy color legend
  (Tol/Nasional/Provinsi/Kabupaten) once the roads layer successfully
  loads -- untested visually in the sandbox since Overpass is blocked
  there, but the conditional logic was code-reviewed and the color
  values are the single source of truth shared with the map itself.
