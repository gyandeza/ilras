import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchDistrict, fetchIndicators, fetchRecommendation } from '../lib/dataService.js';
import { getBandColor, getLowestDimension, DIMENSIONS } from '../lib/ilri.js';
import ScoreRing from '../components/atoms/ScoreRing.jsx';
import BandPill from '../components/atoms/BandPill.jsx';
import Button from '../components/atoms/Button.jsx';
import DimensionBar from '../components/molecules/DimensionBar.jsx';
import IndicatorItem from '../components/molecules/IndicatorItem.jsx';
import DistrictMap from '../components/organisms/DistrictMap.jsx';
import RecommendationPanel from '../components/organisms/RecommendationPanel.jsx';
import { useDistrictContext } from '../layout/DistrictContext.jsx';

export default function DistrictDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [district, setDistrict] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'not-found' | 'error'
  const [error, setError] = useState(null);
  const { setActiveDistrict, setBreadcrumb } = useDistrictContext();

  useEffect(() => {
    setStatus('loading');
    fetchDistrict(id)
      .then((d) => {
        if (!d) {
          setStatus('not-found');
          return;
        }
        setDistrict(d);
        setActiveDistrict(d);
        setBreadcrumb(
          <>
            Dasbor &nbsp;›&nbsp; <strong>{d.name}</strong>
          </>
        );
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
    fetchIndicators('infrastructure', id).then(setIndicators).catch(() => setIndicators([]));
    fetchRecommendation(id).then(setRecommendation).catch(() => setRecommendation(null));
  }, [id, setActiveDistrict, setBreadcrumb]);

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
        <p className="page-sub">
          ID kecamatan "{id}" tidak tersedia dalam data pilot ini.
        </p>
        <Link to="/" className="btn btn--primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Kembali ke Dasbor
        </Link>
      </>
    );
  }

  const band = { label: district.band, color: getBandColor(district.band) };
  const lowest = getLowestDimension(district.dims);

  return (
    <>
      <h1 className="page-title">Kecamatan {district.name}</h1>
      <p className="page-sub">Skor Kesiapan (ILRI) dan rincian 7 dimensi</p>

      <div className="detail-grid">
        <div className="panel detail-grid__score">
          <ScoreRing score={district.score} color={band.color} size={180} />
          <div className="detail-grid__pill">
            <BandPill band={band} />
          </div>
          <div className="detail-grid__map">
            <DistrictMap districts={[district]} zoom={12} height={180} />
          </div>
          <div className="detail-grid__actions">
            <Button variant="primary" onClick={() => navigate(`/simulate/${district.id}`)}>
              Simulasikan Skenario
            </Button>
          </div>
          <div className="detail-grid__actions">
            <Button variant="outline" disabled title="Belum tersedia di prototipe ini">
              Unduh Laporan
            </Button>
          </div>
        </div>

        <div>
          <div className="panel" style={{ marginBottom: 18 }}>
            <div className="panel__heading">Rincian 7 Dimensi (Skor yang Dapat Dijelaskan)</div>
            {DIMENSIONS.map((dim) => (
              <DimensionBar
                key={dim.key}
                dimension={dim}
                value={district.dims[dim.key]}
                flagged={dim.key === lowest.key}
              />
            ))}
          </div>
          <div className="panel" style={{ marginBottom: 18 }}>
            <div className="panel__heading">Contoh Indikator — Infrastruktur</div>
            {indicators.map((ind) => (
              <IndicatorItem key={ind.title} indicator={ind} />
            ))}
          </div>
          <RecommendationPanel data={recommendation} />
        </div>
      </div>
    </>
  );
}
