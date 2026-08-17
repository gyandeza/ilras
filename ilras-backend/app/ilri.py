"""
ILRAS — ILRI Scoring Engine (Backend)

This is now the ONLY place in the entire system where composite ILRI
scores and readiness bands are calculated. Per project constitution:
"Single-source-of-truth ILRI scoring engine — Scenario Simulation
re-enters the same engine, not a parallel path."

The frontend previously duplicated this logic in src/lib/ilri.js for
the prototype (Sprint 3/4). As of Sprint 5, the frontend no longer
calculates scores — it only displays whatever this module returns.

WEIGHTING METHODOLOGY (Sprint 8, v1.1 — equal weighting):
All 7 dimensions are weighted equally (1/7 each). This choice follows
the World Bank's Logistics Performance Index, the closest real-world
analog to ILRI, which has historically weighted its six components
equally rather than presuming any one matters more without evidence.
Equal weighting is explicitly recognized as a legitimate baseline
method in the OECD/JRC Handbook on Constructing Composite Indicators
(Nardo et al., 2008) — the standard methodological reference used by
the UN, World Bank, and most national statistics agencies for this
class of index.

This is a deliberate placeholder for a more refined method, not a
final answer: a 2018 study (Best Worst Method, 107 logistics experts)
found expert judgment differs meaningfully from equal weights on the
LPI's components. The documented path forward is an AHP-based expert
consultation (pairwise comparisons + consistency check) once ILRAS
has access to domain experts to consult — tracked as an open item,
not assumed away. See METHODOLOGY for the full citation list, exposed
via GET /api/methodology.
"""
from dataclasses import dataclass, field

DIMENSIONS = [
    {"key": "connectivity", "label": "Konektivitas", "weight": 1 / 7},
    {"key": "accessibility", "label": "Aksesibilitas", "weight": 1 / 7},
    {"key": "infrastructure", "label": "Infrastruktur", "weight": 1 / 7},
    {"key": "logistics", "label": "Logistik", "weight": 1 / 7},
    {"key": "industrial", "label": "Potensi Industri", "weight": 1 / 7},
    {"key": "socio", "label": "Sosial Ekonomi", "weight": 1 / 7},
    {"key": "risk", "label": "Risiko (keamanan)", "weight": 1 / 7},
]

_WEIGHTS = {d["key"]: d["weight"] for d in DIMENSIONS}

_BANDS = [
    {"min": 80, "label": "Sangat Siap"},
    {"min": 60, "label": "Siap"},
    {"min": 40, "label": "Cukup Siap"},
    {"min": 20, "label": "Kurang Siap"},
    {"min": 0, "label": "Belum Siap"},
]

METHODOLOGY_VERSION = "ilri-v1.1-equal-weighting"

METHODOLOGY = {
    "version": METHODOLOGY_VERSION,
    "method": "Equal Weighting",
    "method_id": "equal",
    "summary": (
        "Setiap dimensi ILRI diberi bobot yang sama (1/7 \u2248 14,3%). "
        "Pendekatan ini mengikuti preseden World Bank Logistics "
        "Performance Index (LPI), yang secara historis membobot "
        "keenam komponennya secara setara."
    ),
    "rationale": [
        "World Bank LPI (indeks pembanding paling relevan dengan ILRI) menggunakan bobot setara pada seluruh komponennya secara historis.",
        "OECD/JRC Handbook on Constructing Composite Indicators (Nardo et al., 2008) — rujukan metodologis standar yang digunakan PBB, World Bank, dan lembaga statistik nasional — mengakui pembobotan setara sebagai metode dasar yang sah untuk indikator komposit.",
        "Pembobotan setara bersifat transparan dan bebas dari bias subjektif penyusun sistem, sesuai prinsip Konstitusi Proyek \u00a711: 'setiap metode pembobotan harus transparan'.",
    ],
    "known_limitation": (
        "Sebuah studi (Best Worst Method, 107 pakar logistik, 2018) menemukan "
        "penilaian pakar berbeda signifikan dari bobot setara pada komponen LPI. "
        "Bobot setara di ILRAS adalah baseline yang disengaja, bukan jawaban final."
    ),
    "future_path": (
        "Revisi menuju bobot berbasis AHP (Analytic Hierarchy Process) melalui "
        "konsultasi pakar domain (perbandingan berpasangan + uji konsistensi) "
        "setelah ILRAS memiliki akses ke panel pakar yang sesuai."
    ),
    "sources": [
        "World Bank, Logistics Performance Index (LPI) Methodology, lpi.worldbank.org",
        "Nardo, M. et al. (2008), Handbook on Constructing Composite Indicators: Methodology and User Guide, OECD/EC-JRC",
        "Study on Best Worst Method applied to LPI component weighting (2018)",
    ],
}


def calculate_score(dims: dict) -> float:
    """dims: {dimension_key: score (0-100)} -> composite ILRI score (0-100)."""
    return round(sum(dims.get(k, 0) * w for k, w in _WEIGHTS.items()), 2)


def get_band(score: float) -> dict:
    for band in _BANDS:
        if score >= band["min"]:
            return band
    return _BANDS[-1]


def get_lowest_dimension(dims: dict) -> str:
    return min(_WEIGHTS.keys(), key=lambda k: dims.get(k, 0))


def gap_to_next_band(score: float) -> dict | None:
    """
    Points needed to reach the next readiness band up. Returns None if
    already in the top band (Sangat Siap) -- there's no "next" band.
    """
    current = get_band(score)
    idx = _BANDS.index(current)
    if idx == 0:
        return None
    next_band = _BANDS[idx - 1]
    return {
        "points_needed": round(next_band["min"] - score, 2),
        "next_band": next_band["label"],
    }


def generate_swot(dims: dict) -> dict:
    """
    Strengths/Weaknesses are the top/bottom dimensions by raw score --
    no new weighting invented. Threats maps onto the existing Risk
    dimension directly (a SWOT quadrant that already has a natural,
    honest home in ILRI's own framework). Opportunities is a narrative
    derived from gap_to_next_band, not a new number.
    """
    non_risk = [d for d in DIMENSIONS if d["key"] != "risk"]
    ranked = sorted(non_risk, key=lambda d: dims.get(d["key"], 0), reverse=True)

    strengths = [{"label": d["label"], "score": dims.get(d["key"], 0)} for d in ranked[:2]]
    weaknesses = [{"label": d["label"], "score": dims.get(d["key"], 0)} for d in ranked[-2:]]

    risk_score = dims.get("risk", 0)
    threats = {
        "label": "Risiko (keamanan)",
        "score": risk_score,
        "interpretation": (
            "Tingkat risiko rendah -- ancaman bencana/konflik lahan perlu diperhatikan"
            if risk_score < 60
            else "Tingkat risiko relatif terkendali"
        ),
    }

    score = calculate_score(dims)
    gap = gap_to_next_band(score)
    lowest_key = get_lowest_dimension(dims)
    lowest_label = next(d["label"] for d in DIMENSIONS if d["key"] == lowest_key)
    if gap:
        opportunity_text = (
            f"Peningkatan pada dimensi {lowest_label} berpotensi membawa kecamatan "
            f"ini mencapai band \u2018{gap['next_band']}\u2019 "
            f"(butuh +{gap['points_needed']} poin komposit)."
        )
    else:
        opportunity_text = "Kecamatan telah mencapai band tertinggi (Sangat Siap)."

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "threats": threats,
        "opportunity": opportunity_text,
    }


def classify_investment_tier(score: float) -> dict:
    """
    Rule-based tier classification using ONLY already-computed,
    already-justified numbers (band + gap_to_next_band) -- deliberately
    NOT a new composite formula. Inventing a second arbitrary weighting
    scheme here would undermine the entire point of Sprint 8.
    """
    band = get_band(score)
    gap = gap_to_next_band(score)

    if band["label"] in ("Siap", "Sangat Siap"):
        return {
            "tier": "Siap Investasi",
            "rationale": f"Skor komposit {score} berada pada band \u2018{band['label']}\u2019 (\u226560).",
        }
    if gap and gap["points_needed"] <= 10:
        return {
            "tier": "Potensial dengan Perbaikan Kecil",
            "rationale": (
                f"Skor komposit {score} berada pada band \u2018{band['label']}\u2019, "
                f"hanya {gap['points_needed']} poin dari band \u2018{gap['next_band']}\u2019."
            ),
        }
    return {
        "tier": "Memerlukan Investasi Signifikan",
        "rationale": f"Skor komposit {score} berada pada band \u2018{band['label']}\u2019, dengan kesenjangan signifikan menuju band berikutnya.",
    }


def apply_overrides(dims: dict, overrides: dict) -> dict:
    """
    Merge arbitrary per-dimension overrides onto a base dims dict,
    clamped to the valid 0-100 range. This is the general re-entry
    point for Scenario Simulation (Sprint 9) -- any dimension can be
    hypothetically adjusted, not just the two canned presets from
    Sprint 5/6.
    """
    after = dict(dims)
    for key, value in overrides.items():
        if key in _WEIGHTS:
            after[key] = max(0, min(100, value))
    return after


# Named presets kept for UI continuity (Sprint 5/6's original two
# scenarios) -- now expressed as delta functions the frontend can use
# to compute slider positions, not a separate code path in the engine.
PRESETS = {
    "toll": {"connectivity": 7, "accessibility": 18, "risk": -2},
    "hub": {"logistics": 20, "industrial": 2, "risk": -2},
}


def apply_preset_deltas(dims: dict, preset_keys: list[str]) -> dict:
    """Compute absolute override values for one or more named presets, for frontend convenience."""
    after = dict(dims)
    for preset_key in preset_keys:
        for dim_key, delta in PRESETS.get(preset_key, {}).items():
            after[dim_key] = max(0, min(100, after.get(dim_key, 0) + delta))
    return after
