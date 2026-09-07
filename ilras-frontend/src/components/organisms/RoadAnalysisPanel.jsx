import { useEffect, useState } from 'react';
import { fetchRoadsAnalysis } from '../../lib/dataService.js';

export default function RoadAnalysisPanel({ districtId }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    setStatus('loading');
    fetchRoadsAnalysis(districtId)
      .then((res) => {
        setData(res);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [districtId]);

  if (status === 'loading') {
    return (
      <div className="panel">
        <div className="panel__heading">Analisis Jalan</div>
        <p className="page-sub" style={{ marginBottom: 0 }}>Menghitung panjang jalan...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="panel">
        <div className="panel__heading">Analisis Jalan</div>
        <p className="road-analysis__unavailable">
          Data jalan tidak tersedia saat ini (gangguan koneksi ke OpenStreetMap).
        </p>
      </div>
    );
  }

  const entries = Object.values(data).filter((e) => e.length_km > 0);
  const total = entries.reduce((sum, e) => sum + e.length_km, 0);

  return (
    <div className="panel">
      <div className="panel__heading">Analisis Jalan</div>
      {entries.length === 0 ? (
        <p className="road-analysis__unavailable">
          Tidak ada ruas jalan utama terdeteksi dalam radius kecamatan ini pada OpenStreetMap.
        </p>
      ) : (
        <>
          {entries.map((e) => (
            <div key={e.label} className="road-analysis__row">
              <span>{e.label}</span>
              <span className="road-analysis__val">{e.length_km.toFixed(1)} km</span>
            </div>
          ))}
          <div className="road-analysis__row road-analysis__row--total">
            <span>Total</span>
            <span className="road-analysis__val">{total.toFixed(1)} km</span>
          </div>
        </>
      )}
      <p className="road-analysis__note">
        Dihitung langsung dari geometri OpenStreetMap (bukan skor ILRI) —
        metodologi normalisasi menjadi indikator resmi belum ditetapkan.
      </p>
    </div>
  );
}
