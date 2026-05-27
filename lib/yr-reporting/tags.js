import { getSettings } from "./storage";

export function splitTags(value) {
  if (!value) return [];
  return String(value).split(/[,;|]/).map((tag) => tag.trim()).filter(Boolean);
}

export function getTagsColumnValue(row = {}) {
  const possibleColumns = ["Tags", "tags", "Ticket Tags", "Ticket tags", "ticket_tags", "Tags "];
  const key = possibleColumns.find((column) => Object.prototype.hasOwnProperty.call(row, column));
  return key ? row[key] : "";
}

export function mapTagToDriver(tag, mapping) {
  const clean = String(tag || "").trim();
  if (!clean) return null;
  if (mapping && mapping[clean]) return mapping[clean];
  if (clean.startsWith("reason::")) return clean.replace("reason::", "").replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return null;
}

export function extractDriversFromTickets(tickets = [], settings = getSettings()) {
  const mapping = settings?.tagMapping || {};
  const counts = {};
  tickets.forEach((ticket) => {
    const driversForTicket = new Set();
    splitTags(getTagsColumnValue(ticket)).forEach((tag) => {
      const driver = mapTagToDriver(tag, mapping);
      if (driver) driversForTicket.add(driver);
    });
    driversForTicket.forEach((driver) => { counts[driver] = (counts[driver] || 0) + 1; });
  });
  return Object.entries(counts).map(([driver, count]) => ({ driver, count })).sort((a, b) => b.count - a.count);
}
