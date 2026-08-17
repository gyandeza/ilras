const CONFIDENCE_LABEL = { high: 'Keyakinan Tinggi', medium: 'Keyakinan Sedang', low: 'Keyakinan Rendah' };

export default function IndicatorItem({ indicator }) {
  return (
    <div className="indicator-item">
      <div className="indicator-item__title">
        {indicator.title}
        <span className={`indicator-item__conf indicator-item__conf--${indicator.confidence}`}>
          {CONFIDENCE_LABEL[indicator.confidence]}
        </span>
      </div>
      <div className="indicator-item__meta">
        Sumber: {indicator.source} · Diperbarui {indicator.updated}
      </div>
    </div>
  );
}
