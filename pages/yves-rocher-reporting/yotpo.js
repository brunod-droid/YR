import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(String(value).replace('%', '').trim());
  return Number.isFinite(n) ? n : null;
};

const toBool = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const v = String(value).toLowerCase().trim();
  if (['true', '1', 'yes', 'y'].includes(v)) return true;
  if (['false', '0', 'no', 'n'].includes(v)) return false;
  return null;
};

const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const toDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const normalizeYotpoRow = (row) => ({
  review_id: String(row['Review ID'] || '').trim(),
  review_creation_date: toDate(row['Review Creation Date']),
  review_type: row['Review Type'] || null,
  review_status: row['Review Status'] || null,
  review_source: row['Review Source'] || null,
  review_score: toNumber(row['Review Score']),
  review_title: row['Review Title'] || null,
  review_content: row['Review Content'] || null,
  sentiment_score: toNumber(row['Sentiment Score']),
  comment_date: toDate(row['Comment Date']),
  comment_content: row['Comment Content'] || null,
  comment_public: toBool(row['Comment Public']),
  review_tags: row['Review Tags'] || null,
  thumbs_up: toNumber(row['Thumbs Up']),
  thumbs_down: toNumber(row['Thumbs Down']),
  order_id: row['Order ID'] ? String(row['Order ID']) : null,
  order_date: toDateOnly(row['Order Date']),
  reviewer_display_name: row['Reviewer Display Name'] || null,
  reviewer_email: row['Reviewer Email'] || null,
  reviewer_type: row['Reviewer Type'] || null,
  reviewer_country: row['Reviewer Country'] || null,
  reviewer_device_type: row['Reviewer Device Type'] || null,
  product_id: row['Product ID'] ? String(row['Product ID']) : null,
  product_title: row['Product Title'] || null,
  product_url: row['Product URL'] || null,
  product_image_url: row['Product Image URL'] || null,
  product_handle: row['Product Handle'] || null,
  product_group: row['Product Group'] ? String(row['Product Group']) : null,
  product_category: row['Product Category'] || null,
  product_sku: row['Product SKU'] ? String(row['Product SKU']) : null,
  product_brand: row['Product Brand'] || null,
  incentivized_flag: toBool(row['Incentivized Flag']),
  raw: row,
  updated_at: new Date().toISOString(),
});

const keywordGroups = {
  Delivery: ['shipping', 'delivery', 'arrived', 'late', 'quickly', 'package', 'packaged'],
  Scent: ['smell', 'scent', 'fragrance', 'perfume'],
  Hydration: ['dry', 'hydrated', 'moisture', 'moisturizing', 'soft'],
  Packaging: ['pump', 'bottle', 'leak', 'broken', 'damaged', 'packaging'],
  Texture: ['texture', 'greasy', 'sticky', 'lightweight', 'heavy'],
  Reaction: ['rash', 'allergy', 'reaction', 'irritation', 'burning'],
  Value: ['price', 'expensive', 'worth', 'money', 'value'],
};

function KpiCard({ label, value, sub }) {
  return <div className="card"><div className="label">{label}</div><div className="value">{value}</div>{sub && <div className="sub">{sub}</div>}</div>;
}

export default function YotpoReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [minReviews, setMinReviews] = useState(10);
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('yotpo_reviews')
      .select('*')
      .order('review_creation_date', { ascending: false })
      .limit(10000);
    if (error) setMessage(error.message);
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return reviews;
    return reviews.filter((r) => r.review_type === typeFilter);
  }, [reviews, typeFilter]);

  const stats = useMemo(() => {
    const scores = filtered.map(r => Number(r.review_score)).filter(Number.isFinite);
    const total = filtered.length;
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const five = scores.filter(s => s === 5).length;
    const negative = scores.filter(s => s <= 2).length;
    const last30 = filtered.filter(r => r.review_creation_date && new Date(r.review_creation_date) >= new Date(Date.now() - 30 * 86400000)).length;
    const last7 = filtered.filter(r => r.review_creation_date && new Date(r.review_creation_date) >= new Date(Date.now() - 7 * 86400000)).length;
    return { total, avg, fiveRate: total ? five / total : 0, negativeRate: total ? negative / total : 0, last30, last7 };
  }, [filtered]);

  const distribution = useMemo(() => [5,4,3,2,1].map(score => ({ score, count: filtered.filter(r => Number(r.review_score) === score).length })), [filtered]);

  const productRows = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const name = r.product_title || 'Unknown Product';
      if (!map.has(name)) map.set(name, { product_title: name, reviews: 0, avg: 0, sum: 0, negatives: 0 });
      const item = map.get(name);
      const score = Number(r.review_score);
      item.reviews += 1;
      if (Number.isFinite(score)) {
        item.sum += score;
        item.avg = item.sum / item.reviews;
        if (score <= 2) item.negatives += 1;
      }
    });
    return [...map.values()].filter(p => p.reviews >= Number(minReviews));
  }, [filtered, minReviews]);

  const topProducts = [...productRows].sort((a,b) => b.avg - a.avg || b.reviews - a.reviews).slice(0, 10);
  const riskProducts = [...productRows].sort((a,b) => a.avg - b.avg || b.negatives - a.negatives).slice(0, 10);
  const negativeReviews = filtered.filter(r => Number(r.review_score) <= 2).slice(0, 20);

  const themes = useMemo(() => {
    const rows = filtered.filter(r => r.review_content || r.review_title);
    return Object.entries(keywordGroups).map(([theme, words]) => {
      const count = rows.filter(r => words.some(w => `${r.review_title || ''} ${r.review_content || ''}`.toLowerCase().includes(w))).length;
      return { theme, count };
    }).sort((a,b) => b.count - a.count);
  }, [filtered]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage('Parsing CSV...');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        const rows = data.map(normalizeYotpoRow).filter(r => r.review_id);
        const batchSize = 500;
        let imported = 0;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const { error } = await supabase.from('yotpo_reviews').upsert(batch, { onConflict: 'review_id' });
          if (error) {
            setMessage(error.message);
            setUploading(false);
            return;
          }
          imported += batch.length;
          setMessage(`Imported ${imported}/${rows.length} reviews...`);
        }
        setMessage(`Import completed: ${imported} Yotpo reviews saved.`);
        setUploading(false);
        fetchReviews();
      },
      error: (error) => {
        setMessage(error.message);
        setUploading(false);
      },
    });
  };

  return <main className="page">
    <div className="header">
      <div>
        <h1>Yotpo Reviews</h1>
        <p>Customer voice dashboard for Yves Rocher reviews: ratings, top products, risk products, and comments requiring attention.</p>
      </div>
      <label className="upload">
        {uploading ? 'Uploading...' : 'Upload Yotpo CSV'}
        <input type="file" accept=".csv" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>

    {message && <div className="message">{message}</div>}

    <div className="toolbar">
      <label>Review type <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option value="all">All</option><option value="product_review">Product reviews</option><option value="site_review">Site reviews</option></select></label>
      <label>Min reviews/product <input type="number" min="1" value={minReviews} onChange={e => setMinReviews(e.target.value)} /></label>
    </div>

    {loading ? <p>Loading...</p> : <>
      <section className="grid kpis">
        <KpiCard label="Total Reviews" value={stats.total.toLocaleString()} />
        <KpiCard label="Average Rating" value={`${stats.avg.toFixed(2)} / 5`} />
        <KpiCard label="5-Star Rate" value={`${(stats.fiveRate * 100).toFixed(1)}%`} />
        <KpiCard label="1-2 Star Rate" value={`${(stats.negativeRate * 100).toFixed(1)}%`} />
        <KpiCard label="Last 30 Days" value={stats.last30.toLocaleString()} />
        <KpiCard label="Last 7 Days" value={stats.last7.toLocaleString()} />
      </section>

      <section className="grid two">
        <div className="panel"><h2>Rating Distribution</h2>{distribution.map(d => <div className="bar" key={d.score}><span>{'★'.repeat(d.score)}</span><div><i style={{ width: `${stats.total ? (d.count / stats.total) * 100 : 0}%` }} /></div><b>{d.count}</b></div>)}</div>
        <div className="panel"><h2>Voice of Customer Themes</h2>{themes.map(t => <div className="theme" key={t.theme}><span>{t.theme}</span><b>{t.count}</b></div>)}</div>
      </section>

      <section className="grid two">
        <div className="panel"><h2>Top Rated Products</h2><Table rows={topProducts} /></div>
        <div className="panel"><h2>Products Requiring Attention</h2><Table rows={riskProducts} showNegatives /></div>
      </section>

      <section className="panel"><h2>Recent Negative Reviews</h2><table><thead><tr><th>Date</th><th>Rating</th><th>Product</th><th>Comment</th></tr></thead><tbody>{negativeReviews.map(r => <tr key={r.review_id}><td>{r.review_creation_date?.slice(0,10)}</td><td>{r.review_score}</td><td>{r.product_title}</td><td><b>{r.review_title}</b><br />{r.review_content}</td></tr>)}</tbody></table></section>
    </>}

    <style jsx>{`
      .page{padding:24px;font-family:Inter,Arial,sans-serif;color:#17202a;background:#f7f9fb;min-height:100vh}.header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px}h1{margin:0 0 6px;font-size:28px}p{margin:0;color:#5f6b7a}.upload{background:#0f766e;color:#fff;border-radius:10px;padding:12px 16px;font-weight:700;cursor:pointer;white-space:nowrap}.upload input{display:none}.message{background:#ecfeff;border:1px solid #a5f3fc;padding:12px;border-radius:10px;margin:12px 0}.toolbar{display:flex;gap:16px;align-items:center;margin:16px 0}.toolbar label{font-size:14px;color:#334155}.toolbar select,.toolbar input{margin-left:8px;border:1px solid #cbd5e1;border-radius:8px;padding:8px;background:#fff}.grid{display:grid;gap:16px}.kpis{grid-template-columns:repeat(6,minmax(0,1fr));margin-bottom:16px}.two{grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:16px}.card,.panel{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.04)}.label{font-size:12px;text-transform:uppercase;color:#64748b;font-weight:700}.value{font-size:24px;font-weight:800;margin-top:6px}.sub{font-size:12px;color:#64748b}.bar{display:grid;grid-template-columns:90px 1fr 50px;gap:10px;align-items:center;margin:10px 0}.bar div{height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden}.bar i{display:block;height:100%;background:#0f766e}.theme{display:flex;justify-content:space-between;border-bottom:1px solid #eef2f7;padding:10px 0}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;border-bottom:1px solid #eef2f7;padding:10px;vertical-align:top}th{color:#64748b;font-size:12px;text-transform:uppercase}@media(max-width:1100px){.kpis{grid-template-columns:repeat(2,1fr)}.two{grid-template-columns:1fr}.header{flex-direction:column}}
    `}</style>
  </main>;
}

function Table({ rows, showNegatives = false }) {
  return <table><thead><tr><th>Product</th><th>Reviews</th><th>Avg Rating</th>{showNegatives && <th>1-2★</th>}</tr></thead><tbody>{rows.map(r => <tr key={r.product_title}><td>{r.product_title}</td><td>{r.reviews}</td><td>{r.avg.toFixed(2)}</td>{showNegatives && <td>{r.negatives}</td>}</tr>)}</tbody></table>;
}
