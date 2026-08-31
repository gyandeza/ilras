/**
 * Template-based executive summary generator. Deliberately NOT an LLM
 * call -- every sentence maps directly to a specific field already
 * computed by the backend (score, band, SWOT, investment tier), so
 * the summary can never say something the underlying data doesn't
 * actually support.
 */
export function generateExecutiveSummary(district, recommendation) {
  if (!district || !recommendation) return '';
  const { swot, investment } = recommendation;

  const strengths = swot.strengths.map((s) => `${s.label} (${s.score})`).join(' dan ');
  const weaknesses = swot.weaknesses.map((s) => `${s.label} (${s.score})`).join(' dan ');

  return (
    `Kecamatan ${district.name} menunjukkan skor kesiapan industri ${district.score.toFixed(1)}/100 ` +
    `(status: ${district.band}). Kekuatan utama pada dimensi ${strengths}. ` +
    `Kendala utama pada dimensi ${weaknesses}. ` +
    `Prioritas investasi: ${investment.tier} — ${investment.rationale}`
  );
}
