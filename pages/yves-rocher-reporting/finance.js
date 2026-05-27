import { useEffect, useMemo, useState } from "react";
import { getReports } from "../../lib/yr-reporting/storage";
import { ReportingNav, pageStyle, cardStyle, MetricCard, formatNumber } from "../../lib/yr-reporting/components";
import { toNumber } from "../../lib/yr-reporting/metrics";

function normalizeName(value = "") {
  return String(value || "").toLowerCase().trim();
}

function isAverageAgentName(name = "") {
  const n = normalizeName(name);
  return n === "average" || n === "avg" || n === "averages" || n.includes("average");
}

function isHumanAgentName(name = "") {
  const n = normalizeName(name);
  return n.includes("antonette") || n.includes("antoinette") || n.includes("kyrene");
}

function value(row, names) {
  const key = Object.keys(row || {}).find((k) => names.some((name) => String(k).toLowerCase().trim() === name));
  return key ? row[key] : "";
}

function normalizeFinanceRows(rows = []) {
  return rows.map((row) => {
    const agent = value(row, ["agent", "agents", "name", "csr", "csr name"]) || row.Agent || row.Name || row.CSR || "";
    return {
      agent: String(agent || "").trim(),
      hours: toNumber(value(row, ["hours", "csr hours", "heures", "heures csr"]) || row.Hours || row["CSR Hours"]),
      costPerHour: toNumber(value(row, ["cost per hour", "hourly cost", "cost/hour", "cout horaire", "coût horaire"]) || row["Cost per hour"] || row["Hourly cost"])
    };
  }).filter((row) => (row.agent || row.hours || row.costPerHour) && !isAverageAgentName(row.agent));
}

function countOrders(orders = []) {
  const explicit = orders.reduce((sum, row) => sum + toNumber(row.Orders || row.orders || row["Order Count"] || row["Total Orders"] || 0), 0);
  return explicit || orders.length;
}

function buildFinanceMetrics(report) {
  const financeRows = normalizeFinanceRows(report?.data?.finance || []);
  const ordersCount = countOrders(report?.data?.orders || []);

  const agentRows = (report?.data?.agents || []).filter((row) => {
    const name = row.Agent || row.Name || row.agent || row.name || row["Agent name"] || "";
    return !isAverageAgentName(name);
  });

  const humanMessagesFromAgents = agentRows.reduce((sum, row) => {
    const name = row.Agent || row.Name || row.agent || row.name || row["Agent name"] || "";
    if (!isHumanAgentName(name)) return sum;
    return sum + toNumber(row["Messages sent"] || row["Messages Sent"] || row["Messages sent during the period"] || row.Messages || row.messages || 0);
  }, 0);

  const humanMessagesFromTickets = (report?.data?.tickets || []).reduce((sum, row) => {
    const name = row["Assignee name"] || row.Assignee || row.assignee || "";
    if (!isHumanAgentName(name)) return sum;
    return sum + toNumber(row["Number of agent messages"] || row["Agent messages"] || row["Messages sent"] || row["Messages Sent"] || row.Messages || 0);
  }, 0);

  const humanMessages = humanMessagesFromAgents || humanMessagesFromTickets;
  const humanHours = financeRows.filter((row) => isHumanAgentName(row.agent)).reduce((sum, row) => sum + row.hours, 0);
  const totalHours = financeRows.reduce((sum, row) => sum + row.hours, 0);
  const totalCost = financeRows.reduce((sum, row) => sum + row.hours * row.costPerHour, 0);

  return {
    financeRows: financeRows.map((row) => ({ ...row, totalCost: row.hours * row.costPerHour })),
    totalHours,
    totalCost,
    ordersCount,
    humanMessages,
    humanHours,
    orderCost: ordersCount ? totalCost / ordersCount : 0,
    productivity: humanHours ? humanMessages / humanHours : 0
  };
}

function money(value, digits = 0) {
  return `$${formatNumber(value, digits)}`;
}

export default function FinancePage() {
  const [reports, setReports] = useState([]);
  const [week, setWeek] = useState("");

  useEffect(() => {
    const stored = getReports();
    setReports(stored);
    setWeek(stored[0]?.week || "");
  }, []);

  const report = reports.find((item) => item.week === week);
  const metrics = useMemo(() => buildFinanceMetrics(report), [report]);

  return (
    <main style={pageStyle}>
      <ReportingNav />
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: "#991b1b", fontWeight: 900 }}>Protected Finance Area</div>
        <h1 style={{ fontSize: 42, margin: "6px 0" }}>Finance KPIs</h1>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>
          The AVERAGE row is ignored. Productivity is calculated only with Antonette + Kyrene messages / hours.
        </p>
      </div>

      <div style={cardStyle}>
        <label style={{ fontWeight: 900, marginRight: 12 }}>Select week</label>
        <select value={week} onChange={(e) => setWeek(e.target.value)} style={{ padding: 10, borderRadius: 10 }}>
          {reports.map((r) => <option key={r.week} value={r.week}>{r.week}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 20 }}>
        <MetricCard label="CSR Hours" value={formatNumber(metrics.totalHours, 0)} hint="All CSR hours except AVERAGE" />
        <MetricCard label="CSR Cost" value={money(metrics.totalCost, 0)} hint="Hours × cost/hour" />
        <MetricCard label="Order Cost" value={money(metrics.orderCost, 2)} hint={`${formatNumber(metrics.ordersCount)} paid orders`} />
        <MetricCard label="Productivity" value={formatNumber(metrics.productivity, 0)} hint={`${formatNumber(metrics.humanMessages)} human messages / ${formatNumber(metrics.humanHours, 0)} human hours`} />
      </div>

      <div style={{ ...cardStyle, marginTop: 20 }}>
        <h2>Finance input by agent</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead><tr style={{ textAlign: "left", color: "#64748b", borderBottom: "1px solid #e5e7eb" }}><th style={{ padding: 10 }}>Agent</th><th style={{ padding: 10 }}>Hours</th><th style={{ padding: 10 }}>Cost / hour</th><th style={{ padding: 10 }}>Total cost</th><th style={{ padding: 10 }}>Productivity scope</th></tr></thead>
            <tbody>{metrics.financeRows.length ? metrics.financeRows.map((row, index) => <tr key={`${row.agent}-${index}`} style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: 10, fontWeight: 900 }}>{row.agent || "Unknown"}</td><td style={{ padding: 10 }}>{formatNumber(row.hours, 0)}</td><td style={{ padding: 10 }}>{money(row.costPerHour, 0)}</td><td style={{ padding: 10 }}>{money(row.totalCost, 0)}</td><td style={{ padding: 10 }}>{isHumanAgentName(row.agent) ? "Included" : "Excluded"}</td></tr>) : <tr><td style={{ padding: 10, color: "#64748b" }} colSpan={5}>No finance data uploaded yet.</td></tr>}</tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
