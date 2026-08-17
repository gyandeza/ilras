const TIER_COLORS = {
  'Siap Investasi': 'var(--band-sangat-siap)',
  'Potensial dengan Perbaikan Kecil': 'var(--band-cukup-siap)',
  'Memerlukan Investasi Signifikan': 'var(--band-kurang-siap)',
};

export default function RecommendationPanel({ data }) {
  if (!data) return null;
  const { swot, investment } = data;
  const tierColor = TIER_COLORS[investment.tier] ?? 'var(--color-muted)';

  return (
    <div className="panel">
      <div className="panel__heading">Rekomendasi &amp; Prioritas Investasi</div>

      <div className="rec-tier" style={{ borderLeftColor: tierColor }}>
        <span className="rec-tier__label" style={{ color: tierColor }}>{investment.tier}</span>
        <p className="rec-tier__rationale">{investment.rationale}</p>
      </div>

      <div className="swot-grid">
        <div className="swot-cell swot-cell--strength">
          <div className="swot-cell__title">Kekuatan</div>
          {swot.strengths.map((s) => (
            <div key={s.label} className="swot-cell__item">{s.label} <b>{s.score}</b></div>
          ))}
        </div>
        <div className="swot-cell swot-cell--weakness">
          <div className="swot-cell__title">Kelemahan</div>
          {swot.weaknesses.map((s) => (
            <div key={s.label} className="swot-cell__item">{s.label} <b>{s.score}</b></div>
          ))}
        </div>
        <div className="swot-cell swot-cell--opportunity">
          <div className="swot-cell__title">Peluang</div>
          <p className="swot-cell__text">{swot.opportunity}</p>
        </div>
        <div className="swot-cell swot-cell--threat">
          <div className="swot-cell__title">Ancaman</div>
          <div className="swot-cell__item">{swot.threats.label} <b>{swot.threats.score}</b></div>
          <p className="swot-cell__text">{swot.threats.interpretation}</p>
        </div>
      </div>
    </div>
  );
}
