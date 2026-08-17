import ScoreRing from '../atoms/ScoreRing.jsx';
import BandPill from '../atoms/BandPill.jsx';
import { getBandColor } from '../../lib/ilri.js';

export default function DistrictCard({ district, rank, onClick }) {
  const band = { label: district.band, color: getBandColor(district.band) };

  return (
    <div className="district-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' ? onClick() : null)}>
      <div className="district-card__rank">PERINGKAT {rank}</div>
      <h3 className="district-card__name">{district.name}</h3>
      <ScoreRing score={district.score} color={band.color} size={88} />
      <div className="district-card__pill-wrap">
        <BandPill band={band} />
      </div>
      <div className="district-card__foot">Kabupaten {district.kabupaten}, {district.provinsi}</div>
    </div>
  );
}
