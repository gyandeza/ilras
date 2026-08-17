import { useEffect, useState } from 'react';
import { fetchMethodology } from '../lib/dataService.js';
import { useDistrictContext } from '../layout/DistrictContext.jsx';

export default function MethodologyPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { setActiveDistrict, setBreadcrumb } = useDistrictContext();

  useEffect(() => {
    setActiveDistrict(null);
    setBreadcrumb('Metodologi Skoring');
    fetchMethodology().then(setData).catch((err) => setError(err.message));
  }, [setActiveDistrict, setBreadcrumb]);

  if (error) {
    return (
      <p className="page-sub" style={{ color: 'var(--band-belum-siap)' }}>
        Gagal memuat data: {error}
      </p>
    );
  }
  if (!data) return <p className="page-sub">Memuat data...</p>;

  return (
    <>
      <h1 className="page-title">Metodologi Skoring ILRI</h1>
      <p className="page-sub">
        Bagaimana dan mengapa bobot setiap dimensi ditentukan — versi {data.version}
      </p>

      <div className="methodology-grid">
        <div className="panel">
          <div className="panel__heading">Metode: {data.method}</div>
          <p className="methodology-text">{data.summary}</p>

          <div className="methodology-subheading">Alasan Pemilihan Metode</div>
          <ul className="methodology-list">
            {data.rationale.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <div className="methodology-callout methodology-callout--limitation">
            <strong>Keterbatasan yang Diketahui</strong>
            <p>{data.known_limitation}</p>
          </div>

          <div className="methodology-callout methodology-callout--future">
            <strong>Rencana Pengembangan</strong>
            <p>{data.future_path}</p>
          </div>

          <div className="methodology-subheading">Sumber Referensi</div>
          <ul className="methodology-sources">
            {data.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel__heading">Bobot per Dimensi</div>
          {data.weights.map((w) => (
            <div key={w.key} className="methodology-weight-row">
              <span>{w.label}</span>
              <span className="methodology-weight-row__val">{(w.weight * 100).toFixed(1)}%</span>
            </div>
          ))}
          <div className="methodology-note">
            Sebelum Sprint 8, bobot tidak setara (Konektivitas 20%, Risiko 10%, dst.)
            tanpa justifikasi terdokumentasi. Perubahan ke bobot setara adalah
            perbaikan transparansi, bukan sekadar preferensi teknis.
          </div>
        </div>
      </div>
    </>
  );
}
