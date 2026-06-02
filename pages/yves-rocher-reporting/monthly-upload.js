import { useState } from "react";
import Papa from "papaparse";
import { saveMonthlyReport, loadMonthlyReports, deleteMonthlyReport } from "../../lib/yr-reporting/storage";
import { detectFileType, normalizeRows, compactRows, defaultReportData } from "../../lib/yr-reporting/parser";
import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";

function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, { header: true, skipEmptyLines: "greedy", dynamicTyping: false, worker: false, transformHeader: (header) => String(header || "").trim().replace(/^\ufeff/, ""), complete: (results) => resolve(normalizeRows(results.data || [])), error: (error) => reject(error) });
  });
}

function getMonthInfo(monthValue) {
  const [year, month] = String(monthValue || "").split("-").map(Number);
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { month: monthValue, monthStart, monthEnd };
}

function sizeMb(value) { return (new Blob([JSON.stringify(value)]).size / 1024 / 1024).toFixed(2); }

async function buildReportForMonth(monthValue) {
  const { month, monthStart, monthEnd } = getMonthInfo(monthValue);
  const reports = await loadMonthlyReports();
  const existing = reports.find((report) => report.month === month);
  return { month, monthStart, monthEnd, data: { ...defaultReportData(), ...(existing?.data || {}) }, uploadedAt: new Date().toISOString() };
}

export default function MonthlyUploadPage() {
  const [monthValue, setMonthValue] = useState("");
  const [manualOrders, setManualOrders] = useState("");
  const [status, setStatus] = useState("");
  const [details, setDetails] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  async function deleteSelectedMonth() {
    if (!monthValue) { setStatus("Select a month first, then delete it."); return; }
    if (!window.confirm(`Delete monthly report ${monthValue}?`)) return;
    try { await deleteMonthlyReport(monthValue); setDetails([]); setStatus(`Deleted monthly report ${monthValue}.`); } catch (error) { setStatus(`Delete failed: ${error.message}`); }
  }

  async function saveManualOrders() {
    if (!monthValue) { setStatus("Please select a month first."); return; }
    const value = Number(manualOrders);
    if (!Number.isFinite(value) || value < 0) { setStatus("Please enter a valid monthly paid orders number."); return; }
    try {
      setStatus("Saving monthly paid orders in Supabase...");
      const report = await buildReportForMonth(monthValue);
      report.data.orders = [{ Orders: Math.round(value) }];
      await saveMonthlyReport(report);
      setStatus(`Monthly orders saved and shared: ${Math.round(value)} paid orders for ${report.month}.`);
      setDetails([{ file: "Monthly Manual Orders Input", status: "Saved", message: `${Math.round(value)} monthly paid orders saved in shared database.` }]);
    } catch (error) { setStatus(`Monthly orders save failed: ${error.message}`); }
  }

  async function handleFiles(files) {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;
    if (!monthValue) { setStatus("Please select a month first."); return; }
    setStatus("Uploading and parsing monthly files..."); setDetails([]);
    try {
      const report = await buildReportForMonth(monthValue);
      const uploadDetails = [];
      for (const file of fileList) {
        const type = detectFileType(file.name);
        if (!type) { uploadDetails.push({ file: file.name, status: "Rejected", message: "Unknown file type. Use the same exports as weekly: ticket-volume, workload, customer-experience, agents-metrics, channels-metrics, tickets, order/orders/shopify, finance/cost, or social." }); continue; }
        const rawRows = await parseCsvFile(file);
        const rows = compactRows(type, rawRows);
        report.data[type] = rows;
        uploadDetails.push({ file: file.name, status: "Imported", message: type === "orders" ? `${rows[0]?.Orders || 0} monthly paid orders counted from ${rawRows.length} Shopify rows` : `${rawRows.length} monthly rows imported as ${type}. Stored size: ${sizeMb(rows)} MB` });
      }
      await saveMonthlyReport(report);
      setDetails(uploadDetails);
      setStatus(`Done. Monthly report ${report.month} (${report.monthStart} to ${report.monthEnd}) saved in Supabase. Everyone can now see it.`);
    } catch (error) { setStatus(`Monthly upload failed: ${error.message}`); }
  }

  function onDrop(event) { event.preventDefault(); event.stopPropagation(); setIsDragging(false); handleFiles(event.dataTransfer.files); }

  return <main style={pageStyle}>
    <ReportingNav />
    <h1 style={{ fontSize: 42, fontWeight: 900 }}>Upload Monthly CSV files</h1>
    <div style={{ ...cardStyle, border: "3px solid #7c2d12" }}><div style={{ fontSize: 24, fontWeight: 950 }}>Step 1 - Select reporting month</div><div style={{ marginTop: 12 }}><input type="month" value={monthValue} onChange={(e) => setMonthValue(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #d1d5db", fontSize: 16 }} /></div><div style={{ marginTop: 10, color: "#64748b" }}>Monthly files should cover the full month, from the 1st day to the last day.</div></div>
    <div style={{ ...cardStyle, marginTop: 20, background: "#fff7ed", border: "3px solid #fb923c" }}><div style={{ fontSize: 28, fontWeight: 950 }}>Step 2 - Monthly Orders Input</div><div style={{ marginTop: 8, color: "#7c2d12", lineHeight: 1.6, fontWeight: 700 }}>Enter only the total number of paid orders for the full month.</div><div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}><input type="number" value={manualOrders} onChange={(e) => setManualOrders(e.target.value)} placeholder="Example: 5200" style={{ padding: 14, borderRadius: 12, border: "1px solid #fdba74", minWidth: 240, fontSize: 18, fontWeight: 800 }} /><button onClick={saveManualOrders} style={{ background: "#7c2d12", color: "#fff", border: "none", borderRadius: 12, padding: "14px 18px", fontWeight: 950, cursor: "pointer", fontSize: 16 }}>Save monthly orders number</button></div></div>
    <div onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} onDrop={onDrop} style={{ ...cardStyle, marginTop: 20, minHeight: 190, border: isDragging ? "4px dashed #7c2d12" : "4px dashed #94a3b8", background: isDragging ? "#ffedd5" : "#ffffff", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}><div style={{ fontSize: 30, fontWeight: 950 }}>Step 3 - Drag and drop Monthly CSV files here</div><div style={{ marginTop: 10, color: "#64748b" }}>Use the same file types as Weekly, but exported for the full month.</div><input type="file" accept=".csv,text/csv" multiple onChange={(e) => handleFiles(e.target.files)} style={{ marginTop: 22, fontSize: 16 }} /></div>
    <div style={{ ...cardStyle, marginTop: 20, background: "#fef2f2", border: "2px solid #fca5a5" }}><div style={{ fontSize: 22, fontWeight: 950 }}>Delete a monthly report</div><div style={{ marginTop: 8, color: "#7f1d1d", lineHeight: 1.6 }}>Select the month above, then delete only that monthly report from the shared database.</div><button onClick={deleteSelectedMonth} style={{ marginTop: 12, background: "#b91c1c", color: "#fff", border: "none", borderRadius: 10, padding: "12px 16px", fontWeight: 950, cursor: "pointer" }}>Delete selected month</button></div>
    {status && <div style={{ ...cardStyle, marginTop: 20 }}><strong>Status:</strong> {status}</div>}
    {!!details.length && <div style={{ ...cardStyle, marginTop: 20 }}><h2>Upload details</h2>{details.map((item) => <div key={`${item.file}-${item.message}`} style={{ display: "grid", gridTemplateColumns: "260px 120px 1fr", gap: 12, padding: "10px 0", borderBottom: "1px solid #e5e7eb" }}><strong>{item.file}</strong><span>{item.status}</span><span style={{ color: item.status === "Rejected" ? "#b91c1c" : "#166534" }}>{item.message}</span></div>)}</div>}
  </main>;
}
