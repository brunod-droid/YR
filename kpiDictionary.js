export const CANADA_MESSAGE_RATE = 2.3;

export const NOTCH_COSTS_2026 = {
  "2026-01": { base: 1500, usage: 762, total: 2262, source: "Notch invoice January 2026" },
  "2026-02": { base: 1500, usage: 259, total: 1759, source: "Notch invoice February 2026" },
  "2026-03": { base: 1500, usage: 309, total: 1809, source: "Notch invoice March 2026" },
  "2026-04": { base: 1500, usage: 270, total: 1770, source: "Notch invoice April 2026" },
  "2026-05": { base: 1500, usage: 416, total: 1916, source: "Notch invoice May 2026" },
  "2026-06": { base: 1500, usage: 804, total: 2304, source: "Notch invoice June 2026" }
};

export const PHILIPPINES_COSTS_2026 = {
  "2026-04": {
    total: 197,
    agents: [
      { name: "Antonette", hours: 25, cost: 112.5 },
      { name: "Kyrene", hours: 13, cost: 84.5 }
    ],
    source: "VA Academy invoice April 2026"
  },
  "2026-05": {
    total: 367,
    agents: [
      { name: "Antonette", hours: 44, cost: 198 },
      { name: "Kyrene", hours: 26, cost: 169 }
    ],
    source: "VA Academy invoice May 2026"
  },
  "2026-06": {
    total: 449,
    agents: [
      { name: "Antonette", hours: 55, cost: 247.5 },
      { name: "Kyrene", hours: 31, cost: 201.5 }
    ],
    source: "VA Academy invoice June 2026"
  }
};

export function isBeforePhilippines(month = "") {
  return String(month) < "2026-04";
}

export function getNotchCost(month) {
  return NOTCH_COSTS_2026[month]?.total || 0;
}

export function getNotchUsage(month) {
  return NOTCH_COSTS_2026[month]?.usage || 0;
}

export function getPhilippinesCost(month) {
  return PHILIPPINES_COSTS_2026[month]?.total || 0;
}

export function getHumanCostForMonth(month, totalMessagesSent = 0) {
  if (PHILIPPINES_COSTS_2026[month]) return getPhilippinesCost(month);
  if (isBeforePhilippines(month)) return Number(totalMessagesSent || 0) * CANADA_MESSAGE_RATE;
  return 0;
}

export function getCostBreakdown(month, metrics = {}) {
  const messages = Number(metrics.totalMessagesSent || 0);
  const tickets = Number(metrics.actionableTickets || metrics.ticketsCreated || 0);
  const orders = Number(metrics.ordersCount || 0);
  const humanCost = getHumanCostForMonth(month, messages);
  const aiCost = getNotchCost(month);
  const totalCost = humanCost + aiCost;
  return {
    month,
    messages,
    tickets,
    orders,
    canadaCost: isBeforePhilippines(month) ? humanCost : 0,
    philippinesCost: getPhilippinesCost(month),
    humanCost,
    aiCost,
    totalCost,
    humanCostPerOrder: orders ? humanCost / orders : 0,
    aiCostPerOrder: orders ? aiCost / orders : 0,
    totalCostPerOrder: orders ? totalCost / orders : 0,
    humanCostPerTicket: tickets ? humanCost / tickets : 0,
    aiCostPerTicket: tickets ? aiCost / tickets : 0,
    totalCostPerTicket: tickets ? totalCost / tickets : 0
  };
}
