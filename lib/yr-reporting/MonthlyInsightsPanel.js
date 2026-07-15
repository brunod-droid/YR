import { useEffect, useState } from "react";
import { cardStyle, formatNumber } from "./components";
import { loadMonthlyInsight } from "./monthlyInsightsStorage";

function textFromStructuredItems(items = [], preferredFields = []) {
  if (!Array.isArray(items) || !items.length) return "";
  const lines = [];
  for (const item of items) {
    if (typeof item === "string") { if (item.trim()) lines.push(item.trim()); continue; }
    const values = preferredFields.map((field) => item?.[field]).filter((value) => value && String(value).trim());
    if (values.length) lines.push(values.join("\n"));
    else {
      const fallback = Object.values(item || {}).map((value) => String(value || "").trim()).filter(Boolean).join("\n");
      if (fallback) lines.push(fallback);
    }
  }
  return lines.join("\n\n");
}

function normalizeText(value, fields = []) {
  if (!value) return "";
  if (Array.isArray(value)) return textFromStructuredItems(value, fields);
  return String(value || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function splitParagraphs(text) {
  return String(text || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

function SmartTextBlock({ text }) {
  const paragraphs = splitParagraphs(text);
  if (!paragraphs.length) return null;
  return <div style={{ display: "grid", gap: 10 }}>{paragraphs.map((paragraph, index) => {
    const lines = paragraph.split("\n").map((line) => line.trim()).filter(Boolean);
    const first = lines[0] || "";
    const rest = lines.slice(1);
    const heading = rest.length > 0 && first.length < 90 && !first.endsWith(".");
    if (heading) return <div key={index}><div style={{ fontWeight: 950, color: "#0f172a", marginBottom: 6 }}>{first}</div><div style={{ color: "#334155", lineHeight: 1.65, whiteSpace: "pre-line" }}>{rest.join("\n")}</div></div>;
    return <p key={index} style={{ margin: 0, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-line" }}>{paragraph}</p>;
  })}</div>;
}

function InsightSection({ title, subtitle, text, icon, accent = "#15803d" }) {
  if (!text) return null;
  return <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.05)", borderLeft: `7px solid ${accent}` }}>
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, background: `${accent}18`, color: accent, display: "grid", placeItems: "center", fontWeight: 950, fontSize: 18 }}>{icon}</div>
      <div><h3 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>{title}</h3>{subtitle && <div style={{ marginTop: 4, color: "#64748b", fontWeight: 700, fontSize: 13 }}>{subtitle}</div>}</div>
    </div>
    <SmartTextBlock text={text} />
  </section>;
}

function MiniMetric({ label, value, hint, color = "#0f172a" }) {
  return <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, borderTop: `5px solid ${color}` }}>
    <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 950, marginTop: 8, color: "#0f172a" }}>{value}</div>
    {hint && <div style={{ color: "#64748b", marginTop: 6, fontSize: 13 }}>{hint}</div>}
  </div>;
}

function SummaryPill({ children, color = "#15803d" }) {
  return <span style={{ display: "inline-flex", borderRadius: 999, padding: "7px 11px", background: `${color}16`, color, fontWeight: 900, fontSize: 12 }}>{children}</span>;
}

export default function MonthlyInsightsPanel({ month, metrics }) {
  const [insight, setInsight] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      if (!month) return;
      try { setInsight(await loadMonthlyInsight(month)); }
      catch (error) { setStatus(`Could not load monthly insight: ${error.message}`); }
    }
    load();
  }, [month]);

  if (!month) return null;
  if (!insight) return <div style={{ ...cardStyle, marginTop: 20, borderTop: "6px solid #7c2d12" }}><h2 style={{ marginTop: 0 }}>Management Summary</h2><p style={{ color: "#64748b", lineHeight: 1.6 }}>No qualitative management summary has been saved yet for {month}.</p><a href="/yves-rocher-reporting/monthly-insights" style={{ display: "inline-block", background: "#7c2d12", color: "#fff", padding: "12px 16px", borderRadius: 12, textDecoration: "none", fontWeight: 900 }}>Add monthly summary</a></div>;

  const executiveSummary = normalizeText(insight.executive_summary);
  const customerMood = normalizeText(insight.customer_mood);
  const keyThemes = normalizeText(insight.key_themes, ["theme", "insight", "opportunity"]);
  const painPoints = normalizeText(insight.pain_points, ["painPoint", "impact", "recommendation"]);
  const risks = normalizeText(insight.risks, ["risk", "whyItMatters", "nextStep"]);
  const wins = normalizeText(insight.wins, ["win", "evidence"]);
  const recommendedActions = normalizeText(insight.recommended_actions, ["priority", "owner", "action"]);
  const managementConclusion = normalizeText(insight.management_conclusion);

  return <div style={{ marginTop: 24, background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 45%, #fff7ed 100%)", border: "1px solid #e5e7eb", borderRadius: 26, padding: 24, boxShadow: "0 18px 50px rgba(15,23,42,0.08)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 20 }}>
      <div><div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}><SummaryPill color="#7c2d12">Monthly Management View</SummaryPill><SummaryPill color="#15803d">Qualitative + Quantitative</SummaryPill></div><h2 style={{ margin: 0, fontSize: 34, color: "#0f172a", letterSpacing: -0.6 }}>{insight.title || `${month} Customer Insights`}</h2><p style={{ color: "#64748b", margin: "8px 0 0", lineHeight: 1.6 }}>Executive monthly summary designed for management review and action follow-up.</p></div>
      <a href="/yves-rocher-reporting/monthly-insights" style={{ background: "#0f172a", color: "#fff", padding: "12px 16px", borderRadius: 12, textDecoration: "none", fontWeight: 900, whiteSpace: "nowrap" }}>Edit summary</a>
    </div>
    {status && <div style={{ marginBottom: 14, color: "#b91c1c", fontWeight: 800 }}>{status}</div>}
    {metrics && <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginBottom: 20 }}><MiniMetric label="CSAT" value={metrics.csat ? formatNumber(metrics.csat, 2) : "—"} hint="Monthly customer satisfaction" color="#15803d" /><MiniMetric label="Tickets / Order" value={metrics.ticketsPerOrder ? `${formatNumber(metrics.ticketsPerOrder * 100, 0)}%` : "—"} hint="Contact intensity" color="#2563eb" /><MiniMetric label="Messages Sent" value={formatNumber(metrics.totalMessagesSent || 0)} hint="Customer-facing messages" color="#0f766e" /><MiniMetric label="Backlog" value={formatNumber(metrics.backlog || 0)} hint="Open tickets" color="#7c3aed" /></div>}
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 18, marginBottom: 18 }}><InsightSection title="Executive Summary" subtitle="What management should know" text={executiveSummary} icon="1" accent="#7c2d12" /><InsightSection title="Customer Mood" subtitle="Overall sentiment and customer tone" text={customerMood} icon="2" accent="#2563eb" /></div>
    <div style={{ display: "grid", gap: 18 }}><InsightSection title="Key Customer Themes" subtitle="Main reasons customers contacted support" text={keyThemes} icon="3" accent="#15803d" /><InsightSection title="Main Pain Points" subtitle="Friction areas to reduce contact volume" text={painPoints} icon="4" accent="#dc2626" /><InsightSection title="Operational Risks" subtitle="Risks to monitor or escalate" text={risks} icon="5" accent="#f59e0b" /><InsightSection title="Positive Signals" subtitle="What is working well" text={wins} icon="6" accent="#16a34a" /><InsightSection title="Recommended Actions" subtitle="Achievable next steps for CS and business teams" text={recommendedActions} icon="7" accent="#4f46e5" /><InsightSection title="Management Conclusion" subtitle="Final readout for leadership" text={managementConclusion} icon="8" accent="#0f172a" /></div>
  </div>;
}
