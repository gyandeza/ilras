import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDistricts } from '../lib/dataService.js';
import DistrictCard from '../components/molecules/DistrictCard.jsx';
import { useDistrictContext } from '../layout/DistrictContext.jsx';

export default function DashboardPage() {
  const [districts, setDistricts] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setActiveDistrict, setBreadcrumb } = useDistrictContext();

  useEffect(() => {
    setActiveDistrict(null);
    setBreadcrumb('Dasbor');
    fetchDistricts()
      .then((data) => {
        const ranked = [...data].sort((a, b) => b.score - a.score);
        setDistricts(ranked);
      })
      .catch((err) => setError(err.message));
  }, [setActiveDistrict, setBreadcrumb]);

  if (error) {
    return (
      <p className="page-sub" style={{ color: 'var(--band-belum-siap)' }}>
        Gagal memuat data: {error}. Pastikan backend berjalan di {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}.
      </p>
    );
  }

  if (!districts) return <p className="page-sub">Memuat data...</p>;

  return (
    <>
      <h1 className="page-title">Dasbor Eksekutif</h1>
      <p className="page-sub">Peringkat kesiapan industri — 3 kecamatan pilot, Kabupaten Kampar</p>
      <div className="dashboard-grid">
        {districts.map((d, i) => (
          <DistrictCard key={d.id} district={d} rank={i + 1} onClick={() => navigate(`/district/${d.id}`)} />
        ))}
      </div>
    </>
  );
}
