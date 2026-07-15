function localKey(month) { return `yr_monthly_insight_${month}`; }

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || `API request failed: ${response.status}`);
  return payload;
}

function normalizeInsight(row) {
  if (!row) return null;
  return {
    ...row,
    key_themes: row.key_themes || "",
    pain_points: row.pain_points || "",
    risks: row.risks || "",
    wins: row.wins || "",
    recommended_actions: row.recommended_actions || ""
  };
}

export async function loadMonthlyInsight(month) {
  if (!month) return null;
  try {
    return normalizeInsight(await apiRequest(`/api/yr-monthly-insights?month=${encodeURIComponent(month)}`));
  } catch {
    try { return normalizeInsight(JSON.parse(window.localStorage.getItem(localKey(month)) || "null")); } catch { return null; }
  }
}

export async function loadMonthlyInsights() {
  const rows = await apiRequest("/api/yr-monthly-insights");
  return Array.isArray(rows) ? rows.map(normalizeInsight) : [];
}

export async function saveMonthlyInsight({ month, title, executiveSummary, customerMood, keyThemes, painPoints, risks, wins, recommendedActions, managementConclusion }) {
  if (!month) throw new Error("Missing month.");
  const payload = {
    month,
    title: title || `${month} Customer Insights`,
    executive_summary: executiveSummary || "",
    customer_mood: customerMood || "",
    key_themes: keyThemes || "",
    pain_points: painPoints || "",
    risks: risks || "",
    wins: wins || "",
    recommended_actions: recommendedActions || "",
    management_conclusion: managementConclusion || ""
  };
  const saved = normalizeInsight(await apiRequest("/api/yr-monthly-insights", { method: "POST", body: JSON.stringify(payload) }));
  window.localStorage.setItem(localKey(month), JSON.stringify(saved));
  return saved;
}

export async function deleteMonthlyInsight(month) {
  if (!month) return;
  await apiRequest(`/api/yr-monthly-insights?month=${encodeURIComponent(month)}`, { method: "DELETE" });
  window.localStorage.removeItem(localKey(month));
}
