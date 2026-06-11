
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadMonthlyReports, getSettings } from "../../lib/yr-reporting/storage";
import { loadMonthlyInsight } from "../../lib/yr-reporting/monthlyInsightsStorage";
import { calculateWeeklyMetrics } from "../../lib/yr-reporting/metrics";
import { ReportingNav, MetricCard, pageStyle, cardStyle, formatNumber } from "../../lib/yr-reporting/components";

function formatHours(value) {
  return value ? `${formatNumber(value, 1)}h` : "—";
}

function asText(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") return item;
      return Object.values(item || {}).filter(Boolean).join(" ");
    }).filter(Boolean).join("\n\n");
  }
  return String(value || "").trim();
}

function shortText(value, maxSentences = 3) {
  const raw = asText(value).replace(/\s+/g, " ").trim();
  if (!raw) return "";
  const sentences = raw.match(/[^.!?]+[.!?]+/g) || [raw];
  return sentences.slice(0, maxSentences).join(" ").trim();
}

function blocks(value) {
  return asText(value).split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
}

function cleanLine(line) {
  return String(line || "")
    .replace(/^(theme|risk|win|priority|owner|action|pain point|impact|recommendation)\s*:\s*/i, "")
    .replace(/^\d+\.\s*/, "")
    .trim();
}

function mood(insight) {
  const value = asText(insight?.customer_mood);
  if (!value) return "—";
  if (/neutral/i.test(value) && /positive/i.test(value)) return "Neutral to Positive";
  if (/positive/i.test(value)) return "Positive";
  if (/negative/i.test(value)) return "Negative";
  if (/neutral/i.test(value)) return "Neutral";
  return value.split("\n")[0].slice(0, 70);
}

function mainTheme(insight) {
  const value = asText(insight?.key_themes);
  const first = value.split("\n").map(cleanLine).find(Boolean);
  return first || "—";
}

function healthScore(metrics) {
  if (!metrics) return { score: 0, label: "No data", color: "#64748b" };

  let score = 0;
  const csat = Number(metrics.csat || 0);
  const sla = Number(metrics.slaGlobal || metrics.slaValue || 0);
  const tpo = Number(metrics.ticketsPerOrder || 0);
  const backlog = Number(metrics.backlog || 0);

  if (csat >= 4.5) score += 40;
  else if (csat >= 4.2) score += 34;
  else if (csat >= 4.0) score += 26;
  else if (csat > 0) score += 16;

  if (sla && sla <= 8) score += 30;
  else if (sla && sla <= 10) score += 25;
  else if (sla && sla <= 14) score += 16;
  else if (sla) score += 8;

  if (tpo && tpo <= 0.10) score += 20;
  else if (tpo && tpo <= 0.15) score += 16;
  else if (tpo && tpo <= 0.20) score += 10;
  else if (tpo) score += 5;

  if (backlog <= 100) score += 10;
  else if (backlog <= 250) score += 7;
  else if (backlog <= 500) score += 4;

  if (score >= 85) return { score, label: "Excellent", color: "#16a34a" };
  if (score >= 70) return { score, label: "Good", color: "#65a30d" };
  if (score >= 55) return { score, label: "Watch", color: "#f59e0b" };
  return { score, label: "Action Required", color: "#dc2626" };
}

function InsightCard({ title, subtitle, color = "#0f172a", children }) {
  return (
    <section style={{ ...cardStyle, borderTop: `6px solid ${color}` }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 24 }}>{title}</h2>
      {subtitle && <div style={{ color: "#64748b", fontWeight: 700, marginBottom: 14 }}>{subtitle}</div>}
      <div style={{ color: "#334155", lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

function SmartText({ value, empty = "No insight saved yet." }) {
  const list = blocks(value);
  if (!list.length) return <p style={{ color: "#64748b", margin: 0 }}>{empty}</p>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {list.map((block, index) => {
        const lines = block.split("\n").map(cleanLine).filter(Boolean);
        const first = lines[0] || "";
        const rest = lines.slice(1);
        const titleLike = rest.length > 0 && first.length < 90 && !first.endsWith(".");
        return (
          <div key={index} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
            {titleLike ? (
              <>
                <div style={{ fontWeight: 950, color: "#0f172a", marginBottom: 6 }}>{first}</div>
                <div style={{ whiteSpace: "pre-line" }}>{rest.join("\n")}</div>
              </>
            ) : (
              <div style={{ whiteSpace: "pre-line" }}>{lines.join("\n")}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActionList({ value }) {
  const lines = asText(value).split("\n").map(cleanLine).filter(Boolean);
  if (!lines.length) return <p style={{ color: "#64748b", margin: 0 }}>No actions saved yet.</p>;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {lines.map((line, index) => {
        const priority =
          /high/i.test(line) ? "High" :
          /medium/i.test(line) ? "Medium" :
          /low/i.test(line) ? "Low" :
          index < 2 ? "High" : index < 5 ? "Medium" : "Low";

        const color = priority === "High" ? "#dc2626" : priority === "Medium" ? "#f59e0b" : "#16a34a";

        return (
          <div key={index} style={{ display: "grid", gridTemplateColumns: "86px 1fr", gap: 12, alignItems: "start", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
            <div style={{ background: `${color}18`, color, borderRadius: 999, padding: "6px 10px", fontWeight: 950, textAlign: "center", fontSize: 12 }}>
              {priority}
            </div>
            <div>{line.replace(/^(High|Medium|Low)\s*Priority\s*[:|-]?\s*/i, "")}</div>
          </div>
        );
      })}
    </div>
  );
}

function DriverTable() {
  const rows = [
    ["Refunds / cancellations", "High", "Improve refund visibility"],
    ["Delivery / order status", "High", "Increase proactive tracking updates"],
    ["Subscription management", "Medium", "Improve self-service and clarity"],
    ["Promotions / discount codes", "Medium", "Simplify promotion rules"],
    ["Product availability", "Low", "Back-in-stock notifications"]
  ];

  return (
    <div style={{ ...cardStyle, marginTop: 20 }}>
      <h2 style={{ marginTop: 0 }}>Top Contact Drivers & Opportunities</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#64748b", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: 10 }}>Driver</th>
              <th style={{ padding: 10 }}>Impact</th>
              <th style={{ padding: 10 }}>Management opportunity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([driver, impact, opportunity]) => (
              <tr key={driver} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 10, fontWeight: 900 }}>{driver}</td>
                <td style={{ padding: 10 }}>{impact}</td>
                <td style={{ padding: 10 }}>{opportunity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MonthlyReport() {
  const [reports, setReports] = useState([]);
  const [month, setMonth] = useState("");
  const [settings, setSettings] = useState(null);
  const [insight, setInsight] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const stored = await loadMonthlyReports();
        setReports(stored);
        setMonth(stored[0]?.month || "");
        setSettings(getSettings());
      } catch (error) {
        setStatus(`Monthly load failed: ${error.message}`);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadInsight() {
      if (!month) return;
      try {
        setInsight(await loadMonthlyInsight(month));
      } catch (error) {
        setStatus(`Insight load failed: ${error.message}`);
      }
    }
    loadInsight();
  }, [month]);

  const report = reports.find((item) => item.month === month);
  const metrics = useMemo(() => report && settings ? calculateWeeklyMetrics(report, settings) : null, [report, settings]);
  const health = healthScore(metrics);

  return (
    <main style={pageStyle}>
      <ReportingNav />

      <div style={{ marginBottom: 22 }}>
        <div style={{ color: "#7c2d12", fontWeight: 950 }}>Yves Rocher Customer Service</div>
        <h1 style={{ fontSize: 42, margin: "6px 0" }}>Monthly Management Report</h1>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>
          Qualitative + quantitative monthly review. Monthly data is uploaded separately and does not aggregate weekly reports.
        </p>
      </div>

      <div style={cardStyle}>
        <label style={{ fontWeight: 900, marginRight: 12 }}>Select month</label>
        <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: 10, borderRadius: 10, minWidth: 220 }}>
          {reports.map((r) => <option key={r.month} value={r.month}>{r.month}</option>)}
        </select>

        <Link href="/yves-rocher-reporting/monthly-upload" style={{ marginLeft: 14, display: "inline-block", background: "#7c2d12", color: "#fff", padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 900 }}>
          Upload monthly data
        </Link>

        <Link href="/yves-rocher-reporting/monthly-insights" style={{ marginLeft: 10, display: "inline-block", background: "#0f172a", color: "#fff", padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 900 }}>
          Edit management summary
        </Link>
      </div>

      {status && <div style={{ ...cardStyle, marginTop: 16, color: "#b91c1c", fontWeight: 800 }}>{status}</div>}

      {!metrics && <div style={{ ...cardStyle, marginTop: 16 }}>No monthly data available. Upload monthly CSV files first.</div>}

      {metrics && (
        <>
          <div style={{ marginTop: 20, background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "#fff", borderRadius: 24, padding: 24, display: "grid", gridTemplateColumns: "1fr 220px", gap: 20, alignItems: "center" }}>
            <div>
              <div style={{ color: "#fed7aa", fontWeight: 950, textTransform: "uppercase", letterSpacing: 1 }}>{month} Customer Service Review</div>
              <h2 style={{ fontSize: 34, margin: "8px 0" }}>Management Health Score</h2>
              <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.6 }}>Based on CSAT, SLA, tickets/order and backlog.</p>
            </div>
            <div style={{ background: "#fff", color: health.color, borderRadius: 20, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 54, fontWeight: 950 }}>{health.score}</div>
              <div style={{ fontWeight: 950 }}>{health.label}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 20 }}>
            <MetricCard label="CSAT" value={metrics.csat ? formatNumber(metrics.csat, 2) : "—"} hint={`Mood: ${mood(insight)}`} />
            <MetricCard label="Tickets / Order" value={metrics.ticketsPerOrder ? `${formatNumber(metrics.ticketsPerOrder * 100, 0)}%` : "—"} hint={`${formatNumber(metrics.actionableTickets)} assigned tickets / ${formatNumber(metrics.ordersCount)} orders`} />
            <MetricCard label="SLA Global" value={formatHours(metrics.slaGlobal || metrics.slaValue)} hint="Monthly service speed" />
            <MetricCard label="Backlog" value={formatNumber(metrics.backlog || 0)} hint="Open tickets" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 16 }}>
            <MetricCard label="Tickets Created" value={formatNumber(metrics.ticketsCreatedRaw)} hint="Monthly volume" />
            <MetricCard label="Messages Sent" value={formatNumber(metrics.totalMessagesSent || 0)} hint="Customer-facing messages" />
            <MetricCard label="Resolution Time" value={metrics.resolutionTime ? formatHours(metrics.resolutionTime) : "—"} hint="Average resolution time" />
            <MetricCard label="Main Theme" value={mainTheme(insight)} hint="From management insights" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 20, marginTop: 20 }}>
            <InsightCard title="Executive Summary" color="#7c2d12">
              {shortText(insight?.executive_summary, 4) || "No executive summary has been saved yet for this month."}
            </InsightCard>
            <InsightCard title="Key Takeaway" color="#2563eb">
              {shortText(insight?.management_conclusion, 2) || "Add a management conclusion in Monthly Insights to show the key takeaway here."}
            </InsightCard>
          </div>

          <DriverTable />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
            <InsightCard title="What Customers Contacted Us About" color="#15803d"><SmartText value={insight?.key_themes} /></InsightCard>
            <InsightCard title="Main Pain Points" color="#dc2626"><SmartText value={insight?.pain_points} /></InsightCard>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
            <InsightCard title="Operational Risks" color="#f59e0b"><SmartText value={insight?.risks} /></InsightCard>
            <InsightCard title="Positive Signals" color="#16a34a"><SmartText value={insight?.wins} /></InsightCard>
          </div>

          <div style={{ marginTop: 20 }}>
            <InsightCard title="Management Actions Next Month" color="#4f46e5"><ActionList value={insight?.recommended_actions} /></InsightCard>
          </div>
        </>
      )}
    </main>
  );
}
