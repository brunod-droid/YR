import { useEffect, useState } from "react";
import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";
import { getLocalReportsOnly, getReports, saveReports } from "../../lib/yr-reporting/storage";
import { SHARED_REPORTS } from "../../lib/yr-reporting/sharedReports";

function buildSharedFileContent(reports) {
  return `// Shared default reporting data for everyone.
// Generated from /yves-rocher-reporting/publish.
// Replace lib/yr-reporting/sharedReports.js with this file.
// Then commit + redeploy on Vercel.

export const SHARED_REPORTS = ${JSON.stringify(reports || [], null, 2)};
`;
}

export default function PublishDataPage() {
  const [localReports, setLocalReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [sharedCount, setSharedCount] = useState(0);
  const [fileContent, setFileContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const local = getLocalReportsOnly();
    const all = getReports();
    setLocalReports(local);
    setAllReports(all);
    setSharedCount(Array.isArray(SHARED_REPORTS) ? SHARED_REPORTS.length : 0);
    setFileContent(buildSharedFileContent(all));
  }, []);

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(fileContent);
      setMessage("Copied. Now paste it into lib/yr-reporting/sharedReports.js, commit and redeploy.");
    } catch {
      setMessage("Copy failed. Select the text manually and copy it.");
    }
  }

  function downloadFile() {
    const blob = new Blob([fileContent], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sharedReports.js";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importSharedIntoMyBrowser() {
    saveReports(allReports);
    setLocalReports(allReports);
    setMessage("Shared data copied into this browser too.");
  }

  return (
    <main style={pageStyle}>
      <ReportingNav />

      <h1 style={{ fontSize: 42, fontWeight: 900 }}>Publish data for everyone</h1>

      <div style={{ ...cardStyle, borderTop: "6px solid #b45309" }}>
        <h2 style={{ marginTop: 0 }}>Simple shared-data system</h2>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>
          Uploads are still saved in your browser first. This page generates one code file that makes the weeks visible to everyone after redeploy.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
          <div style={miniCard}><b>Local weeks in this browser</b><span>{localReports.length}</span></div>
          <div style={miniCard}><b>Shared weeks already in code</b><span>{sharedCount}</span></div>
          <div style={miniCard}><b>Weeks that will be published</b><span>{allReports.length}</span></div>
        </div>

        <ol style={{ color: "#334155", lineHeight: 1.8, marginTop: 18 }}>
          <li>Upload your CSVs normally.</li>
          <li>Come back to this page.</li>
          <li>Click <b>Copy sharedReports.js content</b>.</li>
          <li>In GitHub, open <b>lib/yr-reporting/sharedReports.js</b>.</li>
          <li>Replace the full file content with what you copied.</li>
          <li>Commit changes and let Vercel redeploy.</li>
        </ol>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <button onClick={copyContent} style={buttonStyle}>Copy sharedReports.js content</button>
          <button onClick={downloadFile} style={{ ...buttonStyle, background: "#0f172a" }}>Download sharedReports.js</button>
          <button onClick={importSharedIntoMyBrowser} style={{ ...buttonStyle, background: "#15803d" }}>Refresh my browser with shared data</button>
        </div>

        {message && <div style={{ marginTop: 14, color: "#15803d", fontWeight: 900 }}>{message}</div>}
      </div>

      <div style={{ ...cardStyle, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Generated file content</h2>
        <textarea
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          style={{
            width: "100%",
            minHeight: 420,
            fontFamily: "monospace",
            fontSize: 12,
            padding: 14,
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            boxSizing: "border-box"
          }}
        />
      </div>
    </main>
  );
}

const miniCard = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 16,
  display: "grid",
  gap: 8
};

const buttonStyle = {
  border: "none",
  background: "#b45309",
  color: "#fff",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 900,
  cursor: "pointer"
};
