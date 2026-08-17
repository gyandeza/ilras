export default function BandPill({ band }) {
  return (
    <span className="band-pill" style={{ background: band.color }}>
      {band.label.toUpperCase()}
    </span>
  );
}
