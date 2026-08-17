/**
 * ILRAS — ILRI Display Metadata (Frontend)
 *
 * As of Sprint 5, this file NO LONGER calculates scores or determines
 * readiness bands — that logic now lives exclusively in the backend
 * (ilras-backend/app/ilri.py), per the project constitution's
 * single-source-of-truth rule. The frontend only displays whatever
 * score/band the API returns.
 *
 * This file keeps display-only concerns: dimension labels/colors for
 * rendering, band-label -> color mapping, and the "which dimension is
 * lowest" helper (a pure UI affordance, not a scoring decision).
 */

export const DIMENSIONS = [
  { key: 'connectivity', label: 'Konektivitas', color: 'var(--dim-connectivity)' },
  { key: 'accessibility', label: 'Aksesibilitas', color: 'var(--dim-accessibility)' },
  { key: 'infrastructure', label: 'Infrastruktur', color: 'var(--dim-infrastructure)' },
  { key: 'logistics', label: 'Logistik', color: 'var(--dim-logistics)' },
  { key: 'industrial', label: 'Potensi Industri', color: 'var(--dim-industrial)' },
  { key: 'socio', label: 'Sosial Ekonomi', color: 'var(--dim-socio)' },
  { key: 'risk', label: 'Risiko (keamanan)', color: 'var(--dim-risk)' },
];

const BAND_COLORS = {
  'Sangat Siap': 'var(--band-sangat-siap)',
  'Siap': 'var(--band-siap)',
  'Cukup Siap': 'var(--band-cukup-siap)',
  'Kurang Siap': 'var(--band-kurang-siap)',
  'Belum Siap': 'var(--band-belum-siap)',
};

/**
 * @param {string} bandLabel - band label as returned by the backend API
 * @returns {string} CSS color token for that band
 */
export function getBandColor(bandLabel) {
  return BAND_COLORS[bandLabel] ?? 'var(--color-muted)';
}

/**
 * Find the lowest-scoring dimension — a pure UI affordance to flag
 * "Perlu perhatian" (Sprint 2 Information Hierarchy), not a scoring
 * decision, so it's fine for this to stay client-side.
 */
export function getLowestDimension(dims) {
  return DIMENSIONS.reduce(
    (lowest, d) => ((dims[d.key] ?? 0) < (dims[lowest.key] ?? 0) ? d : lowest),
    DIMENSIONS[0]
  );
}
