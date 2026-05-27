import { useEffect, useState } from "react";
import { deleteReport, getReports } from "../../lib/yr-reporting/storage";
import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";

export default function HistoryPage() {
  const [reports, setReports] = useState([]);
  useEffect(() => setReports(getReports()), []);

  return <main style={pageStyle}>
    <ReportingNav />
    <h1 style={{ fontSize: 40 }}>Uploaded weeks</h1>
    <div style={cardStyle}>
      {reports.length ? reports.map((report) => <div key={report.week} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #e5e7eb" }}><b>{report.week}</b><button onClick={() => setReports(deleteReport(report.week))}>Delete</button></div>) : <p>No uploads yet.</p>}
    </div>
  </main>;
}
