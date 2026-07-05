import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";
import { KPI_DICTIONARY } from "../../lib/yr-reporting/kpiDictionary";

export default function KpiDictionaryPage() {
  return <main style={pageStyle}>
    <ReportingNav />
    <div style={{ marginBottom: 22 }}><div style={{ color: "#475569", fontWeight: 950 }}>Yves Rocher Reporting</div><h1 style={{ fontSize: 42, margin: "6px 0" }}>KPI Dictionary</h1><p style={{ color: "#475569", lineHeight: 1.6 }}>Use this page to explain where every number comes from and how it is calculated.</p></div>
    <div style={{ display: "grid", gap: 14 }}>{KPI_DICTIONARY.map((item) => <section key={item.kpi} style={cardStyle}><h2 style={{ margin: 0 }}>{item.kpi}</h2><p style={{ color: "#334155", lineHeight: 1.6 }}>{item.definition}</p><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}><div><b>Formula</b><div style={{ color: "#475569", marginTop: 4 }}>{item.formula}</div></div><div><b>Data source</b><div style={{ color: "#475569", marginTop: 4 }}>{item.source}</div></div><div><b>Columns used</b><div style={{ color: "#475569", marginTop: 4 }}>{item.columns}</div></div><div><b>Owner / Frequency</b><div style={{ color: "#475569", marginTop: 4 }}>{item.owner} · {item.frequency}</div></div></div></section>)}</div>
  </main>;
}
