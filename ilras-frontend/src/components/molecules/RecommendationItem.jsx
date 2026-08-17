export default function RecommendationItem({ rank, label, impact }) {
  return (
    <div className="recommendation-item">
      <div className="recommendation-item__num">{rank}</div>
      <div>
        <b>{label}</b>
        {impact && <span>{impact}</span>}
      </div>
    </div>
  );
}
