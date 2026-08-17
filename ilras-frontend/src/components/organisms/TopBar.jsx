export default function TopBar({ breadcrumb, activeDistrict, score, bandColor }) {
  return (
    <header className="topbar">
      <div className="topbar__breadcrumb">{breadcrumb}</div>
      {activeDistrict && (
        <div className="topbar__score">
          <span className="topbar__dot" style={{ background: bandColor }} />
          {activeDistrict} · Skor ILRI {score.toFixed(1)}
        </div>
      )}
    </header>
  );
}
