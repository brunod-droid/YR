import { useEffect, useMemo, useState } from "react";
import { getReports, getSettings } from "../../lib/yr-reporting/storage";
import { aggregateMonthly } from "../../lib/yr-reporting/metrics";
import { ReportingNav, MetricCard, pageStyle, cardStyle, formatNumber } from "../../lib/yr-reporting/components";

export default function MonthlyReport() {
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => { setReports(getReports()); setSettings(getSettings()); }, []);
  const aggregate = useMemo(() => settings ? aggregateMonthly(reports, settings) : null, [reports, settings]);

  return <main style={pageStyle}>
    <ReportingNav />
    <h1 style={{ fontSize: 40 }}>Monthly report</h1>
    {aggregate && <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16 }}>
        <MetricCard label="Tickets created" value={formatNumber(aggregate.totals.ticketsCreated)} />
        <MetricCard label="Tickets closed" value={formatNumber(aggregate.totals.ticketsClosed)} />
        <MetricCard label="Orders" value={formatNumber(aggregate.totals.ordersCount)} />
        <MetricCard label="Avg tickets / order" value={formatNumber(aggregate.averages.ticketsPerOrder, 2)} />
      </div>
      <div style={{ ...cardStyle, marginTop: 16 }}>
        <h2>Weekly trend</h2>
        {aggregate.weekly.map((item) => <div key={item.week} style={{ display:"grid", gridTemplateColumns:"2fr repeat(4, 1fr)", gap:10, padding:"10px 0", borderBottom:"1px solid #e5e7eb" }}>
          <b>{item.week}</b><span>Created: {formatNumber(item.metrics.ticketsCreated)}</span><span>Closed: {formatNumber(item.metrics.ticketsClosed)}</span><span>Orders: {formatNumber(item.metrics.ordersCount)}</span><span>CSAT: {formatNumber(item.metrics.csat, 2)}</span>
        </div>)}
      </div>
    </>}
  </main>;
}
