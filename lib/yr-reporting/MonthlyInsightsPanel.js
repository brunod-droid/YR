import { useEffect, useState } from "react";
import { cardStyle } from "./components";
import { loadMonthlyInsight } from "./monthlyInsightsStorage";

function MiniSection({ title, items, fields }) {
  if (!items?.length) return null;

  return (
    <div style={{ marginTop: 18 }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 20 }}>{title}</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item, index) => (
          <div key={index} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
            {fields.map((field) => item[field] ? (
              <div key={field} style={{ marginTop: 4 }}>
                <b>{field.replace(/([A-Z])/g, " $1")}:</b> {item[field]}
              </div>
            ) : null)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MonthlyInsightsPanel({ month }) {
  const [insight, setInsight] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      if (!month) return;
      try {
        const row = await loadMonthlyInsight(month);
        setInsight(row);
      } catch (error) {
        setStatus(`Could not load monthly insight: ${error.message}`);
      }
    }

    load();
  }, [month]);

  if (!month) return null;

  if (!insight) {
    return (
      <div style={{ ...cardStyle, marginTop: 20, borderTop: "6px solid #7c2d12" }}>
        <h2 style={{ marginTop: 0 }}>Management Insights</h2>
        <p style={{ color: "#64748b", lineHeight: 1.6 }}>
          No monthly qualitative analysis has been saved yet for {month}.
        </p>
        <a href="/yves-rocher-reporting/monthly-insights" style={{ display: "inline-block", background: "#7c2d12", color: "#fff", padding: "12px 16px", borderRadius: 12, textDecoration: "none", fontWeight: 900 }}>
          Add monthly insight
        </a>
      </div>
    );
  }

  return (
    <div style={{ ...cardStyle, marginTop: 20, borderTop: "6px solid #7c2d12" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
        <div>
          <div style={{ color: "#7c2d12", fontWeight: 950, textTransform: "uppercase", letterSpacing: 1 }}>Management Insights</div>
          <h2 style={{ margin: "6px 0 0", fontSize: 28 }}>{insight.title || `${month} Customer Insights`}</h2>
          <p style={{ color: "#64748b", margin: "8px 0 0" }}>Qualitative monthly analysis manually added to the hub.</p>
        </div>
        <a href="/yves-rocher-reporting/monthly-insights" style={{ background: "#0f172a", color: "#fff", padding: "12px 16px", borderRadius: 12, textDecoration: "none", fontWeight: 900 }}>
          Edit insights
        </a>
      </div>

      {status && <div style={{ marginTop: 14, color: "#b91c1c", fontWeight: 800 }}>{status}</div>}

      <div style={{ marginTop: 18, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 16, padding: 16 }}>
        <div style={{ fontWeight: 950, color: "#7c2d12", marginBottom: 8 }}>Executive summary</div>
        <div style={{ color: "#1e293b", lineHeight: 1.65 }}>{insight.executive_summary}</div>
        {insight.customer_mood && <div style={{ marginTop: 10, color: "#475569" }}><b>Customer mood:</b> {insight.customer_mood}</div>}
      </div>

      <MiniSection title="Key customer themes" items={insight.key_themes} fields={["theme", "insight", "opportunity"]} />
      <MiniSection title="Main pain points" items={insight.pain_points} fields={["painPoint", "impact", "recommendation"]} />
      <MiniSection title="Operational risks" items={insight.risks} fields={["risk", "whyItMatters", "nextStep"]} />
      <MiniSection title="Positive signals" items={insight.wins} fields={["win", "evidence"]} />
      <MiniSection title="Recommended actions" items={insight.recommended_actions} fields={["priority", "owner", "action"]} />

      {insight.management_conclusion && (
        <div style={{ marginTop: 18, background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 950, color: "#312e81", marginBottom: 8 }}>Management conclusion</div>
          <div style={{ color: "#1e293b", lineHeight: 1.65 }}>{insight.management_conclusion}</div>
        </div>
      )}
    </div>
  );
}
