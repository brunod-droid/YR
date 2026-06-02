export const MONTHLY_INSIGHTS_TABLE = "yr_monthly_insights";

function supabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
}

function hasSupabaseConfig() {
  const { url, key } = supabaseConfig();
  return Boolean(url && key);
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = supabaseConfig();

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.");
  }

  const cleanUrl = String(url).replace(/\/+$/, "");
  const response = await fetch(`${cleanUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function localKey(month) {
  return `yr_monthly_insight_${month}`;
}

export async function loadMonthlyInsight(month) {
  if (!month) return null;

  if (!hasSupabaseConfig()) {
    try {
      return JSON.parse(window.localStorage.getItem(localKey(month)) || "null");
    } catch {
      return null;
    }
  }

  const rows = await supabaseRequest(`${MONTHLY_INSIGHTS_TABLE}?month=eq.${encodeURIComponent(month)}&select=*&limit=1`);
  return rows?.[0] || null;
}

export async function loadMonthlyInsights() {
  if (!hasSupabaseConfig()) return [];

  const rows = await supabaseRequest(`${MONTHLY_INSIGHTS_TABLE}?select=*&order=month.desc`);
  return Array.isArray(rows) ? rows : [];
}

export async function saveMonthlyInsight({ month, title, executiveSummary, customerMood, keyThemes, painPoints, risks, wins, recommendedActions, managementConclusion }) {
  if (!month) throw new Error("Missing month.");

  const payload = {
    month,
    title: title || `${month} Customer Insights`,
    executive_summary: executiveSummary || "",
    customer_mood: customerMood || "",
    key_themes: keyThemes || [],
    pain_points: painPoints || [],
    risks: risks || [],
    wins: wins || [],
    recommended_actions: recommendedActions || [],
    management_conclusion: managementConclusion || "",
    updated_at: new Date().toISOString()
  };

  if (!hasSupabaseConfig()) {
    window.localStorage.setItem(localKey(month), JSON.stringify(payload));
    return payload;
  }

  const rows = await supabaseRequest(MONTHLY_INSIGHTS_TABLE, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload)
  });

  return rows?.[0] || payload;
}

export async function deleteMonthlyInsight(month) {
  if (!month) return;

  if (!hasSupabaseConfig()) {
    window.localStorage.removeItem(localKey(month));
    return;
  }

  await supabaseRequest(`${MONTHLY_INSIGHTS_TABLE}?month=eq.${encodeURIComponent(month)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
}
