export default function CompareBar({ label, before, after }) {
  return (
    <div className="compare-bar">
      <div className="compare-bar__label">{label}</div>
      <div className="compare-bar__bars">
        <div className="compare-bar__track">
          <div className="compare-bar__fill compare-bar__fill--before" style={{ width: `${before}%` }} />
        </div>
        <div className="compare-bar__track">
          <div className="compare-bar__fill compare-bar__fill--after" style={{ width: `${after}%` }} />
        </div>
        <div className="compare-bar__values">
          <span>{before}</span>
          <span>{after}</span>
        </div>
      </div>
    </div>
  );
}
