import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getReports, summarizeWeeks } from '../../lib/reportStore';

export default function Monthly() {
  const [reports, setReports] = useState([]);
  useEffect(() => setReports(getReports()), []);
  const summary = useMemo(() => summarizeWeeks(reports), [reports]);
  const avgCsat = summary.csatValues.length ? (summary.csatValues.reduce((a,b) => a+b, 0) / summary.csatValues.length).toFixed(1) : '-';
  return (
    <main className="shell">
      <Link href="/" className="back">← Home</Link>
      <section className="hero"><p className="eyebrow">Monthly report</p><h1>Monthly aggregation</h1><p className="lead">Totals and averages based on uploaded weekly reports.</p></section>
      <section className="grid cards">
        <div className="metric"><span>Weeks</span><strong>{reports.length}</strong></div>
        <div className="metric"><span>Total created</span><strong>{summary.created}</strong></div>
        <div className="metric"><span>Total closed</span><strong>{summary.closed}</strong></div>
        <div className="metric"><span>Total orders</span><strong>{summary.orders}</strong></div>
        <div className="metric"><span>Avg CSAT</span><strong>{avgCsat}</strong></div>
      </section>
    </main>
  );
}
