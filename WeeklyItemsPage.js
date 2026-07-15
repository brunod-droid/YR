export const STORAGE_KEY = 'yr_reports';
export const SETTINGS_KEY = 'yr_settings';
export const defaultSettings = {
  tagMap: {
    'reason::wismo': 'WISMO', 'reason::refund': 'Refund', 'reason::exchange': 'Exchange',
    'reason::damaged': 'Damaged', 'reason::missing_item': 'Missing Item', 'reason::cancel': 'Cancel',
    'reason::delivery': 'Delivery', 'reason::payment': 'Payment'
  },
  slaTargetHours: 24,
  costPerTicket: 0
};
export function readReports(){ if(typeof window==='undefined') return []; try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch(e){return []} }
export function writeReports(rows){ if(typeof window==='undefined') return; localStorage.setItem(STORAGE_KEY, JSON.stringify(rows||[])); }
export function readSettings(){ if(typeof window==='undefined') return defaultSettings; try{return {...defaultSettings,...JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}}catch(e){return defaultSettings} }
export function writeSettings(s){ if(typeof window==='undefined') return; localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }
export function weekKey(start,end){ return `${start||'no-start'}_${end||'no-end'}`; }
export function detectType(name=''){
 const n=name.toLowerCase();
 if(n.includes('ticket-volume')) return 'ticket-volume'; if(n.includes('workload')) return 'workload';
 if(n.includes('customer-experience')) return 'customer-experience'; if(n.includes('agents-metrics')) return 'agents-metrics';
 if(n.includes('channels-metrics')) return 'channels-metrics'; if(n.includes('tickets')) return 'tickets';
 if(n.includes('orders')) return 'orders'; if(n.includes('finance')) return 'finance'; if(n.includes('social')) return 'social'; return 'unknown';
}
export function metricNumber(v){ const n=Number(String(v??'').replace(/[^0-9.-]/g,'')); return Number.isFinite(n)?n:0; }
export function summarize(reports){
 const sum={created:0,closed:0,orders:0,backlog:0,csat:[],firstResponse:[],resolution:[],tickets:0};
 for(const r of reports||[]){ for(const f of r.files||[]){ for(const row of f.rows||[]){
  const keys=Object.keys(row); const get=(names)=>{for(const name of names){const k=keys.find(x=>x.toLowerCase().includes(name)); if(k) return row[k];} return ''};
  sum.created += metricNumber(get(['created','new tickets'])); sum.closed += metricNumber(get(['closed','resolved']));
  sum.orders += metricNumber(get(['orders'])); sum.backlog += metricNumber(get(['backlog','open']));
  const csat=metricNumber(get(['csat','satisfaction'])); if(csat) sum.csat.push(csat);
  const fr=metricNumber(get(['first response','first_reply'])); if(fr) sum.firstResponse.push(fr);
  const res=metricNumber(get(['resolution','solve'])); if(res) sum.resolution.push(res);
  if(f.type==='tickets') sum.tickets += 1;
 }}}
 const avg=a=>a.length?Math.round((a.reduce((x,y)=>x+y,0)/a.length)*10)/10:0;
 return {...sum, csat:avg(sum.csat), firstResponse:avg(sum.firstResponse), resolution:avg(sum.resolution)};
}
