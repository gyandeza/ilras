import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchDistrict, fetchIndicators, fetchRecommendation, fetchBoundary, fetchHistory } from '../lib/dataService.js';
import { getBandColor, getLowestDimension, DIMENSIONS } from '../lib/ilri.js';
import { exportDistrictProfilePdf } from '../lib/pdfExport.js';
import ScoreRing from '../components/atoms/ScoreRing.jsx';
import BandPill from '../components/atoms/BandPill.jsx';
import Button from '../components/atoms/Button.jsx';
import DimensionBar from '../components/molecules/DimensionBar.jsx';
import IndicatorItem from '../components/molecules/IndicatorItem.jsx';
import DistrictMap from '../components/organisms/DistrictMap.jsx';
import RecommendationPanel from '../components/organisms/RecommendationPanel.jsx';
import HistoryTimeline from '../components/organisms/HistoryTimeline.jsx';
import ExecutiveSummaryPanel from '../components/organisms/ExecutiveSummaryPanel.jsx';
import { useDistrictContext } from '../layout/DistrictContext.jsx';

export default function DistrictDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [district, setDistrict] = useState(null);
  const [indicatorsByDimension, setIndicatorsByDimension] = useState({});
  const [recommendation, setRecommendation] = useState(null);
  const [boundary, setBoundary] = useState(null);
  const [history, setHistory] = useState([]);
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
    // Fetch indicators for every dimension, but only render a section
    // for dimensions that actually have some -- most dimensions don't
    // have curated indicators yet (Essential Feature #2 is filled in
    // dimension-by-dimension across multiple CRs, not all at once).
    Promise.allSettled(
      DIMENSIONS.map((dim) => fetchIndicators(dim.key, id).then((list) => ({ key: dim.key, list })))
    ).then((results) => {
      const byDim = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value.list.length > 0) {
          byDim[r.value.key] = r.value.list;
        }
      });
      setIndicatorsByDimension(byDim);
    });
    fetchRecommendation(id).then(setRecommendation).catch(() => setRecommendation(null));
    fetchBoundary(id).then(setBoundary).catch(() => setBoundary(null));
    fetchHistory(id).then(setHistory).catch(() => setHistory([]));
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
            <DistrictMap
              districts={[district]}
              zoom={12}
              height={180}
              boundaries={boundary ? [{ districtId: district.id, feature: boundary.feature, band: district.band }] : []}
            />
          </div>
          <div className="detail-grid__actions">
            <Button variant="primary" onClick={() => navigate(`/simulate/${district.id}`)}>
              Simulasikan Skenario
            </Button>
          </div>
          <div className="detail-grid__actions">
            <Button
              variant="outline"
              onClick={() => exportDistrictProfilePdf(district, recommendation)}
              disabled={!recommendation}
              title={!recommendation ? 'Menunggu data rekomendasi dimuat' : undefined}
            >
              📥 Unduh Laporan
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
          {DIMENSIONS.filter((dim) => indicatorsByDimension[dim.key]?.length > 0).map((dim) => (
            <div key={dim.key} className="panel" style={{ marginBottom: 18 }}>
              <div className="panel__heading">Contoh Indikator — {dim.label}</div>
              {indicatorsByDimension[dim.key].map((ind) => (
                <IndicatorItem key={ind.title} indicator={ind} />
              ))}
            </div>
          ))}
          <RecommendationPanel data={recommendation} />
          <div style={{ marginTop: 18 }}>
            <ExecutiveSummaryPanel district={district} recommendation={recommendation} />
          </div>
          <div className="panel" style={{ marginTop: 18 }}>
            <div className="panel__heading">Riwayat Perubahan</div>
            <HistoryTimeline entries={history} />
          </div>
        </div>
      </div>
    </>
  );
}
