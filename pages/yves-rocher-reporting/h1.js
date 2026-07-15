import { useEffect, useMemo, useState } from "react";
import { loadMonthlyReports, getSettings } from "../../lib/yr-reporting/storage";
import { calculateWeeklyMetrics } from "../../lib/yr-reporting/metrics";
import { getCostBreakdown, NOTCH_COSTS_2026, PHILIPPINES_COSTS_2026 } from "../../lib/yr-reporting/costs";
import { ReportingNav, pageStyle, cardStyle, formatNumber } from "../../lib/yr-reporting/components";

function money(value, digits = 0) { return `$${formatNumber(value || 0, digits)}`; }
function pct(value, digits = 1) { return value ? `${formatNumber(value * 100, digits)}%` : "—"; }
function Metric({ label, value, hint }) { return <div style={{ ...cardStyle, padding: 16 }}><div style={{ color: "#64748b", fontWeight: 900, fontSize: 12, textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: 30, fontWeight: 950, marginTop: 8 }}>{value}</div>{hint && <div style={{ color: "#64748b", marginTop: 6, fontSize: 13 }}>{hint}</div>}</div>; }

export default function H1Review() {
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState(null);
  const [status, setStatus] = useState("");
  useEffect(() => { async function load() { try { setSettings(getSettings()); setReports(await loadMonthlyReports()); } catch (e) { setStatus(e.message); } } load(); }, []);

  const rows = useMemo(() => {
    if (!settings) return [];
    return reports.filter((r) => r.month >= "2026-01" && r.month <= "2026-06").sort((a,b) => a.month.localeCompare(b.month)).map((report) => {
      const metrics = calculateWeeklyMetrics(report, settings);
      const costs = getCostBreakdown(report.month, metrics);
      return { month: report.month, metrics, costs };
    });
  }, [reports, settings]);

  const totals = rows.reduce((acc, r) => {
    acc.orders += r.metrics.ordersCount || 0;
    acc.tickets += r.metrics.actionableTickets || r.metrics.ticketsCreatedRaw || 0;
    acc.totalTickets += r.metrics.ticketsCreatedRaw || 0;
    acc.messages += r.metrics.totalMessagesSent || 0;
    acc.humanCost += r.costs.humanCost || 0;
    acc.aiCost += r.costs.aiCost || 0;
    acc.totalCost += r.costs.totalCost || 0;
    acc.refunded += r.metrics.refundedOrders || 0;
    acc.cancelled += r.metrics.cancelledOrders || 0;
    acc.fraud += r.metrics.fraudOrders || 0;
    return acc;
  }, { orders: 0, tickets: 0, totalTickets: 0, messages: 0, humanCost: 0, aiCost: 0, totalCost: 0, refunded: 0, cancelled: 0, fraud: 0 });

  const staticNotch = Object.values(NOTCH_COSTS_2026).reduce((s, x) => s + x.total, 0);
  const staticPhilippines = Object.values(PHILIPPINES_COSTS_2026).reduce((s, x) => s + x.total, 0);

  return <main style={pageStyle}>
    <ReportingNav />
    <h1 style={{ fontSize: 40, marginBottom: 6 }}>H1 2026 Executive Review</h1>
    <p style={{ color: "#64748b", lineHeight: 1.6 }}>H1 view based on monthly uploaded reports. If a month is missing, upload it from Monthly Upload. Notch and Philippines invoice totals are embedded for Jan-Jun.</p>
    {status && <div style={{ ...cardStyle, color: "#b91c1c" }}>{status}</div>}

    <section style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      <Metric label="Paid orders" value={formatNumber(totals.orders)} hint="Shopify paid orders Jan-Jun" />
      <Metric label="Assigned tickets" value={formatNumber(totals.tickets)} hint="Gorgias assigned tickets" />
      <Metric label="Tickets / Order" value={pct(totals.orders ? totals.tickets / totals.orders : 0)} hint="Assigned tickets / paid orders" />
      <Metric label="Total CX cost" value={money(totals.totalCost || (staticNotch + staticPhilippines))} hint="Human + Notch" />
      <Metric label="Human cost" value={money(totals.humanCost || staticPhilippines)} hint="Canada when data exists + VA Academy Apr-Jun" />
      <Metric label="AI cost" value={money(totals.aiCost || staticNotch)} hint="Actual Notch invoices Jan-Jun" />
      <Metric label="Cost / order" value={money(totals.orders ? totals.totalCost / totals.orders : 0, 2)} hint="Total CX cost / paid orders" />
      <Metric label="Cost / ticket" value={money(totals.tickets ? totals.totalCost / totals.tickets : 0, 2)} hint="Total CX cost / assigned tickets" />
    </section>

    <section style={{ ...cardStyle, marginTop: 20 }}>
      <h2 style={{ marginTop: 0 }}>Monthly cost and productivity breakdown</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ color: "#64748b", textAlign: "left" }}><th style={{ padding: 10 }}>Month</th><th style={{ padding: 10 }}>Orders</th><th style={{ padding: 10 }}>Tickets</th><th style={{ padding: 10 }}>TPO</th><th style={{ padding: 10 }}>Human cost</th><th style={{ padding: 10 }}>Notch cost</th><th style={{ padding: 10 }}>Total cost</th><th style={{ padding: 10 }}>Cost/order</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.month} style={{ borderTop: "1px solid #e5e7eb" }}><td style={{ padding: 10, fontWeight: 950 }}>{r.month}</td><td style={{ padding: 10 }}>{formatNumber(r.metrics.ordersCount)}</td><td style={{ padding: 10 }}>{formatNumber(r.metrics.actionableTickets || r.metrics.ticketsCreatedRaw)}</td><td style={{ padding: 10 }}>{pct(r.metrics.ticketsPerOrder)}</td><td style={{ padding: 10 }}>{money(r.costs.humanCost)}</td><td style={{ padding: 10 }}>{money(r.costs.aiCost)}</td><td style={{ padding: 10, fontWeight: 950 }}>{money(r.costs.totalCost)}</td><td style={{ padding: 10 }}>{money(r.costs.totalCostPerOrder, 2)}</td></tr>)}</tbody>
      </table>
      {!rows.length && <p style={{ color: "#64748b" }}>No monthly reports found for H1. Upload monthly data for Jan-Jun to populate the table.</p>}
    </section>
  </main>;
}
