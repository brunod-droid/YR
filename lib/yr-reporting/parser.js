export function detectFileType(filename = "") {
  const n = filename.toLowerCase().trim();
  // Gorgias has used both hyphens and underscores in export filenames.
  // Normalize separators so both old and new nomenclatures remain supported.
  const normalized = n.replace(/[_\s]+/g, "-");

  if (normalized.includes("ticket-volume")) return "volume";
  if (normalized.includes("customer-experience")) return "cx";
  if (normalized.includes("agents-metrics") || normalized.includes("agents-metrics-table")) return "agents";
  if (normalized.includes("channels-metrics") || normalized.includes("channels-metrics-table")) return "channels";
  if (normalized.includes("workload")) return "workload";
  if (normalized.includes("csat")) return "cx";
  if (normalized.includes("tickets")) return "tickets";
  if (normalized.includes("orders") || normalized.includes("order") || normalized.includes("shopify")) return "orders";
  if (normalized.includes("finance") || normalized.includes("cost")) return "finance";
  if (normalized.includes("social")) return "social";

  // New Gorgias Overview exports can be downloaded with a numeric filename
  // (example: 1397.csv). In the weekly bundle this is the ticket-volume file.
  if (/^\d+\.csv$/i.test(n)) return "volume";

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

export function orderValue(row = {}, names = []) {
  const wanted = names.map((x) => String(x).toLowerCase().trim());
  const key = Object.keys(row || {}).find((k) => wanted.includes(String(k).toLowerCase().trim()));
  return key ? row[key] : "";
}

function moneyNumber(value) {
  const n = Number(String(value || "").replace(/[$,]/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function orderStatusText(row = {}) {
  return [
    orderValue(row, ["Financial Status", "financial status"]),
    orderValue(row, ["Fulfillment Status", "fulfillment status"]),
    orderValue(row, ["Tags", "tags"]),
    orderValue(row, ["Risk Level", "risk level"]),
    orderValue(row, ["Payment Method", "payment method"]),
    orderValue(row, ["Notes", "notes"])
  ].join(" ").toLowerCase();
}

function isFraudOrder(row = {}) {
  return /fraud|chargeback|charge flow|chargeflow|high risk|medium risk/.test(orderStatusText(row));
}

function isRefundedOrder(row = {}) {
  const status = String(orderValue(row, ["Financial Status", "financial status"])).toLowerCase();
  const refundedAt = orderValue(row, ["Refunded at", "Refunded At", "refunded at"]);
  const refundTotal = moneyNumber(orderValue(row, ["Refunded Amount", "Refund Amount", "Total Refunded", "Refunded", "refund amount"]));
  return status.includes("refund") || hasValue(refundedAt) || refundTotal > 0;
}

function isCancelledOrder(row = {}) {
  const cancelledAt = orderValue(row, ["Cancelled at", "Cancelled At", "cancelled at"]);
  const status = String(orderValue(row, ["Financial Status", "financial status"])).toLowerCase();
  return hasValue(cancelledAt) || status.includes("voided") || status.includes("cancelled") || status.includes("canceled");
}

function isPaidShopifyOrder(row = {}) {
  const paidAt = orderValue(row, ["Paid at", "Paid At", "paid at"]);
  const status = String(orderValue(row, ["Financial Status", "financial status"])).toLowerCase().trim();
  if (hasValue(paidAt)) return true;
  return ["paid", "partially refunded", "refunded"].includes(status);
}

function orderId(row = {}, index = 0) {
  return String(orderValue(row, ["Id", "ID", "id", "Name", "name", "Order ID", "Order Id"]) || `row-${index}`).trim();
}

export function summarizeOrders(rows = []) {
  const seen = new Set();
  const unique = [];
  rows.forEach((row, index) => {
    const key = orderId(row, index);
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(row);
  });

  const paid = unique.filter(isPaidShopifyOrder);
  const cancelled = unique.filter(isCancelledOrder);
  const refunded = unique.filter(isRefundedOrder);
  const fraud = unique.filter(isFraudOrder);
  const revenue = paid.reduce((sum, row) => sum + moneyNumber(orderValue(row, ["Total", "Total Price", "total", "total price"])), 0);
  const refundAmount = refunded.reduce((sum, row) => sum + moneyNumber(orderValue(row, ["Refunded Amount", "Refund Amount", "Total Refunded", "Refunded", "refund amount"])), 0);

  return {
    Orders: paid.length,
    PaidOrders: paid.length,
    TotalOrders: unique.length,
    CancelledOrders: cancelled.length,
    RefundedOrders: refunded.length,
    FraudOrders: fraud.length,
    GrossRevenue: revenue,
    RefundAmount: refundAmount
  };
}

export function compactRows(type, rows = []) {
  if (type === "orders") {
    return [summarizeOrders(rows)];
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
