export const STORAGE_KEY = "yr_reports";
export const MONTHLY_STORAGE_KEY = "yr_monthly_reports";
export const SETTINGS_KEY = "yr_reporting_settings";
export const SUPABASE_TABLE = "yr_reports";
export const SUPABASE_MONTHLY_TABLE = "yr_monthly_reports";

export function isBrowser() { return typeof window !== "undefined"; }

export function emptyReportData() {
  return { tickets: [], workload: [], volume: [], cx: [], agents: [], channels: [], orders: [], finance: [], social: [] };
}

function supabaseConfig() {
  return { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
}

function hasSupabaseConfig() {
  const { url, key } = supabaseConfig();
  return Boolean(url && key);
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = supabaseConfig();
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.");
  const cleanUrl = String(url).replace(/\/+$/, "");
  const response = await fetch(`${cleanUrl}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation", ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error((await response.text()) || `Supabase request failed: ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

function normalizeReportFromRow(row) {
  const report = row?.report || row?.data || {};
  return { ...report, week: report.week || row.week, weekStart: report.weekStart || row.week_start, weekEnd: report.weekEnd || row.week_end, data: { ...emptyReportData(), ...(report.data || {}) }, createdAt: report.createdAt || row.created_at, updatedAt: row.updated_at || report.updatedAt, uploadedAt: row.uploaded_at || report.uploadedAt };
}

function normalizeMonthlyReportFromRow(row) {
  const report = row?.report || row?.data || {};
  return { ...report, month: report.month || row.month, monthStart: report.monthStart || row.month_start, monthEnd: report.monthEnd || row.month_end, data: { ...emptyReportData(), ...(report.data || {}) }, createdAt: report.createdAt || row.created_at, updatedAt: row.updated_at || report.updatedAt, uploadedAt: row.uploaded_at || report.uploadedAt };
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
  if (!hasSupabaseConfig()) return getLocalReportsOnly();
  const rows = await supabaseRequest(`${SUPABASE_TABLE}?select=*&order=week.desc`);
  const remoteReports = Array.isArray(rows) ? rows.map(normalizeReportFromRow) : [];
  if (isBrowser()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteReports));
  return remoteReports;
}

export async function loadMonthlyReports() {
  if (!hasSupabaseConfig()) return getLocalMonthlyReportsOnly();
  const rows = await supabaseRequest(`${SUPABASE_MONTHLY_TABLE}?select=*&order=month.desc`);
  const remoteReports = Array.isArray(rows) ? rows.map(normalizeMonthlyReportFromRow) : [];
  if (isBrowser()) window.localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(remoteReports));
  return remoteReports;
}

export async function loadReportByWeek(week) {
  if (!week) return null;
  if (!hasSupabaseConfig()) return getLocalReportsOnly().find((report) => report.week === week) || null;
  const rows = await supabaseRequest(`${SUPABASE_TABLE}?week=eq.${encodeURIComponent(week)}&select=*&limit=1`);
  return rows?.[0] ? normalizeReportFromRow(rows[0]) : null;
}

export async function loadMonthlyReportByMonth(month) {
  if (!month) return null;
  if (!hasSupabaseConfig()) return getLocalMonthlyReportsOnly().find((report) => report.month === month) || null;
  const rows = await supabaseRequest(`${SUPABASE_MONTHLY_TABLE}?month=eq.${encodeURIComponent(month)}&select=*&limit=1`);
  return rows?.[0] ? normalizeMonthlyReportFromRow(rows[0]) : null;
}

export function getReportByWeek(week) { return getLocalReportsOnly().find((report) => report.week === week) || null; }

export async function saveReport(report) {
  const next = { ...report, data: { ...emptyReportData(), ...(report.data || {}) }, updatedAt: new Date().toISOString() };
  if (!next.week) throw new Error("Missing report.week.");
  if (!hasSupabaseConfig()) {
    const reports = getLocalReportsOnly();
    const nextReports = [next, ...reports.filter((item) => item.week !== next.week)].sort((a, b) => (a.week < b.week ? 1 : -1));
    saveReports(nextReports); return nextReports;
  }
  await supabaseRequest(SUPABASE_TABLE, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ week: next.week, week_start: next.weekStart || null, week_end: next.weekEnd || null, report: next, uploaded_at: next.uploadedAt || new Date().toISOString(), updated_at: new Date().toISOString() }) });
  return loadReports();
}

export async function saveMonthlyReport(report) {
  const next = { ...report, data: { ...emptyReportData(), ...(report.data || {}) }, updatedAt: new Date().toISOString() };
  if (!next.month) throw new Error("Missing report.month.");
  if (!hasSupabaseConfig()) {
    const reports = getLocalMonthlyReportsOnly();
    const nextReports = [next, ...reports.filter((item) => item.month !== next.month)].sort((a, b) => (a.month < b.month ? 1 : -1));
    saveMonthlyReports(nextReports); return nextReports;
  }
  await supabaseRequest(SUPABASE_MONTHLY_TABLE, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ month: next.month, month_start: next.monthStart || null, month_end: next.monthEnd || null, report: next, uploaded_at: next.uploadedAt || new Date().toISOString(), updated_at: new Date().toISOString() }) });
  return loadMonthlyReports();
}

export async function upsertReport(report) { return saveReport(report); }

export async function deleteReport(week) {
  if (!week) return loadReports();
  if (!hasSupabaseConfig()) { const reports = getLocalReportsOnly().filter((report) => report.week !== week); saveReports(reports); return reports; }
  await supabaseRequest(`${SUPABASE_TABLE}?week=eq.${encodeURIComponent(week)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
  return loadReports();
}

export async function deleteMonthlyReport(month) {
  if (!month) return loadMonthlyReports();
  if (!hasSupabaseConfig()) { const reports = getLocalMonthlyReportsOnly().filter((report) => report.month !== month); saveMonthlyReports(reports); return reports; }
  await supabaseRequest(`${SUPABASE_MONTHLY_TABLE}?month=eq.${encodeURIComponent(month)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
  return loadMonthlyReports();
}

export function getDefaultSettings() {
  return { tagMapping: { "reason::wismo": "WISMO", "reason::refund": "Refund", "reason::return": "Return", "reason::exchange": "Exchange", "reason::cancel": "Cancel", "reason::damaged": "Damaged", "reason::wrong_item": "Wrong item", "reason::missing_item": "Missing item", "reason::delivery_issue": "Delivery issue", "reason::payment": "Payment", "reason::coupon": "Coupon / Discount", "reason::order_change": "Order change", "reason::address_change": "Address change", "reason::product_question": "Product question", "reason::subscription": "Subscription" }, targets: { csat: 4.2, slaHours: 10, nps: "High", orderCost: "Low" } };
}

export function getSettings() {
  if (!isBrowser()) return getDefaultSettings();
  try {
    const raw = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}");
    return { ...getDefaultSettings(), ...raw, tagMapping: { ...getDefaultSettings().tagMapping, ...(raw.tagMapping || {}) }, targets: { ...getDefaultSettings().targets, ...(raw.targets || {}) } };
  } catch { return getDefaultSettings(); }
}

export function saveSettings(settings) {
  if (!isBrowser()) return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
