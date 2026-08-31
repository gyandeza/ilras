import { jsPDF } from 'jspdf';
import { DIMENSIONS } from './ilri.js';
import { generateExecutiveSummary } from './reportText.js';

/**
 * Client-side PDF generation. This is presentation only -- no scoring
 * logic here, every number is read directly from data the page
 * already loaded from the backend (single source of truth stays
 * intact; this file just formats what it's given).
 */
export function exportDistrictProfilePdf(district, recommendation) {
  const doc = new jsPDF();
  const marginX = 20;
  let y = 20;

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(`Profil Kesiapan Industri — Kecamatan ${district.name}`, marginX, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  doc.text(`Kabupaten ${district.kabupaten}, ${district.provinsi}`, marginX, y);
  y += 5;
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, marginX, y);
  y += 10;

  doc.setDrawColor(220);
  doc.line(marginX, y, 190, y);
  y += 10;

  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`Skor ILRI: ${district.score.toFixed(1)} / 100  (${district.band})`, marginX, y);
  y += 10;

  doc.setFontSize(12);
  doc.text('Rincian 7 Dimensi', marginX, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  DIMENSIONS.forEach((dim) => {
    const val = district.dims[dim.key];
    doc.text(`${dim.label}`, marginX, y);
    doc.text(`${val}`, 170, y, { align: 'right' });
    y += 6;
  });
  y += 6;

  if (recommendation) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Prioritas Investasi: ${recommendation.investment.tier}`, marginX, y);
    y += 6;
    doc.setFontSize(9.5);
    doc.setFont(undefined, 'normal');
    const rationaleLines = doc.splitTextToSize(recommendation.investment.rationale, 165);
    doc.text(rationaleLines, marginX, y);
    y += rationaleLines.length * 5 + 8;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Ringkasan Eksekutif', marginX, y);
    y += 7;
    doc.setFontSize(9.5);
    doc.setFont(undefined, 'normal');
    const summary = generateExecutiveSummary(district, recommendation);
    const summaryLines = doc.splitTextToSize(summary, 165);
    doc.text(summaryLines, marginX, y);
    y += summaryLines.length * 5 + 8;
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Data ilustratif — dihasilkan oleh ILRAS untuk keperluan pilot 3 kecamatan, Kabupaten Kampar.', marginX, 280);

  doc.save(`Profil-${district.name.replace(/\s+/g, '-')}.pdf`);
}
