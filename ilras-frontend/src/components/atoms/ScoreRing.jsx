export default function ScoreRing({ score, color, size = 96 }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div
      className="score-ring"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${pct}%, var(--color-line) 0)`,
      }}
      role="img"
      aria-label={`Skor ${score.toFixed(1)} dari 100`}
    >
      <div className="score-ring__hole">
        <span className="score-ring__value">{score.toFixed(1)}</span>
      </div>
    </div>
  );
}
