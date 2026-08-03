import Link from "next/link";

export const pageStyle = { minHeight: "100vh", background: "#f5f7fb", padding: 24, fontFamily: "Arial, sans-serif" };
export const cardStyle = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" };

export function ReportingNav() {
  const items = [
    ["← Back to Hub", "/"],
    ["Reporting Dashboard", "/yves-rocher-reporting"],
    ["Upload Weekly", "/yves-rocher-reporting/upload"],
    ["Weekly", "/yves-rocher-reporting/weekly"],
    ["Upload Monthly", "/yves-rocher-reporting/monthly-upload"],
    ["Monthly", "/yves-rocher-reporting/monthly"],
    ["H1 Review", "/yves-rocher-reporting/h1"],
    ["KPI Dictionary", "/yves-rocher-reporting/kpi-dictionary"],
    ["Yotpo Reviews", "/yves-rocher-reporting/yotpo"],
    ["Finance", "/yves-rocher-reporting/finance"],
    ["Management", "/yves-rocher-reporting/management"],
    ["Subscription", "/yves-rocher-reporting/subscription-retention"],
    ["Developments", "/yves-rocher-reporting/developments"],
    ["Future Plans", "/yves-rocher-reporting/future-plans"],
    ["Risks & Flags", "/yves-rocher-reporting/risks"],
    ["Data / How to get data", "/yves-rocher-reporting/data"],
    ["History", "/yves-rocher-reporting/history"],
    ["Settings", "/yves-rocher-reporting/settings"]
  ];
  return <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>{items.map(([label, href]) => <Link key={href} href={href} style={{ background: href === "/" ? "#7c3aed" : href.includes("finance") ? "#991b1b" : href.includes("monthly-upload") ? "#7c2d12" : href.includes("data") ? "#15803d" : href.includes("management") ? "#15803d" : href.includes("developments") ? "#0369a1" : href.includes("future-plans") ? "#4338ca" : href.includes("risks") ? "#b45309" : "#0f172a", color: "#fff", borderRadius: 12, padding: "10px 14px", textDecoration: "none", fontWeight: href === "/" || href.includes("finance") || href.includes("data") || href.includes("monthly-upload") || href.includes("management") || href.includes("developments") || href.includes("future-plans") || href.includes("risks") ? 900 : 700 }}>{label}</Link>)}</div>;
}

export function MetricCard({ label, value, hint }) {
  return <div style={cardStyle}><div style={{ color: "#64748b", fontWeight: 700, fontSize: 13 }}>{label}</div><div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>{value}</div>{hint && <div style={{ color: "#64748b", marginTop: 8 }}>{hint}</div>}</div>;
}

export function formatNumber(value, digits = 0) {
  const number = Number(value || 0);
  return number.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
