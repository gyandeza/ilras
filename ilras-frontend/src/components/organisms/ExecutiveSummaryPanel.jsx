import { useState } from 'react';
import { generateExecutiveSummary } from '../../lib/reportText.js';
import Button from '../atoms/Button.jsx';

export default function ExecutiveSummaryPanel({ district, recommendation }) {
  const [copied, setCopied] = useState(false);
  if (!district || !recommendation) return null;

  const summary = generateExecutiveSummary(district, recommendation);

  function handleCopy() {
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="panel">
      <div className="panel__heading">Ringkasan Eksekutif</div>
      <p className="exec-summary__text">{summary}</p>
      <Button variant="outline" onClick={handleCopy}>
        {copied ? '✓ Tersalin' : '📋 Salin Teks'}
      </Button>
    </div>
  );
}
