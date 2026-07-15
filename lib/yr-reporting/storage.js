export const STORAGE_KEY = "yr_reports";
export const MONTHLY_STORAGE_KEY = "yr_monthly_reports";
export const SETTINGS_KEY = "yr_reporting_settings";

export function isBrowser() { return typeof window !== "undefined"; }

export function emptyReportData() {
  return { tickets: [], workload: [], volume: [], cx: [], agents: [], channels: [], orders: [], finance: [], social: [], tags: [], daily: [], overview: [], sla: [], revenue: [], yotpo: [], trustpilot: [] };
}

function normalizeWeekly(row) {
  const report = row?.report || row?.data || row || {};
  return {
    ...report,
    week: report.week || row?.week,
    weekStart: report.weekStart || row?.week_start,
    weekEnd: report.weekEnd || row?.week_end,
    data: { ...emptyReportData(), ...(report.data || {}) },
    createdAt: report.createdAt || row?.created_at,
    updatedAt: row?.updated_at || report.updatedAt,
    uploadedAt: row?.uploaded_at || report.uploadedAt
  };
}

function normalizeMonthly(row) {
  const report = row?.report || row?.data || row || {};
  return {
    ...report,
    month: report.month || row?.month,
    monthStart: report.monthStart || row?.month_start,
    monthEnd: report.monthEnd || row?.month_end,
    data: { ...emptyReportData(), ...(report.data || {}) },
    createdAt: report.createdAt || row?.created_at,
    updatedAt: row?.updated_at || report.updatedAt,
    uploadedAt: row?.uploaded_at || report.uploadedAt
  };
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || `API request failed: ${response.status}`);
  return payload;
}

export function getLocalReportsOnly() {
  if (!isBrowser()) return [];
  try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function getLocalMonthlyReportsOnly() {
  if (!isBrowser()) return [];
  try { return JSON.parse(window.localStorage.getItem(MONTHLY_STORAGE_KEY) || "[]"); } catch { return []; }
}

export function saveReports(reports) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports || []));
}

export function saveMonthlyReports(reports) {
  if (!isBrowser()) return;
  window.localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(reports || []));
}

export function getReports() { return getLocalReportsOnly(); }
export function getMonthlyReports() { return getLocalMonthlyReportsOnly(); }

export async function loadReports() {
  const rows = await apiRequest("/api/yr-reports");
  const reports = Array.isArray(rows) ? rows.map(normalizeWeekly).filter((r) => r.week) : [];
  saveReports(reports);
  return reports;
}

export async function loadMonthlyReports() {
  const rows = await apiRequest("/api/yr-monthly-reports");
  const reports = Array.isArray(rows) ? rows.map(normalizeMonthly).filter((r) => r.month) : [];
  saveMonthlyReports(reports);
  return reports;
}

export async function loadReportByWeek(week) {
  const reports = await loadReports();
  return reports.find((report) => report.week === week) || null;
}

export async function loadMonthlyReportByMonth(month) {
  const reports = await loadMonthlyReports();
  return reports.find((report) => report.month === month) || null;
}

export function getReportByWeek(week) {
  return getLocalReportsOnly().find((report) => report.week === week) || null;
}

export async function saveReport(report) {
  const next = { ...report, data: { ...emptyReportData(), ...(report.data || {}) }, updatedAt: new Date().toISOString() };
  if (!next.week) throw new Error("Missing report.week.");
  await apiRequest("/api/yr-reports", { method: "POST", body: JSON.stringify({ report: next }) });
  return loadReports();
}

export async function saveMonthlyReport(report) {
  const next = { ...report, data: { ...emptyReportData(), ...(report.data || {}) }, updatedAt: new Date().toISOString() };
  if (!next.month) throw new Error("Missing report.month.");
  await apiRequest("/api/yr-monthly-reports", { method: "POST", body: JSON.stringify({ report: next }) });
  return loadMonthlyReports();
}

export async function upsertReport(report) { return saveReport(report); }

export async function deleteReport(week) {
  if (!week) return loadReports();
  await apiRequest(`/api/yr-reports?week=${encodeURIComponent(week)}`, { method: "DELETE" });
  return loadReports();
}

export async function deleteMonthlyReport(month) {
  if (!month) return loadMonthlyReports();
  await apiRequest(`/api/yr-monthly-reports?month=${encodeURIComponent(month)}`, { method: "DELETE" });
  return loadMonthlyReports();
}

export function getDefaultSettings() {
  return {
    tagMapping: {
      "reason::wismo": "WISMO", "reason::refund": "Refund", "reason::return": "Return",
      "reason::exchange": "Exchange", "reason::cancel": "Cancel", "reason::damaged": "Damaged",
      "reason::wrong_item": "Wrong item", "reason::missing_item": "Missing item",
      "reason::delivery_issue": "Delivery issue", "reason::payment": "Payment",
      "reason::coupon": "Coupon / Discount", "reason::order_change": "Order change",
      "reason::address_change": "Address change", "reason::product_question": "Product question",
      "reason::subscription": "Subscription"
    },
    targets: { csat: 4.2, slaHours: 10, nps: "High", orderCost: "Low" }
  };
}

export function getSettings() {
  if (!isBrowser()) return getDefaultSettings();
  try {
    const raw = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      ...getDefaultSettings(),
      ...raw,
      tagMapping: { ...getDefaultSettings().tagMapping, ...(raw.tagMapping || {}) },
      targets: { ...getDefaultSettings().targets, ...(raw.targets || {}) }
    };
  } catch { return getDefaultSettings(); }
}

export function saveSettings(settings) {
  if (!isBrowser()) return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
