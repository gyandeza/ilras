function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function HistoryTimeline({ entries }) {
  if (!entries || entries.length === 0) {
    return <p className="history-empty">Belum ada aktivitas tercatat untuk kecamatan ini.</p>;
  }

  return (
    <div className="history-timeline">
      {entries.map((e, i) => (
        <div key={i} className="history-item">
          {e.methodology_changed && (
            <div className="history-item__methodology-flag">
              ⚠️ Versi metodologi berubah menjadi {e.methodology_version}
            </div>
          )}
          <div className="history-item__row">
            <span className="history-item__label">{e.action_label}</span>
            <span className="history-item__score">{e.result_score.toFixed(1)}</span>
          </div>
          <div className="history-item__time">{formatDateTime(e.timestamp)}</div>
        </div>
      ))}
    </div>
  );
}
