export const STORAGE_KEY = 'yr_reports';

export const defaultTagMapping = {
  'reason::wismo': 'WISMO',
  'reason::refund': 'Refund',
  'reason::damaged': 'Damaged Item',
  'reason::cancel': 'Cancellation',
  'reason::exchange': 'Exchange',
  'reason::delivery': 'Delivery Issue',
  'reason::payment': 'Payment Issue',
  'reason::loyalty': 'Loyalty / CRM',
};

export function getReports() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveReports(reports) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function addReport(report) {
  const reports = getReports();
  const next = [report, ...reports.filter((item) => item.id !== report.id)];
  saveReports(next);
  return next;
}

export function clearReports() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportReports() {
  return JSON.stringify(getReports(), null, 2);
}

export function importReports(json) {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error('The imported file must contain an array of reports.');
  saveReports(parsed);
  return parsed;
}

export function summarizeWeeks(reports) {
  return reports.reduce((acc, report) => {
    acc.created += Number(report.kpis?.created || 0);
    acc.closed += Number(report.kpis?.closed || 0);
    acc.orders += Number(report.kpis?.orders || 0);
    acc.csatValues.push(Number(report.kpis?.csat || 0));
    return acc;
  }, { created: 0, closed: 0, orders: 0, csatValues: [] });
}
