import { useEffect, useMemo, useState } from "react";
import { getReports, getSettings } from "../../lib/yr-reporting/storage";
import { calculateWeeklyMetrics } from "../../lib/yr-reporting/metrics";
import { ReportingNav, MetricCard, pageStyle, cardStyle, formatNumber } from "../../lib/yr-reporting/components";

function statusHint(type, value, unit) {
  if (!value) return "⚠️ Not found in uploaded files";
  if (type === "csat") return value >= 4.2 ? "✅ On target" : "⚠️ Below target (Goal: 4.2)";
  if (type === "sla") {
    if (unit === "%") return value >= 90 ? "✅ On target" : "⚠️ Below target";
    return value <= 10 ? "✅ On target" : "⚠️ Too slow (Goal: 10h)";
  }
  return "";
}

function formatHours(value) { return value ? `${formatNumber(value, 1)}h` : "—"; }

function HighlightKpi({ label, value, hint, color }) {
  return (
    <div style={{ ...cardStyle, borderTop: `6px solid ${color}`, minHeight: 138 }}>
      <div style={{ color: "#64748b", fontWeight: 800, fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 40, fontWeight: 950, marginTop: 8, color: "#0f172a" }}>{value}</div>
      <div style={{ color: "#475569", marginTop: 8, fontWeight: 700 }}>{hint}</div>
    </div>
  );
}

function AgentTable({ agents }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#64748b", borderBottom: "1px solid #e5e7eb" }}>
            <th style={{ padding: 10 }}>Agent</th><th style={{ padding: 10 }}>Role</th><th style={{ padding: 10 }}>Assigned tickets</th><th style={{ padding: 10 }}>Messages sent</th><th style={{ padding: 10 }}>CSAT</th><th style={{ padding: 10 }}>CSAT count</th><th style={{ padding: 10 }}>SLA / FRT</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.name} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: 10, fontWeight: 900 }}>{agent.name}</td>
              <td style={{ padding: 10 }}>{agent.role}</td>
              <td style={{ padding: 10 }}>{formatNumber(agent.assignedTickets)}</td>
              <td style={{ padding: 10 }}>{formatNumber(agent.messagesSent)}</td>
              <td style={{ padding: 10 }}>{agent.avgCsat ? formatNumber(agent.avgCsat, 2) : "—"}</td>
              <td style={{ padding: 10 }}>{agent.csatCount || "—"}</td>
              <td style={{ padding: 10 }}>{formatHours(agent.avgFirstResponseHours)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WeeklyReport() {
  const [reports, setReports] = useState([]);
  const [week, setWeek] = useState("");
  const [settings, setSettings] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showAgents, setShowAgents] = useState(true);

  useEffect(() => {
    const stored = getReports();
    setReports(stored);
    setWeek(stored[0]?.week || "");
    setSettings(getSettings());
  }, []);

  const report = reports.find((item) => item.week === week);
  const metrics = useMemo(() => report && settings ? calculateWeeklyMetrics(report, settings) : null, [report, settings]);

  return (
    <main style={pageStyle}>
      <ReportingNav />
      <h1 style={{ fontSize: 42, fontWeight: 900 }}>Weekly Report</h1>

      <div style={cardStyle}>
        <label style={{ fontWeight: 900, marginRight: 12 }}>Select week</label>
        <select value={week} onChange={(e) => setWeek(e.target.value)} style={{ padding: 10, borderRadius: 10 }}>
          {reports.map((r) => <option key={r.week} value={r.week}>{r.week}</option>)}
        </select>
      </div>

      {!metrics && <div style={cardStyle}>No data available. Upload CSV files first.</div>}

      {metrics && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 20 }}>
            <HighlightKpi label="CSAT" value={metrics.csat ? formatNumber(metrics.csat, 2) : "Not found"} hint={metrics.csatCount ? `${statusHint("csat", metrics.csat)} · ${metrics.csatCount} CSAT responses` : `${statusHint("csat", metrics.csat)} · response count not found`} color={metrics.csat >= 4.2 ? "#16a34a" : "#f59e0b"} />
            <HighlightKpi label="SLA Global" value={formatHours(metrics.slaGlobal)} hint={statusHint("sla", metrics.slaGlobal, "h")} color={metrics.slaGlobal ? "#16a34a" : "#f59e0b"} />
            <HighlightKpi label="SLA Notch" value={formatHours(metrics.slaNotch)} hint="AI answer only" color={metrics.slaNotch ? "#16a34a" : "#64748b"} />
            <HighlightKpi label="SLA Agents" value={formatHours(metrics.slaAgents)} hint="Human agents only" color={metrics.slaAgents ? "#16a34a" : "#64748b"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 20 }}>
            <HighlightKpi label="Tickets / Order" value={`${formatNumber(metrics.ticketsPerOrder * 100, 0)}%`} hint={`${formatNumber(metrics.actionableTickets)} assigned tickets / ${formatNumber(metrics.ordersCount)} paid orders`} color="#2563eb" />
            <HighlightKpi label="Backlog" value={formatNumber(metrics.backlog)} hint="Open tickets" color="#7c3aed" />
            <HighlightKpi label="Messages sent" value={formatNumber(metrics.totalMessagesSent)} hint="Customer-facing messages" color="#0f766e" />
            <HighlightKpi label="Resolution Time" value={metrics.resolutionTime ? `${formatNumber(metrics.resolutionTime, 1)}h` : "Not found"} hint="Average resolution time" color="#ea580c" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 20 }}>
            <MetricCard label="Tickets Created" value={formatNumber(metrics.ticketsCreatedRaw)} hint="Raw tickets from volume/file" />
            <MetricCard label="Assigned Tickets" value={formatNumber(metrics.actionableTickets)} hint={`${formatNumber(metrics.unassignedTickets)} unassigned / not handled`} />
            <MetricCard label="Paid Orders" value={formatNumber(metrics.ordersCount)} hint={`${formatNumber(metrics.unpaidOrRemovedOrders)} unpaid / cancelled / duplicate removed`} />
            <MetricCard label="Global FRT source" value={formatHours(metrics.slaValue)} hint="Fallback from customer experience" />
          </div>

          <div style={{ ...cardStyle, marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div><h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Agent drilldown</h2><div style={{ color: "#64748b", marginTop: 6 }}>Sorted by role: AI answer → Human agent → Management</div></div>
              <button onClick={() => setShowAgents(!showAgents)} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer" }}>{showAgents ? "Hide" : "Show"}</button>
            </div>
            {showAgents && <AgentTable agents={metrics.agentDrilldown} />}
          </div>

          <div style={{ ...cardStyle, marginTop: 20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900 }}>Top Drivers</h2>
            {metrics.drivers.length ? metrics.drivers.map((item) => <div key={item.driver} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}><span>{item.driver}</span><b>{item.count}</b></div>) : <p style={{ color: "#64748b" }}>No drivers detected yet.</p>}
          </div>

          <div style={{ ...cardStyle, marginTop: 20 }}>
            <button onClick={() => setShowDebug(!showDebug)} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer" }}>{showDebug ? "Hide file diagnostics" : "Show file diagnostics"}</button>
            {showDebug && <div style={{ marginTop: 16, color: "#475569", lineHeight: 1.7 }}>
              <div><b>Order columns:</b></div><pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", padding: 12, borderRadius: 12 }}>{(metrics.debug?.orderColumns || []).join(", ")}</pre>
              <div><b>Ticket columns:</b></div><pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", padding: 12, borderRadius: 12 }}>{(metrics.debug?.ticketColumns || []).join(", ")}</pre>
              <div><b>Agent metrics columns:</b></div><pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", padding: 12, borderRadius: 12 }}>{(metrics.debug?.agentMetricsColumns || []).join(", ") || "No agent metrics file detected"}</pre>
            </div>}
          </div>
        </>
      )}
    </main>
  );
}
