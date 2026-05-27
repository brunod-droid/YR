export function detectFileType(filename = "") {
  const n = filename.toLowerCase();
  if (n.includes("ticket-volume")) return "volume";
  if (n.includes("customer-experience")) return "cx";
  if (n.includes("agents-metrics")) return "agents";
  if (n.includes("channels-metrics")) return "channels";
  if (n.includes("workload")) return "workload";
  if (n.includes("tickets")) return "tickets";
  if (n.includes("orders") || n.includes("order") || n.includes("shopify")) return "orders";
  if (n.includes("finance") || n.includes("cost")) return "finance";
  if (n.includes("social")) return "social";
  return null;
}

export function normalizeHeader(header = "") {
  return String(header || "").trim().replace(/\s+/g, " ").replace(/^\ufeff/, "");
}

export function normalizeRows(rows = []) {
  return rows.map((row) => {
    const out = {};
    Object.entries(row || {}).forEach(([k, v]) => {
      out[normalizeHeader(k)] = typeof v === "string" ? v.trim() : v;
    });
    return out;
  }).filter((row) => Object.values(row).some((v) => v !== "" && v !== null && v !== undefined));
}

export function compactRows(type, rows = []) {
  if (type === "orders") {
    const seen = new Set();
    const paid = [];

    rows.forEach((r, index) => {
      const paidAt = r["Paid at"] || r["Paid At"] || r["paid at"];
      const cancelledAt = r["Cancelled at"] || r["Cancelled At"] || r["cancelled at"];
      const financialStatus = String(r["Financial Status"] || r["financial status"] || "").toLowerCase().trim();

      const isPaid = paidAt ? true : financialStatus === "paid" || financialStatus === "partially refunded";
      const isCancelled = cancelledAt && String(cancelledAt).trim() !== "";
      if (!isPaid || isCancelled) return;

      const key = String(r.Id || r.ID || r.id || r.Name || r.name || `row-${index}`).trim();
      if (seen.has(key)) return;
      seen.add(key);

      paid.push({ Id: key, Name: r.Name || "", "Paid at": paidAt || "", Total: r.Total || "" });
    });

    // Critical simplification: only store one summary row, not the whole Shopify file.
    return [{ Orders: paid.length }];
  }

  if (type === "tickets") {
    return rows.map((r) => ({
      id: r.id || r.ID || r["Ticket id"] || r["Ticket ID"] || r.Id || "",
      "Created at": r["Created at"] || r["Creation date"] || "",
      "Closed at": r["Closed at"] || r["Closed date"] || "",
      Tags: r.Tags || r.tags || "",
      "Initial channel": r["Initial channel"] || r.Channel || "",
      "Assignee name": r["Assignee name"] || r.Assignee || "",
      "Survey score": r["Survey score"] || r.CSAT || "",
      "Number of agent messages": r["Number of agent messages"] || r["Messages sent"] || r.Messages || "",
      "First response time (s)": r["First response time (s)"] || ""
    }));
  }

  return rows;
}

export function defaultReportData() {
  return { tickets: [], workload: [], volume: [], cx: [], agents: [], channels: [], orders: [], finance: [], social: [] };
}
