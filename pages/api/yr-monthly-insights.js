
function getConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  };
}

async function supabaseRequest(tablePath, options = {}) {
  const { url, key } = getConfig();
  if (!url || !key) throw new Error("Missing Supabase environment variables in Vercel.");
  const cleanUrl = String(url).replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const response = await fetch(`${cleanUrl}/rest/v1/${tablePath}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });
  if (!response.ok) throw new Error(await response.text() || `Supabase request failed: ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

const TABLE = "yr_monthly_insights";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const month = req.query.month;
      if (month) {
        const rows = await supabaseRequest(`${TABLE}?month=eq.${encodeURIComponent(month)}&select=*&limit=1`);
        return res.status(200).json(rows?.[0] || null);
      }
      const rows = await supabaseRequest(`${TABLE}?select=*&order=month.desc`);
      return res.status(200).json(rows || []);
    }

    if (req.method === "POST") {
      const p = req.body || {};
      if (!p.month) return res.status(400).json({ error: "Missing month." });

      const rows = await supabaseRequest(TABLE, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          month: p.month,
          title: p.title || `${p.month} Customer Insights`,
          executive_summary: p.executive_summary || p.executiveSummary || "",
          customer_mood: p.customer_mood || p.customerMood || "",
          key_themes: p.key_themes || p.keyThemes || "",
          pain_points: p.pain_points || p.painPoints || "",
          risks: p.risks || "",
          wins: p.wins || "",
          recommended_actions: p.recommended_actions || p.recommendedActions || "",
          management_conclusion: p.management_conclusion || p.managementConclusion || "",
          updated_at: new Date().toISOString()
        })
      });
      return res.status(200).json(rows?.[0] || p);
    }

    if (req.method === "DELETE") {
      const month = req.query.month || req.body?.month;
      if (!month) return res.status(400).json({ error: "Missing month." });
      await supabaseRequest(`${TABLE}?month=eq.${encodeURIComponent(month)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" }
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    return res.status(500).json({ error: error.message || "API error." });
  }
}
