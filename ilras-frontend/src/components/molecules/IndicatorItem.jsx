const CONFIDENCE_LABEL = { high: 'Keyakinan Tinggi', medium: 'Keyakinan Sedang', low: 'Keyakinan Rendah' };

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function IndicatorItem({ indicator }) {
  const { source } = indicator;
  return (
    <div className="indicator-item">
      <div className="indicator-item__title">
        {indicator.title}
        <span className={`indicator-item__conf indicator-item__conf--${source.confidence}`}>
          {CONFIDENCE_LABEL[source.confidence]}
        </span>
      </div>
      <div className="indicator-item__meta">
        Sumber: {source.agency} — {source.document_name}
      </div>
      <div className="indicator-item__meta">
        Diverifikasi terakhir: {formatDate(source.last_verified_at)}
      </div>
      <div className="indicator-item__links">
        {source.document_url ? (
          <a href={source.document_url} target="_blank" rel="noopener noreferrer" className="indicator-item__link">
            🔗 Lihat Dokumen
          </a>
        ) : (
          <span className="indicator-item__link indicator-item__link--unavailable">
            Dokumen belum tersedia daring
          </span>
        )}
        {source.contact_phone && (
          <span className="indicator-item__contact">📞 {source.contact_phone}</span>
        )}
        {source.contact_email && (
          <span className="indicator-item__contact">✉️ {source.contact_email}</span>
        )}
      </div>
    </div>
  );
}
