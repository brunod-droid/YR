import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getReports } from '../../lib/reportStore';

export default function Weekly() {
  const [reports, setReports] = useState([]);
  useEffect(() => setReports(getReports()), []);
  const latest = reports[0];
  return (
    <main className="shell">
      <Link href="/" className="back">← Home</Link>
      <section className="hero"><p className="eyebrow">Weekly report</p><h1>{latest ? `${latest.weekStart} → ${latest.weekEnd}` : 'No week uploaded yet'}</h1><p className="lead">Core Yves Rocher Customer Service KPIs.</p></section>
      {latest ? <section className="grid cards">
        <div className="metric"><span>Created tickets</span><strong>{latest.kpis?.created || 0}</strong></div>
        <div className="metric"><span>Closed tickets</span><strong>{latest.kpis?.closed || 0}</strong></div>
        <div className="metric"><span>Backlog</span><strong>{latest.kpis?.backlog || 0}</strong></div>
        <div className="metric"><span>Orders</span><strong>{latest.kpis?.orders || 0}</strong></div>
        <div className="metric"><span>Tickets / order</span><strong>{latest.kpis?.orders ? ((latest.kpis.created || 0) / latest.kpis.orders).toFixed(2) : '-'}</strong></div>
        <div className="metric"><span>CSAT</span><strong>{latest.kpis?.csat || '-'}</strong></div>
      </section> : <section className="panel"><p>No data yet. Go to Upload Center first.</p></section>}
    </main>
  );
}
