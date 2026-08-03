import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { ReportingNav } from "../../lib/yr-reporting/components";

const slides = [
  { id: "overview", eyebrow: "01 · Business challenge", title: "Make subscriptions clear — then retain with care" },
  { id: "journey", eyebrow: "02 · Current experience", title: "The PDP explains more. The cart confirms less." },
  { id: "ux-options", eyebrow: "03 · UX proposals", title: "Three clearer ways to present the offer" },
  { id: "benchmark", eyebrow: "04 · Competitor benchmark", title: "What leading beauty and retail programs make explicit" },
  { id: "reasons", eyebrow: "05 · Customer listening", title: "Capture the real reason before choosing the offer" },
  { id: "retention", eyebrow: "06 · Retention levers", title: "Three simple choices for the customer" },
  { id: "playbook", eyebrow: "07 · Service playbook", title: "Match the save offer to the cancellation reason" },
  { id: "decisions", eyebrow: "08 · Decisions", title: "What we need to align with Ron" }
];

function NotePad({ slideId, value, onChange }) {
  return (
    <aside className="subNotes">
      <div className="subNotesHead">
        <div>
          <span>Meeting notes</span>
          <small>Saved automatically in this browser</small>
        </div>
        <span className="subPencil">✎</span>
      </div>
      <textarea
        aria-label={`Notes for ${slideId}`}
        value={value || ""}
        onChange={(e) => onChange(slideId, e.target.value)}
        placeholder="Decisions, questions, owner, next step…"
      />
    </aside>
  );
}

function Slide({ slide, active, notes, onNoteChange, children }) {
  return (
    <section id={slide.id} className={`subSlide ${active ? "isActive" : ""}`} aria-hidden={!active}>
      <div className="subSlideMain">
        <header className="subSlideHeader">
          <p>{slide.eyebrow}</p>
          <h2>{slide.title}</h2>
        </header>
        <div className="subSlideContent">{children}</div>
      </div>
      <NotePad slideId={slide.id} value={notes[slide.id]} onChange={onNoteChange} />
    </section>
  );
}

function OfferCard({ label, title, price, detail, tag, selected }) {
  return (
    <div className={`offerCard ${selected ? "selected" : ""}`}>
      <div className="offerRadio">{selected ? "✓" : ""}</div>
      <div className="offerBody">
        <div className="offerTitleRow"><b>{title}</b>{tag && <span>{tag}</span>}</div>
        <p>{detail}</p>
      </div>
      <div className="offerPrice"><small>{label}</small><strong>{price}</strong></div>
    </div>
  );
}

export default function SubscriptionRetention() {
  const [active, setActive] = useState(0);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("yr_subscription_workshop_notes") || "{}");
      setNotes(saved);
    } catch (_) {}
  }, []);

  const updateNote = (id, value) => {
    const next = { ...notes, [id]: value };
    setNotes(next);
    try { localStorage.setItem("yr_subscription_workshop_notes", JSON.stringify(next)); } catch (_) {}
  };

  const progress = useMemo(() => `${active + 1} / ${slides.length}`, [active]);
  const go = (index) => setActive(Math.max(0, Math.min(slides.length - 1, index)));

  return (
    <>
      <Head><title>Subscription Retention | Yves Rocher Hub</title></Head>
      <main className="subPage">
        <ReportingNav />

        <section className="subHero">
          <div>
            <p className="subKicker">Yves Rocher · Subscription challenge</p>
            <h1>Clearer choices.<br/>Happier subscribers.</h1>
            <p>Discussion workspace for Ron, Product and Customer Service — combining UX clarity, market learnings and practical retention options.</p>
          </div>
          <div className="subHeroBadge">
            <span>North star</span>
            <b>Reduce “I didn’t know” cancellations</b>
            <small>without creating friction for customers who genuinely want auto-delivery.</small>
          </div>
        </section>

        <nav className="subStepper" aria-label="Subscription workshop sections">
          {slides.map((slide, index) => (
            <button key={slide.id} className={index === active ? "active" : ""} onClick={() => go(index)}>
              <span>{String(index + 1).padStart(2, "0")}</span>{slide.title}
            </button>
          ))}
        </nav>

        <div className="subDeck">
          <Slide slide={slides[0]} active={active === 0} notes={notes} onNoteChange={updateNote}>
            <div className="summaryGrid">
              <article className="summaryCard red"><span>Customer signal</span><b>Many cancellation requests</b><p>One known driver is that customers did not realize they had started a recurring order.</p></article>
              <article className="summaryCard amber"><span>Experience signal</span><b>Even internally, the offer was interpreted differently</b><p>Shani, Neva and Bruno needed several minutes to align on pricing, timing and recurrence.</p></article>
              <article className="summaryCard green"><span>Opportunity</span><b>Fix clarity + introduce thoughtful save offers</b><p>Reduce avoidable dissatisfaction while preserving subscription revenue and product discovery.</p></article>
            </div>
            <div className="principleBanner"><b>Guiding principle</b><span>Transparency first. Retention second. The best retained customer is one who fully understands the value.</span></div>
          </Slide>

          <Slide slide={slides[1]} active={active === 1} notes={notes} onNoteChange={updateNote}>
            <div className="journeyGrid">
              <figure className="experienceCard"><div className="experienceLabel"><span>PDP</span><b>More complete</b></div><img src="/subscription/pdp.png" alt="Current Yves Rocher PDP subscription selection"/><figcaption><b>What is visible</b><ul><li>30% today and 25% later</li><li>Delivery every 2 months</li><li>Pause or cancel message</li></ul></figcaption></figure>
              <figure className="experienceCard"><div className="experienceLabel"><span>Floating cart</span><b>Less explicit</b></div><img src="/subscription/cart.png" alt="Current Yves Rocher cart subscription confirmation"/><figcaption><b>What is visible</b><ul><li>30% saving and discounted price</li><li>“Delivered every 2 months” in light text</li><li>No future price or cancellation reassurance</li></ul></figcaption></figure>
            </div>
            <div className="answerStrip"><b>Answer:</b><span>The wording is broadly consistent, but the UX is not equivalent. The PDP provides context; the floating cart compresses the commitment into a much weaker visual signal.</span></div>
          </Slide>

          <Slide slide={slides[2]} active={active === 2} notes={notes} onNoteChange={updateNote}>
            <div className="optionTabs">
              <article className="mockupPanel">
                <div className="mockupHead"><span>Option A</span><b>Maximum clarity</b><small>Keep current commercial model</small></div>
                <OfferCard title="Buy once" price="$34.00" detail="One-time purchase. No automatic renewal." />
                <OfferCard selected title="Auto-delivery every 2 months" price="$23.80" label="Today" detail="Then $25.50 every 2 months. Skip, pause or cancel anytime." tag="Save 30% today" />
                <div className="microConfirm">✓ I understand this is a recurring order billed every 2 months.</div>
              </article>
              <article className="mockupPanel">
                <div className="mockupHead"><span>Option B</span><b>One simple subscription price</b><small>Best for trust and recall</small></div>
                <OfferCard title="Buy once" price="$34.00" detail="One-time purchase." />
                <OfferCard selected title="Auto-delivery" price="$25.50" label="Every delivery" detail="Save 25% today and on every future delivery. Choose your frequency." tag="Same price each time" />
                <div className="frequencyRow"><span>Deliver every</span><b>2 months⌄</b></div>
              </article>
              <article className="mockupPanel">
                <div className="mockupHead"><span>Option C</span><b>Benefit-led choice</b><small>Softer, beauty-friendly wording</small></div>
                <OfferCard title="One-time purchase" price="$34.00" detail="Perfect when you only need one bottle." />
                <OfferCard selected title="Never run out" price="$23.80" label="First delivery" detail="We’ll send it every 2 months. Future deliveries are $25.50." tag="Auto-delivery" />
                <div className="benefitChips"><span>Skip anytime</span><span>Swap products</span><span>Cancel in one click</span></div>
              </article>
            </div>
          </Slide>

          <Slide slide={slides[3]} active={active === 3} notes={notes} onNoteChange={updateNote}>
            <div className="benchmarkGrid">
              <article className="benchmarkCard"><div className="brandDot">A</div><div><span>Amazon</span><h3>Subscribe & Save</h3><p>Strong familiarity with the phrase, but the recurring delivery schedule and subscription management are central to the program.</p><b>Learning for YR: keep “save,” but make the automatic shipment unmistakable.</b></div></article>
              <article className="benchmarkCard"><div className="brandDot">S</div><div><span>Sephora</span><h3>Auto-Replenish</h3><p>The name describes the customer outcome: products are replenished automatically. Subscription FAQs separately explain billing, changes and cancellation.</p><b>Learning for YR: “Auto-delivery” or “Auto-replenish” is clearer than “Subscribe” alone.</b><a href="https://www.sephora.com/beauty/auto-replenish" target="_blank" rel="noreferrer">Open official example ↗</a></div></article>
              <article className="benchmarkCard"><div className="brandDot">U</div><div><span>Ulta Beauty</span><h3>Replenish & Save</h3><p>Uses a consistent saving on recurring orders and highlights scheduling, product management and free shipping.</p><b>Learning for YR: a stable benefit is easier to understand than 30% first / 25% later.</b><a href="https://www.ulta.com/guestservices/ways-to-shop/replenish-and-save" target="_blank" rel="noreferrer">Open official example ↗</a></div></article>
            </div>
            <div className="benchmarkTakeaway"><span>Common pattern</span><b>Benefit + recurrence + frequency + control</b><p>The strongest programs do not rely on a discount label alone. They explicitly connect the saving to automatic, scheduled deliveries that the customer can manage.</p></div>
          </Slide>

          <Slide slide={slides[4]} active={active === 4} notes={notes} onNoteChange={updateNote}>
            <div className="reasonLayout">
              <div className="reasonQuestion"><span>Before cancellation</span><h3>What is the main reason you want to stop?</h3><p>One click, customer-friendly and reportable.</p></div>
              <div className="reasonList">
                {["I didn’t know this was a recurring order","I have enough product","I don’t like this product","It is too expensive","I want a different product","I no longer need it","Other"].map((reason, i) => <div key={reason}><span>{i+1}</span><b>{reason}</b><em>→</em></div>)}
              </div>
            </div>
            <div className="dataRow"><div><span>Capture</span><b>Reason selected</b></div><div><span>Measure</span><b>Offer displayed</b></div><div><span>Learn</span><b>Accepted / declined</b></div><div><span>Improve</span><b>30 / 60 / 90-day retention</b></div></div>
          </Slide>

          <Slide slide={slides[5]} active={active === 5} notes={notes} onNoteChange={updateNote}>
            <div className="leverGrid">
              <article className="leverCard"><div className="leverIcon">Ⅱ</div><span>Lowest cost</span><h3>Skip one occurrence</h3><p>Cancel the next scheduled delivery. The customer receives nothing and pays nothing, while the subscription remains active for the following cycle.</p><div className="leverExample"><small>Next shipment</small><b>Skipped</b><small>Next charge</small><b>$0</b></div></article>
              <article className="leverCard featured"><div className="leverIcon">🎁</div><span>Strongest recovery</span><h3>Get the next one free</h3><p>The customer receives the usual product at the next cycle but is not charged. Useful after a misunderstanding or a poor first experience.</p><div className="leverExample"><small>Next shipment</small><b>Delivered</b><small>Next charge</small><b>$0</b></div></article>
              <article className="leverCard"><div className="leverIcon">↻</div><span>Discovery & cross-sell</span><h3>Choose another product</h3><p>Replace the next delivery with another eligible product, potentially allowing a value up to $5 higher, subject to Ron’s approval.</p><div className="leverExample"><small>Next shipment</small><b>Swapped</b><small>Value rule</small><b>Up to +$5?</b></div></article>
            </div>
            <div className="guardrail"><b>Important guardrail</b><span>Offers should be targeted by reason and customer history — not automatically shown to every cancellation request.</span></div>
          </Slide>

          <Slide slide={slides[6]} active={active === 6} notes={notes} onNoteChange={updateNote}>
            <div className="playbookTable">
              <div className="playbookHead"><span>Cancellation reason</span><span>Recommended first action</span><span>Save offer</span><span>Why it helps</span></div>
              <div><b>“I was not aware”</b><span>Acknowledge and explain clearly</span><strong>Next one free OR swap</strong><em>Repairs trust and gives time to experience the product</em></div>
              <div><b>“I have too much”</b><span>Offer a longer interval</span><strong>Skip one occurrence</strong><em>Solves timing without discounting the product</em></div>
              <div><b>“I don’t like it”</b><span>Ask what result or format they prefer</span><strong>Choose another product</strong><em>Turns dissatisfaction into discovery</em></div>
              <div><b>“Too expensive”</b><span>Clarify future price and value</span><strong>Skip one OR next one free</strong><em>Creates immediate relief while testing future willingness</em></div>
              <div><b>“I no longer need it”</b><span>Respect the choice</span><strong>Easy cancellation</strong><em>Protects trust; do not over-retain</em></div>
            </div>
            <div className="serviceTone"><span>Recommended tone</span><b>“I can take care of that. Before I cancel it, I can also offer one option that may suit you better…”</b></div>
          </Slide>

          <Slide slide={slides[7]} active={active === 7} notes={notes} onNoteChange={updateNote}>
            <div className="decisionGrid">
              {["Preferred UX option","Customer-facing terminology","30% first / 25% future pricing","Eligible cancellation reasons","Next one free — limits","Product swap — +$5 rule","Where the offer appears","KPIs and test duration"].map((item, i) => <article key={item}><span>{String(i+1).padStart(2,"0")}</span><h3>{item}</h3><p>Decision:</p><div className="decisionLine"></div><p>Owner / due date:</p><div className="decisionLine small"></div></article>)}
            </div>
          </Slide>
        </div>

        <footer className="subControls">
          <button onClick={() => go(active - 1)} disabled={active === 0}>← Previous</button>
          <div><b>{progress}</b><span>{slides[active].eyebrow}</span></div>
          <button onClick={() => go(active + 1)} disabled={active === slides.length - 1}>Next →</button>
        </footer>
      </main>
    </>
  );
}
