import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComparison } from '../lib/dataService.js';
import { DIMENSIONS, getBandColor } from '../lib/ilri.js';
import ScoreRing from '../components/atoms/ScoreRing.jsx';
import BandPill from '../components/atoms/BandPill.jsx';
import { useDistrictContext } from '../layout/DistrictContext.jsx';

export default function ComparisonPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setActiveDistrict, setBreadcrumb } = useDistrictContext();

  useEffect(() => {
    setActiveDistrict(null);
    setBreadcrumb('Perbandingan Kecamatan');
    fetchComparison().then(setData).catch((err) => setError(err.message));
  }, [setActiveDistrict, setBreadcrumb]);

  if (error) {
    return (
      <p className="page-sub" style={{ color: 'var(--band-belum-siap)' }}>
        Gagal memuat data: {error}
      </p>
    );
  }
  if (!data) return <p className="page-sub">Memuat data...</p>;

  const { districts, dimension_analysis: dimAnalysis, score_spread: spread } = data;

  return (
    <>
      <h1 className="page-title">Perbandingan Kecamatan</h1>
      <p className="page-sub">
        Benchmarking antar 3 kecamatan pilot — rentang skor {spread.toFixed(1)} poin antara tertinggi dan terendah
      </p>

      <div className="compare-cards">
        {districts.map((d) => {
          const band = { label: d.band, color: getBandColor(d.band) };
          return (
            <div key={d.id} className="panel compare-card" onClick={() => navigate(`/district/${d.id}`)}>
              <h3 className="compare-card__name">{d.name}</h3>
              <ScoreRing score={d.score} color={band.color} size={80} />
              <div className="compare-card__pill">
                <BandPill band={band} />
              </div>
              {d.gap_to_next_band ? (
                <div className="compare-card__gap">
                  Butuh <strong>+{d.gap_to_next_band.points_needed.toFixed(1)}</strong> poin untuk mencapai{' '}
                  <strong>{d.gap_to_next_band.next_band}</strong>
                </div>
              ) : (
                <div className="compare-card__gap compare-card__gap--top">
                  Sudah mencapai band tertinggi
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel__heading">Analisis per Dimensi</div>
        <table className="compare-table">
          <thead>
            <tr>
              <th>Dimensi</th>
              <th>Terdepan</th>
              <th>Tertinggal</th>
              <th>Selisih</th>
            </tr>
          </thead>
          <tbody>
            {dimAnalysis.map((row) => {
              const dim = DIMENSIONS.find((d) => d.key === row.dimension_key);
              return (
                <tr key={row.dimension_key}>
                  <td>
                    <span className="compare-table__dot" style={{ background: dim?.color }} />
                    {row.dimension_label}
                  </td>
                  <td>
                    <button className="compare-table__link" onClick={() => navigate(`/district/${row.leader_id}`)}>
                      {row.leader_name}
                    </button>{' '}
                    <span className="compare-table__val">({row.leader_score})</span>
                  </td>
                  <td>
                    <button className="compare-table__link" onClick={() => navigate(`/district/${row.laggard_id}`)}>
                      {row.laggard_name}
                    </button>{' '}
                    <span className="compare-table__val">({row.laggard_score})</span>
                  </td>
                  <td className="compare-table__spread">{row.spread}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
