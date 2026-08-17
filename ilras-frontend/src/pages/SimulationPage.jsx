import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDistrict, fetchPresets, simulateScenario } from '../lib/dataService.js';
import { DIMENSIONS } from '../lib/ilri.js';
import CompareBar from '../components/molecules/CompareBar.jsx';
import RecommendationItem from '../components/molecules/RecommendationItem.jsx';
import { useDistrictContext } from '../layout/DistrictContext.jsx';

const DEBOUNCE_MS = 350;

export default function SimulationPage() {
  const { id } = useParams();
  const [district, setDistrict] = useState(null);
  const [presets, setPresets] = useState(null);
  const [sliders, setSliders] = useState(null); // current hypothetical dims, starts = base dims
  const [result, setResult] = useState(null); // backend SimulationResponse
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'not-found' | 'error'
  const [error, setError] = useState(null);
  const { setActiveDistrict, setBreadcrumb } = useDistrictContext();
  const debounceRef = useRef(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    setStatus('loading');
    fetchDistrict(id)
      .then((d) => {
        if (!d) {
          setStatus('not-found');
          return;
        }
        setDistrict(d);
        setSliders({ ...d.dims });
        setActiveDistrict(d);
        setBreadcrumb(
          <>
            Dasbor &nbsp;›&nbsp; {d.name} &nbsp;›&nbsp; <strong>Simulasi Skenario</strong>
          </>
        );
        return fetchPresets(id).then((p) => {
          setPresets(p);
          setStatus('ready');
        });
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, [id, setActiveDistrict, setBreadcrumb]);

  // Debounced re-entry into the backend's scoring engine whenever
  // slider values change -- fires ~350ms after the user stops
  // adjusting, not on every drag pixel.
  useEffect(() => {
    if (status !== 'ready' || !sliders || !district) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const overrides = {};
      for (const dim of DIMENSIONS) {
        if (sliders[dim.key] !== district.dims[dim.key]) overrides[dim.key] = sliders[dim.key];
      }
      const seq = ++requestSeq.current;
      simulateScenario(id, overrides)
        .then((res) => {
          if (seq === requestSeq.current) setResult(res);
        })
        .catch((err) => {
          if (seq === requestSeq.current) setError(err.message);
        });
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [sliders, status, district, id]);

  function applyPreset(key) {
    setSliders((prev) => {
      const next = { ...prev };
      for (const [dimKey, delta] of Object.entries(presets[key] ?? {})) {
        next[dimKey] = Math.max(0, Math.min(100, (prev[dimKey] ?? 0) + delta));
      }
      return next;
    });
  }
  function resetSliders() {
    setSliders({ ...district.dims });
  }

  if (status === 'loading') return <p className="page-sub">Memuat data...</p>;

  if (status === 'error') {
    return (
      <p className="page-sub" style={{ color: 'var(--band-belum-siap)' }}>
        Gagal memuat data: {error}
      </p>
    );
  }

  if (status === 'not-found') {
    return (
      <>
        <h1 className="page-title">Kecamatan Tidak Ditemukan</h1>
        <p className="page-sub">ID kecamatan "{id}" tidak tersedia dalam data pilot ini.</p>
        <Link to="/" className="btn btn--primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Kembali ke Dasbor
        </Link>
      </>
    );
  }

  const { before, after, delta } = result || {};
  const hasChanges = district && sliders && DIMENSIONS.some((d) => sliders[d.key] !== district.dims[d.key]);

  const recommendations = [];
  if (before && after) {
    const deltas = DIMENSIONS
      .map((d) => ({ dim: d, delta: after.dims[d.key] - before.dims[d.key] }))
      .filter((x) => x.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 3);
    deltas.forEach((x) => recommendations.push({
      label: `Tingkatkan ${x.dim.label}`,
      impact: `+${x.delta.toFixed(0)} poin`,
    }));
  }
  if (recommendations.length === 0) {
    recommendations.push({ label: 'Geser salah satu slider di kiri untuk melihat rekomendasi', impact: '' });
  }

  return (
    <>
      <h1 className="page-title">Simulasi Skenario</h1>
      <p className="page-sub">
        What-if untuk Kecamatan {district.name} — geser tiap dimensi secara manual, atau gunakan preset cepat
      </p>

      <div className="sim-grid">
        <div className="panel">
          <div className="panel__heading">Preset Cepat</div>
          <div className="sim-presets">
            <button className="sim-preset-btn" onClick={() => applyPreset('toll')}>+ Akses Jalan Tol</button>
            <button className="sim-preset-btn" onClick={() => applyPreset('hub')}>+ Hub Logistik</button>
            <button className="sim-preset-btn sim-preset-btn--reset" onClick={resetSliders} disabled={!hasChanges}>
              Atur Ulang
            </button>
          </div>

          <div className="panel__heading" style={{ marginTop: 20 }}>Atur Manual per Dimensi</div>
          <div className="sim-sliders">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="sim-slider-row">
                <div className="sim-slider-row__label">
                  <span>{dim.label}</span>
                  <span className="sim-slider-row__val">{sliders[dim.key]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliders[dim.key]}
                  onChange={(e) => setSliders((prev) => ({ ...prev, [dim.key]: Number(e.target.value) }))}
                  style={{ accentColor: dim.color }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel__heading" style={{ marginBottom: 14 }}>Sebelum vs Sesudah per Dimensi</div>
          {before && after ? (
            <>
              {DIMENSIONS.map((dim) => (
                <CompareBar key={dim.key} label={dim.label} before={before.dims[dim.key]} after={after.dims[dim.key]} />
              ))}
              <div className="sim-legend">
                <span><i style={{ background: '#A9BBD6' }} />Sebelum</span>
                <span><i style={{ background: 'var(--color-accent-teal)' }} />Sesudah</span>
              </div>
            </>
          ) : (
            <p className="page-sub">Menghitung skor...</p>
          )}
        </div>

        <div className="rec-card">
          <div className="rec-card__eyebrow">PRIORITAS REKOMENDASI</div>
          {recommendations.map((r, i) => (
            <RecommendationItem key={r.label} rank={i + 1} label={r.label} impact={r.impact} />
          ))}
          <div className="rec-card__divider" />
          <div className="rec-card__eyebrow">PROYEKSI SKOR ILRI</div>
          {before && after ? (
            <>
              <div className="rec-card__score">{before.score.toFixed(1)} → {after.score.toFixed(1)}</div>
              <div className="rec-card__delta">{delta >= 0 ? '+' : ''}{delta.toFixed(1)} poin</div>
            </>
          ) : (
            <div className="rec-card__score">—</div>
          )}
        </div>
      </div>
    </>
  );
}
