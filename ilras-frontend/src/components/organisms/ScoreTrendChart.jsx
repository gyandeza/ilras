/**
 * Score Trend Chart (EPIC 5).
 *
 * Deliberately built from real audit_log score_view entries only --
 * NOT from a fabricated multi-year dataset. This system doesn't have
 * genuine historical snapshots spanning years yet (it's a new pilot),
 * so this chart shows whatever real score-view history actually
 * exists so far, however sparse that is, rather than inventing a
 * "2024/2025/2026" trend line that never happened.
 *
 * Forecasting (2027/2028) is intentionally NOT implemented here --
 * extrapolating from 0-2 real data points would be fabricating
 * predictions dressed up as statistics. See the note rendered at the
 * bottom of this component.
 */
function formatShortDate(isoString) {
  return new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const WIDTH = 560;
const HEIGHT = 180;
const PAD_X = 40;
const PAD_Y = 24;

export default function ScoreTrendChart({ entries }) {
  // Simulated scores are hypothetical what-if results, not the
  // district's actual recorded score -- mixing them into a "trend"
  // would misrepresent what really happened over time.
  const realScores = (entries ?? [])
    .filter((e) => e.action === 'score_view')
    .slice()
    .reverse(); // backend returns newest-first; chart reads left-to-right chronologically

  if (realScores.length === 0) {
    return (
      <p className="trend-empty">
        Belum ada riwayat skor tercatat untuk kecamatan ini. Grafik tren akan muncul
        setelah kecamatan ini dilihat beberapa kali dari waktu ke waktu.
      </p>
    );
  }

  if (realScores.length === 1) {
    const only = realScores[0];
    return (
      <div>
        <p className="trend-single">
          Baru ada <strong>1 titik data</strong> ({only.result_score.toFixed(1)} pada{' '}
          {formatShortDate(only.timestamp)}) -- belum cukup untuk menggambar tren. Kunjungi
          kembali kecamatan ini di lain waktu untuk mulai membangun riwayat.
        </p>
        <TrendNote />
      </div>
    );
  }

  const scores = realScores.map((e) => e.result_score);
  const minScore = Math.max(0, Math.min(...scores) - 5);
  const maxScore = Math.min(100, Math.max(...scores) + 5);
  const range = maxScore - minScore || 1;

  const points = realScores.map((e, i) => {
    const x = PAD_X + (i / (realScores.length - 1)) * (WIDTH - PAD_X * 2);
    const y = HEIGHT - PAD_Y - ((e.result_score - minScore) / range) * (HEIGHT - PAD_Y * 2);
    return { x, y, entry: e };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="trend-chart">
        <line x1={PAD_X} y1={HEIGHT - PAD_Y} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_Y} className="trend-chart__axis" />
        <path d={pathD} className="trend-chart__line" fill="none" />
        {points.map((p, i) => (
          <g key={i}>
            {p.entry.methodology_changed && (
              <line x1={p.x} y1={PAD_Y / 2} x2={p.x} y2={HEIGHT - PAD_Y} className="trend-chart__methodology-marker" />
            )}
            <circle cx={p.x} cy={p.y} r={3.5} className="trend-chart__dot" />
          </g>
        ))}
      </svg>
      <div className="trend-chart__labels">
        <span>{formatShortDate(realScores[0].timestamp)}</span>
        <span>{formatShortDate(realScores[realScores.length - 1].timestamp)}</span>
      </div>
      {points.some((p) => p.entry.methodology_changed) && (
        <div className="trend-chart__legend">
          <span className="trend-chart__legend-marker" /> Perubahan versi metodologi
        </div>
      )}
      <TrendNote />
    </div>
  );
}

function TrendNote() {
  return (
    <p className="trend-note">
      Grafik ini hanya menampilkan riwayat skor NYATA yang tercatat sistem -- bukan
      data ilustratif multi-tahun. Peramalan (2027/2028) belum tersedia: mengekstrapolasi
      dari data historis yang masih sangat sedikit akan menghasilkan prediksi yang
      terlihat presisi padahal tidak berdasar.
    </p>
  );
}
