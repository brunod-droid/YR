import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clearReports, exportReports, getReports, importReports } from '../../lib/reportStore';

export default function History() {
  const [reports, setReports] = useState([]);
  const [importText, setImportText] = useState('');
  useEffect(() => setReports(getReports()), []);

  function downloadExport() {
    const blob = new Blob([exportReports()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yr_reports_export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData() {
    const next = importReports(importText);
    setReports(next);
    setImportText('');
  }

  function clearData() {
    clearReports();
    setReports([]);
  }

  return (
    <main className="shell">
      <Link href="/" className="back">← Home</Link>
      <section className="hero"><p className="eyebrow">History</p><h1>Uploaded weeks</h1><p className="lead">LocalStorage key: yr_reports. Export from the old hub browser, then import here.</p></section>
      <section className="panel actions"><button onClick={downloadExport}>Export JSON</button><button onClick={clearData}>Clear local data</button></section>
      <section className="panel"><textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste yr_reports JSON here" /><button onClick={importData}>Import JSON</button></section>
      <section className="panel"><table><thead><tr><th>Week</th><th>Created</th><th>Closed</th><th>Orders</th><th>Files</th></tr></thead><tbody>{reports.map((r) => <tr key={r.id}><td>{r.weekStart} → {r.weekEnd}</td><td>{r.kpis?.created || 0}</td><td>{r.kpis?.closed || 0}</td><td>{r.kpis?.orders || 0}</td><td>{Object.keys(r.files || {}).join(', ')}</td></tr>)}</tbody></table></section>
    </main>
  );
}
