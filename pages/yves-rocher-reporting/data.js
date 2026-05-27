import Link from "next/link";
import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";

const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { textAlign: "left", padding: 12, borderBottom: "1px solid #cbd5e1", color: "#475569" };
const tdStyle = { padding: 12, borderBottom: "1px solid #e5e7eb", verticalAlign: "top" };

function Section({ children }) {
  return <section style={{ ...cardStyle, marginTop: 18 }}>{children}</section>;
}

function InfoBox({ children, type = "note" }) {
  const bg = type === "warning" ? "#fff7ed" : type === "fake" ? "#fef2f2" : "#f0fdf4";
  const border = type === "warning" ? "#fed7aa" : type === "fake" ? "#fecaca" : "#bbf7d0";
  return <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 14, marginTop: 16, color: "#334155", lineHeight: 1.7 }}>{children}</div>;
}

function Code({ children }) {
  return <pre style={{ background: "#0f172a", color: "#e5e7eb", borderRadius: 14, padding: 16, overflowX: "auto" }}>{children}</pre>;
}

export default function YvesRocherReportingData() {
  const gorgiasRows = [
    ["customer-experience", "Gorgias → Statistics → Support Performance → Overview → Download data", "CSAT, first response time, resolution time."],
    ["ticket-volume", "Gorgias → Statistics → Support Performance → Overview → Download data", "Created tickets, replied tickets, closed tickets, ticket volume trends."],
    ["workload", "Gorgias → Statistics → Support Performance → Overview → Download data", "Open tickets, backlog, created tickets, closed tickets."],
    ["agents-metrics", "Gorgias → Statistics → Support Performance → Agents → Download data", "Agent productivity, messages sent, CSAT and SLA by agent when available."],
    ["channels-metrics", "Gorgias → Statistics → Support Performance → Channels → Download data", "Volume and performance by channel."],
    ["tickets raw export", "Gorgias → Statistics → Support Performance → Overview → Workload → click Created tickets", "Ticket-level data, Tags, drivers, assignee, initial channel, CSAT by ticket, and unassigned tickets."]
  ];

  return (
    <main style={pageStyle}>
      <ReportingNav />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <p style={{ color: "#15803d", fontWeight: 900, margin: 0 }}>Yves Rocher Reporting</p>
          <h1 style={{ fontSize: 42, margin: "6px 0" }}>Data — How to get Customer Service Data</h1>
          <p style={{ color: "#475569", lineHeight: 1.7, maxWidth: 980 }}>Weekly data extraction guide. Reporting weeks run from Sunday to Saturday.</p>
        </div>
        <Link href="/yves-rocher-reporting" style={{ background: "#0f172a", color: "#fff", padding: "12px 16px", borderRadius: 12, textDecoration: "none", fontWeight: 900 }}>Back to Reporting</Link>
      </div>

      <Section>
        <h2>Weekly data checklist</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div><h3>Gorgias</h3><ul><li>customer-experience</li><li>ticket-volume</li><li>workload</li><li>agents-metrics</li><li>channels-metrics</li><li>tickets raw export</li></ul></div>
          <div><h3>Shopify</h3><ul><li>orders export</li><li>remove unpaid orders</li><li>remove cancelled-before-payment orders</li><li>use Paid at as validation field</li></ul></div>
          <div><h3>Finance</h3><ul><li>CSR hours</li><li>cost per hour</li><li>CSR cost</li><li>order cost</li></ul></div>
          <div><h3>Social / Trustpilot</h3><ul><li>Placeholder only for now</li><li>not connected to real source yet</li></ul></div>
        </div>
      </Section>

      <Section>
        <h2>1. Gorgias data</h2>
        <p>Gorgias is used for ticket volume, workload, performance, customer satisfaction, agents, channels and contact drivers.</p>
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table style={tableStyle}>
            <thead><tr><th style={thStyle}>File</th><th style={thStyle}>Where to find it</th><th style={thStyle}>Usage</th></tr></thead>
            <tbody>{gorgiasRows.map(([file, where, usage]) => <tr key={file}><td style={tdStyle}><b>{file}</b></td><td style={tdStyle}>{where}</td><td style={tdStyle}>{usage}</td></tr>)}</tbody>
          </table>
        </div>
        <InfoBox><strong>Important:</strong> the tickets raw export is required for contact drivers, assignee analysis, unassigned tickets, CSAT by ticket and agent-level reporting.</InfoBox>
      </Section>

      <Section>
        <h2>2. Shopify orders data</h2>
        <p>Shopify is used to calculate paid orders volume, tickets per order, productivity and order cost.</p>
        <h3>Required columns</h3>
        <ul><li>Name — order number / order ID</li><li>Created at — order creation date</li><li>Total — order amount</li><li>Paid at — payment validation date</li><li>Financial Status — should be paid</li><li>Cancelled at — remove if filled</li></ul>
        <InfoBox type="warning"><strong>Remove from the file / calculation:</strong> unpaid orders, pending payment orders and orders cancelled before payment. In the tool, only orders with a non-empty <strong>Paid at</strong> field are counted.</InfoBox>
        <h3>KPI logic</h3>
        <Code>{`paidOrders = orders.filter(order => order["Paid at"] && order["Paid at"].trim() !== "")
ordersCount = unique(paidOrders by Id or Name).length
ticketsPerOrder = assignedTickets / ordersCount`}</Code>
      </Section>

      <Section>
        <h2>3. Finance data</h2>
        <p>Finance data is used to calculate CSR hours, CSR cost, order cost and productivity.</p>
        <InfoBox><strong>Productivity rule:</strong> productivity only uses messages sent by Antonette + Kyrene divided by Antonette + Kyrene hours.</InfoBox>
        <Code>{`CSR Hours = sum(agent hours)
CSR Cost = sum(agent hours × cost per hour)
Order Cost = CSR Cost / paid orders
Productivity = (Antonette + Kyrene customer-facing messages) / (Antonette + Kyrene hours)`}</Code>
      </Section>

      <Section>
        <h2>4. Social media and Trustpilot</h2>
        <InfoBox type="fake"><strong>Current status:</strong> yes, for now this part is fake / placeholder data only. We do not yet have a reliable weekly source connected for Social and Trustpilot volume.</InfoBox>
      </Section>
    </main>
  );
}
