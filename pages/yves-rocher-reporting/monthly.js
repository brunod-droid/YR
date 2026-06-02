import MonthlyInsightsPanel from "../../lib/yr-reporting/MonthlyInsightsPanel";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadMonthlyReports, getSettings } from "../../lib/yr-reporting/storage";
import { calculateWeeklyMetrics } from "../../lib/yr-reporting/metrics";
import { ReportingNav, MetricCard, pageStyle, cardStyle, formatNumber } from "../../lib/yr-reporting/components";

function formatHours(value) { return value ? `${formatNumber(value, 1)}h` : "-"; }
function statusHint(type, value, unit) { if (!value) return "Not found in uploaded files"; if (type === "csat") return value >= 4.2 ? "On target" : "Below target (Goal: 4.2)"; if (type === "sla") return unit === "%" ? (value >= 90 ? "On target" : "Below target") : (value <= 10 ? "On target" : "Too slow (Goal: 10h)"); return ""; }
function HighlightKpi({ label, value, hint, color }) { return <div style={{ ...cardStyle, borderTop: `6px solid ${color}`, minHeight: 138 }}><div style={{ color: "#64748b", fontWeight: 800, fontSize: 13 }}>{label}</div><div style={{ fontSize: 40, fontWeight: 950, marginTop: 8, color: "#0f172a" }}>{value}</div><div style={{ color: "#475569", marginTop: 8, fontWeight: 700 }}>{hint}</div></div>; }

export default function MonthlyReport() {
  const [reports, setReports] = useState([]);
  const [month, setMonth] = useState("");
  const [settings, setSettings] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => { async function load() { const stored = await loadMonthlyReports(); setReports(stored); setMonth(stored[0]?.month || ""); setSettings(getSettings()); } load(); }, []);
  const report = reports.find((item) => item.month === month);
  const metrics = useMemo(() => report && settings ? calculateWeeklyMetrics(report, settings) : null, [report, settings]);

  return <main style={pageStyle}>
    <ReportingNav />
    <div style={{ marginBottom: 22 }}><div style={{ color: "#7c2d12", fontWeight: 900 }}>Monthly data is uploaded separately</div><h1 style={{ fontSize: 42, margin: "6px 0" }}>Monthly Report</h1><p style={{ color: "#475569", lineHeight: 1.7 }}>This page uses monthly CSV exports from the 1st to the last day of the month. It does not aggregate weekly reports.</p></div>
    <div style={cardStyle}><label style={{ fontWeight: 900, marginRight: 12 }}>Select month</label><select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: 10, borderRadius: 10, minWidth: 220 }}>{reports.map((r) => <option key={r.month} value={r.month}>{r.month}</option>)}</select><Link href="/yves-rocher-reporting/monthly-upload" style={{ marginLeft: 14, display: "inline-block", background: "#7c2d12", color: "#fff", padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 900 }}>Upload monthly data</Link></div>
    {!metrics && <div style={{ ...cardStyle, marginTop: 16 }}>No monthly data available. Upload monthly CSV files first.</div>}
    <MonthlyInsightsPanel month={month} />
     {metrics && <>
      <div style={{ ...cardStyle, marginTop: 16, background: "#fff7ed", border: "1px solid #fed7aa" }}><b>Period:</b> {report.monthStart} to {report.monthEnd}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 20 }}><HighlightKpi label="CSAT" value={metrics.csat ? formatNumber(metrics.csat, 2) : "Not found"} hint={metrics.csatCount ? `${statusHint("csat", metrics.csat)} - ${metrics.csatCount} CSAT responses` : `${statusHint("csat", metrics.csat)} - response count not found`} color={metrics.csat >= 4.2 ? "#16a34a" : "#f59e0b"} /><HighlightKpi label="SLA Global" value={formatHours(metrics.slaGlobal)} hint={statusHint("sla", metrics.slaGlobal, "h")} color={metrics.slaGlobal ? "#16a34a" : "#f59e0b"} /><HighlightKpi label="SLA Notch" value={formatHours(metrics.slaNotch)} hint="AI answer only" color={metrics.slaNotch ? "#16a34a" : "#64748b"} /><HighlightKpi label="SLA Agents" value={formatHours(metrics.slaAgents)} hint="Human agents only" color={metrics.slaAgents ? "#16a34a" : "#64748b"} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 20 }}><HighlightKpi label="Tickets / Order" value={`${formatNumber(metrics.ticketsPerOrder * 100, 0)}%`} hint={`${formatNumber(metrics.actionableTickets)} assigned tickets / ${formatNumber(metrics.ordersCount)} paid orders`} color="#2563eb" /><HighlightKpi label="Backlog" value={formatNumber(metrics.backlog)} hint="Open tickets" color="#7c3aed" /><HighlightKpi label="Messages sent" value={formatNumber(metrics.totalMessagesSent)} hint="Customer-facing messages" color="#0f766e" /><HighlightKpi label="Resolution Time" value={metrics.resolutionTime ? `${formatNumber(metrics.resolutionTime, 1)}h` : "Not found"} hint="Average resolution time" color="#ea580c" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 20 }}><MetricCard label="Tickets Created" value={formatNumber(metrics.ticketsCreatedRaw)} hint="Raw tickets from monthly volume/file" /><MetricCard label="Assigned Tickets" value={formatNumber(metrics.actionableTickets)} hint={`${formatNumber(metrics.unassignedTickets)} unassigned / not handled`} /><MetricCard label="Paid Orders" value={formatNumber(metrics.ordersCount)} hint="Monthly paid orders" /><MetricCard label="Global FRT source" value={formatHours(metrics.slaValue)} hint="Fallback from customer experience" /></div>
      <div style={{ ...cardStyle, marginTop: 20 }}><h2 style={{ fontSize: 24, fontWeight: 900 }}>Top Drivers</h2>{metrics.drivers.length ? metrics.drivers.map((item) => <div key={item.driver} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}><span>{item.driver}</span><b>{item.count}</b></div>) : <p style={{ color: "#64748b" }}>No drivers detected yet.</p>}</div>
      <div style={{ ...cardStyle, marginTop: 20 }}><button onClick={() => setShowDebug(!showDebug)} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer" }}>{showDebug ? "Hide monthly file diagnostics" : "Show monthly file diagnostics"}</button>{showDebug && <div style={{ marginTop: 16, color: "#475569", lineHeight: 1.7 }}><div><b>Order columns:</b></div><pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", padding: 12, borderRadius: 12 }}>{(metrics.debug?.orderColumns || []).join(", ")}</pre><div><b>Ticket columns:</b></div><pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", padding: 12, borderRadius: 12 }}>{(metrics.debug?.ticketColumns || []).join(", ")}</pre><div><b>Agent metrics columns:</b></div><pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", padding: 12, borderRadius: 12 }}>{(metrics.debug?.agentMetricsColumns || []).join(", ") || "No agent metrics file detected"}</pre></div>}</div>
    </>}
  </main>;
}
