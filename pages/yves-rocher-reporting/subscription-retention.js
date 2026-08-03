import { useEffect, useState } from "react";
import Head from "next/head";
import { ReportingNav } from "../../lib/yr-reporting/components";

const sections = [
  { id: "overview", n: "01", title: "Executive overview" },
  { id: "experience", n: "02", title: "Current experience" },
  { id: "confusion", n: "03", title: "Why the UX is confusing" },
  { id: "options", n: "04", title: "Three UX options" },
  { id: "benchmark", n: "05", title: "Competitor benchmark" },
  { id: "reasons", n: "06", title: "Cancellation reasons" },
  { id: "retention", n: "07", title: "Retention strategy" },
  { id: "decisions", n: "08", title: "Decisions with Ron" },
];

const questions = {
  overview: [
    "How large is the cancellation problem today?",
    "What share is linked to customers not realizing they subscribed?",
    "What retention target do we want to reach?",
  ],
  experience: [
    "Where do customers start the subscription: PDP, cart, or another entry point?",
    "Do PDP and cart communicate the same price, frequency and recurring commitment?",
    "At what exact moment does the customer understand that future orders are automatic?",
  ],
  confusion: [
    "Is 30% today versus 25% later creating unnecessary complexity?",
    "Is “Subscribe” understood as recurring delivery or as joining a site/newsletter?",
    "Is delivery frequency visible enough before payment?",
    "Should the future price and next billing date be shown more prominently?",
  ],
  options: [
    "Do we keep the current 30% / 25% commercial model or simplify it?",
    "Which wording is clearest: Subscribe & Save, Auto-delivery, or Never run out?",
    "Should we require an explicit recurring-order confirmation?",
    "Which option gives the best balance between conversion and transparency?",
  ],
  benchmark: [
    "Which competitor approach is closest to the Yves Rocher brand tone?",
    "Which elements should be mandatory on our PDP and cart?",
    "Should customers see the next delivery date before checkout?",
  ],
  reasons: [
    "Which cancellation reasons must agents capture systematically?",
    "How will we distinguish misunderstanding from product, price and frequency issues?",
    "How much data do we need before changing the offer?",
  ],
  retention: [
    "Which offers can Customer Service approve without escalation?",
    "What value limit should apply when customers choose another product?",
    "When should we offer a free next delivery versus a skipped occurrence?",
    "How do we prevent abuse while keeping the experience generous?",
  ],
  decisions: [
    "Who owns the UX change, the data tracking and the Customer Service playbook?",
    "What can be tested immediately, and what needs development?",
    "Which KPIs will determine whether the test is successful?",
  ],
};

function Questions({ id }) {
  return (
    <div className="questionBox">
      <div className="questionTitle"><span>?</span><b>Questions to discuss with Ron</b></div>
      <ul>{questions[id].map((q) => <li key={q}>{q}</li>)}</ul>
    </div>
  );
}

function Notes({ id, notes, setNotes }) {
  return (
    <aside className="notes">
      <div className="notesTitle"><b>Notes / Decisions with Ron</b><small>Saved automatically in this browser</small></div>
      <textarea value={notes[id] || ""} onChange={(e) => setNotes(id, e.target.value)} placeholder="Write decisions, answers, owners and next steps…" />
    </aside>
  );
}

function Section({ id, n, title, children, notes, setNotes }) {
  return (
    <section id={id} className="sectionCard">
      <div className="content">
        <div className="sectionTitle"><span>{n}</span><h2>{title}</h2></div>
        {children}
        <Questions id={id} />
      </div>
      <Notes id={id} notes={notes} setNotes={setNotes} />
    </section>
  );
}

function Offer({ title, price, copy, selected, badge }) {
  return <div className={`offer ${selected ? "selected" : ""}`}><span className="radio">{selected ? "✓" : ""}</span><div><b>{title}</b>{badge && <em>{badge}</em>}<p>{copy}</p></div><strong>{price}</strong></div>;
}

export default function SubscriptionRetention() {
  const [notes, setNotesState] = useState({});
  useEffect(() => { try { setNotesState(JSON.parse(localStorage.getItem("yr_subscription_notes") || "{}")); } catch (_) {} }, []);
  const setNotes = (id, value) => { const next = { ...notes, [id]: value }; setNotesState(next); try { localStorage.setItem("yr_subscription_notes", JSON.stringify(next)); } catch (_) {} };

  return <>
    <Head><title>Subscription Retention | Yves Rocher Hub</title></Head>
    <main className="page">
      <ReportingNav />
      <div className="hero">
        <div><p className="crumb">Yves Rocher · Subscription challenge</p><h1>Subscription Retention Strategy</h1><h3>Clearer choices. Happier subscribers.</h3><p className="lead">A discussion workspace for Ron, Product and Customer Service, combining UX clarity, competitor learnings and practical retention options.</p></div>
        <div className="goal"><span>◎</span><div><b>Our goal</b><p>Increase retention by making subscription value obvious and giving customers simple ways to keep their routine.</p></div></div>
      </div>

      <nav className="jump">{sections.map(s => <a key={s.id} href={`#${s.id}`}><span>{s.n}</span>{s.title}</a>)}</nav>

      <Section {...sections[0]} notes={notes} setNotes={setNotes}>
        <div className="overviewGrid">
          <article><i className="red">!</i><div><b>Current issue</b><p>Many cancellation requests appear to come from customers who did not fully understand the recurring model or future pricing.</p></div></article>
          <article><i className="green">◎</i><div><b>Objective</b><p>Make the value and recurring commitment explicit, while offering simple retention choices when customers hesitate.</p></div></article>
          <article><i className="orange">▥</i><div><b>Business risk</b><p>Lost recurring revenue, avoidable dissatisfaction and a negative impact on brand trust.</p></div></article>
          <article><i className="blue">?</i><div><b>Open decisions</b><p>UX design, wording, retention offers, eligibility rules and cancellation flow.</p></div></article>
        </div>
      </Section>

      <Section {...sections[1]} notes={notes} setNotes={setNotes}>
        <div className="experienceGrid">
          <div><h3>Product Detail Page (PDP)</h3><img src="/subscription/pdp.png" alt="Current PDP subscription experience"/><div className="finding good"><b>What is clear</b><p>First-order discount, future discount, frequency and cancellation flexibility are visible.</p></div></div>
          <div><h3>Floating Cart</h3><img src="/subscription/cart.png" alt="Current cart subscription experience"/><div className="finding bad"><b>What is missing</b><p>Future price and cancellation reassurance disappear; recurring delivery becomes a secondary line.</p></div></div>
        </div>
        <div className="answer"><b>Conclusion</b><p>The wording is broadly consistent, but the UX is not equivalent. The PDP explains; the cart merely confirms.</p></div>
      </Section>

      <Section {...sections[2]} notes={notes} setNotes={setNotes}>
        <div className="issueGrid">
          {[['%','Discount structure','30% today and 25% later require customers to process two different benefits.'],['$','Price hierarchy','The first price is dominant while the future recurring price is easy to miss.'],['↻','Recurring nature','“Subscribe” can be misunderstood as joining a site or newsletter.'],['▣','Delivery frequency','“Every 2 months” is small, grey and visually secondary.'],['→','Journey consistency','The cart removes information that was available on the PDP.']].map(([i,t,p]) => <article key={t}><i>{i}</i><b>{t}</b><p>{p}</p></article>)}
        </div>
      </Section>

      <Section {...sections[3]} notes={notes} setNotes={setNotes}>
        <div className="optionsGrid">
          <article className="option"><span>Option A</span><h3>Maximum clarity</h3><small>Keep current commercial model</small><Offer title="Buy once" price="$34.00" copy="One-time purchase. No automatic renewal."/><Offer selected title="Auto-delivery every 2 months" price="$23.80 today" badge="Save 30%" copy="Then $25.50 every 2 months. Skip, pause or cancel anytime."/><div className="confirm">✓ I understand this is a recurring order billed every 2 months.</div></article>
          <article className="option recommended"><span>Option B · Recommended</span><h3>One simple recurring price</h3><small>Best for trust and recall</small><Offer title="Buy once" price="$34.00" copy="One-time purchase."/><Offer selected title="Auto-delivery" price="$25.50" badge="Save 25%" copy="The same price today and on every future delivery."/><div className="selectRow">Deliver every <b>2 months⌄</b></div></article>
          <article className="option"><span>Option C</span><h3>Benefit-led choice</h3><small>Softer beauty-friendly wording</small><Offer title="One-time purchase" price="$34.00" copy="Perfect when you only need one bottle."/><Offer selected title="Never run out" price="$23.80 today" badge="Auto-delivery" copy="We will send it every 2 months. Future deliveries are $25.50."/><div className="chips"><em>Skip anytime</em><em>Swap products</em><em>Cancel in one click</em></div></article>
        </div>
      </Section>

      <Section {...sections[4]} notes={notes} setNotes={setNotes}>
        <div className="benchmarkGrid">
          <article><span>A</span><div><small>Amazon</small><h3>Subscribe & Save</h3><p>Strong familiarity, with delivery schedule and subscription management central to the program.</p><b>Learning: keep “save”, but make automatic shipment unmistakable.</b></div></article>
          <article><span>S</span><div><small>Sephora</small><h3>Auto-Replenish</h3><p>The wording itself describes the recurring action rather than asking customers to interpret “subscribe”.</p><b>Learning: action-based wording can reduce misunderstanding.</b></div></article>
          <article><span>U</span><div><small>Ulta Beauty</small><h3>Auto Replenish</h3><p>Automatic delivery, savings and the ability to pause, skip or cancel are communicated together.</p><b>Learning: pair the benefit with customer control.</b></div></article>
        </div>
      </Section>

      <Section {...sections[5]} notes={notes} setNotes={setNotes}>
        <div className="reasonWrap"><div className="reasonPrompt"><small>Agent question</small><h3>“What is the main reason you want to cancel?”</h3><p>Capture one primary reason before selecting a retention offer.</p></div><div className="reasonList">{['I did not know I subscribed','I still have enough product','I do not like the product','The price is too high','I want another product','I need a different frequency','Other'].map((x,i)=><div key={x}><span>{i+1}</span><b>{x}</b><em>Track</em></div>)}</div></div>
      </Section>

      <Section {...sections[6]} notes={notes} setNotes={setNotes}>
        <div className="retentionGrid">
          <article><i>Ⅱ</i><small>Option 1</small><h3>Skip one occurrence</h3><p>Cancel the next scheduled shipment. No product and no payment. The subscription remains active.</p><b>Best for:</b><span>Too much product, travel, temporary budget issue.</span></article>
          <article className="featured"><i>★</i><small>Option 2</small><h3>Get the next one free</h3><p>The next product is shipped, but the customer is not charged for that occurrence.</p><b>Best for:</b><span>Customer was unaware and we want to rebuild trust.</span></article>
          <article><i>⇄</i><small>Option 3</small><h3>Choose another product</h3><p>Replace the next delivery with another eligible product, potentially up to $5 more.</p><b>Best for:</b><span>Product dislike, discovery and cross-sell.</span></article>
        </div>
        <div className="guardrail"><b>Guardrail to define:</b> eligibility, maximum value, number of uses per customer and agent approval limits.</div>
      </Section>

      <Section {...sections[7]} notes={notes} setNotes={setNotes}>
        <div className="decisionGrid">
          {['UX option and wording','Commercial pricing model','Retention offer eligibility','Product-swap value limit','Customer Service authority','Test duration and KPIs'].map((x,i)=><article key={x}><span>{String(i+1).padStart(2,'0')}</span><h3>{x}</h3><p>Decision</p><div></div><p>Owner / Deadline</p><div></div></article>)}
        </div>
      </Section>
    </main>
    <style jsx global>{`
      html{scroll-behavior:smooth} body{background:#f7f4ee;color:#17351f}.page{min-height:100vh;padding:22px 28px 60px;background:linear-gradient(145deg,#faf8f3,#f1f6ef)}
      .page>*{box-sizing:border-box}.hero,.jump,.sectionCard{max-width:1500px;margin-left:auto;margin-right:auto}.hero{display:grid;grid-template-columns:1.25fr .75fr;gap:34px;padding:34px 8px 26px}.crumb{color:#587138;font-weight:800;margin:0 0 18px}.hero h1{font:800 clamp(42px,5vw,68px)/1.02 Georgia,serif;margin:0;color:#123d24}.hero h3{font-size:26px;margin:10px 0 12px;color:#252b27}.lead{font-size:17px;line-height:1.65;max-width:780px;color:#556059}.goal{align-self:center;display:flex;gap:16px;background:#fff;border:1px solid #bfd5bc;border-radius:22px;padding:24px;box-shadow:0 14px 38px rgba(34,72,42,.08)}.goal>span{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#eaf3e4;font-size:28px}.goal b{font-size:17px}.goal p{line-height:1.55;margin:8px 0 0;color:#4f5c53}
      .jump{display:flex;gap:10px;overflow:auto;padding:0 0 16px}.jump a{min-width:160px;background:#fff;border:1px solid #d7e2d4;border-radius:14px;padding:11px 13px;text-decoration:none;color:#243b2a;font-weight:800;font-size:13px}.jump a span{display:block;color:#78904b;font-size:11px;margin-bottom:4px}
      .sectionCard{display:grid;grid-template-columns:minmax(0,1fr) 390px;background:#fff;border:1px solid #e1e5dc;border-radius:24px;margin-bottom:22px;overflow:hidden;box-shadow:0 16px 42px rgba(33,62,38,.08)}.content{padding:28px 30px}.sectionTitle{display:flex;align-items:center;gap:12px;margin-bottom:23px}.sectionTitle span{color:#58753c;font-weight:900}.sectionTitle h2{font:800 28px/1.15 Georgia,serif;margin:0;color:#123d24}.notes{padding:24px;background:#fbfaf6;border-left:1px solid #e7e5dc;display:flex;flex-direction:column;min-height:420px}.notesTitle b{display:block;font-size:16px}.notesTitle small{display:block;color:#8a918b;margin-top:4px}.notes textarea{flex:1;min-height:260px;margin-top:14px;border:1px solid #d9d9cf;border-radius:16px;padding:16px;font:14px/1.6 Inter,Arial;resize:vertical;background:#fff}
      .questionBox{margin-top:22px;background:#f2f6e7;border:1px solid #d5e0b5;border-radius:17px;padding:16px 18px}.questionTitle{display:flex;align-items:center;gap:9px;color:#264c2d}.questionTitle span{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#dce98a;font-weight:900}.questionBox ul{margin:12px 0 0;padding-left:22px;display:grid;gap:8px;color:#35483a;line-height:1.45}.questionBox li::marker{color:#6f8837}
      .overviewGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.overviewGrid article{display:flex;gap:14px;padding:18px;border:1px solid #e3e8df;border-radius:18px;background:#fcfdfb}.overviewGrid i{flex:0 0 44px;height:44px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:22px}.red{background:#ffe4df;color:#c63b2d}.green{background:#e5f2df;color:#2f7b3a}.orange{background:#ffedd7;color:#d76b17}.blue{background:#e1effa;color:#2571ad}.overviewGrid b{font-size:16px}.overviewGrid p{margin:7px 0 0;color:#526057;line-height:1.55}
      .experienceGrid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.experienceGrid h3{font-size:18px;margin:0 0 10px}.experienceGrid img{width:100%;height:390px;object-fit:contain;background:#fafafa;border:1px solid #e2e5df;border-radius:16px}.finding{margin-top:10px;padding:13px 15px;border-radius:14px}.finding p{margin:5px 0 0;line-height:1.45}.finding.good{background:#eaf5e8}.finding.bad{background:#fff0e3}.answer{display:flex;gap:14px;margin-top:16px;background:#153f27;color:#fff;padding:16px 18px;border-radius:15px}.answer b{color:#dce98a}.answer p{margin:0;line-height:1.5}
      .issueGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.issueGrid article{padding:17px;border:1px solid #e0e6dd;border-radius:17px;background:#fbfcfa}.issueGrid i{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#e9f1e3;font-style:normal;font-weight:900;margin-bottom:12px}.issueGrid b{display:block}.issueGrid p{font-size:13px;line-height:1.5;color:#59655d}
      .optionsGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.option{padding:18px;border:1px solid #dce5d9;border-radius:20px;background:#fafcf9}.option.recommended{border:2px solid #2f7b45;box-shadow:0 12px 26px rgba(47,123,69,.12)}.option>span{display:inline-block;background:#173f28;color:#fff;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:900;text-transform:uppercase}.option h3{font:800 22px Georgia,serif;margin:13px 0 3px}.option>small{color:#748078}.offer{display:grid;grid-template-columns:24px 1fr auto;gap:10px;padding:13px;margin-top:13px;border:1px solid #dfe4dc;border-radius:14px;background:#fff}.offer.selected{border:2px solid #21824a;background:#f3fbf4}.radio{width:20px;height:20px;border:1px solid #a9b2ab;border-radius:50%;display:grid;place-items:center}.selected .radio{background:#21824a;color:#fff}.offer b{font-size:13px}.offer em{display:inline-block;margin-left:6px;background:#dce98a;padding:2px 6px;border-radius:999px;font-size:9px;font-style:normal;font-weight:900}.offer p{font-size:11px;line-height:1.4;color:#68736b;margin:5px 0 0}.offer strong{font-size:13px;white-space:nowrap}.confirm,.selectRow{margin-top:11px;padding:10px;border-radius:12px;background:#fff;border:1px dashed #aebbab;font-size:11px}.selectRow{display:flex;justify-content:space-between}.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:11px}.chips em{font-style:normal;background:#e8efe5;border-radius:999px;padding:6px 8px;font-size:10px;font-weight:800}
      .benchmarkGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.benchmarkGrid article{display:grid;grid-template-columns:46px 1fr;gap:14px;padding:19px;border:1px solid #e0e6dd;border-radius:18px;background:#fbfcfa}.benchmarkGrid article>span{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:#173f28;color:#fff;font:800 21px Georgia}.benchmarkGrid small{color:#718740;text-transform:uppercase;font-weight:900}.benchmarkGrid h3{font:800 22px Georgia,serif;margin:5px 0 10px}.benchmarkGrid p{font-size:13px;line-height:1.5;color:#58645c}.benchmarkGrid b{font-size:12px;line-height:1.45;color:#2b5433}
      .reasonWrap{display:grid;grid-template-columns:.85fr 1.15fr;gap:18px}.reasonPrompt{background:#173f28;color:#fff;padding:26px;border-radius:20px}.reasonPrompt small{color:#dce98a;text-transform:uppercase;font-weight:900}.reasonPrompt h3{font:800 31px/1.12 Georgia,serif;margin:13px 0}.reasonPrompt p{color:#dce4df}.reasonList{display:grid;gap:8px}.reasonList div{display:grid;grid-template-columns:30px 1fr auto;align-items:center;padding:11px 13px;border:1px solid #dfe5dc;border-radius:13px}.reasonList span{width:25px;height:25px;border-radius:50%;display:grid;place-items:center;background:#edf2e9;font-size:11px;font-weight:900}.reasonList em{font-style:normal;color:#78904b;font-size:11px;font-weight:800}
      .retentionGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.retentionGrid article{padding:20px;border:1px solid #dfe5dc;border-radius:20px;background:#fbfcfa}.retentionGrid article.featured{background:#173f28;color:#fff;transform:translateY(-4px)}.retentionGrid i{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#e8f0e3;font-style:normal;font-size:20px;color:#173f28}.retentionGrid small{display:block;color:#78904b;text-transform:uppercase;font-weight:900;margin-top:13px}.featured small{color:#dce98a}.retentionGrid h3{font:800 24px Georgia,serif;margin:6px 0 10px}.retentionGrid p{line-height:1.5;color:#59655d}.featured p{color:#d9e2dc}.retentionGrid b{display:block;margin-top:13px}.retentionGrid span{font-size:12px;line-height:1.45}.guardrail{margin-top:16px;padding:14px 16px;border-radius:14px;background:#fff1d9;border:1px solid #ecd6a8;color:#77521f}
      .decisionGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.decisionGrid article{display:grid;grid-template-columns:38px 1fr;padding:15px;border:1px solid #e0e5dd;border-radius:15px}.decisionGrid article>span{grid-row:1/6;width:31px;height:31px;border-radius:9px;display:grid;place-items:center;background:#173f28;color:#fff;font-size:10px;font-weight:900}.decisionGrid h3{margin:2px 0 8px;font-size:16px}.decisionGrid p{margin:5px 0 2px;color:#7c857e;font-size:9px;text-transform:uppercase;font-weight:900}.decisionGrid article div{height:18px;border-bottom:1px solid #aeb8b0}
      @media(max-width:1150px){.sectionCard{grid-template-columns:1fr}.notes{border-left:0;border-top:1px solid #e7e5dc;min-height:300px}.issueGrid{grid-template-columns:repeat(3,1fr)}.optionsGrid,.benchmarkGrid,.retentionGrid{grid-template-columns:1fr}.hero{grid-template-columns:1fr}}
      @media(max-width:760px){.page{padding:12px}.content{padding:20px}.hero h1{font-size:40px}.overviewGrid,.experienceGrid,.reasonWrap,.decisionGrid{grid-template-columns:1fr}.issueGrid{grid-template-columns:1fr}.experienceGrid img{height:280px}.sectionTitle h2{font-size:24px}}
    `}</style>
  </>;
}
