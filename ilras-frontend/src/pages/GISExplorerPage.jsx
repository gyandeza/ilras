import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDistricts, fetchRoadsLayer, fetchRiskLayer, fetchBoundary } from '../lib/dataService.js';
import { getBandColor } from '../lib/ilri.js';
import DistrictMap, { ROAD_LEGEND } from '../components/organisms/DistrictMap.jsx';
import { useDistrictContext } from '../layout/DistrictContext.jsx';

export default function GISExplorerPage() {
  const [districts, setDistricts] = useState(null);
  const [error, setError] = useState(null);
  const [showRoads, setShowRoads] = useState(false);
  const [showRisk, setShowRisk] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [roadLayers, setRoadLayers] = useState([]);
  const [riskLayers, setRiskLayers] = useState([]);
  const [boundaries, setBoundaries] = useState([]);
  const [roadsStatus, setRoadsStatus] = useState('idle'); // idle | loading | ready | error
  const [riskStatus, setRiskStatus] = useState('idle');
  const [boundaryStatus, setBoundaryStatus] = useState('idle');
  const navigate = useNavigate();
  const { setActiveDistrict, setBreadcrumb } = useDistrictContext();

  useEffect(() => {
    setActiveDistrict(null);
    setBreadcrumb('Peta');
    fetchDistricts()
      .then(setDistricts)
      .catch((err) => setError(err.message));
  }, [setActiveDistrict, setBreadcrumb]);

  useEffect(() => {
    if (!showRoads || !districts || roadLayers.length > 0) return;
    setRoadsStatus('loading');
    Promise.all(districts.map((d) => fetchRoadsLayer(d.id).then((res) => ({ districtId: d.id, geojson: res.geojson }))))
      .then((results) => {
        setRoadLayers(results);
        setRoadsStatus('ready');
      })
      .catch(() => setRoadsStatus('error'));
  }, [showRoads, districts, roadLayers.length]);

  useEffect(() => {
    if (!showRisk || !districts || riskLayers.length > 0) return;
    setRiskStatus('loading');
    Promise.all(districts.map((d) => fetchRiskLayer(d.id).then((res) => ({ districtId: d.id, ...res }))))
      .then((results) => {
        setRiskLayers(results);
        setRiskStatus('ready');
      })
      .catch(() => setRiskStatus('error'));
  }, [showRisk, districts, riskLayers.length]);

  useEffect(() => {
    if (!showBoundaries || !districts || boundaries.length > 0) return;
    setBoundaryStatus('loading');
    // Real boundaries are opt-in per district: BIG may not have a match
    // for every kecamatan, so failures here are individually swallowed
    // (Promise.allSettled) rather than failing the whole layer -- a
    // district missing from BIG still shows its marker as usual.
    Promise.allSettled(districts.map((d) => fetchBoundary(d.id).then((res) => (res ? { districtId: d.id, feature: res.feature, band: d.band } : null))))
      .then((results) => {
        const found = results
          .filter((r) => r.status === 'fulfilled' && r.value)
          .map((r) => r.value);
        setBoundaries(found);
        setBoundaryStatus(found.length > 0 ? 'ready' : 'error');
      });
  }, [showBoundaries, districts, boundaries.length]);

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
          <DistrictMap
            districts={districts}
            onMarkerClick={(id) => navigate(`/district/${id}`)}
            zoom={10}
            height={520}
            roadLayers={showRoads ? roadLayers : []}
            riskLayers={showRisk ? riskLayers : []}
            boundaries={showBoundaries ? boundaries : []}
          />
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

          <div className="panel__heading" style={{ marginTop: 18 }}>Lapisan Tematik</div>
          <label className="gis-layer-toggle">
            <input type="checkbox" checked={showBoundaries} onChange={(e) => setShowBoundaries(e.target.checked)} />
            Batas Kecamatan (BIG) {boundaryStatus === 'loading' && showBoundaries && <span className="gis-layer-toggle__status">memuat...</span>}
            {boundaryStatus === 'error' && <span className="gis-layer-toggle__status gis-layer-toggle__status--error">tidak ditemukan</span>}
          </label>
          <label className="gis-layer-toggle">
            <input type="checkbox" checked={showRoads} onChange={(e) => setShowRoads(e.target.checked)} />
            Jalan Utama {roadsStatus === 'loading' && showRoads && <span className="gis-layer-toggle__status">memuat...</span>}
            {roadsStatus === 'error' && <span className="gis-layer-toggle__status gis-layer-toggle__status--error">gagal</span>}
          </label>
          {showRoads && roadsStatus === 'ready' && (
            <div className="road-legend">
              {ROAD_LEGEND.map((r) => (
                <div key={r.key} className="road-legend__item">
                  <span className="road-legend__swatch" style={{ background: r.color }} />
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          )}
          <label className="gis-layer-toggle">
            <input type="checkbox" checked={showRisk} onChange={(e) => setShowRisk(e.target.checked)} />
            Zona Risiko Banjir {riskStatus === 'loading' && showRisk && <span className="gis-layer-toggle__status">memuat...</span>}
            {riskStatus === 'error' && <span className="gis-layer-toggle__status gis-layer-toggle__status--error">gagal</span>}
          </label>
          <div className="gis-layer-toggle gis-layer-toggle--disabled">
            <input type="checkbox" disabled />
            Kawasan Industri <span className="gis-layer-toggle__status">segera</span>
          </div>

          <div className="gis-layout__note">
            Kawasan Industri belum tersedia — data ada di portal Disperindag
            Riau (sepat.riau.go.id/mapki) namun belum memiliki API publik.
            Batas kecamatan dari BIG (edisi 2022); Jalan dari OpenStreetMap;
            Zona Risiko dari InaRisk BNPB.
          </div>
        </div>
      </div>
    </>
  );
}
