import { useEffect, useState } from "react";
import { deleteReport, deleteMonthlyReport, loadReports, loadMonthlyReports } from "../../lib/yr-reporting/storage";
import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";

export default function HistoryPage() {
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [status, setStatus] = useState("");
  async function refresh() { try { setWeeklyReports(await loadReports()); setMonthlyReports(await loadMonthlyReports()); } catch (error) { setStatus(`Load failed: ${error.message}`); } }
  useEffect(() => { refresh(); }, []);
  async function removeWeek(week) { if (!window.confirm(`Delete weekly report ${week} from the shared database?`)) return; try { setStatus("Deleting weekly report..."); setWeeklyReports(await deleteReport(week)); setStatus(`Deleted weekly report ${week}.`); } catch (error) { setStatus(`Delete failed: ${error.message}`); } }
  async function removeMonth(month) { if (!window.confirm(`Delete monthly report ${month} from the shared database?`)) return; try { setStatus("Deleting monthly report..."); setMonthlyReports(await deleteMonthlyReport(month)); setStatus(`Deleted monthly report ${month}.`); } catch (error) { setStatus(`Delete failed: ${error.message}`); } }
  return <main style={pageStyle}><ReportingNav /><h1 style={{ fontSize: 40 }}>Uploaded reports</h1>{status && <div style={{ ...cardStyle, marginBottom: 16 }}>{status}</div>}<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}><div style={cardStyle}><h2 style={{ marginTop: 0 }}>Weekly reports</h2>{weeklyReports.length ? weeklyReports.map((report) => <div key={report.week} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #e5e7eb" }}><div><b>{report.week}</b><div style={{ color:"#64748b", fontSize:13 }}>Shared weekly report</div></div><button onClick={() => removeWeek(report.week)}>Delete</button></div>) : <p>No weekly uploads yet.</p>}</div><div style={cardStyle}><h2 style={{ marginTop: 0 }}>Monthly reports</h2>{monthlyReports.length ? monthlyReports.map((report) => <div key={report.month} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #e5e7eb" }}><div><b>{report.month}</b><div style={{ color:"#64748b", fontSize:13 }}>{report.monthStart} to {report.monthEnd}</div></div><button onClick={() => removeMonth(report.month)}>Delete</button></div>) : <p>No monthly uploads yet.</p>}</div></div></main>;
}
