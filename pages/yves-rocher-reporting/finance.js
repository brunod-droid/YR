
import { useEffect, useMemo, useState } from "react";
import { loadReports } from "../../lib/yr-reporting/storage";
import { ReportingNav, pageStyle, cardStyle, MetricCard, formatNumber } from "../../lib/yr-reporting/components";
import { toNumber } from "../../lib/yr-reporting/metrics";

const MESSAGE_BENCHMARK_RATE = 2.3;

function normalizeName(value = "") {
  return String(value || "").toLowerCase().trim();
}

function isAverageAgentName(name = "") {
  const n = normalizeName(name);
  return n === "average" || n === "avg" || n === "averages" || n.includes("average");
}

function isTargetAgentName(name = "") {
  const n = normalizeName(name);
  return n.includes("kyrene") || n.includes("kyrène") || n.includes("antonette") || n.includes("antoinette");
}

function targetAgentKey(name = "") {
  const n = normalizeName(name);
  if (n.includes("kyrene") || n.includes("kyrène")) return "Kyrene";
  if (n.includes("antonette") || n.includes("antoinette")) return "Antoinette";
  return String(name || "Other").trim() || "Other";
}

function value(row, names) {
  const key = Object.keys(row || {}).find((k) => names.some((name) => String(k).toLowerCase().trim() === name));
  return key ? row[key] : "";
}

function valueIncludes(row, names) {
  const key = Object.keys(row || {}).find((k) => names.some((name) => String(k).toLowerCase().trim().includes(name)));
  return key ? row[key] : "";
}

function agentName(row) {
  return value(row, ["agent", "agents", "name", "csr", "csr name", "agent name"]) ||
    valueIncludes(row, ["agent", "name", "csr"]) ||
    row.Agent || row.Name || row.CSR || row.agent || row.name || "";
}

function normalizeFinanceRows(rows = []) {
  return rows.map((row) => {
    const agent = agentName(row);
    return {
      agent: String(agent || "").trim(),
      hours: toNumber(value(row, ["hours", "csr hours", "heures", "heures csr"]) || valueIncludes(row, ["hours", "heures"]) || row.Hours || row["CSR Hours"]),
      costPerHour: toNumber(value(row, ["cost per hour", "hourly cost", "cost/hour", "cout horaire", "coût horaire", "rate", "hourly rate"]) || valueIncludes(row, ["cost", "rate", "hour"]) || row["Cost per hour"] || row["Hourly cost"] || row.Rate)
    };
  }).filter((row) => (row.agent || row.hours || row.costPerHour) && !isAverageAgentName(row.agent));
}

function messagesFromAgentRows(agentRows = []) {
  const totals = {};
  for (const row of agentRows || []) {
    const name = agentName(row);
    if (!isTargetAgentName(name) || isAverageAgentName(name)) continue;
    const key = targetAgentKey(name);
    const messages = toNumber(value(row, ["messages sent", "message sent", "messages", "sent messages", "customer messages", "messages sent during the period"]) || valueIncludes(row, ["messages sent", "messages", "sent"]));
    totals[key] = (totals[key] || 0) + messages;
  }
  return totals;
}

function messagesFromTickets(ticketRows = []) {
  const totals = {};
  for (const row of ticketRows || []) {
    const name = row["Assignee name"] || row.Assignee || row.assignee || row["Agent name"] || row.Agent || row.agent || "";
    if (!isTargetAgentName(name)) continue;
    const key = targetAgentKey(name);
    const messages = toNumber(row["Number of agent messages"] || row["Agent messages"] || row["Messages sent"] || row["Messages Sent"] || row.Messages || row.messages || valueIncludes(row, ["agent messages", "messages sent", "messages"]));
    totals[key] = (totals[key] || 0) + messages;
  }
  return totals;
}

function countOrders(orders = []) {
  const explicit = orders.reduce((sum, row) => sum + toNumber(row.Orders || row.orders || row["Order Count"] || row["Total Orders"] || 0), 0);
  return explicit || orders.length;
}

function money(value, digits = 0) {
  return `$${formatNumber(value, digits)}`;
}

function buildFinanceMetrics(report) {
  const financeRows = normalizeFinanceRows(report?.data?.finance || []);
  const ordersCount = countOrders(report?.data?.orders || []);
  const agentRows = (report?.data?.agents || []).filter((row) => !isAverageAgentName(agentName(row)));

  const agentMsg = messagesFromAgentRows(agentRows);
  const ticketMsg = messagesFromTickets(report?.data?.tickets || []);
  const messagesByAgent = {
    Kyrene: agentMsg.Kyrene || ticketMsg.Kyrene || 0,
    Antoinette: agentMsg.Antoinette || ticketMsg.Antoinette || 0
  };

  const byAgentMap = {
    Kyrene: { agent: "Kyrene", hours: 0, costPerHourTotal: 0, costPerHourCount: 0, messages: messagesByAgent.Kyrene || 0 },
    Antoinette: { agent: "Antoinette", hours: 0, costPerHourTotal: 0, costPerHourCount: 0, messages: messagesByAgent.Antoinette || 0 }
  };

  for (const row of financeRows.filter((row) => isTargetAgentName(row.agent))) {
    const key = targetAgentKey(row.agent);
    byAgentMap[key].hours += row.hours || 0;
    if (row.costPerHour) {
      byAgentMap[key].costPerHourTotal += row.costPerHour;
      byAgentMap[key].costPerHourCount += 1;
    }
  }

  const byAgent = Object.values(byAgentMap).map((row) => {
    const costPerHour = row.costPerHourCount ? row.costPerHourTotal / row.costPerHourCount : 0;
    const actualCost = row.hours * costPerHour;
    const messageBasedValue = row.messages * MESSAGE_BENCHMARK_RATE;
    const valueCreated = messageBasedValue - actualCost;
    return {
      ...row,
      costPerHour,
      actualCost,
      messageBasedValue,
      valueCreated,
      messagesPerHour: row.hours ? row.messages / row.hours : 0,
      actualCostPerMessage: row.messages ? actualCost / row.messages : 0
    };
  });

  const humanMessages = byAgent.reduce((sum, row) => sum + row.messages, 0);
  const humanHours = byAgent.reduce((sum, row) => sum + row.hours, 0);
  const actualPayrollCost = byAgent.reduce((sum, row) => sum + row.actualCost, 0);
  const messageBasedValue = humanMessages * MESSAGE_BENCHMARK_RATE;
  const valueCreated = messageBasedValue - actualPayrollCost;
  const messagesPerPaidHour = humanHours ? humanMessages / humanHours : 0;
  const actualCostPerMessage = humanMessages ? actualPayrollCost / humanMessages : 0;
  const valueRatio = actualPayrollCost ? messageBasedValue / actualPayrollCost : 0;
  const totalCost = financeRows.reduce((sum, row) => sum + row.hours * row.costPerHour, 0);

  return {
    financeRows: financeRows.map((row) => ({ ...row, totalCost: row.hours * row.costPerHour })),
    byAgent,
    ordersCount,
    humanMessages,
    humanHours,
    actualPayrollCost,
    messageBasedValue,
    valueCreated,
    messagesPerPaidHour,
    actualCostPerMessage,
    valueRatio,
    totalCost,
    orderCost: ordersCount ? totalCost / ordersCount : 0
  };
}

function ValueCard({ label, value, hint, color = "#0f172a" }) {
  return (
    <div style={{ ...cardStyle, borderTop: `6px solid ${color}`, minHeight: 138 }}>
      <div style={{ color: "#64748b", fontWeight: 800, fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 38, fontWeight: 950, marginTop: 8, color: "#0f172a" }}>{value}</div>
      {hint && <div style={{ color: "#475569", marginTop: 8, fontWeight: 700 }}>{hint}</div>}
    </div>
  );
}

export default function FinancePage() {
  const [reports, setReports] = useState([]);
  const [week, setWeek] = useState("");

  useEffect(() => {
    async function load() {
      const stored = await loadReports();
      setReports(stored);
      setWeek(stored[0]?.week || "");
    }
    load();
  }, []);

  const report = reports.find((item) => item.week === week);
  const metrics = useMemo(() => buildFinanceMetrics(report), [report]);

  return (
    <main style={pageStyle}>
      <ReportingNav />

      <div style={{ marginBottom: 22 }}>
        <div style={{ color: "#991b1b", fontWeight: 900 }}>Protected Finance Area</div>
        <h1 style={{ fontSize: 42, margin: "6px 0" }}>Finance KPIs</h1>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>
          Compares current hourly payroll cost for Kyrene + Antoinette against the equivalent value of their sent messages at US $2.30 per message.
        </p>
      </div>

      <div style={cardStyle}>
        <label style={{ fontWeight: 900, marginRight: 12 }}>Select week</label>
        <select value={week} onChange={(e) => setWeek(e.target.value)} style={{ padding: 10, borderRadius: 10, minWidth: 260 }}>
          {reports.map((r) => <option key={r.week} value={r.week}>{r.week}</option>)}
        </select>
      </div>

      {!report && <div style={{ ...cardStyle, marginTop: 16 }}>No finance data available yet.</div>}

      {report && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 20 }}>
            <ValueCard label="Actual Payroll Cost" value={money(metrics.actualPayrollCost, 0)} hint="Kyrene + Antoinette hours × hourly rate" color="#991b1b" />
            <ValueCard label="Message-Based Equivalent Value" value={money(metrics.messageBasedValue, 0)} hint={`${formatNumber(metrics.humanMessages)} messages × $${MESSAGE_BENCHMARK_RATE.toFixed(2)}`} color="#2563eb" />
            <ValueCard label="Value Created" value={money(metrics.valueCreated, 0)} hint={metrics.valueCreated >= 0 ? "Message value above hourly payroll cost" : "Hourly cost above message value"} color={metrics.valueCreated >= 0 ? "#16a34a" : "#f59e0b"} />
            <ValueCard label="Value Multiplier" value={`${formatNumber(metrics.valueRatio, 1)}x`} hint="Message value / actual payroll cost" color="#7c3aed" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 20 }}>
            <MetricCard label="Messages per Paid Hour" value={formatNumber(metrics.messagesPerPaidHour, 1)} hint={`${formatNumber(metrics.humanMessages)} messages / ${formatNumber(metrics.humanHours, 1)} hours`} />
            <MetricCard label="Actual Cost per Message" value={money(metrics.actualCostPerMessage, 2)} hint="Actual payroll cost / messages sent" />
            <MetricCard label="Benchmark Value per Message" value={money(MESSAGE_BENCHMARK_RATE, 2)} hint="Volume-based comparison rate" />
            <MetricCard label="Total Order Cost" value={money(metrics.orderCost, 2)} hint={`${formatNumber(metrics.totalCost, 0)} total CSR cost / ${formatNumber(metrics.ordersCount)} paid orders`} />
          </div>

          <div style={{ ...cardStyle, marginTop: 20, borderTop: "6px solid #16a34a" }}>
            <h2 style={{ marginTop: 0 }}>Executive Finance Insight</h2>
            <p style={{ color: "#334155", lineHeight: 1.8, fontSize: 16 }}>
              During the selected period, Kyrene and Antoinette sent <b>{formatNumber(metrics.humanMessages)}</b> customer-facing messages across <b>{formatNumber(metrics.humanHours, 1)}</b> paid hours. Based on actual hourly payroll cost, their combined service cost was <b>{money(metrics.actualPayrollCost, 0)}</b>. Using the benchmark valuation of <b>{money(MESSAGE_BENCHMARK_RATE, 2)} per message</b>, the equivalent message-based value generated was <b>{money(metrics.messageBasedValue, 0)}</b>. This represents an estimated value creation of <b>{money(metrics.valueCreated, 0)}</b>.
            </p>
          </div>

          <div style={{ ...cardStyle, marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>Kyrene + Antoinette Productivity Breakdown</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#64748b", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: 10 }}>Agent</th>
                    <th style={{ padding: 10 }}>Hours</th>
                    <th style={{ padding: 10 }}>Hourly rate</th>
                    <th style={{ padding: 10 }}>Actual cost</th>
                    <th style={{ padding: 10 }}>Messages sent</th>
                    <th style={{ padding: 10 }}>Messages/hour</th>
                    <th style={{ padding: 10 }}>Actual cost/message</th>
                    <th style={{ padding: 10 }}>Message-based value</th>
                    <th style={{ padding: 10 }}>Value created</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.byAgent.map((row) => (
                    <tr key={row.agent} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: 10, fontWeight: 900 }}>{row.agent}</td>
                      <td style={{ padding: 10 }}>{formatNumber(row.hours, 1)}</td>
                      <td style={{ padding: 10 }}>{money(row.costPerHour, 2)}</td>
                      <td style={{ padding: 10 }}>{money(row.actualCost, 0)}</td>
                      <td style={{ padding: 10 }}>{formatNumber(row.messages)}</td>
                      <td style={{ padding: 10 }}>{formatNumber(row.messagesPerHour, 1)}</td>
                      <td style={{ padding: 10 }}>{money(row.actualCostPerMessage, 2)}</td>
                      <td style={{ padding: 10 }}>{money(row.messageBasedValue, 0)}</td>
                      <td style={{ padding: 10, fontWeight: 900, color: row.valueCreated >= 0 ? "#15803d" : "#b45309" }}>{money(row.valueCreated, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {metrics.humanMessages === 0 && (
              <p style={{ color: "#b45309", fontWeight: 800, marginTop: 16 }}>
                No Kyrene / Antoinette messages found. Check that the agents-metrics or tickets file includes messages sent by agent.
              </p>
            )}

            {metrics.humanHours === 0 && (
              <p style={{ color: "#b45309", fontWeight: 800, marginTop: 16 }}>
                No Kyrene / Antoinette hours found. Check that the finance file includes hours and hourly cost by agent.
              </p>
            )}
          </div>

          <div style={{ ...cardStyle, marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>Finance input by agent</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#64748b", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: 10 }}>Agent</th>
                    <th style={{ padding: 10 }}>Hours</th>
                    <th style={{ padding: 10 }}>Cost / hour</th>
                    <th style={{ padding: 10 }}>Total cost</th>
                    <th style={{ padding: 10 }}>Included in comparison</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.financeRows.length ? metrics.financeRows.map((row, index) => (
                    <tr key={`${row.agent}-${index}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: 10, fontWeight: 900 }}>{row.agent || "Unknown"}</td>
                      <td style={{ padding: 10 }}>{formatNumber(row.hours, 1)}</td>
                      <td style={{ padding: 10 }}>{money(row.costPerHour, 2)}</td>
                      <td style={{ padding: 10 }}>{money(row.totalCost, 0)}</td>
                      <td style={{ padding: 10 }}>{isTargetAgentName(row.agent) ? "Yes" : "No"}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td style={{ padding: 10, color: "#64748b" }} colSpan={5}>No finance data uploaded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
