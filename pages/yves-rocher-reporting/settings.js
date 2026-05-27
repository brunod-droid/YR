import { useEffect, useState } from 'react';
import Link from 'next/link';
import { defaultTagMapping } from '../../lib/reportStore';

const SETTINGS_KEY = 'yr_settings';

export default function Settings() {
  const [mapping, setMapping] = useState(defaultTagMapping);
  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) setMapping(JSON.parse(saved).tagMapping || defaultTagMapping);
  }, []);
  function update(key, value) {
    const next = { ...mapping, [key]: value };
    setMapping(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ tagMapping: next }));
  }
  return (
    <main className="shell">
      <Link href="/" className="back">← Home</Link>
      <section className="hero"><p className="eyebrow">Settings</p><h1>Tag mapping & KPI rules</h1><p className="lead">Editable mapping for Gorgias tags and reporting categories.</p></section>
      <section className="panel">
        {Object.entries(mapping).map(([key, value]) => <label className="row" key={key}><span>{key}</span><input value={value} onChange={(e) => update(key, e.target.value)} /></label>)}
      </section>
      <section className="panel"><h2>KPI definitions</h2><p>Tickets/order = created tickets ÷ orders. Monthly CSAT = average of uploaded weekly CSAT values. Week starts Sunday.</p></section>
    </main>
  );
}
