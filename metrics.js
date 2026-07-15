function pad(value) { return String(value).padStart(2, "0"); }
export function formatDate(date) { const d = new Date(date); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
export function parseDate(value) { const d = new Date(`${value}T00:00:00`); return Number.isNaN(d.getTime()) ? new Date() : d; }
export function getSunday(date = new Date()) { const d = new Date(date); d.setHours(0,0,0,0); d.setDate(d.getDate() - d.getDay()); return d; }
export function getWeekRange(inputDate = new Date()) { const start = getSunday(inputDate); const end = new Date(start); end.setDate(start.getDate() + 6); const weekStart = formatDate(start); const weekEnd = formatDate(end); return { weekStart, weekEnd, week: `${weekStart}_${weekEnd}` }; }
export function getWeekFromStart(weekStart) { return getWeekRange(parseDate(weekStart)); }
