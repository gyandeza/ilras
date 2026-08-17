import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDistricts } from '../lib/dataService.js';
import { getBandColor } from '../lib/ilri.js';
import DistrictMap from '../components/organisms/DistrictMap.jsx';
import { useDistrictContext } from '../layout/DistrictContext.jsx';

export default function GISExplorerPage() {
  const [districts, setDistricts] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setActiveDistrict, setBreadcrumb } = useDistrictContext();

  useEffect(() => {
    setActiveDistrict(null);
    setBreadcrumb('Peta');
    fetchDistricts()
      .then(setDistricts)
      .catch((err) => setError(err.message));
  }, [setActiveDistrict, setBreadcrumb]);

  if (error) {
    return (
      <p className="page-sub" style={{ color: 'var(--band-belum-siap)' }}>
        Gagal memuat data: {error}
      </p>
    );
  }

  if (!districts) return <p className="page-sub">Memuat data...</p>;

  return (
    <>
      <h1 className="page-title">Peta Kesiapan Wilayah</h1>
      <p className="page-sub">
        Lokasi 3 kecamatan pilot, Kabupaten Kampar — klik penanda untuk membuka detail kecamatan
      </p>

      <div className="gis-layout">
        <div className="panel gis-layout__map">
          <DistrictMap districts={districts} onMarkerClick={(id) => navigate(`/district/${id}`)} zoom={10} height={520} />
        </div>
        <div className="panel gis-layout__legend">
          <div className="panel__heading">Legenda</div>
          {districts.map((d) => (
            <button key={d.id} className="gis-legend-item" onClick={() => navigate(`/district/${d.id}`)}>
              <span className="gis-legend-item__dot" style={{ background: getBandColor(d.band) }} />
              <span className="gis-legend-item__name">{d.name}</span>
              <span className="gis-legend-item__score">{d.score.toFixed(1)}</span>
            </button>
          ))}
          <div className="gis-layout__note">
            Lapisan tematik tambahan (jalan, zona risiko, kawasan industri) belum
            tersedia — menunggu penyelesaian riset ketersediaan data Infrastruktur
            &amp; Logistik (RT-01, Sprint 0).
          </div>
        </div>
      </div>
    </>
  );
}
