import { useEffect, useState } from "react";
import { deleteReport, loadReports } from "../../lib/yr-reporting/storage";
import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";

export default function HistoryPage() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("");

  async function refresh() {
    try {
      setReports(await loadReports());
    } catch (error) {
      setStatus(`Load failed: ${error.message}`);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function removeWeek(week) {
    if (!window.confirm(`Delete ${week} from the shared database?`)) return;

    try {
      setStatus("Deleting...");
      const next = await deleteReport(week);
      setReports(next);
      setStatus(`Deleted ${week}.`);
    } catch (error) {
      setStatus(`Delete failed: ${error.message}`);
    }
  }

  return (
    <main style={pageStyle}>
      <ReportingNav />
      <h1 style={{ fontSize: 40 }}>Uploaded weeks</h1>
      {status && <div style={{ ...cardStyle, marginBottom: 16 }}>{status}</div>}
      <div style={cardStyle}>
        {reports.length ? reports.map((report) => (
          <div key={report.week} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #e5e7eb" }}>
            <div>
              <b>{report.week}</b>
              <div style={{ color:"#64748b", fontSize:13 }}>Shared in Supabase</div>
            </div>
            <button onClick={() => removeWeek(report.week)}>Delete</button>
          </div>
        )) : <p>No uploads yet.</p>}
      </div>
    </main>
  );
}
