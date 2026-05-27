import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../../lib/yr-reporting/storage";
import { ReportingNav, pageStyle, cardStyle } from "../../lib/yr-reporting/components";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [newDriver, setNewDriver] = useState("");
  useEffect(() => setSettings(getSettings()), []);
  if (!settings) return null;

  function updateMapping(tag, value) { setSettings({ ...settings, tagMapping: { ...settings.tagMapping, [tag]: value } }); }
  function removeMapping(tag) { const next = { ...settings.tagMapping }; delete next[tag]; setSettings({ ...settings, tagMapping: next }); }
  function addMapping() { if (!newTag || !newDriver) return; updateMapping(newTag, newDriver); setNewTag(""); setNewDriver(""); }

  return <main style={pageStyle}>
    <ReportingNav />
    <h1 style={{ fontSize: 40 }}>Settings</h1>
    <div style={cardStyle}>
      <h2>Tag mapping</h2>
      {Object.entries(settings.tagMapping || {}).map(([tag, driver]) => <div key={tag} style={{ display:"grid", gridTemplateColumns:"1.5fr 1.5fr auto", gap:10, marginBottom:10 }}><input value={tag} disabled style={{ padding:10 }} /><input value={driver} onChange={(e) => updateMapping(tag, e.target.value)} style={{ padding:10 }} /><button onClick={() => removeMapping(tag)}>Remove</button></div>)}
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1.5fr auto", gap:10, marginTop:18 }}><input placeholder="reason::new_tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} style={{ padding:10 }} /><input placeholder="Driver label" value={newDriver} onChange={(e) => setNewDriver(e.target.value)} style={{ padding:10 }} /><button onClick={addMapping}>Add</button></div>
      <button onClick={() => { saveSettings(settings); alert("Saved"); }} style={{ marginTop:20, background:"#15803d", color:"#fff", border:"none", borderRadius:12, padding:"12px 16px", fontWeight:900 }}>Save settings</button>
    </div>
  </main>;
}
