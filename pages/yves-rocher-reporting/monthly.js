import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadMonthlyReports, getSettings } from "../../lib/yr-reporting/storage";
import { loadMonthlyInsight } from "../../lib/yr-reporting/monthlyInsightsStorage";
import { calculateWeeklyMetrics } from "../../lib/yr-reporting/metrics";
import { getFinanceBreakdown } from "../../lib/yr-reporting/financeModel";
import { ReportingNav, pageStyle, cardStyle, formatNumber } from "../../lib/yr-reporting/components";

const target = { csat: 4.2, slaHours: 10, tpo: 0.10 };
const nice = { green: "#15803d", amber: "#d97706", red: "#dc2626", blue: "#2563eb", slate: "#0f172a", purple: "#7c3aed" };

function currency(v, digits = 0) { return `$${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })}`; }
function pct(v, digits = 1) { return Number.isFinite(Number(v)) ? `${formatNumber(Number(v) * 100, digits)}%` : "—"; }
function hours(v) { return v ? `${formatNumber(v, 1)}h` : "—"; }
function safe(v, fallback = "—") { return v || v === 0 ? v : fallback; }
function prevMonth(month) { const [y, m] = String(month || "").split("-").map(Number); if (!y || !m) return ""; const d = new Date(y, m - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function delta(current, previous, goodWhenDown = false) { if (!previous) return { text: "—", color: "#64748b" }; const d = (current - previous) / previous; const good = goodWhenDown ? d <= 0 : d >= 0; return { text: `${d >= 0 ? "+" : ""}${formatNumber(d * 100, 1)}%`, color: good ? nice.green : nice.red }; }
function smallSource(source, formula) { return <div style={{ marginTop: 8, color: "#64748b", fontSize: 11, lineHeight: 1.35 }}><b>Source:</b> {source}<br /><b>Formula:</b> {formula}</div>; }
function Section({ title, subtitle, children }) { return <section style={{ ...cardStyle, marginTop: 18 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}><div><h2 style={{ margin: 0, fontSize: 24 }}>{title}</h2>{subtitle && <p style={{ margin: "6px 0 0", color: "#64748b", lineHeight: 1.5 }}>{subtitle}</p>}</div></div><div style={{ marginTop: 16 }}>{children}</div></section>; }
function Kpi({ label, value, sub, color = nice.slate, source, formula }) { return <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, minHeight: 118 }}><div style={{ color: "#64748b", fontWeight: 900, fontSize: 12, textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 8, color, fontSize: 28, fontWeight: 950, whiteSpace: "nowrap" }}>{value}</div>{sub && <div style={{ marginTop: 6, color: "#475569", fontSize: 13 }}>{sub}</div>}{source && smallSource(source, formula)}</div>; }
function Insight({ title, children, tone = "blue", meta }) { const colors = { blue: nice.blue, green: nice.green, amber: nice.amber, red: nice.red, purple: nice.purple, slate: nice.slate }; const c = colors[tone] || colors.blue; return <div style={{ border: "1px solid #e5e7eb", borderLeft: `5px solid ${c}`, borderRadius: 14, padding: 14, background: "#fff" }}><div style={{ fontWeight: 950, fontSize: 16, color: "#0f172a" }}>{title}</div>{meta && <div style={{ color: c, fontWeight: 900, fontSize: 12, marginTop: 4 }}>{meta}</div>}<div style={{ color: "#334155", lineHeight: 1.55, marginTop: 8, fontSize: 14 }}>{children}</div></div>; }
function Table({ rows }) { return <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr style={{ textAlign: "left", color: "#64748b", borderBottom: "1px solid #e5e7eb" }}>{Object.keys(rows[0] || {}).map((h) => <th key={h} style={{ padding: 10 }}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>{Object.values(row).map((v, j) => <td key={j} style={{ padding: 10, fontWeight: j === 0 ? 900 : 500 }}>{v}</td>)}</tr>)}</tbody></table></div>; }
function monthLabel(month) { if (!month) return ""; const [y, m] = month.split("-"); return new Date(Number(y), Number(m) - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" }); }

const juneContactInsights = [
  ["Returns / refund follow-up", "Customers returned items using provided labels and then contacted CS to request refund confirmation.", "~5 tickets/day", "amber"],
  ["Monoi product quality", "Complaints around leaking contents, broken bottles and missing seals increased.", "~10 complaints in 5 days", "red"],
  ["Subscription cancellations", "Many tickets are cancellation requests because customers did not realize they joined a subscription plan.", "High contact driver", "red"],
  ["OOS cancellation flow", "Current cancellation process for out-of-stock items is inefficient and should be improved.", "Process opportunity", "amber"],
  ["Allergy workflow friction", "Agents still ask a standard question list even when it does not change resolution, creating customer friction.", "Policy review", "amber"],
  ["DNR declaration", "Customers sign a DNR declaration that is not reused in carrier claims or internal workflows.", "Simplification opportunity", "amber"]
];

const customerVoice = [
  ["French heritage", "Customers repeatedly mention France, memories from French stores, and the emotional connection to Yves Rocher.", "Trustpilot / Yotpo reviews", "green"],
  ["Brand rediscovery", "Several customers describe coming back after many years and being happy to find the brand again online.", "Customer voice", "green"],
  ["Hero products", "Hair Vinegar, Monoi / Tahitian oil, Evidence perfume and hair care products stand out in positive reviews.", "Product signal", "blue"],
  ["Advocacy", "Some customers explicitly say they recommend Yves Rocher to friends or professional clients.", "Growth opportunity", "purple"]
];

export default function MonthlyReport() {
  const [reports, setReports] = useState([]);
  const [month, setMonth] = useState("");
  const [settings, setSettings] = useState(null);
  const [insight, setInsight] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => { async function load() { try { const stored = await loadMonthlyReports(); setReports(stored); setMonth(stored[0]?.month || ""); setSettings(getSettings()); } catch (e) { setStatus(`Monthly load failed: ${e.message}`); } } load(); }, []);
  useEffect(() => { async function loadInsight() { if (!month) return; try { setInsight(await loadMonthlyInsight(month)); } catch (e) { setStatus(`Insight load failed: ${e.message}`); } } loadInsight(); }, [month]);

  const report = reports.find((x) => x.month === month);
  const previousReport = reports.find((x) => x.month === prevMonth(month));
  const metrics = useMemo(() => report && settings ? calculateWeeklyMetrics(report, settings) : null, [report, settings]);
  const prevMetrics = useMemo(() => previousReport && settings ? calculateWeeklyMetrics(previousReport, settings) : null, [previousReport, settings]);
  const finance = useMemo(() => metrics ? getFinanceBreakdown(month, metrics) : null, [month, metrics]);
  const statusLabel = metrics && ((metrics.csat || 0) >= target.csat && (metrics.ticketsPerOrder || 0) <= target.tpo) ? "Healthy" : "Needs attention";

  const momRows = metrics ? [
    { KPI: "Tickets", Previous: formatNumber(prevMetrics?.actionableTickets || 0), Current: formatNumber(metrics.actionableTickets || 0), Delta: <span style={{ color: delta(metrics.actionableTickets, prevMetrics?.actionableTickets, true).color }}>{delta(metrics.actionableTickets, prevMetrics?.actionableTickets, true).text}</span> },
    { KPI: "Paid Orders", Previous: formatNumber(prevMetrics?.paidOrders || prevMetrics?.ordersCount || 0), Current: formatNumber(metrics.paidOrders || metrics.ordersCount || 0), Delta: <span style={{ color: delta(metrics.paidOrders || metrics.ordersCount, prevMetrics?.paidOrders || prevMetrics?.ordersCount).color }}>{delta(metrics.paidOrders || metrics.ordersCount, prevMetrics?.paidOrders || prevMetrics?.ordersCount).text}</span> },
    { KPI: "Tickets / Order", Previous: pct(prevMetrics?.ticketsPerOrder || 0), Current: pct(metrics.ticketsPerOrder || 0), Delta: <span style={{ color: delta(metrics.ticketsPerOrder, prevMetrics?.ticketsPerOrder, true).color }}>{delta(metrics.ticketsPerOrder, prevMetrics?.ticketsPerOrder, true).text}</span> },
    { KPI: "CSAT", Previous: formatNumber(prevMetrics?.csat || 0, 2), Current: formatNumber(metrics.csat || 0, 2), Delta: <span style={{ color: delta(metrics.csat, prevMetrics?.csat).color }}>{delta(metrics.csat, prevMetrics?.csat).text}</span> },
    { KPI: "SLA / FRT", Previous: hours(prevMetrics?.slaGlobal || prevMetrics?.slaValue), Current: hours(metrics.slaGlobal || metrics.slaValue), Delta: <span style={{ color: delta(metrics.slaGlobal || metrics.slaValue, prevMetrics?.slaGlobal || prevMetrics?.slaValue, true).color }}>{delta(metrics.slaGlobal || metrics.slaValue, prevMetrics?.slaGlobal || prevMetrics?.slaValue, true).text}</span> },
    { KPI: "Total CX Cost / Order", Previous: prevMetrics ? currency(getFinanceBreakdown(prevMonth(month), prevMetrics).totalCostPerOrder, 2) : "—", Current: currency(finance?.totalCostPerOrder, 2), Delta: <span style={{ color: delta(finance?.totalCostPerOrder, prevMetrics ? getFinanceBreakdown(prevMonth(month), prevMetrics).totalCostPerOrder : 0, true).color }}>{delta(finance?.totalCostPerOrder, prevMetrics ? getFinanceBreakdown(prevMonth(month), prevMetrics).totalCostPerOrder : 0, true).text}</span> }
  ] : [];

  return <main style={pageStyle}>
    <ReportingNav />
    <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
      <div><div style={{ color: "#7c2d12", fontWeight: 950 }}>Yves Rocher Customer Experience</div><h1 style={{ fontSize: 40, margin: "6px 0" }}>Monthly Business Review</h1><p style={{ color: "#475569", lineHeight: 1.6, margin: 0 }}>High-level KPI, cost and customer insights. Every metric includes source and formula.</p></div>
      <div style={{ ...cardStyle, padding: 14 }}><label style={{ fontWeight: 900, marginRight: 10 }}>Month</label><select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: 10, borderRadius: 10, minWidth: 180 }}>{reports.map((r) => <option key={r.month} value={r.month}>{r.month}</option>)}</select><div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}><Link href="/yves-rocher-reporting/monthly-upload" style={{ background: "#7c2d12", color: "#fff", padding: "9px 12px", borderRadius: 10, textDecoration: "none", fontWeight: 900 }}>Upload</Link><Link href="/yves-rocher-reporting/monthly-insights" style={{ background: "#0f172a", color: "#fff", padding: "9px 12px", borderRadius: 10, textDecoration: "none", fontWeight: 900 }}>Edit notes</Link><Link href="/yves-rocher-reporting/h1" style={{ background: "#15803d", color: "#fff", padding: "9px 12px", borderRadius: 10, textDecoration: "none", fontWeight: 900 }}>H1</Link></div></div>
    </div>
    {status && <div style={{ ...cardStyle, marginTop: 16, color: "#b91c1c", fontWeight: 800 }}>{status}</div>}
    {!metrics && <div style={{ ...cardStyle, marginTop: 16 }}>No monthly data available. Upload monthly files first.</div>}
    {metrics && finance && <>
      <section style={{ marginTop: 20, background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "#fff", borderRadius: 22, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}><div><div style={{ color: "#fed7aa", fontWeight: 950 }}>{monthLabel(month).toUpperCase()} CUSTOMER EXPERIENCE REVIEW</div><h2 style={{ margin: "8px 0", fontSize: 32 }}>Overall status: {statusLabel}</h2><p style={{ color: "#cbd5e1", margin: 0 }}>KPI, operational insights and cost visibility for management review.</p></div><div style={{ background: statusLabel === "Healthy" ? "#dcfce7" : "#fef3c7", color: statusLabel === "Healthy" ? "#166534" : "#92400e", borderRadius: 16, padding: "18px 22px", fontWeight: 950, fontSize: 24, alignSelf: "center" }}>{statusLabel}</div></div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginTop: 18 }}>
        <Kpi label="CSAT" value={metrics.csat ? formatNumber(metrics.csat, 2) : "—"} sub={`Target ${target.csat}`} color={metrics.csat >= target.csat ? nice.green : nice.amber} source="Gorgias Customer Experience / Tickets" formula="Average Survey score" />
        <Kpi label="SLA / FRT" value={hours(metrics.slaGlobal || metrics.slaValue)} sub={`Target < ${target.slaHours}h`} color={(metrics.slaGlobal || metrics.slaValue) <= target.slaHours ? nice.green : nice.amber} source="Gorgias SLA / Agents" formula="Weighted average first response time" />
        <Kpi label="Automation" value="Placeholder" sub="Notch export needed" source="Notch" formula="AI solved / total actionable tickets" />
        <Kpi label="TPO" value={pct(metrics.ticketsPerOrder)} sub={`${formatNumber(metrics.actionableTickets)} tickets / ${formatNumber(metrics.paidOrders || metrics.ordersCount)} paid orders`} color={metrics.ticketsPerOrder <= target.tpo ? nice.green : nice.amber} source="Gorgias + Shopify" formula="Actionable tickets / paid orders" />
        <Kpi label="OC" value={currency(finance.totalCostPerOrder, 2)} sub={`Human ${currency(finance.humanCostPerOrder, 2)} + AI ${currency(finance.aiCostPerOrder, 2)}`} color={nice.purple} source="Finance invoices + Shopify" formula="Total CX cost / paid orders" />
      </div>

      <Section title="Month over Month" subtitle="Short management view: are we improving vs previous uploaded month?"><Table rows={momRows} /></Section>

      <Section title="Service Cost Overview" subtitle="Real cost split between human CS and Notch automation.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>
          <Kpi label="Human CS Cost" value={currency(finance.humanCost)} sub={`Canada ${currency(finance.canada.total)} / PH ${currency(finance.philippines.total)}`} source="Canada rate + VA invoices" formula="Canada messages x $2.30 + Antonette/Kyrene invoices" />
          <Kpi label="AI Cost" value={currency(finance.aiCost)} sub={`Minimum ${currency(finance.notch.minimum)} + usage ${currency(finance.notch.usage)}`} source="Notch invoice" formula="Monthly minimum + usage fees" />
          <Kpi label="Cost / Ticket" value={currency(finance.totalCostPerTicket, 2)} sub={`Human ${currency(finance.humanCostPerTicket, 2)} + AI ${currency(finance.aiCostPerTicket, 2)}`} source="Finance + Gorgias" formula="Total CX cost / actionable tickets" />
          <Kpi label="Refund Rate" value={pct(metrics.refundRate)} sub={`${formatNumber(metrics.refundedOrders)} refunded orders`} source="Shopify Orders" formula="Refunded orders / paid orders" />
          <Kpi label="Cancellation Rate" value={pct(metrics.cancellationRate)} sub={`${formatNumber(metrics.cancelledOrders)} cancelled orders`} source="Shopify Orders" formula="Cancelled orders / total orders" />
          <Kpi label="NPS / Return Rate" value="Placeholder" sub="Add source later" source="Future source" formula="To define" />
        </div>
      </Section>

      <Section title="Customer Voice" subtitle="High-level themes from Trustpilot, Yotpo and customer comments.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12 }}>{customerVoice.map(([t, d, m, tone]) => <Insight key={t} title={t} meta={m} tone={tone}>{d}</Insight>)}</div>
      </Section>

      <Section title="Gorgias Conversation Insights" subtitle="High-level operational themes, focused on KPI impact and actionability.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>{juneContactInsights.map(([t, d, m, tone]) => <Insight key={t} title={t} meta={m} tone={tone}>{d}</Insight>)}</div>
      </Section>

      <Section title="Operational Highlights" subtitle="Management summary from CS ↔ Operations discussions.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12 }}>
          <Insight title="Shipping tests" meta="Completed / monitored" tone="blue">Shipping threshold A/B tests were running in June. Related shipping contacts should be interpreted separately from bugs.</Insight>
          <Insight title="Promotion / coupon issue" meta="Monitoring" tone="amber">Coupon and promotion application issues should be tracked separately from shipping A/B test questions.</Insight>
          <Insight title="Fraud workflow" meta="Process clarification" tone="amber">Orders may still flow to fulfillment after fraud flags; CS should involve Operations when ERP fulfillment may already have started.</Insight>
          <Insight title="Reporting corrections" meta="Finance accuracy" tone="green">Zero-value / unpaid order handling was clarified to protect reporting and accounting accuracy.</Insight>
        </div>
      </Section>

      <Section title="Action Items Completed This Month" subtitle="Manual placeholder for tomorrow's meeting. Add/update in the management notes page.">
        <Table rows={[{ Priority: "High", Action: "Add completed actions here", Owner: "—", Result: "—", Status: "Placeholder" }]} />
      </Section>

      <Section title="Strategy Action Items for Coming Month" subtitle="Manual placeholder for initiatives, owners, ETA and status.">
        <Table rows={[{ Priority: "High", Initiative: "Add next-month strategy items here", Owner: "—", ETA: "—", Status: "Planned" }]} />
      </Section>

      <Section title="KPI Dictionary Shortcut" subtitle="Every KPI must be explainable: source, columns and formula.">
        <Link href="/yves-rocher-reporting/kpi-dictionary" style={{ display: "inline-block", background: "#0f172a", color: "#fff", padding: "12px 16px", borderRadius: 12, textDecoration: "none", fontWeight: 950 }}>Open KPI Dictionary</Link>
      </Section>
    </>}
  </main>;
}
