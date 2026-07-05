export function detectFileType(filename = "") {
  const n = filename.toLowerCase();
  if (n.includes("ticket-volume")) return "volume";
  if (n.includes("customer-experience")) return "cx";
  if (n.includes("agents-metrics")) return "agents";
  if (n.includes("channels-metrics")) return "channels";
  if (n.includes("workload")) return "workload";
  if (n.includes("all-used-tags") || n.includes("used-tags")) return "tags";
  if (n.includes("daily overview") || n.includes("daily-overview")) return "daily";
  if (n.includes("overview-metrics") || n.includes("overview metrics")) return "overview";
  if (n.includes("sla-report") || n.includes("sla report")) return "sla";
  if (n.includes("revenue-per-day") || n.includes("revenue per day")) return "revenue";
  if (n.includes("yotpo")) return "yotpo";
  if (n.includes("trustpilot") || n.includes("tp ")) return "trustpilot";
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

function money(value) {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(String(value).replace(/[$,%]/g, "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function cell(row, names) {
  for (const name of names) {
    if (row[name] !== undefined) return row[name];
  }
  const keys = Object.keys(row || {});
  const normalized = names.map((n) => String(n).toLowerCase());
  const found = keys.find((k) => normalized.includes(k.toLowerCase()));
  return found ? row[found] : undefined;
}

function hasText(value) {
  return String(value || "").trim() !== "";
}

function isFraudOrder(row = {}) {
  const fields = [
    cell(row, ["Risk Level", "Risk level", "risk level"]),
    cell(row, ["Cancel Reason", "Cancel reason", "cancel reason"]),
    cell(row, ["Tags", "tags"]),
    cell(row, ["Note", "note"]),
    cell(row, ["Notes", "notes"])
  ].join(" ").toLowerCase();
  return fields.includes("fraud") || fields.includes("high risk") || fields.includes("chargeback");
}

function summarizeOrders(rows = []) {
  const seen = new Set();
  const summary = {
    Orders: 0,
    "Total Orders": 0,
    "Paid Orders": 0,
    "Cancelled Orders": 0,
    "Refunded Orders": 0,
    "Partially Refunded Orders": 0,
    "Fraud Orders": 0,
    Revenue: 0,
    "Refunded Amount": 0
  };

  rows.forEach((r, index) => {
    const key = String(cell(r, ["Id", "ID", "id", "Name", "name", "Order ID", "Order Number"]) || `row-${index}`).trim();
    if (seen.has(key)) return;
    seen.add(key);

    const paidAt = cell(r, ["Paid at", "Paid At", "paid at"]);
    const cancelledAt = cell(r, ["Cancelled at", "Cancelled At", "cancelled at"]);
    const financialStatus = String(cell(r, ["Financial Status", "financial status", "Payment Status"]) || "").toLowerCase().trim();
    const total = money(cell(r, ["Total", "Total Price", "Total price", "Grand Total"]));
    const refundedAmount = money(cell(r, ["Refunded Amount", "Refunded amount", "Refunded", "Refund"]));

    const paid = hasText(paidAt) || financialStatus === "paid" || financialStatus === "partially_refunded" || financialStatus === "partially refunded" || financialStatus === "refunded";
    const cancelled = hasText(cancelledAt) || financialStatus === "voided" || financialStatus === "cancelled";
    const refunded = financialStatus.includes("refund") || refundedAmount > 0;
    const partialRefund = financialStatus.includes("partially") || (refundedAmount > 0 && total > 0 && refundedAmount < total);
    const fraud = isFraudOrder(r);

    summary["Total Orders"] += 1;
    if (paid && !cancelled) {
      summary["Paid Orders"] += 1;
      summary.Orders += 1;
      summary.Revenue += total;
    }
    if (cancelled) summary["Cancelled Orders"] += 1;
    if (refunded) summary["Refunded Orders"] += 1;
    if (partialRefund) summary["Partially Refunded Orders"] += 1;
    if (fraud) summary["Fraud Orders"] += 1;
    summary["Refunded Amount"] += refundedAmount;
  });

  return [summary];
}

export function compactRows(type, rows = []) {
  if (type === "orders") return summarizeOrders(rows);

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
  return { tickets: [], workload: [], volume: [], cx: [], agents: [], channels: [], orders: [], finance: [], social: [], tags: [], daily: [], overview: [], sla: [], revenue: [], yotpo: [], trustpilot: [] };
}
