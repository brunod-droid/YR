import { useState } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';
import { addReport } from '../../lib/reportStore';

function detectType(filename) {
  const name = filename.toLowerCase();
  if (name.includes('ticket-volume')) return 'ticket-volume';
  if (name.includes('workload')) return 'workload';
  if (name.includes('customer-experience')) return 'customer-experience';
  if (name.includes('agents-metrics')) return 'agents-metrics';
  if (name.includes('channels-metrics')) return 'channels-metrics';
  if (name.includes('tickets')) return 'tickets';
  if (name.includes('orders')) return 'orders';
  if (name.includes('finance')) return 'finance';
  if (name.includes('social')) return 'social';
  return 'unknown';
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve({ file, rows: result.data, fields: result.meta.fields || [] }),
      error: reject,
    });
  });
}

export default function Upload() {
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [message, setMessage] = useState('');

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    const parsed = await Promise.all(files.map(readFile));
    const filesByType = parsed.reduce((acc, item) => {
      acc[detectType(item.file.name)] = {
        filename: item.file.name,
        fields: item.fields,
        rowCount: item.rows.length,
        sampleRows: item.rows.slice(0, 5),
      };
      return acc;
    }, {});

    const report = {
      id: `${weekStart || 'week'}-${Date.now()}`,
      weekStart,
      weekEnd,
      createdAt: new Date().toISOString(),
      files: filesByType,
      kpis: {
        created: Number(filesByType['ticket-volume']?.sampleRows?.[0]?.Created || 0),
        closed: Number(filesByType['ticket-volume']?.sampleRows?.[0]?.Closed || 0),
        backlog: Number(filesByType['workload']?.sampleRows?.[0]?.Backlog || 0),
        orders: Number(filesByType.orders?.sampleRows?.[0]?.Orders || 0),
        csat: Number(filesByType['customer-experience']?.sampleRows?.[0]?.CSAT || 0),
        firstResponseTime: filesByType['customer-experience']?.sampleRows?.[0]?.['First response time'] || '',
        resolutionTime: filesByType['customer-experience']?.sampleRows?.[0]?.['Resolution time'] || '',
      },
    };

    addReport(report);
    setMessage(`Saved ${files.length} file(s) for week ${weekStart || ''} ${weekEnd ? `to ${weekEnd}` : ''}.`);
  }

  return (
    <main className="shell">
      <Link href="/" className="back">← Home</Link>
      <section className="hero"><p className="eyebrow">Upload Center</p><h1>Import weekly files</h1><p className="lead">Upload multiple CSV files. File type is detected from the filename.</p></section>
      <section className="panel form">
        <label>Week start<input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} /></label>
        <label>Week end<input type="date" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} /></label>
        <label>CSV files<input type="file" accept=".csv" multiple onChange={handleUpload} /></label>
        {message && <p className="success">{message}</p>}
      </section>
    </main>
  );
}
