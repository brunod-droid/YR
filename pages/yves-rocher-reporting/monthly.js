import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadMonthlyReports, getSettings } from "../../lib/yr-reporting/storage";
import { loadMonthlyInsight } from "../../lib/yr-reporting/monthlyInsightsStorage";
import { calculateWeeklyMetrics } from "../../lib/yr-reporting/metrics";
import { getCostBreakdown, NOTCH_COSTS_2026, PHILIPPINES_COSTS_2026, CANADA_MESSAGE_RATE } from "../../lib/yr-reporting/costs";
import { ReportingNav, pageStyle, cardStyle, formatNumber } from "../../lib/yr-reporting/components";

const compactGrid = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 };
const small = { color: "#64748b", fontSize: 13, lineHeight: 1.45 };

function money(value, digits = 0) { return `$${formatNumber(value || 0, digits)}`; }
function pct(value, digits = 1) { return value ? `${formatNumber(value * 100, digits)}%` : "—"; }
function hours(value) { return value ? `${formatNumber(value, 1)}h` : "—"; }
function safeNumber(value) { const n = Number(value || 0); return Number.isFinite(n) ? n : 0; }

function Badge({ children, tone = "slate" }) {
  const colors = {
    green: ["#dcfce7", "#166534"], amber: ["#fef3c7", "#92400e"], red: ["#fee2e2", "#991b1b"], blue: ["#dbeafe", "#1d4ed8"], slate: ["#f1f5f9", "#334155"], purple: ["#ede9fe", "#5b21b6"]
  };
  const [bg, color] = colors[tone] || colors.slate;
  return <span style={{ background: bg, color, borderRadius: 999, padding: "4px 9px", fontSize: 12, fontWeight: 900 }}>{children}</span>;
}

function KpiCard({ label, value, hint, tone = "slate", source, formula }) {
  return <div style={{ ...cardStyle, padding: 16, minHeight: 118 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}>
      <div style={{ color: "#64748b", fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: .3 }}>{label}</div>
      {tone !== "slate" && <Badge tone={tone}>{tone === "green" ? "OK" : tone === "amber" ? "Watch" : "Risk"}</Badge>}
    </div>
    <div style={{ fontSize: 30, fontWeight: 950, marginTop: 8, color: "#0f172a" }}>{value}</div>
    {hint && <div style={{ ...small, marginTop: 6 }}>{hint}</div>}
    {(source || formula) && <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", color: "#2563eb", fontWeight: 800, fontSize: 12 }}>source + formula</summary><div style={{ ...small, marginTop: 6 }}><strong>Source:</strong> {source || "—"}<br/><strong>Formula:</strong> {formula || "—"}</div></details>}
  </div>;
}

function Section({ title, subtitle, children }) {
  return <section style={{ marginTop: 22 }}>
    <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
      <div><h2 style={{ margin: 0, fontSize: 24 }}>{title}</h2>{subtitle && <p style={{ ...small, margin: "5px 0 0" }}>{subtitle}</p>}</div>
    </div>
    {children}
  </section>;
}

function InsightMiniCard({ title, text, impact = "Medium", action, status = "Monitoring", tone = "blue" }) {
  return <div style={{ ...cardStyle, padding: 16, borderTop: `5px solid ${tone === "red" ? "#dc2626" : tone === "green" ? "#16a34a" : tone === "amber" ? "#f59e0b" : "#2563eb"}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}>
      <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3><Badge tone={impact === "High" ? "red" : impact === "Low" ? "green" : "amber"}>{impact}</Badge>
    </div>
    <p style={{ margin: "8px 0", color: "#334155", lineHeight: 1.45 }}>{text}</p>
    {action && <div style={{ ...small }}><strong>Recommended action:</strong> {action}</div>}
    {status && <div style={{ marginTop: 10 }}><Badge tone={status === "Resolved" || status === "Completed" ? "green" : status === "Open" ? "red" : "blue"}>{status}</Badge></div>}
  </div>;
}

function tryParseJson(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return null;
  try { return JSON.parse(trimmed); } catch { return null; }
}

function listFromInsight(value, fallback = []) {
  const parsed = tryParseJson(value);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => {
      if (typeof item === "string") return { title: item, text: "" };
      return { title: item.theme || item.risk || item.win || item.action || item.painPoint || item.priority || "Insight", text: item.insight || item.impact || item.evidence || item.recommendation || item.opportunity || item.nextStep || "", action: item.opportunity || item.recommendation || item.nextStep || "" };
    }).slice(0, 5);
  }
  const text = String(value || "").trim();
  if (text) return text.split(/\n+/).map((line) => line.replace(/^[-*\d.\s]+/, "").trim()).filter(Boolean).slice(0, 5).map((line) => ({ title: line, text: "" }));
  return fallback;
}

function MoMTable({ current, previous }) {
  const rows = [
    ["Tickets", previous?.ticketsCreatedRaw, current?.ticketsCreatedRaw, false],
    ["CSAT", previous?.csat, current?.csat, true],
    ["SLA / FRT", previous?.slaGlobal || previous?.firstResponseTime, current?.slaGlobal || current?.firstResponseTime, false, "h"],
    ["Tickets / Order", previous?.ticketsPerOrder, current?.ticketsPerOrder, false, "%"],
    ["Backlog", previous?.backlog, current?.backlog, false]
  ];
  return <div style={cardStyle}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr style={{ textAlign: "left", color: "#64748b" }}><th style={{ padding: 10 }}>KPI</th><th style={{ padding: 10 }}>Previous</th><th style={{ padding: 10 }}>Current</th><th style={{ padding: 10 }}>Δ</th><th style={{ padding: 10 }}>Trend</th></tr></thead><tbody>{rows.map(([label, prev, cur, higherGood, unit]) => {
    const p = safeNumber(prev), c = safeNumber(cur); const delta = c - p; const good = higherGood ? delta >= 0 : delta <= 0;
    const display = unit === "%" ? `${formatNumber(delta * 100, 1)} pts` : unit === "h" ? `${formatNumber(delta, 1)}h` : formatNumber(delta, label === "CSAT" ? 2 : 0);
    return <tr key={label} style={{ borderTop: "1px solid #e5e7eb" }}><td style={{ padding: 10, fontWeight: 900 }}>{label}</td><td style={{ padding: 10 }}>{unit === "%" ? pct(p, 1) : unit === "h" ? hours(p) : label === "CSAT" ? formatNumber(p, 2) : formatNumber(p)}</td><td style={{ padding: 10, fontWeight: 900 }}>{unit === "%" ? pct(c, 1) : unit === "h" ? hours(c) : label === "CSAT" ? formatNumber(c, 2) : formatNumber(c)}</td><td style={{ padding: 10 }}>{display}</td><td style={{ padding: 10 }}><Badge tone={good ? "green" : "amber"}>{good ? "Improving" : "Watch"}</Badge></td></tr>;
  })}</tbody></table></div>;
}

function ActionPlaceholders() {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
    <div style={cardStyle}><h3 style={{ marginTop: 0 }}>Action items completed this month</h3><p style={small}>Use the Developments page to add actions completed during the month. Keep this section short for management review.</p><Link href="/yves-rocher-reporting/developments" style={{ fontWeight: 900, color: "#0369a1" }}>Open Developments →</Link></div>
    <div style={cardStyle}><h3 style={{ marginTop: 0 }}>Strategy action items for next month</h3><p style={small}>Use the Future Plans page to add initiatives, owners, ETA, priority and status.</p><Link href="/yves-rocher-reporting/future-plans" style={{ fontWeight: 900, color: "#4338ca" }}>Open Future Plans →</Link></div>
  </div>;
}

function DataTrace() {
  const rows = [
    ["Paid Orders", "Shopify orders export", "Count unique orders where Paid at is not empty or Financial Status is paid/refunded"],
    ["Tickets / Order", "Gorgias tickets + Shopify orders", "Assigned tickets / Paid orders"],
    ["Refund Rate", "Shopify orders export", "Refunded orders / Paid orders"],
    ["Cancellation Rate", "Shopify orders export", "Cancelled orders / Total orders"],
    ["AI Cost", "Notch invoices", "Monthly minimum + usage fees"],
    ["Human Cost", "Canada messages or VA invoices", "Jan-Mar: messages × $2.30. Apr-Jun: Antonette/Kyrene invoices"],
    ["Cost / Order", "Finance + Shopify", "Total CX cost / Paid orders"],
    ["CSAT", "Gorgias Customer Experience or ticket survey scores", "Average CSAT responses"],
    ["SLA", "Gorgias Customer Experience / agents", "Average first response time"],
    ["NPS / Return Rate", "Placeholder", "To be added when source is confirmed"]
  ];
  return <details style={{ ...cardStyle, marginTop: 20 }}><summary style={{ cursor: "pointer", fontSize: 18, fontWeight: 950 }}>KPI source and calculation dictionary</summary><table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14 }}><thead><tr style={{ textAlign: "left", color: "#64748b" }}><th style={{ padding: 10 }}>KPI</th><th style={{ padding: 10 }}>Source</th><th style={{ padding: 10 }}>Calculation</th></tr></thead><tbody>{rows.map(([kpi, source, formula]) => <tr key={kpi} style={{ borderTop: "1px solid #e5e7eb" }}><td style={{ padding: 10, fontWeight: 900 }}>{kpi}</td><td style={{ padding: 10 }}>{source}</td><td style={{ padding: 10 }}>{formula}</td></tr>)}</tbody></table></details>;
}

const defaultContactInsights = [
  { title: "Return labels / refund follow-up", text: "Customers are contacting us after returning items with the provided label to request refund confirmation, around 5 tickets per day.", impact: "High", action: "Automate return received and refund status notifications.", status: "Open", tone: "amber" },
  { title: "Monoi product quality", text: "Complaints increased around leaking contents, damaged bottles and missing seals, around 10 complaints over 5 days.", impact: "High", action: "Escalate to Product / Operations with photos and batch details.", status: "Monitoring", tone: "red" },
  { title: "Subscription cancellations", text: "A large share of incoming tickets relates to customers requesting subscription cancellation, often because enrollment was not clear.", impact: "High", action: "Improve subscription clarity before checkout and cancellation self-service.", status: "Open", tone: "red" },
  { title: "OOS cancellations", text: "The current cancellation process for out-of-stock items is inefficient and creates avoidable work.", impact: "Medium", action: "Create a cleaner OOS cancellation process and proactive customer communication.", status: "Open", tone: "amber" },
  { title: "Allergy and DNR process friction", text: "Allergy follow-up questions and DNR declarations create friction when they do not impact resolution or internal workflow.", impact: "Medium", action: "Review required steps with Operations and simplify where possible.", status: "Open", tone: "amber" }
];

const defaultVoice = [
  { title: "French heritage", text: "Customers repeatedly connect Yves Rocher with France, previous European experiences and emotional brand memories.", impact: "High", action: "Use French botanical heritage and nostalgia more visibly in campaigns.", status: "Opportunity", tone: "green" },
  { title: "Hero products", text: "Hair Vinegar, Monoi / Tahitian Oil and Evidence perfume appear as recurring positive product mentions.", impact: "Medium", action: "Feature these products in customer voice and retention content.", status: "Opportunity", tone: "green" },
  { title: "Brand advocacy", text: "Some customers explicitly say they recommend Yves Rocher to friends or clients.", impact: "Medium", action: "Consider referral or review amplification campaigns.", status: "Opportunity", tone: "green" }
];

export default function MonthlyReport() {
  const [reports, setReports] = useState([]);
  const [month, setMonth] = useState("");
  const [settings, setSettings] = useState(null);
  const [insight, setInsight] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => { async function load() { try { const stored = await loadMonthlyReports(); const sorted = [...stored].sort((a,b) => String(b.month).localeCompare(String(a.month))); setReports(sorted); setMonth(sorted[0]?.month || ""); setSettings(getSettings()); } catch (error) { setStatus(`Monthly load failed: ${error.message}`); } } load(); }, []);
  useEffect(() => { async function loadInsight() { if (!month) return; try { setInsight(await loadMonthlyInsight(month)); } catch (error) { setStatus(`Insight load failed: ${error.message}`); } } loadInsight(); }, [month]);

  const report = reports.find((item) => item.month === month);
  const previousReport = reports.find((item) => item.month < month);
  const metrics = useMemo(() => report && settings ? calculateWeeklyMetrics(report, settings) : null, [report, settings]);
  const previousMetrics = useMemo(() => previousReport && settings ? calculateWeeklyMetrics(previousReport, settings) : null, [previousReport, settings]);
  const costs = useMemo(() => metrics ? getCostBreakdown(month, metrics) : null, [month, metrics]);

  const topThemes = listFromInsight(insight?.key_themes, defaultContactInsights.map((x) => ({ title: x.title, text: x.text, action: x.action })));
  const painPoints = listFromInsight(insight?.pain_points, defaultContactInsights.slice(0, 4).map((x) => ({ title: x.title, text: x.text, action: x.action })));

  return <main style={pageStyle}>
    <ReportingNav />
    <div style={{ marginBottom: 18 }}><div style={{ color: "#7c2d12", fontWeight: 950 }}>Yves Rocher Customer Service</div><h1 style={{ fontSize: 40, margin: "5px 0" }}>Monthly Business Review</h1><p style={{ ...small, fontSize: 15 }}>Executive view: KPI performance, cost, customer voice, operational insights and action plan. Every metric includes source and formula.</p></div>

    <div style={{ ...cardStyle, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}><label style={{ fontWeight: 900 }}>Select month</label><select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: 10, borderRadius: 10, minWidth: 220 }}>{reports.map((r) => <option key={r.month} value={r.month}>{r.month}</option>)}</select><Link href="/yves-rocher-reporting/monthly-upload" style={{ background: "#7c2d12", color: "#fff", padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 900 }}>Upload monthly data</Link><Link href="/yves-rocher-reporting/monthly-insights" style={{ background: "#0f172a", color: "#fff", padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 900 }}>Edit management summary</Link><Link href="/yves-rocher-reporting/kpi-dictionary" style={{ background: "#15803d", color: "#fff", padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 900 }}>KPI Dictionary</Link></div>
    {status && <div style={{ ...cardStyle, marginTop: 16, color: "#b91c1c", fontWeight: 800 }}>{status}</div>}
    {!metrics && <div style={{ ...cardStyle, marginTop: 16 }}>No monthly data available. Upload June monthly data first.</div>}

    {metrics && costs && <>
      <section style={{ marginTop: 20, background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "#fff", borderRadius: 22, padding: 22 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center" }}><div><div style={{ color: "#fed7aa", fontWeight: 950, textTransform: "uppercase", letterSpacing: 1 }}>{month} Executive Review</div><h2 style={{ fontSize: 30, margin: "8px 0" }}>Overall status: {metrics.csat >= 4.2 && metrics.ticketsPerOrder <= 0.08 ? "Healthy" : "Needs Attention"}</h2><p style={{ margin: 0, color: "#cbd5e1" }}>Focus tomorrow: strong customer satisfaction, clear cost visibility, and 5 operational priorities for next month.</p></div><div style={{ display: "grid", gap: 8, textAlign: "right" }}><Badge tone="green">CSAT {metrics.csat ? formatNumber(metrics.csat, 2) : "—"}</Badge><Badge tone={metrics.backlog > 150 ? "amber" : "green"}>Backlog {formatNumber(metrics.backlog)}</Badge><Badge tone="blue">Total CX cost {money(costs.totalCost)}</Badge></div></div></section>

      <Section title="1. Overview of KPIs" subtitle="Core customer service indicators. TPO uses paid Shopify orders only."><div style={compactGrid}>
        <KpiCard label="CSAT" value={metrics.csat ? formatNumber(metrics.csat, 2) : "—"} hint={`${formatNumber(metrics.csatCount || 0)} survey responses`} tone={metrics.csat >= 4.2 ? "green" : "amber"} source="Gorgias Customer Experience / ticket survey scores" formula="Average CSAT score" />
        <KpiCard label="SLA / FRT" value={hours(metrics.slaGlobal || metrics.firstResponseTime)} hint="Target: under 10h" tone={(metrics.slaGlobal || metrics.firstResponseTime) <= 10 ? "green" : "amber"} source="Gorgias Customer Experience / agents metrics" formula="Average first response time" />
        <KpiCard label="Automation rate" value="Placeholder" hint="Add Notch automation export" source="Notch" formula="AI solved / total tickets" />
        <KpiCard label="TPO" value={pct(metrics.ticketsPerOrder, 1)} hint={`${formatNumber(metrics.actionableTickets)} assigned tickets / ${formatNumber(metrics.ordersCount)} paid orders`} tone={metrics.ticketsPerOrder <= 0.08 ? "green" : "amber"} source="Gorgias tickets + Shopify orders" formula="Assigned tickets / Paid orders" />
        <KpiCard label="Orders" value={formatNumber(metrics.paidOrders || metrics.ordersCount)} hint={`${formatNumber(metrics.totalOrders || 0)} total Shopify rows`} source="Shopify orders export" formula="Orders with Paid at not empty" />
        <KpiCard label="OC" value={pct(metrics.cancellationRate, 1)} hint={`${formatNumber(metrics.cancelledOrders)} cancelled / ${formatNumber(metrics.totalOrders)} total`} source="Shopify orders export" formula="Cancelled orders / Total orders" />
        <KpiCard label="Tickets" value={formatNumber(metrics.ticketsCreatedRaw)} hint={`${formatNumber(metrics.assignedTickets)} assigned, ${formatNumber(metrics.unassignedTickets)} unassigned`} source="Gorgias tickets export" formula="Ticket rows / assigned tickets" />
        <KpiCard label="Backlog" value={formatNumber(metrics.backlog)} hint="Open tickets at end of period" tone={metrics.backlog <= 100 ? "green" : "amber"} source="Gorgias workload / overview" formula="Open tickets or created - closed" />
      </div></Section>

      <Section title="2. Month over Month" subtitle="Simple movement view. Green does not mean perfect; it means directionally better."><MoMTable current={metrics} previous={previousMetrics} /></Section>

      <Section title="3. Overview of service cost" subtitle="Human + AI cost, separated for CSR and Notch. Cost per order uses paid orders."><div style={compactGrid}>
        <KpiCard label="Human CSR cost" value={money(costs.humanCost)} hint={month >= "2026-04" ? "Antonette + Kyrene invoice" : `Canada messages × $${CANADA_MESSAGE_RATE}`} source={month >= "2026-04" ? "VA Academy invoice" : "Gorgias messages sent + Canada rate"} formula={month >= "2026-04" ? "Monthly invoice total" : `Messages sent × $${CANADA_MESSAGE_RATE}`} />
        <KpiCard label="Notch AI cost" value={money(costs.aiCost)} hint={`Usage fee: ${formatNumber(NOTCH_COSTS_2026[month]?.usage || 0)} + $1,500 minimum`} source="Notch invoice" formula="Monthly minimum + additional usage fee" />
        <KpiCard label="Total CX cost" value={money(costs.totalCost)} hint="Human CSR + Notch AI" source="Invoices" formula="Human cost + AI cost" />
        <KpiCard label="Total cost / order" value={money(costs.totalCostPerOrder, 2)} hint={`${money(costs.humanCostPerOrder, 2)} CSR + ${money(costs.aiCostPerOrder, 2)} AI`} source="Finance + Shopify" formula="Total CX cost / Paid orders" />
        <KpiCard label="Refund rate" value={pct(metrics.refundRate, 1)} hint={`${formatNumber(metrics.refundedOrders)} refunded / ${formatNumber(metrics.paidOrders)} paid`} source="Shopify orders export" formula="Refunded orders / Paid orders" />
        <KpiCard label="Satisfaction rate" value={metrics.csat ? formatNumber(metrics.csat, 2) : "—"} hint="CSAT proxy for now" source="Gorgias" formula="Average CSAT" />
        <KpiCard label="Return rate" value="Placeholder" hint="Needs return source" source="Placeholder" formula="Returned orders / Paid orders" />
        <KpiCard label="NPS" value="Placeholder" hint="Needs NPS source" source="Placeholder" formula="Promoters - detractors" />
      </div></Section>

      <Section title="4. Customer voice" subtitle="High-level customer perception from Trustpilot, Yotpo and customer comments."><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>{defaultVoice.map((item) => <InsightMiniCard key={item.title} {...item} />)}</div></Section>

      <Section title="5. Gorgias conversation insights" subtitle="High-level operational insights from tickets, AI intents, Neva's June summary and CS/Operations discussions."><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>{defaultContactInsights.map((item) => <InsightMiniCard key={item.title} {...item} />)}</div></Section>

      <Section title="6. AI / management summary" subtitle="Clean rendering. Raw JSON is never displayed."><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><div style={cardStyle}><h3 style={{ marginTop: 0 }}>Top customer topics</h3>{topThemes.slice(0, 5).map((x) => <div key={x.title} style={{ padding: "9px 0", borderTop: "1px solid #e5e7eb" }}><strong>{x.title}</strong>{x.text && <div style={small}>{x.text}</div>}</div>)}</div><div style={cardStyle}><h3 style={{ marginTop: 0 }}>Main pain points</h3>{painPoints.slice(0, 5).map((x) => <div key={x.title} style={{ padding: "9px 0", borderTop: "1px solid #e5e7eb" }}><strong>{x.title}</strong>{x.text && <div style={small}>{x.text}</div>}{x.action && <div style={small}><strong>Action:</strong> {x.action}</div>}</div>)}</div></div></Section>

      <Section title="7. Management action plan" subtitle="Manual placeholders for tomorrow. Add/edit in the existing pages."><ActionPlaceholders /></Section>
      <Section title="8. Risks and watchlist" subtitle="Use this section to show unresolved escalations or blockers needing leadership input."><div style={cardStyle}><p style={{ marginTop: 0 }}>For tomorrow: keep only 3–5 risks. Recommended: Subscription cancellation clarity, Return refund confirmation, Monoi packaging issue, OOS cancellation process, DNR/allergy process friction.</p><Link href="/yves-rocher-reporting/risks" style={{ fontWeight: 900, color: "#b45309" }}>Open Risks & Flags →</Link></div></Section>
      <DataTrace />
    </>}
  </main>;
}
