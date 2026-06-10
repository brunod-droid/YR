import { useState } from "react";
import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";
import { deleteMonthlyInsight, loadMonthlyInsight, saveMonthlyInsight } from "../../lib/yr-reporting/monthlyInsightsStorage";

const emptyForm = { month: "", title: "", executiveSummary: "", customerMood: "", keyThemes: "", painPoints: "", risks: "", wins: "", recommendedActions: "", managementConclusion: "" };

function textFromStructuredItems(items = [], fields = []) {
  if (!Array.isArray(items)) return "";
  return items.map((item) => {
    if (typeof item === "string") return item;
    const values = fields.map((field) => item?.[field]).filter(Boolean);
    if (values.length) return values.join("\n");
    return Object.values(item || {}).filter(Boolean).join("\n");
  }).filter(Boolean).join("\n\n");
}

export default function MonthlyInsightsAdmin() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  function update(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function loadExisting() {
    if (!form.month) { setStatus("Select a month first."); return; }
    try {
      const row = await loadMonthlyInsight(form.month);
      if (!row) { setStatus(`No summary saved yet for ${form.month}.`); return; }
      setForm({
        month: row.month || form.month,
        title: row.title || "",
        executiveSummary: row.executive_summary || "",
        customerMood: row.customer_mood || "",
        keyThemes: typeof row.key_themes === "string" ? row.key_themes : textFromStructuredItems(row.key_themes, ["theme", "insight", "opportunity"]),
        painPoints: typeof row.pain_points === "string" ? row.pain_points : textFromStructuredItems(row.pain_points, ["painPoint", "impact", "recommendation"]),
        risks: typeof row.risks === "string" ? row.risks : textFromStructuredItems(row.risks, ["risk", "whyItMatters", "nextStep"]),
        wins: typeof row.wins === "string" ? row.wins : textFromStructuredItems(row.wins, ["win", "evidence"]),
        recommendedActions: typeof row.recommended_actions === "string" ? row.recommended_actions : textFromStructuredItems(row.recommended_actions, ["priority", "owner", "action"]),
        managementConclusion: row.management_conclusion || ""
      });
      setStatus(`Loaded summary for ${form.month}.`);
    } catch (error) { setStatus(`Load failed: ${error.message}`); }
  }

  async function save() {
    if (!form.month) { setStatus("Please select a month."); return; }
    try {
      await saveMonthlyInsight({ month: form.month, title: form.title || `${form.month} Customer Insights`, executiveSummary: form.executiveSummary, customerMood: form.customerMood, keyThemes: form.keyThemes, painPoints: form.painPoints, risks: form.risks, wins: form.wins, recommendedActions: form.recommendedActions, managementConclusion: form.managementConclusion });
      setStatus(`Saved management summary for ${form.month}. It is now visible to all users.`);
    } catch (error) { setStatus(`Save failed: ${error.message}`); }
  }

  async function remove() {
    if (!form.month) { setStatus("Please select a month."); return; }
    if (!window.confirm(`Delete management summary for ${form.month}?`)) return;
    try { await deleteMonthlyInsight(form.month); setForm({ ...emptyForm, month: form.month }); setStatus(`Deleted summary for ${form.month}.`); }
    catch (error) { setStatus(`Delete failed: ${error.message}`); }
  }

  return <main style={pageStyle}>
    <ReportingNav />
    <div style={{ marginBottom: 22 }}><div style={{ color: "#7c2d12", fontWeight: 950 }}>Monthly Management Summary</div><h1 style={{ fontSize: 42, fontWeight: 950, margin: "6px 0" }}>Monthly Insights Admin</h1><p style={{ color: "#475569", lineHeight: 1.7 }}>Paste the monthly qualitative summary here. Each section is a large free-text field, so it is easy to copy/paste a management-ready analysis.</p></div>
    <div style={{ ...cardStyle, borderTop: "6px solid #7c2d12" }}><div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}><div><label style={label}>Month</label><input type="month" value={form.month} onChange={(e) => update("month", e.target.value)} style={input} /></div><div><label style={label}>Title</label><input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="May 2026 Customer Insights" style={input} /></div></div><div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}><button onClick={loadExisting} style={darkButton}>Load existing</button><button onClick={save} style={greenButton}>Save summary</button><button onClick={remove} style={redButton}>Delete summary</button></div>{status && <div style={{ marginTop: 14, color: status.includes("failed") ? "#b91c1c" : "#166534", fontWeight: 900 }}>{status}</div>}</div>
    <EditorCard title="Executive Summary" help="Short management readout: what happened, why it matters, and what to focus on."><textarea value={form.executiveSummary} onChange={(e) => update("executiveSummary", e.target.value)} style={textarea} /></EditorCard>
    <EditorCard title="Customer Mood" help="Overall customer sentiment and tone."><textarea value={form.customerMood} onChange={(e) => update("customerMood", e.target.value)} style={textarea} /></EditorCard>
    <EditorCard title="Key Customer Themes" help="Free text. Use paragraphs and bullets. No special format needed."><textarea value={form.keyThemes} onChange={(e) => update("keyThemes", e.target.value)} style={largeTextarea} /></EditorCard>
    <EditorCard title="Main Pain Points" help="Free text. Focus on customer friction and operational impact."><textarea value={form.painPoints} onChange={(e) => update("painPoints", e.target.value)} style={largeTextarea} /></EditorCard>
    <EditorCard title="Operational Risks" help="Free text. Highlight what needs monitoring or escalation."><textarea value={form.risks} onChange={(e) => update("risks", e.target.value)} style={textarea} /></EditorCard>
    <EditorCard title="Positive Signals" help="Free text. Show what is working well."><textarea value={form.wins} onChange={(e) => update("wins", e.target.value)} style={textarea} /></EditorCard>
    <EditorCard title="Recommended Actions" help="Free text. Make it actionable for management."><textarea value={form.recommendedActions} onChange={(e) => update("recommendedActions", e.target.value)} style={largeTextarea} /></EditorCard>
    <EditorCard title="Management Conclusion" help="Final conclusion for leadership review."><textarea value={form.managementConclusion} onChange={(e) => update("managementConclusion", e.target.value)} style={textarea} /></EditorCard>
  </main>;
}
function EditorCard({ title, help, children }) { return <div style={{ ...cardStyle, marginTop: 16 }}><h2 style={{ marginTop: 0 }}>{title}</h2>{help && <div style={{ color: "#64748b", marginBottom: 10, lineHeight: 1.5 }}>{help}</div>}{children}</div>; }
const label = { display: "block", fontWeight: 900, marginBottom: 8 };
const input = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" };
const textarea = { width: "100%", minHeight: 150, padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box", lineHeight: 1.55, fontSize: 15 };
const largeTextarea = { ...textarea, minHeight: 260 };
const greenButton = { background: "#15803d", color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
const darkButton = { background: "#0f172a", color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
const redButton = { background: "#b91c1c", color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 900, cursor: "pointer" };
