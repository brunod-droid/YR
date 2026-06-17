import { ReportingNav, cardStyle, pageStyle } from "../../lib/yr-reporting/components";

const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { textAlign: "left", borderBottom: "1px solid #cbd5e1", padding: 10, color: "#334155" };
const tdStyle = { borderBottom: "1px solid #e5e7eb", padding: 10, verticalAlign: "top", color: "#475569" };
const codeStyle = { background: "#0f172a", color: "#e2e8f0", padding: 14, borderRadius: 12, overflowX: "auto" };

export default function DataPage() {
  return (
    <main style={pageStyle}>
      <ReportingNav />
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: "#15803d", fontWeight: 900 }}>Yves Rocher Customer Service</div>
        <h1 style={{ fontSize: 42, margin: "6px 0" }}>Data / How to get data</h1>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>
          This page explains how to extract the weekly data used by the Yves Rocher CS reporting module. The reporting week runs from Sunday to Saturday.
        </p>
      </div>

      <section style={{ ...cardStyle, marginBottom: 16 }}>
        <h2>Weekly checklist</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div><h3>Gorgias</h3><ul><li>ticket-volume</li><li>workload</li><li>customer-experience</li><li>agents-metrics</li><li>channels-metrics</li><li>tickets raw export with Tags</li></ul></div>
          <div><h3>Shopify</h3><ul><li>orders export</li><li>only paid orders counted</li><li>Paid at must not be empty</li></ul></div>
          <div><h3>Finance</h3><ul><li>agents cost</li><li>tools cost</li><li>BPO / outsourcing</li><li>CS social media cost if applicable</li></ul></div>
          <div><h3>Manual notes</h3><ul><li>Recent Developments</li><li>Future Plans</li><li>Risks & Flags</li><li>Saved in Supabase by week</li></ul></div>
        </div>
      </section>

      <section style={{ ...cardStyle, marginBottom: 16 }}>
        <h2>1. Gorgias exports</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thStyle}>File</th><th style={thStyle}>Where to find it</th><th style={thStyle}>Usage</th></tr></thead>
          <tbody>
            <tr><td style={tdStyle}>ticket-volume</td><td style={tdStyle}>Gorgias → Statistics → Support Performance → Overview</td><td style={tdStyle}>Created, replied, and closed tickets.</td></tr>
            <tr><td style={tdStyle}>workload</td><td style={tdStyle}>Gorgias → Statistics → Support Performance → Workload</td><td style={tdStyle}>Open tickets, backlog, created tickets, closed tickets.</td></tr>
            <tr><td style={tdStyle}>customer-experience</td><td style={tdStyle}>Gorgias → Statistics → Customer Experience</td><td style={tdStyle}>CSAT, first response time, resolution time.</td></tr>
            <tr><td style={tdStyle}>agents-metrics</td><td style={tdStyle}>Gorgias → Statistics → Support Performance → Agents</td><td style={tdStyle}>Agent productivity and performance.</td></tr>
            <tr><td style={tdStyle}>channels-metrics</td><td style={tdStyle}>Gorgias → Statistics → Support Performance → Channels</td><td style={tdStyle}>Volume and performance by channel.</td></tr>
            <tr><td style={tdStyle}>tickets raw export</td><td style={tdStyle}>Gorgias → Tickets → filter the week → Export</td><td style={tdStyle}>Ticket-level data, Tags, drivers, assignee, channel, CSAT by ticket.</td></tr>
          </tbody>
        </table>
        <p style={{ color: "#991b1b", fontWeight: 900 }}>Important: the tickets raw export must include the Tags column. Without Tags, top drivers cannot be calculated.</p>
      </section>

      <section style={{ ...cardStyle, marginBottom: 16 }}>
        <h2>2. Shopify orders</h2>
        <p>Path: Shopify → Orders → Export. Export the same Sunday-to-Saturday week as the Gorgias report.</p>
        <h3>Required columns</h3>
        <ul><li>Name — order number / order ID</li><li>Created at — order creation date</li><li>Total — order amount</li><li>Paid at — payment validation date</li></ul>
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 14, borderRadius: 12, fontWeight: 900 }}>
          Critical rule: only count paid orders. The Paid at field must not be empty.
        </div>
        <pre style={codeStyle}>{`paidOrders = orders.filter(order => order["Paid at"] && order["Paid at"].trim() !== "")
ordersCount = paidOrders.length
ticketsPerOrder = ticketsCount / ordersCount`}</pre>
      </section>

      <section style={{ ...cardStyle, marginBottom: 16 }}>
        <h2>3. Finance costs</h2>
        <p>Finance data is used to calculate cost per ticket and cost per order.</p>
        <ul><li>Internal agents cost</li><li>BPO or outsourcing cost</li><li>Gorgias and other CS tools</li><li>Aircall / phone tools if applicable</li><li>Social media CS cost if applicable</li></ul>
        <pre style={codeStyle}>{`totalCost = sum(finance.Amount)
costPerTicket = totalCost / ticketsCount
costPerOrder = totalCost / paidOrdersCount`}</pre>
      </section>

      <section style={cardStyle}>
        <h2>4. Weekly manual notes for leadership</h2>
        <p>These items answer the leadership request for a concise weekly update beyond KPI numbers.</p>
        <table style={tableStyle}>
          <thead><tr><th style={thStyle}>Page</th><th style={thStyle}>Purpose</th><th style={thStyle}>Fields</th></tr></thead>
          <tbody>
            <tr><td style={tdStyle}>Recent Developments</td><td style={tdStyle}>What happened this week.</td><td style={tdStyle}>Category, Title, Description, Impact, Status</td></tr>
            <tr><td style={tdStyle}>Future Plans</td><td style={tdStyle}>What we plan to improve next.</td><td style={tdStyle}>Initiative, Description, Owner, ETA, Priority, Status</td></tr>
            <tr><td style={tdStyle}>Risks & Flags</td><td style={tdStyle}>Escalations, blockers, leadership input needed.</td><td style={tdStyle}>Risk, Description, Impact, Owner, Escalation Needed, Status</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
