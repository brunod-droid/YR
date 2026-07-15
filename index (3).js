function getConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  };
}

const TYPE_CONFIG = {
  developments: {
    table: "weekly_developments",
    allowed: ["id", "week", "week_start", "week_end", "category", "title", "description", "impact", "status"]
  },
  "future-plans": {
    table: "weekly_future_plans",
    allowed: ["id", "week", "week_start", "week_end", "initiative", "description", "owner", "eta", "priority", "status"]
  },
  risks: {
    table: "weekly_risks",
    allowed: ["id", "week", "week_start", "week_end", "risk", "description", "impact", "owner", "escalation_needed", "status"]
  }
};

function cleanPayload(item, allowed) {
  const output = {};
  for (const key of allowed) {
    if (key === "id") continue;
    if (Object.prototype.hasOwnProperty.call(item || {}, key)) output[key] = item[key] === "" ? null : item[key];
  }
  return output;
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

export default async function handler(req, res) {
  try {
    const type = req.query.type || req.body?.type;
    const config = TYPE_CONFIG[type];
    if (!config) return res.status(400).json({ error: "Invalid weekly item type." });

    if (req.method === "GET") {
      const week = req.query.week;
      const filter = week ? `&week=eq.${encodeURIComponent(week)}` : "";
      const rows = await supabaseRequest(`${config.table}?select=*${filter}&order=created_at.desc`);
      return res.status(200).json(rows || []);
    }

    if (req.method === "POST") {
      const item = req.body?.item || {};
      if (!item.week) return res.status(400).json({ error: "Missing item.week." });
      const payload = cleanPayload(item, config.allowed);
      const id = item.id;
      const rows = await supabaseRequest(id ? `${config.table}?id=eq.${encodeURIComponent(id)}` : config.table, {
        method: id ? "PATCH" : "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(payload)
      });
      return res.status(200).json(rows?.[0] || payload);
    }

    if (req.method === "DELETE") {
      const id = req.query.id || req.body?.id;
      if (!id) return res.status(400).json({ error: "Missing id." });
      await supabaseRequest(`${config.table}?id=eq.${encodeURIComponent(id)}`, {
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
