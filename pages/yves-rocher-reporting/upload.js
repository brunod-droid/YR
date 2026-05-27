import { useState } from "react";
import Papa from "papaparse";
import { getWeekRange } from "../../lib/yr-reporting/dates";
import { getReports, saveReports } from "../../lib/yr-reporting/storage";
import { detectFileType, normalizeRows, compactRows, defaultReportData } from "../../lib/yr-reporting/parser";
import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";

function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
      worker: false,
      transformHeader: (header) => String(header || "").trim().replace(/^\ufeff/, ""),
      complete: (results) => resolve(normalizeRows(results.data || [])),
      error: (error) => reject(error)
    });
  });
}

function getWeekInfo(weekStart) {
  const { weekEnd } = getWeekRange(weekStart);
  return { weekEnd, week: `${weekStart}_${weekEnd}` };
}

function sizeMb(value) {
  return (new Blob([JSON.stringify(value)]).size / 1024 / 1024).toFixed(2);
}

function buildReportForWeek(weekStart) {
  const { weekEnd, week } = getWeekInfo(weekStart);
  const reports = getReports();
  const existing = reports.find((report) => report.week === week);

  return {
    week,
    weekStart,
    weekEnd,
    data: {
      ...defaultReportData(),
      ...(existing?.data || {})
    },
    uploadedAt: new Date().toISOString()
  };
}

function saveReportKeepingWeeks(report) {
  const reports = getReports();
  const withoutCurrentWeek = reports.filter((item) => item.week !== report.week);
  const nextReports = [report, ...withoutCurrentWeek].slice(0, 12);
  saveReports(nextReports);
}

export default function UploadPage() {
  const [weekStart, setWeekStart] = useState("");
  const [manualOrders, setManualOrders] = useState("");
  const [status, setStatus] = useState("");
  const [details, setDetails] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  function clearReports() {
    localStorage.removeItem("yr_reports");
    setDetails([]);
    setStatus("Cleared. Select a week and upload again.");
  }

  function saveManualOrders() {
    if (!weekStart) {
      setStatus("Please select a week start first.");
      return;
    }

    const value = Number(manualOrders);
    if (!Number.isFinite(value) || value < 0) {
      setStatus("Please enter a valid paid orders number.");
      return;
    }

    try {
      const report = buildReportForWeek(weekStart);
      report.data.orders = [{ Orders: Math.round(value) }];
      saveReportKeepingWeeks(report);
      setStatus(`Manual orders saved: ${Math.round(value)} paid orders for ${report.week}.`);
      setDetails([{ file: "Manual Orders Input", status: "Saved", message: `${Math.round(value)} paid orders saved. Previous weeks kept.` }]);
    } catch (error) {
      setStatus(`Manual orders save failed: ${error.message}`);
    }
  }

  async function handleFiles(files) {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;

    if (!weekStart) {
      setStatus("Please select a week start first.");
      return;
    }

    setStatus("Uploading and parsing files...");
    setDetails([]);

    try {
      const report = buildReportForWeek(weekStart);
      const uploadDetails = [];

      for (const file of fileList) {
        const type = detectFileType(file.name);

        if (!type) {
          uploadDetails.push({
            file: file.name,
            status: "Rejected",
            message: "Unknown file type. Use ticket-volume, workload, customer-experience, agents-metrics, channels-metrics, tickets, order/orders/shopify, finance/cost, or social."
          });
          continue;
        }

        const rawRows = await parseCsvFile(file);
        const rows = compactRows(type, rawRows);
        report.data[type] = rows;

        uploadDetails.push({
          file: file.name,
          status: "Imported",
          message: type === "orders"
            ? `${rows[0]?.Orders || 0} paid orders counted from ${rawRows.length} Shopify rows`
            : `${rawRows.length} rows imported as ${type}. Stored size: ${sizeMb(rows)} MB`
        });
      }

      saveReportKeepingWeeks(report);
      setDetails(uploadDetails);
      setStatus(`Done. Week ${report.week} saved. Previous weeks kept. Storage size: ${sizeMb(getReports())} MB.`);
    } catch (error) {
      setStatus(`Upload failed: ${error.message}`);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <main style={pageStyle}>
      <ReportingNav />

      <h1 style={{ fontSize: 42, fontWeight: 900 }}>Upload CSV files</h1>

      <div style={{ ...cardStyle, border: "3px solid #15803d" }}>
        <div style={{ fontSize: 24, fontWeight: 950 }}>Step 1 — Select reporting week</div>
        <div style={{ marginTop: 12 }}>
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: "1px solid #d1d5db", fontSize: 16 }}
          />
        </div>
        <div style={{ marginTop: 10, color: "#64748b" }}>Week starts on Sunday. You can upload several weeks; previous weeks are now kept.</div>
      </div>

      <div style={{ ...cardStyle, marginTop: 20, background: "#f0fdf4", border: "3px solid #22c55e" }}>
        <div style={{ fontSize: 28, fontWeight: 950 }}>Step 2 — Manual Orders Input</div>
        <div style={{ marginTop: 8, color: "#166534", lineHeight: 1.6, fontWeight: 700 }}>
          Enter only the number of paid orders for the selected week.
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="number"
            value={manualOrders}
            onChange={(e) => setManualOrders(e.target.value)}
            placeholder="Example: 1250"
            style={{ padding: 14, borderRadius: 12, border: "1px solid #86efac", minWidth: 240, fontSize: 18, fontWeight: 800 }}
          />
          <button
            onClick={saveManualOrders}
            style={{ background: "#15803d", color: "#fff", border: "none", borderRadius: 12, padding: "14px 18px", fontWeight: 950, cursor: "pointer", fontSize: 16 }}
          >
            Save orders number
          </button>
        </div>
      </div>

      <div
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={onDrop}
        style={{
          ...cardStyle,
          marginTop: 20,
          minHeight: 190,
          border: isDragging ? "4px dashed #15803d" : "4px dashed #94a3b8",
          background: isDragging ? "#dcfce7" : "#ffffff",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 950 }}>Step 3 — Drag & drop CSV files here</div>
        <div style={{ marginTop: 10, color: "#64748b" }}>Or use Choose files below.</div>
        <input
          type="file"
          accept=".csv,text/csv"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          style={{ marginTop: 22, fontSize: 16 }}
        />
      </div>

      <div style={{ ...cardStyle, marginTop: 20, background: "#fff7ed", border: "2px solid #fdba74" }}>
        <div style={{ fontSize: 22, fontWeight: 950 }}>Storage troubleshooting</div>
        <div style={{ marginTop: 8, color: "#7c2d12", lineHeight: 1.6 }}>
          If you see a browser storage/quota error, clear uploaded reporting data, then re-upload.
        </div>
        <button
          onClick={clearReports}
          style={{ marginTop: 12, background: "#c2410c", color: "#fff", border: "none", borderRadius: 10, padding: "12px 16px", fontWeight: 950, cursor: "pointer" }}
        >
          Clear uploaded reporting data
        </button>
      </div>

      {status && (
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <strong>Status:</strong> {status}
        </div>
      )}

      {!!details.length && (
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <h2>Upload details</h2>
          {details.map((item) => (
            <div
              key={`${item.file}-${item.message}`}
              style={{
                display: "grid",
                gridTemplateColumns: "240px 120px 1fr",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid #e5e7eb"
              }}
            >
              <strong>{item.file}</strong>
              <span>{item.status}</span>
              <span style={{ color: item.status === "Rejected" ? "#b91c1c" : "#166534" }}>{item.message}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
