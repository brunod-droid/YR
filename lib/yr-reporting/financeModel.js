import { toNumber } from "./metrics";

export const NOTCH_COSTS = {
  "2026-01": { minimum: 1500, usage: 762, total: 2262, source: "Notch invoice January 2026" },
  "2026-02": { minimum: 1500, usage: 259, total: 1759, source: "Notch invoice February 2026" },
  "2026-03": { minimum: 1500, usage: 309, total: 1809, source: "Notch invoice March 2026" },
  "2026-04": { minimum: 1500, usage: 270, total: 1770, source: "Notch invoice April 2026" },
  "2026-05": { minimum: 1500, usage: 416, total: 1916, source: "Notch invoice May 2026" },
  "2026-06": { minimum: 1500, usage: 804, total: 2304, source: "Notch invoice June 2026" }
};

export const PHILIPPINES_COSTS = {
  "2026-04": { antonette: 112.50, kyrene: 84.50, hours: 38, total: 197, source: "VA Academy invoice April 2026" },
  "2026-05": { antonette: 198.00, kyrene: 169.00, hours: 70, total: 367, source: "VA Academy invoice May 2026" },
  "2026-06": { antonette: 247.50, kyrene: 201.50, hours: 86, total: 449, source: "VA Academy invoice June 2026" }
};

export const CANADA_MESSAGE_PRICE = 2.3;

export function getNotchCost(month) {
  return NOTCH_COSTS[month] || { minimum: 1500, usage: 0, total: 1500, source: "Default Notch minimum; replace with invoice when available" };
}

export function getPhilippinesCost(month) {
  return PHILIPPINES_COSTS[month] || { antonette: 0, kyrene: 0, hours: 0, total: 0, source: month < "2026-04" ? "Not active before April 2026" : "No invoice uploaded" };
}

export function getCanadaCost(month, messagesSent = 0) {
  if (month >= "2026-04") return { messages: 0, unitPrice: CANADA_MESSAGE_PRICE, total: 0, source: "Replaced by Antonette/Kyrene from April 2026" };
  const messages = toNumber(messagesSent);
  return { messages, unitPrice: CANADA_MESSAGE_PRICE, total: messages * CANADA_MESSAGE_PRICE, source: "Canada team messages x price per message" };
}

export function getFinanceBreakdown(month, metrics = {}) {
  const notch = getNotchCost(month);
  const philippines = getPhilippinesCost(month);
  const canada = getCanadaCost(month, metrics.totalMessagesSent || 0);
  const humanCost = (philippines.total || 0) + (canada.total || 0);
  const aiCost = notch.total || 0;
  const totalCost = humanCost + aiCost;
  const paidOrders = metrics.paidOrders || metrics.ordersCount || 0;
  const tickets = metrics.actionableTickets || metrics.ticketsCreated || 0;

  return {
    month,
    notch,
    philippines,
    canada,
    humanCost,
    aiCost,
    totalCost,
    humanCostPerOrder: paidOrders ? humanCost / paidOrders : 0,
    aiCostPerOrder: paidOrders ? aiCost / paidOrders : 0,
    totalCostPerOrder: paidOrders ? totalCost / paidOrders : 0,
    humanCostPerTicket: tickets ? humanCost / tickets : 0,
    aiCostPerTicket: tickets ? aiCost / tickets : 0,
    totalCostPerTicket: tickets ? totalCost / tickets : 0
  };
}

export function aggregateFinance(monthlyRows = []) {
  return monthlyRows.reduce((acc, row) => {
    const f = row.finance || {};
    acc.humanCost += f.humanCost || 0;
    acc.aiCost += f.aiCost || 0;
    acc.totalCost += f.totalCost || 0;
    acc.paidOrders += row.metrics?.paidOrders || row.metrics?.ordersCount || 0;
    acc.tickets += row.metrics?.actionableTickets || row.metrics?.ticketsCreated || 0;
    acc.notchUsage += f.notch?.usage || 0;
    return acc;
  }, { humanCost: 0, aiCost: 0, totalCost: 0, paidOrders: 0, tickets: 0, notchUsage: 0 });
}
