export const REQUIRED_COLUMNS = { tickets: ["Tags"], volume: [], workload: [], cx: [], agents: [], channels: [], orders: [], finance: [], social: [] };

export function getColumns(rows = []) {
  const columns = new Set();
  rows.forEach((row) => Object.keys(row || {}).forEach((key) => columns.add(key)));
  return Array.from(columns);
}

export function validateRows(type, rows = []) {
  const columns = getColumns(rows);
  const required = REQUIRED_COLUMNS[type] || [];
  const missing = required.filter((column) => !columns.includes(column));
  return { ok: missing.length === 0, type, rowCount: rows.length, columns, missing, warnings: rows.length ? [] : ["File has no rows"] };
}
