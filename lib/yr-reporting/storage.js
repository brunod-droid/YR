export const STORAGE_KEY = "yr_reports";
export const SETTINGS_KEY = "yr_reporting_settings";

export function isBrowser() { return typeof window !== "undefined"; }

export function emptyReportData() {
  return { tickets: [], workload: [], volume: [], cx: [], agents: [], channels: [], orders: [], finance: [], social: [] };
}

export function getReports() {
  if (!isBrowser()) return [];
  try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function saveReports(reports) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports || []));
}

export function getReportByWeek(week) {
  return getReports().find((report) => report.week === week) || null;
}

export function upsertReport(report) {
  const reports = getReports();
  const index = reports.findIndex((item) => item.week === report.week);
  const next = { ...report, data: { ...emptyReportData(), ...(report.data || {}) }, updatedAt: new Date().toISOString() };
  if (index >= 0) reports[index] = { ...reports[index], ...next, data: { ...emptyReportData(), ...(reports[index].data || {}), ...(next.data || {}) } };
  else reports.push({ ...next, createdAt: new Date().toISOString() });
  reports.sort((a, b) => (a.week < b.week ? 1 : -1));
  saveReports(reports);
  return reports;
}

export function deleteReport(week) {
  const reports = getReports().filter((report) => report.week !== week);
  saveReports(reports);
  return reports;
}

export function getDefaultSettings() {
  return {
    tagMapping: {
      "reason::wismo": "WISMO",
      "reason::refund": "Refund",
      "reason::return": "Return",
      "reason::exchange": "Exchange",
      "reason::cancel": "Cancel",
      "reason::damaged": "Damaged",
      "reason::wrong_item": "Wrong item",
      "reason::missing_item": "Missing item",
      "reason::delivery_issue": "Delivery issue",
      "reason::payment": "Payment",
      "reason::coupon": "Coupon / Discount",
      "reason::order_change": "Order change",
      "reason::address_change": "Address change",
      "reason::product_question": "Product question",
      "reason::subscription": "Subscription"
    },
    targets: { csat: 4.2, slaHours: 10, nps: "High", orderCost: "Low" }
  };
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
