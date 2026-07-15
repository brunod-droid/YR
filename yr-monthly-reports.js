export const WEEKLY_ITEM_TYPES = {
  developments: {
    title: "Recent Developments",
    subtitle: "Notable customer issues or wins, process/tooling changes, policy updates, team changes, recurring problems and feedback themes.",
    apiType: "developments",
    route: "/yves-rocher-reporting/developments",
    addLabel: "Add development",
    fields: [
      { name: "category", label: "Category", type: "select", options: ["Customer Issue", "Customer Win", "Process / Tooling", "Policy Update", "Team Change", "Recurring Problem", "Feedback Theme"] },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "impact", label: "Impact", type: "select", options: ["Critical", "High", "Medium", "Low"] },
      { name: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Completed", "Monitoring"] }
    ],
    emptyItem: { category: "Customer Issue", title: "", description: "", impact: "Medium", status: "Open" }
  },
  futurePlans: {
    title: "Future Plans",
    subtitle: "Initiatives planned for the upcoming week(s), action items, process improvements, resourcing and training needs.",
    apiType: "future-plans",
    route: "/yves-rocher-reporting/future-plans",
    addLabel: "Add future plan",
    fields: [
      { name: "initiative", label: "Initiative", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "owner", label: "Owner", type: "text" },
      { name: "eta", label: "ETA", type: "date" },
      { name: "priority", label: "Priority", type: "select", options: ["Critical", "High", "Medium", "Low"] },
      { name: "status", label: "Status", type: "select", options: ["Planned", "In Progress", "Blocked", "Completed"] }
    ],
    emptyItem: { initiative: "", description: "", owner: "", eta: "", priority: "Medium", status: "Planned" }
  },
  risks: {
    title: "Risks & Flags",
    subtitle: "Unresolved escalations, blockers and items needing leadership input.",
    apiType: "risks",
    route: "/yves-rocher-reporting/risks",
    addLabel: "Add risk / flag",
    fields: [
      { name: "risk", label: "Risk / Flag", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "impact", label: "Impact", type: "select", options: ["Critical", "High", "Medium", "Low"] },
      { name: "owner", label: "Owner", type: "text" },
      { name: "escalation_needed", label: "Leadership input needed", type: "checkbox" },
      { name: "status", label: "Status", type: "select", options: ["Open", "Monitoring", "Mitigated", "Closed"] }
    ],
    emptyItem: { risk: "", description: "", impact: "High", owner: "", escalation_needed: false, status: "Open" }
  }
};

export async function loadWeeklyItems(type, week) {
  const query = new URLSearchParams({ type });
  if (week) query.set("week", week);
  const response = await fetch(`/api/yr-weekly-items?${query.toString()}`);
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || "Unable to load weekly items.");
  return Array.isArray(payload) ? payload : [];
}

export async function saveWeeklyItem(type, item) {
  const response = await fetch("/api/yr-weekly-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, item })
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || "Unable to save weekly item.");
  return payload;
}

export async function deleteWeeklyItem(type, id) {
  const response = await fetch(`/api/yr-weekly-items?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || "Unable to delete weekly item.");
  return payload;
}
