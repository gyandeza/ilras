/**
 * Dummy pilot data for Tapung, Siak Hulu, Tambang (Kabupaten Kampar).
 * NOT real assessment data — illustrative only, same figures used
 * consistently across the Sprint 0-3 deliverables for continuity.
 */
export const DISTRICTS = {
  tapung: {
    id: 'tapung',
    name: 'Tapung',
    dims: { connectivity: 75, accessibility: 60, infrastructure: 55, logistics: 65, industrial: 80, socio: 70, risk: 85 },
  },
  'siak-hulu': {
    id: 'siak-hulu',
    name: 'Siak Hulu',
    dims: { connectivity: 88, accessibility: 85, infrastructure: 78, logistics: 80, industrial: 85, socio: 82, risk: 80 },
  },
  tambang: {
    id: 'tambang',
    name: 'Tambang',
    dims: { connectivity: 45, accessibility: 35, infrastructure: 30, logistics: 32, industrial: 35, socio: 55, risk: 48 },
  },
};

export const INDICATORS_BY_DIMENSION = {
  infrastructure: [
    {
      title: 'Rasio Elektrifikasi Desa',
      source: 'BPS Podes',
      updated: 'Jun 2026',
      confidence: 'high',
    },
    {
      title: 'Cakupan Air Bersih',
      source: 'Data PUPR (proksi kabupaten)',
      updated: 'Mar 2026',
      confidence: 'medium',
    },
  ],
};
