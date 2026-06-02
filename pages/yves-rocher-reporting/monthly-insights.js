import { useEffect, useState } from "react";
import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";
import { deleteMonthlyInsight, loadMonthlyInsight, saveMonthlyInsight } from "../../lib/yr-reporting/monthlyInsightsStorage";

const emptyInsight = {
  month: "",
  title: "",
  executiveSummary: "",
  customerMood: "",
  keyThemesText: "",
  painPointsText: "",
  risksText: "",
  winsText: "",
  recommendedActionsText: "",
  managementConclusion: ""
};

function parseLines(text, type) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());

      if (type === "theme") return { theme: parts[0] || "", insight: parts[1] || "", opportunity: parts[2] || "" };
      if (type === "pain") return { painPoint: parts[0] || "", impact: parts[1] || "", recommendation: parts[2] || "" };
      if (type === "risk") return { risk: parts[0] || "", whyItMatters: parts[1] || "", nextStep: parts[2] || "" };
      if (type === "win") return { win: parts[0] || "", evidence: parts[1] || "" };
      if (type === "action") return { priority: parts[0] || "Medium", owner: parts[1] || "CS", action: parts[2] || parts[0] || "" };

      return {};
    });
}

function stringifyLines(items, fields) {
  return (items || []).map((item) => fields.map((field) => item[field] || "").join(" | ")).join("\n");
}

export default function MonthlyInsightsAdmin() {
  const [form, setForm] = useState(emptyInsight);
  const [status, setStatus] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function loadExisting() {
    if (!form.month) {
      setStatus("Select a month first.");
      return;
    }

    try {
      const row = await loadMonthlyInsight(form.month);

      if (!row) {
        setStatus(`No insight saved yet for ${form.month}.`);
        return;
      }

      setForm({
        month: row.month || form.month,
        title: row.title || "",
        executiveSummary: row.executive_summary || "",
        customerMood: row.customer_mood || "",
        keyThemesText: stringifyLines(row.key_themes, ["theme", "insight", "opportunity"]),
        painPointsText: stringifyLines(row.pain_points, ["painPoint", "impact", "recommendation"]),
        risksText: stringifyLines(row.risks, ["risk", "whyItMatters", "nextStep"]),
        winsText: stringifyLines(row.wins, ["win", "evidence"]),
        recommendedActionsText: stringifyLines(row.recommended_actions, ["priority", "owner", "action"]),
        managementConclusion: row.management_conclusion || ""
      });

      setStatus(`Loaded insight for ${form.month}.`);
    } catch (error) {
      setStatus(`Load failed: ${error.message}`);
    }
  }

  async function save() {
    if (!form.month) {
      setStatus("Please select a month.");
      return;
    }

    try {
      await saveMonthlyInsight({
        month: form.month,
        title: form.title,
        executiveSummary: form.executiveSummary,
        customerMood: form.customerMood,
        keyThemes: parseLines(form.keyThemesText, "theme"),
        painPoints: parseLines(form.painPointsText, "pain"),
        risks: parseLines(form.risksText, "risk"),
        wins: parseLines(form.winsText, "win"),
        recommendedActions: parseLines(form.recommendedActionsText, "action"),
        managementConclusion: form.managementConclusion
      });

      setStatus(`Saved monthly insight for ${form.month}. It is now visible to all users.`);
    } catch (error) {
      setStatus(`Save failed: ${error.message}`);
    }
  }

  async function remove() {
    if (!form.month) {
      setStatus("Please select a month.");
      return;
    }

    if (!window.confirm(`Delete insight for ${form.month}?`)) return;

    try {
      await deleteMonthlyInsight(form.month);
      setForm({ ...emptyInsight, month: form.month });
      setStatus(`Deleted insight for ${form.month}.`);
    } catch (error) {
      setStatus(`Delete failed: ${error.message}`);
    }
  }

  return (
    <main style={pageStyle}>
      <ReportingNav />

      <h1 style={{ fontSize: 42, fontWeight: 900 }}>Monthly Insights Admin</h1>
      <p style={{ color: "#475569", lineHeight: 1.7 }}>
        Paste the qualitative monthly analysis here. It will be saved in Supabase and displayed on the Monthly Report page for all users.
      </p>

      <div style={{ ...cardStyle, borderTop: "6px solid #7c2d12" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>
          <div>
            <label style={label}>Month</label>
            <input type="month" value={form.month} onChange={(e) => update("month", e.target.value)} style={input} />
          </div>
          <div>
            <label style={label}>Title</label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="May 2026 Customer Insights" style={input} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button onClick={loadExisting} style={darkButton}>Load existing</button>
          <button onClick={save} style={greenButton}>Save insight</button>
          <button onClick={remove} style={redButton}>Delete insight</button>
        </div>

        {status && <div style={{ marginTop: 14, color: status.includes("failed") ? "#b91c1c" : "#166534", fontWeight: 900 }}>{status}</div>}
      </div>

      <EditorCard title="Executive Summary">
        <textarea value={form.executiveSummary} onChange={(e) => update("executiveSummary", e.target.value)} style={textarea} />
      </EditorCard>

      <EditorCard title="Customer Mood">
        <input value={form.customerMood} onChange={(e) => update("customerMood", e.target.value)} placeholder="Neutral to Positive" style={input} />
      </EditorCard>

      <EditorCard title="Key Customer Themes" help="Format per line: Theme | Insight | Opportunity">
        <textarea value={form.keyThemesText} onChange={(e) => update("keyThemesText", e.target.value)} style={textarea} />
      </EditorCard>

      <EditorCard title="Main Pain Points" help="Format per line: Pain Point | Impact | Recommendation">
        <textarea value={form.painPointsText} onChange={(e) => update("painPointsText", e.target.value)} style={textarea} />
      </EditorCard>

      <EditorCard title="Operational Risks" help="Format per line: Risk | Why it matters | Next step">
        <textarea value={form.risksText} onChange={(e) => update("risksText", e.target.value)} style={textarea} />
      </EditorCard>

      <EditorCard title="Positive Signals" help="Format per line: Win | Evidence">
        <textarea value={form.winsText} onChange={(e) => update("winsText", e.target.value)} style={textarea} />
      </EditorCard>

      <EditorCard title="Recommended Actions" help="Format per line: Priority | Owner | Action">
        <textarea value={form.recommendedActionsText} onChange={(e) => update("recommendedActionsText", e.target.value)} style={textarea} />
      </EditorCard>

      <EditorCard title="Management Conclusion">
        <textarea value={form.managementConclusion} onChange={(e) => update("managementConclusion", e.target.value)} style={textarea} />
      </EditorCard>
    </main>
  );
}

function EditorCard({ title, help, children }) {
  return (
    <div style={{ ...cardStyle, marginTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {help && <div style={{ color: "#64748b", marginBottom: 10 }}>{help}</div>}
      {children}
    </div>
  );
}

const label = { display: "block", fontWeight: 900, marginBottom: 8 };
const input = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" };
const textarea = { width: "100%", minHeight: 140, padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box", lineHeight: 1.5 };
const greenButton = { background: "#15803d", color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
const darkButton = { background: "#0f172a", color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
const redButton = { background: "#b91c1c", color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
