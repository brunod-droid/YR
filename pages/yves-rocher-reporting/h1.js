import { useEffect, useMemo, useState } from "react";
import { loadMonthlyReports, getSettings } from "../../lib/yr-reporting/storage";
import { calculateWeeklyMetrics } from "../../lib/yr-reporting/metrics";
import { getFinanceBreakdown, aggregateFinance } from "../../lib/yr-reporting/financeModel";
import { ReportingNav, pageStyle, cardStyle, formatNumber } from "../../lib/yr-reporting/components";

function currency(v, digits = 0) { return `$${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })}`; }
function pct(v, digits = 1) { return `${formatNumber(Number(v || 0) * 100, digits)}%`; }
function Kpi({ label, value, sub }) { return <div style={{ ...cardStyle, minHeight: 110 }}><div style={{ color: "#64748b", fontWeight: 900, fontSize: 12, textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: 30, fontWeight: 950, marginTop: 8 }}>{value}</div>{sub && <div style={{ color: "#64748b", marginTop: 6, fontSize: 13 }}>{sub}</div>}</div>; }
function RowTable({ rows }) { return <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr style={{ textAlign: "left", color: "#64748b", borderBottom: "1px solid #e5e7eb" }}>{Object.keys(rows[0] || {}).map((h) => <th key={h} style={{ padding: 10 }}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>{Object.values(row).map((v, j) => <td key={j} style={{ padding: 10, fontWeight: j === 0 ? 900 : 500 }}>{v}</td>)}</tr>)}</tbody></table></div>; }

export default function H1ReviewPage() {
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => { async function load() { try { setReports(await loadMonthlyReports()); setSettings(getSettings()); } catch (e) { setStatus(e.message); } } load(); }, []);

  const rows = useMemo(() => {
    if (!settings) return [];
    return reports.filter((r) => r.month >= "2026-01" && r.month <= "2026-06").sort((a, b) => a.month.localeCompare(b.month)).map((r) => {
      const metrics = calculateWeeklyMetrics(r, settings);
      const finance = getFinanceBreakdown(r.month, metrics);
      return { month: r.month, metrics, finance };
    });
  }, [reports, settings]);

  const totals = useMemo(() => {
    const finance = aggregateFinance(rows);
    return rows.reduce((acc, row) => {
      acc.totalOrders += row.metrics.totalOrders || 0;
      acc.paidOrders += row.metrics.paidOrders || row.metrics.ordersCount || 0;
      acc.cancelledOrders += row.metrics.cancelledOrders || 0;
      acc.refundedOrders += row.metrics.refundedOrders || 0;
      acc.fraudOrders += row.metrics.fraudOrders || 0;
      acc.tickets += row.metrics.actionableTickets || 0;
      acc.messages += row.metrics.totalMessagesSent || 0;
      acc.revenue += row.metrics.revenue || 0;
      return acc;
    }, { totalOrders: 0, paidOrders: 0, cancelledOrders: 0, refundedOrders: 0, fraudOrders: 0, tickets: 0, messages: 0, revenue: 0, finance });
  }, [rows]);

  const tableRows = rows.map((r) => ({ Month: r.month, "Paid Orders": formatNumber(r.metrics.paidOrders || r.metrics.ordersCount), Tickets: formatNumber(r.metrics.actionableTickets), TPO: pct(r.metrics.ticketsPerOrder), "Human Cost": currency(r.finance.humanCost), "AI Cost": currency(r.finance.aiCost), "Total Cost / Order": currency(r.finance.totalCostPerOrder, 2), "Total Cost / Ticket": currency(r.finance.totalCostPerTicket, 2) }));

  return <main style={pageStyle}>
    <ReportingNav />
    <div style={{ marginBottom: 22 }}><div style={{ color: "#15803d", fontWeight: 950 }}>Yves Rocher Customer Experience</div><h1 style={{ fontSize: 42, margin: "6px 0" }}>H1 2026 Executive Review</h1><p style={{ color: "#475569", lineHeight: 1.6 }}>January to June view: order volume, support load, human cost, Notch AI cost and cost per order.</p></div>
    {status && <div style={{ ...cardStyle, color: "#b91c1c" }}>{status}</div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>
      <Kpi label="Paid Orders" value={formatNumber(totals.paidOrders)} sub="Shopify paid orders only" />
      <Kpi label="Tickets" value={formatNumber(totals.tickets)} sub="Actionable Gorgias tickets" />
      <Kpi label="Tickets / Order" value={pct(totals.paidOrders ? totals.tickets / totals.paidOrders : 0)} sub="Tickets / paid orders" />
      <Kpi label="Human CS Cost" value={currency(totals.finance.humanCost)} sub="Canada + Philippines" />
      <Kpi label="Notch AI Cost" value={currency(totals.finance.aiCost)} sub="Actual invoices Jan-Jun" />
      <Kpi label="Total CX Cost" value={currency(totals.finance.totalCost)} sub="Human + AI" />
      <Kpi label="Cost / Order" value={currency(totals.paidOrders ? totals.finance.totalCost / totals.paidOrders : 0, 2)} sub="Total CX cost / paid orders" />
      <Kpi label="Cost / Ticket" value={currency(totals.tickets ? totals.finance.totalCost / totals.tickets : 0, 2)} sub="Total CX cost / tickets" />
    </div>
    <section style={{ ...cardStyle, marginTop: 18 }}><h2 style={{ marginTop: 0 }}>Month-by-month H1 breakdown</h2>{tableRows.length ? <RowTable rows={tableRows} /> : <p style={{ color: "#64748b" }}>Upload monthly reports for Jan-Jun to activate this view.</p>}</section>
    <section style={{ ...cardStyle, marginTop: 18 }}><h2 style={{ marginTop: 0 }}>Cost logic</h2><ul style={{ color: "#334155", lineHeight: 1.8 }}><li><b>Notch:</b> actual invoice total per month, including minimum fee and usage fees.</li><li><b>Philippines:</b> Antonette and Kyrene invoices from April onward.</li><li><b>Canada:</b> January to end of prestation, calculated as messages sent × $2.30 per message.</li><li><b>Order cost:</b> all cost-per-order KPIs use paid Shopify orders only.</li></ul></section>
  </main>;
}
