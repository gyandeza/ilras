export default function DimensionBar({ dimension, value, flagged }) {
  return (
    <div className="dimension-bar">
      <span className="dimension-bar__dot" style={{ background: dimension.color }} />
      <span className="dimension-bar__label">
        {dimension.label}
        {flagged && <span className="dimension-bar__flag">Perlu perhatian</span>}
      </span>
      <span className="dimension-bar__track">
        <span className="dimension-bar__fill" style={{ width: `${value}%`, background: dimension.color }} />
      </span>
      <span className="dimension-bar__value">{value}</span>
    </div>
  );
}
