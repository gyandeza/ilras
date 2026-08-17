/**
 * Data service layer.
 *
 * As of Sprint 5, these functions call the real ILRAS backend
 * (FastAPI + SQLite) instead of returning mock data. The function
 * signatures are unchanged from Sprint 4's mock implementation —
 * that was the point of designing it this way from the start.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.detail || `Permintaan gagal (${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export async function fetchDistricts() {
  const res = await fetch(`${API_BASE}/api/districts`);
  return handleResponse(res);
}

export async function fetchDistrict(id) {
  const res = await fetch(`${API_BASE}/api/districts/${id}`);
  if (res.status === 404) return null;
  return handleResponse(res);
}

export async function fetchIndicators(dimensionKey, districtId) {
  const res = await fetch(`${API_BASE}/api/districts/${districtId}/indicators?dimension=${dimensionKey}`);
  return handleResponse(res);
}

/**
 * Re-enters the backend's single scoring engine with arbitrary
 * per-dimension overrides. Per the project constitution: "Scenario
 * Simulation re-enters the same engine, not a parallel path."
 */
export async function simulateScenario(districtId, overrides) {
  const res = await fetch(`${API_BASE}/api/districts/${districtId}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ overrides }),
  });
  return handleResponse(res);
}

export async function fetchComparison(ids) {
  const query = ids && ids.length ? `?ids=${ids.join(',')}` : '';
  const res = await fetch(`${API_BASE}/api/analytics/compare${query}`);
  return handleResponse(res);
}

export async function fetchMethodology() {
  const res = await fetch(`${API_BASE}/api/methodology`);
  return handleResponse(res);
}

export async function fetchPresets(districtId) {
  const res = await fetch(`${API_BASE}/api/districts/${districtId}/presets`);
  return handleResponse(res);
}

export async function fetchRecommendation(districtId) {
  const res = await fetch(`${API_BASE}/api/districts/${districtId}/recommendation`);
  return handleResponse(res);
}
