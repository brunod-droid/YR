
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

const TABLE = "yr_reports";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const rows = await supabaseRequest(`${TABLE}?select=*&order=week.desc`);
      return res.status(200).json(rows || []);
    }

    if (req.method === "POST") {
      const report = req.body?.report || req.body;
      if (!report?.week) return res.status(400).json({ error: "Missing report.week." });

      const rows = await supabaseRequest(TABLE, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          week: report.week,
          week_start: report.weekStart || null,
          week_end: report.weekEnd || null,
          report,
          uploaded_at: report.uploadedAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      return res.status(200).json(rows?.[0] || report);
    }

    if (req.method === "DELETE") {
      const week = req.query.week || req.body?.week;
      if (!week) return res.status(400).json({ error: "Missing week." });
      await supabaseRequest(`${TABLE}?week=eq.${encodeURIComponent(week)}`, {
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
