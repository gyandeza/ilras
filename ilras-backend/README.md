# ILRAS Backend — Sprint 5

FastAPI + SQLite backend implementing the ILRI scoring engine as the
single source of truth for the whole system (the frontend no longer
calculates scores — see `ilras-frontend/src/lib/ilri.js`).

## Run locally

```bash
pip install -r requirements.txt
python -m app.seed        # creates ilras.db and seeds pilot data
python -m uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

## Endpoints

- `GET /api/health`
- `GET /api/districts` — list all districts (each includes score, band, and lat/lng)
- `GET /api/districts/{id}` — single district detail (logs an audit entry)
- `GET /api/districts/{id}/indicators?dimension=infrastructure`
- `POST /api/districts/{id}/simulate` — body `{"toll": bool, "hub": bool}`,
  re-enters the same scoring engine used everywhere else, logs an audit entry

## Geospatial data (Sprint 6)

District `lat`/`lng` are approximate centroids, not surveyed cadastral
boundaries. `geo_precision` is set to `"approximate"` on every seeded
district — the frontend displays a disclaimer whenever this flag is
present. Real administrative boundaries would come from BIG's WFS
service (confirmed accessible in Sprint 0's Data Source Strategy) but
integrating that is real scope for a later sprint, not a quick add.

## Analytics (Sprint 7)

`GET /api/analytics/compare?ids=a,b,c` (omit `ids` to compare all
districts) returns cross-district benchmarking: which district leads
and lags on each of the 7 dimensions, the score spread, and — per
district — how many points are needed to reach the next readiness
band (via `ilri.gap_to_next_band()`). This is genuinely new analysis,
not just the per-district scores already available from `/api/districts`.

## Weighting Methodology (Sprint 8)

Switched from arbitrary, undocumented weights (Connectivity 20%, Risk
10%, etc.) to **equal weighting** (1/7 per dimension). Rationale,
citations, known limitations, and the documented path to AHP-based
revision all live in `ilri.METHODOLOGY` and are exposed via
`GET /api/methodology`. See `app/ilri.py`'s module docstring for the
full research basis (World Bank LPI precedent, OECD/JRC Handbook on
Constructing Composite Indicators).

**This changed real outcomes, not just internals** — bumped
`METHODOLOGY_VERSION` to `ilri-v1.1-equal-weighting` (recorded in every
audit log entry going forward). Under the old weights, Tambang scored
39.1 ("Kurang Siap"); under equal weighting it scores 40.0 ("Cukup
Siap") — the exact same underlying dimension data now classifies
differently. This is disclosed prominently in the UI's new
"Metodologi Skoring" page, not buried in a changelog.

## Scenario Simulation (Sprint 9)

`/simulate` now accepts arbitrary per-dimension `overrides` (a dict of
`dimension_key -> new_value`) instead of the old hardcoded
`{toll, hub}` booleans. This is a breaking API change from Sprint
5/6/7/8 -- nothing else calls this endpoint besides the frontend also
in this repo, so it was safe to change directly rather than version.

`GET /districts/{id}/presets` returns raw per-dimension **deltas**
(`ilri.PRESETS`), not absolute values. This was a real bug fix during
this sprint: an earlier version returned base-relative absolute
snapshots, which silently overwrote unrelated dimensions when two
presets were applied in sequence (stacking "Hub" after "Toll" would
reset Toll's connectivity/accessibility gains back to base values).
Deltas applied client-side on top of *current* slider state fixed it.

## Recommendation Engine (Sprint 10)

`GET /districts/{id}/recommendation` returns SWOT (Strengths/
Weaknesses/Opportunities/Threats) and an Investment Priority tier.

**Deliberately NOT a new composite score.** Investment tier
classification (`ilri.classify_investment_tier`) uses only numbers
already computed and already justified in Sprint 8 (band + gap-to-
next-band) -- three rule-based tiers, not a newly invented weighted
formula. Inventing a second arbitrary scoring scheme here would have
undermined the entire point of Sprint 8's equal-weighting transparency
work.

SWOT similarly reuses existing computed values: Strengths/Weaknesses
are literally the top/bottom dimensions by raw score, Threats maps
directly onto the existing Risk dimension (a natural, honest fit --
no new logic), and Opportunity is a narrative built from the
already-existing `gap_to_next_band()` call.


## Architecture notes

- `app/ilri.py` is the ONLY place score calculation and band
  classification happen anywhere in the system. If the scoring
  methodology ever changes, this is the one file to touch — bump
  `METHODOLOGY_VERSION` when you do, since it's recorded in every
  audit log entry.
- `app/models.py` includes an `AuditLog` table per Sprint 0's FR-07.
  There's no viewer UI for it yet (that's Administration, a later
  sprint) but every score view and every simulation is already being
  recorded with timestamp and methodology version.
- CORS is currently open only to local dev ports. Revisit before
  Sprint 11 (Deployment).
- No authentication yet — Sprint 0 flagged government SSO as an open
  question that was never answered. Endpoints are unauthenticated.
  Do not deploy this publicly as-is.

## Not yet in this sprint

- PostgreSQL/PostGIS migration (Constitution §8 lists this as future work)
- GIS Engine data (Sprint 6)
- Administration endpoints for indicator weight management (FR-09)

## Change Request — Lapisan Tematik GIS (pasca-Sprint 11)

Menyelesaikan RT-01 (dibuka Sprint 0, dinilai ulang di sini setelah
konteks berubah -- API pemerintah yang sebelumnya belum diverifikasi
kini dikonfirmasi live dan dapat diakses).

**Hasil riset RT-01:**
- **Jalan**: kelayakan tinggi. `app/gis_layers.py` memanggil Overpass
  API (OpenStreetMap) secara real-time, hasil di-cache 7 hari di tabel
  `gis_layer_cache` agar tidak membebani layanan pihak ketiga.
- **Zona Risiko**: kelayakan sedang-tinggi. Overlay gambar dikonstruksi
  langsung dari endpoint ArcGIS ImageServer InaRisk BNPB
  (`gis.bnpb.go.id`), lapisan default: Indeks Bahaya Banjir. Disclaimer
  resmi BNPB WAJIB ditampilkan bersama layer ini (sudah diimplementasikan).
- **Kawasan Industri**: TETAP belum terselesaikan untuk akses otomatis.
  Data ada (portal `sepat.riau.go.id/mapki`, sistem SPIN Kemenperin)
  tapi diblokir robots.txt, tanpa API publik yang ditemukan. Jalan ke
  depan: permintaan data formal ke Disperindag Riau, atau kurasi manual
  untuk 3 kecamatan pilot (bukan data fiktif yang terlihat otentik).

**KETERBATASAN PENTING:** endpoint `/layers/roads` dan `/layers/risk`
melakukan panggilan jaringan keluar ke layanan pihak ketiga saat
runtime. Ini TIDAK BISA diuji dari sandbox pengembangan Anthropic
(egress jaringan dibatasi di sana) -- endpoint risiko sudah diverifikasi
bekerja (hanya konstruksi URL, tidak perlu jaringan keluar saat
diuji), tapi endpoint jalan HARUS diverifikasi ulang setelah deploy ke
Render, di mana server punya akses internet normal.

## Essential Feature #1 — Batas Administratif Riil (pasca Change Request GIS)

Endpoint baru: `GET /districts/{id}/boundary`, menarik poligon batas
kecamatan RIIL dari BIG (Badan Informasi Geospasial), bukan lagi
titik pusat + kotak perkiraan.

**Verifikasi yang sudah dilakukan (level skema, bukan eksekusi live):**
- Endpoint dikonfirmasi: `Administrasi_AR_Kecamatan_10K/MapServer/0`
  ("data batas wilayah administrasi kecamatan edisi tahun 2022" --
  deskripsi resmi dari layanan BIG sendiri)
- Field `WADMKC`/`WADMKK`/`WADMPR` dikonfirmasi ADA di layer ini
  secara langsung (bukan diasumsikan dari layanan sejenis)
- Geometry type: esriGeometryPolygon, Spatial Reference: 4326 (WGS84)
  -- selaras langsung dengan lat/lng yang sudah dipakai di seluruh
  sistem, tidak perlu reproyeksi
- Mendukung SQL expression (WHERE clause) dan output geoJSON langsung

**BELUM diverifikasi (perlu dicek setelah deploy):** hasil query
sesungguhnya. Sandbox pengembangan tidak bisa menjangkau
`geoservices.big.go.id` (403 dari proxy jaringan sandbox, sama seperti
Overpass dan InaRisk). Kalau setelah deploy hasil query kosong,
kemungkinan penyebab: penulisan nama kecamatan/kabupaten di BIG tidak
persis sama dengan yang ada di `seed.py` (mis. "Kec. Tapung" vs
"Tapung") -- bukan endpoint yang salah.

**Desain fallback:** kalau BIG tidak punya data untuk kecamatan
tertentu, endpoint mengembalikan 404 dengan pesan jelas -- frontend
otomatis kembali ke representasi titik+kotak perkiraan yang sudah ada,
tidak pernah menyembunyikan kecamatan begitu saja.


## Essential Feature #3 — Registry Sumber Data & Hyperlink (pasca Change Request Boundary)

Model `DataSource` baru menggantikan field datar `source`/`updated`/
`confidence` di `Indicator` dengan struktur registry riil:
`agency, document_name, document_url (nullable), contact_phone,
contact_email, last_verified_at`.

**Prinsip kejujuran yang dipegang saat seed data:**
- `document_url` HANYA diisi kalau URL spesifik yang riil ditemukan
  lewat riset -- bukan homepage generik dinas. Contoh: BPS Kabupaten
  Kampar (`kamparkab.bps.go.id`) dan dataset spesifik Kementerian PUPR
  (`data.pu.go.id/dataset/kapasitas-dan-layanan-pdam`), keduanya
  dikonfirmasi nyata lewat pencarian, bukan dikarang.
- Kontak (`contact_phone`/`contact_email`) HANYA diisi kalau ditemukan
  eksplisit di sumber (BPS Kampar punya nomor telepon dan email publik
  yang dikonfirmasi; PUPR tidak, jadi dibiarkan `null`, bukan diisi
  placeholder).

**Confidence badge sekarang otomatis** (`DataSource.confidence`,
computed property, bukan kolom manual): <6 bulan sejak
`last_verified_at` = tinggi, 6-12 bulan = sedang, >12 bulan = rendah.
Ini menutup Roadmap #4 (badge kepercayaan diperluas & otomatis)
sekaligus, karena keduanya saling terkait langsung.

## Roadmap #1, #2, #3 — Timeline, Ekspor PDF, Ringkasan Eksekutif (pasca Essential #3)

`GET /districts/{id}/history` menyurfacekan `audit_log` sebagai timeline
terbaca -- dibatasi 20 entri terbaru, dengan label bahasa Indonesia.
Satu enrichment ditambahkan (bukan sekadar tampilan mentah): setiap
entri menandai `methodology_changed` kalau `methodology_version`-nya
berbeda dari entri sebelumnya secara kronologis -- ini menangkap momen
seperti perubahan bobot setara di Sprint 8 secara otomatis, tanpa perlu
tabel/logika terpisah untuk mencatat perubahan metodologi secara eksplisit.

Ekspor PDF dan Ringkasan Eksekutif keduanya diimplementasikan di
frontend (client-side, lihat README frontend) -- tidak perlu perubahan
backend tambahan karena semua data yang dibutuhkan sudah tersedia dari
endpoint yang ada (`/districts/{id}` dan `/districts/{id}/recommendation`).

## Perbaikan Layer Jalan + Essential #2 (pasca Roadmap #1-3)

**Perbaikan robustness layer Jalan:** riset menemukan `overpass-api.de`
punya insiden reliabilitas terdokumentasi di Agustus 2026 (timeout
koneksi berulang, DAN pola penolakan 406 yang bersifat *stateful* --
retry ke server yang SAMA tidak membantu kalau klien sudah
dikategorikan). `fetch_osm_roads()` sekarang mencoba
`overpass-api.de` lalu failover ke `overpass.kumi.systems` (mirror
publik dengan sumber daya kuat, tidak perlu registrasi) sebelum
menyerah. Diverifikasi di sandbox: error yang muncul berasal dari
mirror KEDUA, mengonfirmasi keduanya benar-benar dicoba.

**Essential Feature #2 (dimulai, bukan selesai):** 2 dimensi baru
mendapat indikator riil dengan sumber terverifikasi:
- Konektivitas: "Kepadatan Jaringan Jalan Utama" -- sumber OpenStreetMap
  Contributors, link ke `openstreetmap.org/copyright` (halaman atribusi
  resmi OSM, bukan homepage generik)
- Risiko: "Indeks Bahaya Banjir" -- sumber InaRisk BNPB, link ke
  `inarisk.bnpb.go.id/irbi` (dashboard IRBI resmi, dikonfirmasi lewat
  pencarian, bukan endpoint API mentah yang sudah dipakai untuk overlay
  peta)

Kedua dimensi ini dipilih karena SUDAH punya fondasi data riil dari
Change Request GIS sebelumnya (Overpass untuk jalan, InaRisk untuk
risiko) -- bukan pilihan sembarangan. 5 dimensi lain (Aksesibilitas,
Logistik, Potensi Industri, Sosial Ekonomi, dan Infrastruktur yang
masih perlu 1 indikator lagi) masih menunggu riset sumber data di CR
berikutnya, satu atau dua dimensi per CR sesuai rencana semula.
