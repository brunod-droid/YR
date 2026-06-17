import { useEffect, useMemo, useState } from "react";
import { ReportingNav, cardStyle, pageStyle } from "./components";
import { loadReports } from "./storage";
import { deleteWeeklyItem, loadWeeklyItems, saveWeeklyItem, WEEKLY_ITEM_TYPES } from "./weeklyItems";

const buttonStyle = { border: 0, borderRadius: 12, padding: "10px 14px", color: "#fff", fontWeight: 900, cursor: "pointer" };
const inputStyle = { width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 10, padding: 10, fontSize: 14, background: "#fff" };
const labelStyle = { display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 };

function Field({ field, value, onChange }) {
  if (field.type === "textarea") {
    return <textarea rows={4} style={inputStyle} value={value || ""} onChange={(event) => onChange(event.target.value)} />;
  }
  if (field.type === "select") {
    return <select style={inputStyle} value={value || field.options?.[0] || ""} onChange={(event) => onChange(event.target.value)}>{(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}</select>;
  }
  if (field.type === "checkbox") {
    return <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /> Yes</label>;
  }
  return <input type={field.type || "text"} style={inputStyle} value={value || ""} onChange={(event) => onChange(event.target.value)} />;
}


function getStatusOptions(config) {
  return config.fields.find((field) => field.name === "status")?.options || [];
}

function isDoneStatus(status) {
  return ["done", "completed", "closed"].includes(String(status || "").trim().toLowerCase());
}

function getDefaultStatusFilter(config) {
  return getStatusOptions(config).filter((status) => !isDoneStatus(status));
}

export default function WeeklyItemsPage({ type }) {
  const config = WEEKLY_ITEM_TYPES[type];
  const [reports, setReports] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(config.emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const statusOptions = useMemo(() => getStatusOptions(config), [config]);
  const [selectedStatuses, setSelectedStatuses] = useState(() => getDefaultStatusFilter(config));

  useEffect(() => {
    setSelectedStatuses(getDefaultStatusFilter(config));
  }, [config]);

  useEffect(() => {
    async function init() {
      try {
        const loadedReports = await loadReports();
        setReports(loadedReports);
        const firstWeek = loadedReports?.[0]?.week || "";
        setSelectedWeek(firstWeek);
      } catch (err) {
        setError(err.message || "Unable to load weeks.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function refresh() {
      if (!selectedWeek) return;
      try {
        setError("");
        setItems(await loadWeeklyItems(config.apiType, selectedWeek));
      } catch (err) {
        setError(err.message || "Unable to load items.");
      }
    }
    refresh();
  }, [selectedWeek, config.apiType]);

  const selectedReport = useMemo(() => reports.find((report) => report.week === selectedWeek), [reports, selectedWeek]);

  const filteredItems = useMemo(() => {
    if (!statusOptions.length) return items;
    return items.filter((item) => selectedStatuses.includes(item.status || ""));
  }, [items, selectedStatuses, statusOptions.length]);

  function toggleStatus(status) {
    setSelectedStatuses((current) => (
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status]
    ));
  }

  function setFormValue(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(config.emptyItem);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedWeek) return setError("Select a week first.");
    const requiredField = config.fields.find((field) => field.required && !String(form[field.name] || "").trim());
    if (requiredField) return setError(`${requiredField.label} is required.`);

    try {
      setError("");
      await saveWeeklyItem(config.apiType, {
        ...form,
        id: editingId,
        week: selectedWeek,
        week_start: selectedReport?.weekStart || null,
        week_end: selectedReport?.weekEnd || null
      });
      setItems(await loadWeeklyItems(config.apiType, selectedWeek));
      resetForm();
    } catch (err) {
      setError(err.message || "Unable to save item.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this item?")) return;
    try {
      setError("");
      await deleteWeeklyItem(config.apiType, id);
      setItems(await loadWeeklyItems(config.apiType, selectedWeek));
    } catch (err) {
      setError(err.message || "Unable to delete item.");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    const next = { ...config.emptyItem };
    config.fields.forEach((field) => { next[field.name] = item[field.name] ?? config.emptyItem[field.name] ?? ""; });
    setForm(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main style={pageStyle}>
      <ReportingNav />
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: "#15803d", fontWeight: 900 }}>Yves Rocher Customer Service</div>
        <h1 style={{ fontSize: 42, margin: "6px 0" }}>{config.title}</h1>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>{config.subtitle}</p>
      </div>

      <section style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Week</h2>
        {loading ? <p>Loading weeks...</p> : (
          <select style={{ ...inputStyle, maxWidth: 360 }} value={selectedWeek} onChange={(event) => setSelectedWeek(event.target.value)}>
            <option value="">Select week</option>
            {reports.map((report) => <option key={report.week} value={report.week}>{report.week}</option>)}
          </select>
        )}
        {!reports.length && <p style={{ color: "#64748b" }}>Upload a weekly report first, then add notes for that week.</p>}
      </section>

      {statusOptions.length > 0 && (
        <section style={{ ...cardStyle, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Status filter</h2>
          <p style={{ color: "#64748b", marginTop: 0 }}>
            Default view excludes done statuses. Select one or several statuses to display.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {statusOptions.map((status) => (
              <label key={status} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                background: selectedStatuses.includes(status) ? "#dcfce7" : "#f1f5f9",
                color: selectedStatuses.includes(status) ? "#166534" : "#334155",
                fontWeight: 900,
                cursor: "pointer"
              }}>
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status)}
                  onChange={() => toggleStatus(status)}
                />
                {status}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setSelectedStatuses(getDefaultStatusFilter(config))} style={{ ...buttonStyle, background: "#15803d" }}>
              Active only
            </button>
            <button type="button" onClick={() => setSelectedStatuses(statusOptions)} style={{ ...buttonStyle, background: "#0f172a" }}>
              Show all
            </button>
            <button type="button" onClick={() => setSelectedStatuses([])} style={{ ...buttonStyle, background: "#64748b" }}>
              Clear
            </button>
          </div>
        </section>
      )}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>
          Items for {selectedWeek || "selected week"}
          {statusOptions.length > 0 && ` (${filteredItems.length}/${items.length})`}
        </h2>
        {!items.length && <p style={{ color: "#64748b" }}>No items yet.</p>}
        {!!items.length && !filteredItems.length && <p style={{ color: "#64748b" }}>No items matching the selected status filter.</p>}
        {filteredItems.map((item) => (
          <div key={item.id} style={{ borderTop: "1px solid #e5e7eb", padding: "14px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
              <div>
                <h3 style={{ margin: "0 0 8px" }}>{item.title || item.initiative || item.risk}</h3>
                <p style={{ color: "#475569", margin: 0, lineHeight: 1.6 }}>{item.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {config.fields.filter((field) => field.type !== "textarea" && !["title", "initiative", "risk"].includes(field.name)).map((field) => (
                    <span key={field.name} style={{ background: "#eef2ff", color: "#1e3a8a", padding: "6px 8px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                      {field.label}: {field.type === "checkbox" ? (item[field.name] ? "Yes" : "No") : (item[field.name] || "-")}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <button onClick={() => handleEdit(item)} style={{ ...buttonStyle, background: "#0f172a" }}>Edit</button>
                <button onClick={() => handleDelete(item.id)} style={{ ...buttonStyle, background: "#991b1b" }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </section>
      <section style={{ ...cardStyle, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{editingId ? "Edit item" : config.addLabel}</h2>
        {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 12, marginBottom: 14, fontWeight: 800 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
            {config.fields.map((field) => (
              <div key={field.name} style={{ gridColumn: field.type === "textarea" ? "1 / -1" : "auto" }}>
                <label style={labelStyle}>{field.label}</label>
                <Field field={field} value={form[field.name]} onChange={(value) => setFormValue(field.name, value)} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="submit" style={{ ...buttonStyle, background: "#15803d" }}>{editingId ? "Save changes" : config.addLabel}</button>
            {editingId && <button type="button" onClick={resetForm} style={{ ...buttonStyle, background: "#64748b" }}>Cancel edit</button>}
          </div>
        </form>
      </section>


    </main>
  );
}
