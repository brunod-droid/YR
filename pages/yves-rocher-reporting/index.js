import { useEffect, useState } from "react";
import Link from "next/link";
import { getReports, getSettings } from "../../lib/yr-reporting/storage";
import { calculateWeeklyMetrics } from "../../lib/yr-reporting/metrics";
import { ReportingNav, MetricCard, pageStyle, cardStyle, formatNumber } from "../../lib/yr-reporting/components";

export default function YvesRocherReportingDashboard() {
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setReports(getReports());
    setSettings(getSettings());
  }, []);

  const latest = reports[0] || null;
  const metrics = latest && settings ? calculateWeeklyMetrics(latest, settings) : null;

  return (
    <main style={pageStyle}>
      <ReportingNav />
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: "#15803d", fontWeight: 900 }}>Yves Rocher Customer Service</div>
        <h1 style={{ fontSize: 42, margin: "6px 0" }}>Reporting Dashboard</h1>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>Frontend-only V1. CSV files are parsed locally and stored in browser localStorage.</p>
      </div>

      {!latest && (
        <div style={cardStyle}>
          <h2>No report uploaded yet</h2>
          <p style={{ color: "#475569" }}>Start by uploading CSV exports.</p>
          <Link href="/yves-rocher-reporting/upload" style={{ display: "inline-block", background: "#15803d", color: "#fff", padding: "12px 16px", borderRadius: 12, textDecoration: "none", fontWeight: 800 }}>
            Upload CSV files
          </Link>
        </div>
      )}

      {latest && metrics && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <MetricCard label="Latest week" value={latest.week} />
            <MetricCard label="Tickets created" value={formatNumber(metrics.ticketsCreated)} />
            <MetricCard label="Tickets closed" value={formatNumber(metrics.ticketsClosed)} />
            <MetricCard label="Open backlog" value={formatNumber(metrics.backlog)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 16 }}>
            <MetricCard label="Orders" value={formatNumber(metrics.ordersCount)} />
            <MetricCard label="Tickets / Order" value={formatNumber(metrics.ticketsPerOrder, 2)} />
            <MetricCard label="CSAT" value={formatNumber(metrics.csat, 2)} hint={`Target: ${settings.targets.csat}`} />
            <MetricCard label="First response time" value={formatNumber(metrics.firstResponseTime, 1)} hint={`SLA: ${settings.targets.slaHours}h`} />
          </div>

          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h2>Top drivers</h2>
            {metrics.drivers.length ? metrics.drivers.map((item) => (
              <div key={item.driver} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span>{item.driver}</span><b>{item.count}</b>
              </div>
            )) : <p style={{ color: "#64748b" }}>No drivers detected yet.</p>}
          </div>
        </>
      )}
    </main>
  );
}
