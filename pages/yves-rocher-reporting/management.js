import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ReportingNav, cardStyle, pageStyle } from "../../lib/yr-reporting/components";
import { loadWeeklyItems } from "../../lib/yr-reporting/weeklyItems";

const sections = [
  {
    key: "developments",
    apiType: "developments",
    title: "Developments",
    route: "/yves-rocher-reporting/developments",
    accent: "#0369a1",
    name: (item) => item.title,
    openStatuses: ["Open", "In Progress", "Monitoring"]
  },
  {
    key: "futurePlans",
    apiType: "future-plans",
    title: "Future Plans",
    route: "/yves-rocher-reporting/future-plans",
    accent: "#4338ca",
    name: (item) => item.initiative,
    openStatuses: ["Planned", "In Progress", "Blocked"]
  },
  {
    key: "risks",
    apiType: "risks",
    title: "Risks & Flags",
    route: "/yves-rocher-reporting/risks",
    accent: "#b45309",
    name: (item) => item.risk,
    openStatuses: ["Open", "Monitoring", "Mitigated"]
  }
];

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: 10,
  fontSize: 14,
  background: "#fff"
};

function statusColor(status) {
  const value = String(status || "").toLowerCase();
  if (["completed", "closed", "done"].includes(value)) return { background: "#dcfce7", color: "#166534" };
  if (["blocked", "critical"].includes(value)) return { background: "#fee2e2", color: "#991b1b" };
  if (["in progress", "monitoring", "mitigated"].includes(value)) return { background: "#fef3c7", color: "#92400e" };
  return { background: "#e0e7ff", color: "#3730a3" };
}

function ItemCard({ item, section }) {
  const title = section.name(item) || "Untitled item";
  const chips = [
    item.status && ["Status", item.status],
    item.week && ["Week", item.week],
    item.owner && ["Owner", item.owner],
    item.impact && ["Impact", item.impact],
    item.priority && ["Priority", item.priority],
    item.eta && ["ETA", item.eta],
    item.category && ["Category", item.category]
  ].filter(Boolean);

  return (
    <div style={{ borderTop: "1px solid #e5e7eb", padding: "15px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 240, flex: 1 }}>
          <h3 style={{ margin: "0 0 7px", fontSize: 17 }}>{title}</h3>
          {item.description && <p style={{ margin: 0, color: "#475569", lineHeight: 1.55 }}>{item.description}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {chips.map(([label, value]) => (
              <span
                key={`${label}-${value}`}
                style={{
                  ...(label === "Status" ? statusColor(value) : { background: "#f1f5f9", color: "#334155" }),
                  padding: "6px 9px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800
                }}
              >
                {label}: {value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagementPage() {
  const [data, setData] = useState({ developments: [], futurePlans: [], risks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("active");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const [developments, futurePlans, risks] = await Promise.all([
          loadWeeklyItems("developments"),
          loadWeeklyItems("future-plans"),
          loadWeeklyItems("risks")
        ]);
        setData({ developments, futurePlans, risks });
      } catch (err) {
        setError(err.message || "Unable to load management items.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visibleBySection = useMemo(() => {
    const term = search.trim().toLowerCase();
    return Object.fromEntries(sections.map((section) => {
      const rows = data[section.key] || [];
      const filtered = rows.filter((item) => {
        const statusMatch = view === "all" || section.openStatuses.includes(item.status);
        if (!statusMatch) return false;
        if (!term) return true;
        return Object.values(item).some((value) => String(value ?? "").toLowerCase().includes(term));
      });
      return [section.key, filtered];
    }));
  }, [data, search, view]);

  const totalActive = sections.reduce((sum, section) => sum + (data[section.key] || []).filter((item) => section.openStatuses.includes(item.status)).length, 0);
  const totalVisible = sections.reduce((sum, section) => sum + (visibleBySection[section.key] || []).length, 0);

  return (
    <main style={pageStyle}>
      <ReportingNav />

      <div style={{ marginBottom: 22 }}>
        <div style={{ color: "#15803d", fontWeight: 900 }}>Yves Rocher Customer Service</div>
        <h1 style={{ fontSize: 42, margin: "6px 0" }}>Global Management View</h1>
        <p style={{ color: "#475569", lineHeight: 1.7, maxWidth: 900 }}>
          All developments, future plans and risks across every reporting week. The default view shows only items still active.
        </p>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 16 }}>
        <div style={cardStyle}><div style={{ color: "#64748b", fontWeight: 800 }}>Active items</div><div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{totalActive}</div></div>
        {sections.map((section) => (
          <div key={section.key} style={cardStyle}>
            <div style={{ color: "#64748b", fontWeight: 800 }}>{section.title}</div>
            <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8, color: section.accent }}>{visibleBySection[section.key]?.length || 0}</div>
          </div>
        ))}
      </section>

      <section style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>Search all items</label>
            <input style={inputStyle} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Notch, Customer Voice, owner, status..." />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setView("active")} style={{ border: 0, borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontWeight: 900, background: view === "active" ? "#15803d" : "#e2e8f0", color: view === "active" ? "#fff" : "#334155" }}>Active only</button>
            <button type="button" onClick={() => setView("all")} style={{ border: 0, borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontWeight: 900, background: view === "all" ? "#0f172a" : "#e2e8f0", color: view === "all" ? "#fff" : "#334155" }}>Show all</button>
          </div>
        </div>
        <div style={{ color: "#64748b", fontSize: 13, marginTop: 10 }}>{totalVisible} item(s) displayed</div>
      </section>

      {error && <div style={{ ...cardStyle, borderColor: "#fecaca", color: "#991b1b", marginBottom: 16 }}>{error}</div>}
      {loading && <div style={cardStyle}>Loading global management items...</div>}

      {!loading && sections.map((section) => {
        const rows = visibleBySection[section.key] || [];
        return (
          <section key={section.key} style={{ ...cardStyle, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0, color: section.accent }}>{section.title}</h2>
                <div style={{ color: "#64748b", marginTop: 5 }}>{rows.length} item(s) across all weeks</div>
              </div>
              <Link href={section.route} style={{ color: section.accent, fontWeight: 900, textDecoration: "none" }}>Open weekly page →</Link>
            </div>
            {!rows.length && <p style={{ color: "#64748b", marginBottom: 0 }}>No items match the current filters.</p>}
            {rows.map((item) => <ItemCard key={`${section.key}-${item.id}`} item={item} section={section} />)}
          </section>
        );
      })}
    </main>
  );
}
