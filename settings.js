import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";

const rows = [
  ["Paid Orders", "Shopify orders export", "Count unique orders where Paid at is not empty or Financial Status is paid/refunded", "Name, Paid at, Financial Status"],
  ["Total Orders", "Shopify orders export", "Unique Shopify order rows before paid filter", "Name / Id"],
  ["Refund Rate", "Shopify orders export", "Refunded orders / Paid orders", "Financial Status, Refunded Amount, Paid at"],
  ["Cancellation Rate", "Shopify orders export", "Cancelled orders / Total orders", "Cancelled at, Financial Status"],
  ["Fraud Orders", "Shopify orders export", "Orders with fraud/high-risk/chargeback indicators", "Tags, Risk Level, Notes"],
  ["Tickets", "Gorgias tickets export", "Ticket rows and assigned tickets", "Ticket ID, Assignee name"],
  ["Tickets / Order (TPO)", "Gorgias tickets + Shopify orders", "Assigned tickets / Paid orders", "Assignee name + Paid Orders"],
  ["CSAT", "Gorgias customer experience / tickets", "Average CSAT survey score", "Survey score / CSAT"],
  ["SLA / FRT", "Gorgias customer experience / agents", "Average first response time", "First response time"],
  ["Backlog", "Gorgias workload / overview", "Open tickets or Created - Closed", "Open / Created / Closed"],
  ["Human CSR Cost", "Invoices / Gorgias messages", "Jan-Mar Canada: messages × $2.30. Apr-Jun: VA Academy invoices", "Messages sent / invoices"],
  ["Notch AI Cost", "Notch invoices", "Monthly minimum + additional usage fee", "Invoice total"],
  ["Cost / Order", "Finance + Shopify", "Total CX cost / Paid orders", "Cost + Paid orders"],
  ["Cost / Ticket", "Finance + Gorgias", "Total CX cost / assigned tickets", "Cost + assigned tickets"],
  ["Automation Rate", "Notch export", "AI solved / total tickets", "Placeholder until export is connected"],
  ["Return Rate", "Return source", "Returned orders / Paid orders", "Placeholder"],
  ["NPS", "NPS source", "Promoters - Detractors", "Placeholder"]
];

export default function KpiDictionary() {
  return <main style={pageStyle}>
    <ReportingNav />
    <h1 style={{ fontSize: 40, marginBottom: 6 }}>KPI Dictionary</h1>
    <p style={{ color: "#64748b", lineHeight: 1.6 }}>Use this page during management reviews to explain exactly where each number comes from and how it is calculated.</p>
    <div style={cardStyle}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ textAlign: "left", color: "#64748b" }}><th style={{ padding: 12 }}>KPI</th><th style={{ padding: 12 }}>Source</th><th style={{ padding: 12 }}>Formula</th><th style={{ padding: 12 }}>Columns</th></tr></thead>
        <tbody>{rows.map(([kpi, source, formula, columns]) => <tr key={kpi} style={{ borderTop: "1px solid #e5e7eb" }}><td style={{ padding: 12, fontWeight: 950 }}>{kpi}</td><td style={{ padding: 12 }}>{source}</td><td style={{ padding: 12 }}>{formula}</td><td style={{ padding: 12, color: "#64748b" }}>{columns}</td></tr>)}</tbody>
      </table>
    </div>
  </main>;
}
