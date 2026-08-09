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
  { id: "toolbox", n: "08", title: "Retention toolbox" },
  { id: "kpis", n: "09", title: "Measuring success" },
  { id: "decisions", n: "10", title: "Decisions with Ron" },
];



const meetingRecap = {
  overview: {
    points: [
      "Churn is material: roughly half of subscribers do not reach the first replenishment, and retention drops sharply again on later orders.",
      "Ron recommends following subscriber retention in OrderGroove rather than only subscription-per-item retention.",
      "A small retention improvement can have a large revenue impact; moving first-replenishment retention from 50% to 55% was framed as roughly +10% revenue on that step.",
    ],
    actions: [
      "Use OrderGroove cohort / subscriber retention as the baseline dashboard; the team already has access.",
      "Track first replenishment and later-order retention separately.",
      "Ron: define the target subscriber retention KPI.",
    ],
  },
  experience: {
    points: [
      "Most subscription sign-ups come from the PDP, not the floating cart.",
      "The team confirmed that the PDP contains more information, but the 30% first-order discount versus 25% recurring discount remains hard to read quickly.",
      "The floating cart removes several explanations that are visible on the PDP.",
    ],
    actions: [
      "Keep the PDP as the priority UX workstream.",
      "Review whether the cart should repeat future price, recurrence and control messages more clearly.",
    ],
  },
  confusion: {
    points: [
      "The 30% / 25% split is intentional: the stronger first-order incentive drives enrollment, while profitability comes from recurring orders.",
      "The word ‘Subscribe’ can be understood in more than one context; Jerome confirmed the term is used both for recurring purchases and other sign-ups.",
      "Frequency is currently visually secondary, while the customer has to process several concepts at once.",
    ],
    actions: [
      "Do not change the commercial model only for simplicity until the new 25% recurring discount has enough retention data.",
      "Test clearer recurring wording and stronger frequency visibility without weakening conversion.",
    ],
  },
  options: {
    points: [
      "The team reacted positively to the clearer mock-ups, especially the flexible, friendly presentation with visible skip / swap / cancel controls.",
      "Ron’s priority is retention rather than enrollment because enrollment is already strong.",
    ],
    actions: [
      "Prepare a testable PDP version focused on clarity and recurring commitment.",
      "Measure impact on both enrollment and subscriber retention before changing the pricing structure.",
    ],
  },
  benchmark: {
    points: [
      "Amazon keeps a clear one-time versus Subscribe & Save choice; Sephora and Ulta use Auto-Replenish / Replenish & Save wording.",
      "The examples shown use around 5% savings, while Yves Rocher currently offers 25% on recurring orders.",
      "Competitors make frequency, recurring nature and cancellation / control language more explicit in different ways.",
    ],
    actions: [
      "Borrow clarity patterns, not competitor discount levels.",
      "Keep YR’s stronger value proposition but make the recurring commitment and controls unmistakable.",
    ],
  },
  reasons: {
    points: [
      "The group aligned on using cancellation conversations as a source of insight, not only as a one-off save attempt.",
      "Ron proposed asking: ‘What would make you keep the subscription?’ to identify whether the real lever is discount, shipping, frequency or something else.",
      "Neva highlighted that answers will vary and need a clear follow-up process.",
    ],
    actions: [
      "Neva: launch the cancellation survey, capture both the reason and ‘what would make you stay?’, and analyze the results.",
      "Bruno: review cancellation reasons and retention learnings weekly.",
      "Pay special attention to customers cancelling after the second recurring order / third product, where churn is unexpectedly high.",
    ],
  },
  retention: {
    points: [
      "Change frequency, skip one occurrence and choose another product are already possible and were fully supported by Ron.",
      "Customer Service should actively offer these existing controls instead of defaulting to cancellation.",
      "A free next subscription order is attractive but may not be technically supported in OrderGroove today.",
    ],
    actions: [
      "Include change frequency, skip, product swap and next-order-free among the retention options to evaluate.",
      "Bruno: check with Achiad whether we can technically present several retention options and which desired options are feasible.",
      "If a free next subscription order is not feasible, use the validated fallback: keep the order + coupon equal to the order value.",
    ],
  },
  toolbox: {
    points: [
      "Ron prefers keeping the existing return-recovery rule simple: if the customer keeps a shipped order, offer a coupon equal to the order value.",
      "Two months free was not supported as a standard offer; the main concern is creating a loophole that customers can take and then cancel immediately.",
      "A choice-based retention page remains interesting, but only if the incentives can be controlled technically.",
    ],
    actions: [
      "Bruno: check with Achiad how to build, track and control an A / B / C retention choice flow, and which desired options are technically feasible.",
      "Keep ‘two months free’ as an idea, clearly marked NOT VALIDATED BY RON.",
      "Use the keep-order + full-value coupon as the fallback when a free next order cannot be implemented.",
    ],
  },
  kpis: {
    points: [
      "Subscriber retention is the preferred strategic view because one customer can hold several item subscriptions.",
      "The new 25% recurring discount started mainly in June, so August is the first meaningful period to assess its effect for many 60-day customers.",
      "Shipping was reduced from $12 to $4.99 for subscribers; Ron wants evidence on whether the next investment should go to discount or shipping.",
    ],
    actions: [
      "Add Saved Subscription, but confirm the save only after a subsequent paid renewal.",
      "Track retention by cohort and order number, especially first replenishment and third order onwards.",
      "Neva: use the cancellation survey to identify whether discount, shipping, frequency, product or another factor is the stronger retention lever.",
    ],
  },
  decisions: {
    points: [
      "Subscription is a strategic profit driver and retention is now the main question, not enrollment.",
      "There is interest in making subscribers feel special with extra benefits beyond price: birthday / anniversary rewards, milestone rewards or a free 5th order were discussed as ideas.",
      "No final decision was made on whether the next economic lever should be higher discount or lower shipping; more customer insight is required first.",
    ],
    actions: [
      "Neva: launch and analyze the cancellation survey.",
      "Bruno: own the weekly cancellation / retention review.",
      "Bruno: check with Achiad whether multiple retention choices can be implemented and which options are technically feasible.",
      "Ron: define the target for the subscriber retention KPI tracked in OrderGroove.",
      "Team: next review in mid-September after vacations, using survey learnings, OrderGroove data and Achiad’s feasibility feedback.",
    ],
  },
};

const cancellationCases = [
  {
    reason: "I did not know I subscribed",
    customer: "I only wanted to buy the product once. I did not realize another order would be created automatically.",
    trigger: "Get the next one free",
    triggerClass: "free",
    rationale: "Rebuild trust after an unexpected recurring order while keeping the subscription active.",
  },
  {
    reason: "I still have enough product",
    customer: "I have not finished the first bottle yet, so I do not need another one now.",
    trigger: "Skip one occurrence",
    triggerClass: "skip",
    rationale: "Give the customer more time without ending the relationship.",
  },
  {
    reason: "I do not like the product",
    customer: "The product does not suit me and I do not want to receive the same item again.",
    trigger: "Choose another product",
    triggerClass: "swap",
    rationale: "Turn dissatisfaction into discovery and preserve the recurring relationship.",
  },
  {
    reason: "The price is too high",
    customer: "I like the product, but I cannot justify paying for it again right now.",
    trigger: "Skip one occurrence",
    triggerClass: "skip",
    rationale: "Provide immediate budget relief without using the most expensive goodwill offer.",
  },
  {
    reason: "I want another product",
    customer: "I would prefer to receive another product from the range next time.",
    trigger: "Choose another product",
    triggerClass: "swap",
    rationale: "Create a cross sell opportunity and make the subscription feel more flexible.",
  },
  {
    reason: "I need a different frequency",
    customer: "Every two months is too frequent for the way I use this product.",
    trigger: "Change the frequency",
    triggerClass: "frequency",
    rationale: "Solve the stated need directly by moving the recurring delivery to a cadence that matches actual product usage.",
  },
  {
    reason: "Other / unhappy after shipment",
    customer: "The order was already billed and shipped. Paying around $7 to return it feels unfair.",
    trigger: "Get the next one free",
    triggerClass: "free",
    rationale: "Use a strong recovery gesture when the current flow has already created frustration.",
  },
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
    "Should the recurring-charge consent appear directly beside the purchase button?",
    "Which control promises must be visible: change frequency, skip, pause, swap or cancel?",
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
  toolbox: [
    "Which offers can agents propose directly, and which need manager approval?",
    "Can Achiad build an A / B / C choice directly in the cancellation flow?",
    "What is the maximum retention investment per customer?",
    "Should incentives depend on customer value, reason or subscription age?",
  ],
  kpis: [
    "What exactly counts as a saved subscription?",
    "Do we measure acceptance immediately or only after the next successful renewal?",
    "What target Saved Subscription Rate should we set for the pilot?",
    "How will we compare the cost of the offer with the revenue preserved?",
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

function Notes({ id }) {
  const recap = meetingRecap[id] || { points: [], actions: [] };
  return (
    <aside className="notes">
      <div className="notesTitle"><b>Meeting recap · Aug 6</b><small>Key points and agreed follow-up</small></div>
      <div className="recapBlock">
        <strong>What we learned</strong>
        <ul>{recap.points.map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
      <div className="recapBlock actionsBlock">
        <strong>Actions</strong>
        <ul>{recap.actions.map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
    </aside>
  );
}

function Section({ id, n, title, children }) {
  return (
    <section id={id} className="sectionCard">
      <div className="content">
        <div className="sectionTitle"><span>{n}</span><h2>{title}</h2></div>
        {children}
        <Questions id={id} />
      </div>
      <Notes id={id} />
    </section>
  );
}

function Offer({ title, price, copy, selected, badge }) {
  return <div className={`offer ${selected ? "selected" : ""}`}><span className="radio">{selected ? "✓" : ""}</span><div><b>{title}</b>{badge && <em>{badge}</em>}<p>{copy}</p></div><strong>{price}</strong></div>;
}

export default function SubscriptionRetention() {
  const [lightbox, setLightbox] = useState(null);
  useEffect(() => {
    if (!lightbox) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => { if (event.key === "Escape") setLightbox(null); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [lightbox]);

  return <>
    <Head><title>Subscription Retention | Yves Rocher Hub</title></Head>
    <main className="page">
      <ReportingNav />
      <div className="hero">
        <div><p className="crumb">Yves Rocher · Subscription challenge</p><h1>Subscription Retention Strategy</h1><h3>Clearer choices. Happier subscribers.</h3><p className="lead">A discussion workspace for Ron, Product and Customer Service, combining UX clarity, competitor learnings and practical retention options.</p></div>
        <div className="goal"><span>◎</span><div><b>Our goal</b><p>Increase retention by making subscription value obvious and giving customers simple ways to keep their routine.</p></div></div>
      </div>

      <nav className="jump">{sections.map(s => <a key={s.id} href={`#${s.id}`}><span>{s.n}</span>{s.title}</a>)}</nav>

      <Section {...sections[0]}>
        <div className="overviewGrid">
          <article><i className="red">!</i><div><b>Current issue</b><p>Many cancellation requests appear to come from customers who did not fully understand the recurring model or future pricing.</p></div></article>
          <article><i className="green">◎</i><div><b>Objective</b><p>Make the value and recurring commitment explicit, while offering simple retention choices when customers hesitate.</p></div></article>
          <article><i className="orange">▥</i><div><b>Business risk</b><p>Lost recurring revenue, avoidable dissatisfaction and a negative impact on brand trust.</p></div></article>
          <article><i className="blue">?</i><div><b>Open decisions</b><p>UX design, wording, retention offers, eligibility rules and cancellation flow.</p></div></article>
        </div>
      </Section>

      <Section {...sections[1]}>
        <div className="experienceGrid">
          <div><h3>Product Detail Page (PDP)</h3><img src="/subscription/pdp.png" alt="Current PDP subscription experience"/><div className="finding good"><b>What is clear</b><p>First-order discount, future discount, frequency and cancellation flexibility are visible.</p></div></div>
          <div><h3>Floating Cart</h3><img src="/subscription/cart.png" alt="Current cart subscription experience"/><div className="finding bad"><b>What is missing</b><p>Future price and cancellation reassurance disappear; recurring delivery becomes a secondary line.</p></div></div>
        </div>
        <div className="answer"><b>Conclusion</b><p>The wording is broadly consistent, but the UX is not equivalent. The PDP explains; the cart merely confirms.</p></div>
      </Section>

      <Section {...sections[2]}>
        <div className="issueGrid">
          {[['%','Discount structure','30% today and 25% later require customers to process two different benefits.'],['$','Price hierarchy','The first price is dominant while the future recurring price is easy to miss.'],['↻','Recurring nature','“Subscribe” can be misunderstood as joining a site or newsletter.'],['▣','Delivery frequency','“Every 2 months” is small, grey and visually secondary.'],['→','Journey consistency','The cart removes information that was available on the PDP.']].map(([i,t,p]) => <article key={t}><i>{i}</i><b>{t}</b><p>{p}</p></article>)}
        </div>
      </Section>

      <Section {...sections[3]}>
        <div className="optionsGrid">
          <article className="option"><span>Option A</span><h3>Maximum clarity</h3><small>Keep current commercial model</small><Offer title="Buy once" price="$34.00" copy="One-time purchase. No automatic renewal."/><Offer selected title="Auto-delivery every 2 months" price="$23.80 today" badge="Save 30%" copy="Then $25.50 every 2 months. Skip, pause or cancel anytime."/><div className="confirm">✓ I understand this is a recurring order billed every 2 months.</div></article>
          <article className="option recommended"><span>Option B · Recommended</span><h3>One simple recurring price</h3><small>Best for trust and recall</small><Offer title="Buy once" price="$34.00" copy="One-time purchase."/><Offer selected title="Auto-delivery" price="$25.50" badge="Save 25%" copy="The same price today and on every future delivery."/><div className="selectRow">Deliver every <b>2 months⌄</b></div></article>
          <article className="option"><span>Option C</span><h3>Benefit-led choice</h3><small>Softer beauty-friendly wording</small><Offer title="One-time purchase" price="$34.00" copy="Perfect when you only need one bottle."/><Offer selected title="Never run out" price="$23.80 today" badge="Auto-delivery" copy="We will send it every 2 months. Future deliveries are $25.50."/><div className="chips"><em>Skip anytime</em><em>Swap products</em><em>Cancel in one click</em></div></article>
        </div>
      </Section>

      <Section {...sections[4]}>
        <div className="benchmarkGrid visualBenchmark">
          <article>
            <div className="brandHead"><span>A</span><div><small>Amazon</small><h3>Subscribe & Save</h3></div></div>
            <div className="thumbGrid two">
              {[
                ["/subscription/competitors/amazon-one-time.png", "Amazon clearly separates one-time purchase from Subscribe & Save."],
                ["/subscription/competitors/amazon-subscribe-save.png", "The subscription choice is visible as a separate purchase mode, but the detailed recurring terms are not prominent in this compact view."],
              ].map(([src, alt]) => <button type="button" key={src} className="benchmarkThumb" onClick={() => setLightbox({src, alt})}><img src={src} alt={alt}/><span>Click to enlarge</span></button>)}
            </div>
            <p><b>What works:</b> the customer must choose between two clearly separated purchase modes. Price comparison is immediate.</p>
            <p><b>Watch-out:</b> delivery frequency and recurring-charge details need to remain visible after selection.</p>
            <strong>YR learning: create an unmistakable one-time versus recurring choice before Add to Cart.</strong>
          </article>
          <article>
            <div className="brandHead"><span>S</span><div><small>Sephora</small><h3>Auto-Replenish</h3></div></div>
            <div className="thumbGrid">
              <button type="button" className="benchmarkThumb" onClick={() => setLightbox({src: "/subscription/competitors/sephora-auto-replenish.png", alt: "Sephora Auto-Replenish product page"})}><img src="/subscription/competitors/sephora-auto-replenish.png" alt="Sephora Auto-Replenish product page"/><span>Click to enlarge</span></button>
            </div>
            <p><b>What works:</b> “Auto-Replenish” describes the recurring action, the cadence is selectable, and consent to recurring charges is explicit.</p>
            <p><b>Watch-out:</b> the saving is modest, so clarity and convenience must carry the proposition.</p>
            <strong>YR learning: show consent, frequency and future charge next to the CTA.</strong>
          </article>
          <article>
            <div className="brandHead"><span>U</span><div><small>Ulta Beauty</small><h3>Replenish & Save</h3></div></div>
            <div className="thumbGrid two">
              {[
                ["/subscription/competitors/ulta-product-option.png", "Ulta Replenish & Save option on the product page."],
                ["/subscription/competitors/ulta-benefits.png", "Ulta explains recurring subscription, easy cancellation, savings and free shipping."],
              ].map(([src, alt]) => <button type="button" key={src} className="benchmarkThumb" onClick={() => setLightbox({src, alt})}><img src={src} alt={alt}/><span>Click to enlarge</span></button>)}
            </div>
            <p><b>What works:</b> the same saving is applied to the first and every recurring order. Benefits and customer control are explained together.</p>
            <p><b>Watch-out:</b> the compact product-page option still depends on “Learn More” for the full explanation.</p>
            <strong>YR learning: keep the offer simple and repeat the essential recurring terms without requiring another click.</strong>
          </article>
        </div>
        <div className="benchmarkSummary"><b>Overall benchmark conclusion</b><p>The strongest pattern is not the discount level. It is the combination of a clear purchase-mode choice, an explicit recurring cadence, transparent future charges and visible customer control.</p></div>
      </Section>

      <Section {...sections[5]}>
        <div className="reasonIntro">
          <div className="reasonPrompt"><small>Agent questions</small><h3>“Why do you want to cancel?”</h3><p>Then ask: <b>“What would make you keep the subscription?”</b> Capture the primary reason and the lever that could change the decision.</p></div>
          <div className="triggerLegend">
            <b>Retention triggers</b>
            <span className="trigger skip">Skip one occurrence</span>
            <span className="trigger free">Get the next one free</span>
            <span className="trigger swap">Choose another product</span>
            <span className="trigger frequency">Change the frequency</span>
          </div>
        </div>
        <div className="caseTable">
          <div className="caseHeader"><span>Reason</span><span>Customer case</span><span>Best trigger</span><span>Why this trigger</span></div>
          {cancellationCases.map((item, i) => (
            <article className="caseRow" key={item.reason}>
              <div className="caseReason"><i>{String(i + 1).padStart(2, "0")}</i><b>{item.reason}</b></div>
              <blockquote>“{item.customer}”</blockquote>
              <div><span className={`trigger ${item.triggerClass}`}>{item.trigger}</span></div>
              <p>{item.rationale}</p>
            </article>
          ))}
        </div>
        <div className="caseNote"><b>CS principle:</b> propose one relevant option, not all three. The offer should answer the customer’s real reason for leaving.</div>
      </Section>

      <Section {...sections[6]}>
        <div className="retentionGrid">
          <article className="featured"><i>↻</i><small>Option 1 · Preferred</small><h3>Change the frequency</h3><p>Move the customer to a rhythm that matches their actual product consumption, for example every 3, 4 or 6 months.</p><b>Best for:</b><span>Too much product, bottle not finished, or a different delivery rhythm needed.</span></article>
          <article><i>Ⅱ</i><small>Option 2</small><h3>Skip one occurrence</h3><p>Cancel the next scheduled shipment. No product and no payment. The subscription remains active.</p><b>Best for:</b><span>Travel, temporary stock surplus or a short-term budget issue.</span></article>
          <article><i>★</i><small>Option 3</small><h3>Get the next one free</h3><p>The next product is shipped, but the customer is not charged for that occurrence.</p><b>Best for:</b><span>Customer was unaware and we want to rebuild trust.</span></article>
          <article><i>⇄</i><small>Option 4</small><h3>Choose another product</h3><p>Replace the next delivery with another eligible product, potentially up to $5 more.</p><b>Best for:</b><span>Product dislike, discovery and cross-sell.</span></article>
        </div>
        <div className="guardrail"><b>Guardrail to define:</b> eligibility, maximum value, number of uses per customer and agent approval limits.</div>
      </Section>

      <Section {...sections[7]}>
        <div className="toolboxGrid">
          <article className="featured"><i>✓</i><small>Approved / existing</small><h3>Keep order + full-value coupon</h3><p>If a subscriber wants to return a shipped order, offer a coupon equal to the order value if they keep the product.</p><b>Meeting position</b><span>Ron supports using the same recovery rule already used for non-subscription orders.</span></article>
          <article><i>FREE</i><small>Preferred if technically possible</small><h3>Next subscription order free</h3><p>Keep the current order and make the next recurring subscription order free.</p><b>Technical check</b><span>Ron likes the idea, but OrderGroove may not currently support making the next automated order free.</span></article>
          <article><i>A/B/C</i><small>To explore</small><h3>Controlled choice page</h3><p>Present a small set of approved save options that match the customer reason, rather than one generic incentive.</p><b>To check with Achiad</b><span>How to build, track and restrict the choices so customers cannot take an incentive and immediately exploit the flow.</span></article>
          <article><i>★</i><small>Future loyalty concept</small><h3>Subscriber-only rewards</h3><p>Make long-term subscribers feel special with milestone or anniversary benefits.</p><b>Ideas from the meeting</b><span>Birthday / anniversary reward, special subscriber benefit, or potentially a free 5th order.</span></article>
        </div>
        <div className="guardrail"><b>Two months free:</b> keep as an option to explore, but mark it clearly as <strong>NOT VALIDATED BY RON</strong>. Any incentive flow needs technical guardrails to avoid immediate cancellation after redemption.</div>
      </Section>

      <Section {...sections[8]}>
        <div className="kpiHero">
          <small>New management KPI</small>
          <h3>Saved Subscription</h3>
          <p>A cancellation request that results in the subscription remaining active because the customer accepted a retention solution.</p>
          <strong>Saved Subscription Rate = Saved subscriptions ÷ Cancellation requests</strong>
        </div>
        <div className="kpiGrid">
          <article><span>01</span><h3>Saved subscriptions</h3><p>Number of cancellation requests successfully retained.</p></article>
          <article><span>02</span><h3>Offer acceptance rate</h3><p>Accepted retention offers divided by offers proposed.</p></article>
          <article><span>03</span><h3>Confirmed retention rate</h3><p>Saved customers who complete the next paid renewal, not only accept the initial offer.</p></article>
          <article><span>04</span><h3>Saved recurring revenue</h3><p>Estimated subscription revenue preserved through retention actions.</p></article>
          <article><span>05</span><h3>Cost per saved subscription</h3><p>Total incentive, gift and free-product cost divided by confirmed saves.</p></article>
          <article><span>06</span><h3>Best-performing trigger</h3><p>Compare frequency change, skip, product swap, full-value coupon and, if technically feasible, a free next recurring order.</p></article>
        </div>
        <div className="kpiNote"><b>Important:</b> track both the immediate save and the next successful paid renewal, otherwise the KPI may overstate real retention.</div>
      </Section>

      <Section {...sections[9]}>
        <div className="decisionGrid">
          {[
            ['Subscriber retention KPI','Track in OrderGroove. Target to be defined.','Ron · Target TBD'],
            ['Cancellation survey','Launch survey and analyze why customers cancel and what would make them stay.','Neva'],
            ['Weekly cancellation review','Review reasons, retention learnings and saved subscriptions weekly.','Bruno'],
            ['Retention option flow','Check whether several retention choices can be offered and which desired options are technically feasible.','Bruno → Achiad'],
            ['Free next order','Keep as a desired option subject to technical feasibility.','Bruno → Achiad'],
            ['Fallback','If free next order is not feasible: keep the order + coupon equal to order value.','Validated'],
            ['Discount vs shipping','Use survey results to understand which lever matters more to retention.','Neva · Survey'],
            ['PDP origin','Most subscriptions originate from the PDP; consider this fact in UX decisions.','No specific action'],
            ['Two months free','Keep as an idea only.','NOT VALIDATED BY RON'],
            ['Next review','Review survey, OrderGroove data and technical feasibility.','Mid-September'],
          ].map(([x,decision,owner],i)=><article key={x}><span>{String(i+1).padStart(2,'0')}</span><div className="decisionBody"><h3>{x}</h3><p>Decision / outcome</p><div className="decisionText">{decision}</div><p>Owner / timing</p><div className="ownerText">{owner}</div></div></article>)}
        </div>

        <div className="actionPlan">
          <div className="actionPlanHead">
            <div>
              <small>Meeting follow-up</small>
              <h3>Action Plan</h3>
              <p>Concrete next steps agreed or assigned during the subscription brainstorming meeting.</p>
            </div>
            <span>Next review · Mid-September</span>
          </div>
          <div className="actionTable">
            <div className="actionRow actionHeader"><b>#</b><b>Action</b><b>Owner</b><b>Timing / Status</b></div>
            {[
              ['01','Launch the cancellation survey and analyze why customers cancel + what would make them stay.','Neva','Start now'],
              ['02','Review cancellation reasons, retention learnings and saved subscriptions.','Bruno','Weekly'],
              ['03','Check with Achiad whether multiple retention choices can be implemented and which desired options are technically feasible.','Bruno → Achiad','To check'],
              ['04','Validate technical feasibility of a free next subscription order.','Bruno → Achiad','To check'],
              ['05','If a free next order is not feasible, keep the order and issue a coupon equal to the order value.','Customer Service','Validated fallback'],
              ['06','Use survey findings to understand whether discount or shipping is the stronger retention lever.','Neva','Survey analysis'],
              ['07','Define the target for the Subscriber Retention KPI tracked in OrderGroove.','Ron','Target TBD'],
              ['08','Keep “Two months free” as an idea to explore only.','—','NOT VALIDATED BY RON'],
              ['09','Review survey results, OrderGroove data, retention options and Achiad technical feedback.','Team','Mid-September'],
            ].map(([n,action,owner,status])=><div className="actionRow" key={n}><span>{n}</span><div>{action}</div><div>{owner}</div><div>{status}</div></div>)}
          </div>
        </div>
      </Section>

      {lightbox && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="lightboxClose"
            aria-label="Close enlarged image"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(event) => event.stopPropagation()}
          />
          <p>{lightbox.alt}</p>
        </div>
      )}
    </main>
    <style jsx global>{`
      html{scroll-behavior:smooth} body{background:#f7f4ee;color:#17351f}.page{min-height:100vh;padding:22px 28px 60px;background:linear-gradient(145deg,#faf8f3,#f1f6ef)}
      .page>*{box-sizing:border-box}.hero,.jump,.sectionCard{max-width:1500px;margin-left:auto;margin-right:auto}.hero{display:grid;grid-template-columns:1.25fr .75fr;gap:34px;padding:34px 8px 26px}.crumb{color:#587138;font-weight:800;margin:0 0 18px}.hero h1{font:800 clamp(42px,5vw,68px)/1.02 Georgia,serif;margin:0;color:#123d24}.hero h3{font-size:26px;margin:10px 0 12px;color:#252b27}.lead{font-size:17px;line-height:1.65;max-width:780px;color:#556059}.goal{align-self:center;display:flex;gap:16px;background:#fff;border:1px solid #bfd5bc;border-radius:22px;padding:24px;box-shadow:0 14px 38px rgba(34,72,42,.08)}.goal>span{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#eaf3e4;font-size:28px}.goal b{font-size:17px}.goal p{line-height:1.55;margin:8px 0 0;color:#4f5c53}
      .jump{display:flex;gap:10px;overflow:auto;padding:0 0 16px}.jump a{min-width:160px;background:#fff;border:1px solid #d7e2d4;border-radius:14px;padding:11px 13px;text-decoration:none;color:#243b2a;font-weight:800;font-size:13px}.jump a span{display:block;color:#78904b;font-size:11px;margin-bottom:4px}
      .sectionCard{display:grid;grid-template-columns:minmax(0,1fr) 390px;background:#fff;border:1px solid #e1e5dc;border-radius:24px;margin-bottom:22px;overflow:hidden;box-shadow:0 16px 42px rgba(33,62,38,.08)}.content{padding:28px 30px}.sectionTitle{display:flex;align-items:center;gap:12px;margin-bottom:23px}.sectionTitle span{color:#58753c;font-weight:900}.sectionTitle h2{font:800 28px/1.15 Georgia,serif;margin:0;color:#123d24}.notes{padding:24px;background:#fbfaf6;border-left:1px solid #e7e5dc;display:flex;flex-direction:column;min-height:420px}.notesTitle b{display:block;font-size:16px}.notesTitle small{display:block;color:#8a918b;margin-top:4px}.recapBlock{margin-top:14px;padding:14px 15px;border-radius:14px;background:#fff;border:1px solid #e0e4dc}.recapBlock strong{display:block;color:#173f28;font-size:13px;margin-bottom:8px}.recapBlock ul{margin:0;padding-left:18px}.recapBlock li{font-size:12px;line-height:1.48;color:#4f5c53;margin:0 0 7px}.recapBlock li:last-child{margin-bottom:0}.actionsBlock{background:#edf6e9;border-color:#cfe0c8}.actionsBlock strong{color:#2c6b3c}.notesTitle.manual{margin-top:16px}.notes textarea{flex:1;min-height:120px;margin-top:14px;border:1px solid #d9d9cf;border-radius:16px;padding:16px;font:14px/1.6 Inter,Arial;resize:vertical;background:#fff}
      .questionBox{margin-top:22px;background:#f2f6e7;border:1px solid #d5e0b5;border-radius:17px;padding:16px 18px}.questionTitle{display:flex;align-items:center;gap:9px;color:#264c2d}.questionTitle span{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#dce98a;font-weight:900}.questionBox ul{margin:12px 0 0;padding-left:22px;display:grid;gap:8px;color:#35483a;line-height:1.45}.questionBox li::marker{color:#6f8837}
      .overviewGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.overviewGrid article{display:flex;gap:14px;padding:18px;border:1px solid #e3e8df;border-radius:18px;background:#fcfdfb}.overviewGrid i{flex:0 0 44px;height:44px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:22px}.red{background:#ffe4df;color:#c63b2d}.green{background:#e5f2df;color:#2f7b3a}.orange{background:#ffedd7;color:#d76b17}.blue{background:#e1effa;color:#2571ad}.overviewGrid b{font-size:16px}.overviewGrid p{margin:7px 0 0;color:#526057;line-height:1.55}
      .experienceGrid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.experienceGrid h3{font-size:18px;margin:0 0 10px}.experienceGrid img{width:100%;height:390px;object-fit:contain;background:#fafafa;border:1px solid #e2e5df;border-radius:16px}.finding{margin-top:10px;padding:13px 15px;border-radius:14px}.finding p{margin:5px 0 0;line-height:1.45}.finding.good{background:#eaf5e8}.finding.bad{background:#fff0e3}.answer{display:flex;gap:14px;margin-top:16px;background:#153f27;color:#fff;padding:16px 18px;border-radius:15px}.answer b{color:#dce98a}.answer p{margin:0;line-height:1.5}
      .issueGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.issueGrid article{padding:17px;border:1px solid #e0e6dd;border-radius:17px;background:#fbfcfa}.issueGrid i{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#e9f1e3;font-style:normal;font-weight:900;margin-bottom:12px}.issueGrid b{display:block}.issueGrid p{font-size:13px;line-height:1.5;color:#59655d}
      .optionsGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.option{padding:18px;border:1px solid #dce5d9;border-radius:20px;background:#fafcf9}.option.recommended{border:2px solid #2f7b45;box-shadow:0 12px 26px rgba(47,123,69,.12)}.option>span{display:inline-block;background:#173f28;color:#fff;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:900;text-transform:uppercase}.option h3{font:800 22px Georgia,serif;margin:13px 0 3px}.option>small{color:#748078}.offer{display:grid;grid-template-columns:24px 1fr auto;gap:10px;padding:13px;margin-top:13px;border:1px solid #dfe4dc;border-radius:14px;background:#fff}.offer.selected{border:2px solid #21824a;background:#f3fbf4}.radio{width:20px;height:20px;border:1px solid #a9b2ab;border-radius:50%;display:grid;place-items:center}.selected .radio{background:#21824a;color:#fff}.offer b{font-size:13px}.offer em{display:inline-block;margin-left:6px;background:#dce98a;padding:2px 6px;border-radius:999px;font-size:9px;font-style:normal;font-weight:900}.offer p{font-size:11px;line-height:1.4;color:#68736b;margin:5px 0 0}.offer strong{font-size:13px;white-space:nowrap}.confirm,.selectRow{margin-top:11px;padding:10px;border-radius:12px;background:#fff;border:1px dashed #aebbab;font-size:11px}.selectRow{display:flex;justify-content:space-between}.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:11px}.chips em{font-style:normal;background:#e8efe5;border-radius:999px;padding:6px 8px;font-size:10px;font-weight:800}
      .benchmarkGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.benchmarkGrid article{padding:19px;border:1px solid #e0e6dd;border-radius:18px;background:#fbfcfa}.brandHead{display:grid;grid-template-columns:46px 1fr;gap:14px;align-items:center;margin-bottom:14px}.brandHead>span{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:#173f28;color:#fff;font:800 21px Georgia}.benchmarkGrid small{color:#718740;text-transform:uppercase;font-weight:900}.benchmarkGrid h3{font:800 22px Georgia,serif;margin:4px 0 0}.benchmarkGrid p{font-size:13px;line-height:1.5;color:#58645c}.benchmarkGrid strong{display:block;font-size:12px;line-height:1.45;color:#2b5433;margin-top:10px}.thumbGrid{display:grid;grid-template-columns:1fr;gap:10px;margin:10px 0 14px}.thumbGrid.two{grid-template-columns:1fr 1fr}.benchmarkThumb{appearance:none;border:1px solid #d9e1d7;border-radius:14px;background:#fff;padding:8px;cursor:zoom-in;text-align:left;transition:.18s ease;overflow:hidden}.benchmarkThumb:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(23,63,40,.12);border-color:#9db89f}.benchmarkThumb img{display:block;width:100%;height:190px;object-fit:contain;background:#f7f7f4;border-radius:9px}.benchmarkThumb span{display:block;text-align:center;font-size:10px;font-weight:800;color:#587138;margin-top:7px}.benchmarkSummary{margin-top:16px;padding:16px 18px;border-radius:15px;background:#173f28;color:#fff}.benchmarkSummary b{color:#dce98a}.benchmarkSummary p{margin:6px 0 0;line-height:1.5}.lightbox{position:fixed;inset:0;z-index:9999;background:rgba(10,24,15,.86);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;cursor:zoom-out}.lightbox img{max-width:min(1200px,92vw);max-height:82vh;object-fit:contain;background:#fff;border-radius:14px;box-shadow:0 25px 80px rgba(0,0,0,.4)}.lightbox p{color:#fff;max-width:900px;text-align:center}.lightboxClose{position:fixed;top:20px;right:28px;width:46px;height:46px;border:0;border-radius:50%;background:#fff;color:#173f28;font-size:30px;cursor:pointer}
      .reasonIntro{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}.reasonPrompt{background:#173f28;color:#fff;padding:24px;border-radius:20px}.reasonPrompt small{color:#dce98a;text-transform:uppercase;font-weight:900}.reasonPrompt h3{font:800 29px/1.14 Georgia,serif;margin:12px 0}.reasonPrompt p{color:#dce4df;line-height:1.5;margin-bottom:0}.triggerLegend{display:flex;flex-wrap:wrap;align-content:center;gap:9px;padding:22px;border:1px solid #dfe5dc;border-radius:20px;background:#fbfcfa}.triggerLegend b{width:100%;font-size:15px;margin-bottom:4px}.trigger{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900;white-space:nowrap}.trigger.skip{background:#e7f0ff;color:#215b9b}.trigger.free{background:#e6f4df;color:#246f37}.trigger.swap{background:#fff0d8;color:#9a5b16}.trigger.frequency{background:#eee8ff;color:#5a3aa8}.caseTable{border:1px solid #dfe5dc;border-radius:18px;overflow:hidden}.caseHeader,.caseRow{display:grid;grid-template-columns:1.05fr 1.65fr .9fr 1.35fr;gap:14px;align-items:center}.caseHeader{padding:11px 14px;background:#edf3e9;color:#45604b;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}.caseRow{padding:15px 14px;border-top:1px solid #e4e8e1;background:#fff}.caseRow:nth-child(odd){background:#fbfcfa}.caseReason{display:flex;align-items:center;gap:10px}.caseReason i{flex:0 0 30px;height:30px;border-radius:9px;display:grid;place-items:center;background:#173f28;color:#fff;font-style:normal;font-size:10px;font-weight:900}.caseReason b{font-size:13px;line-height:1.35}.caseRow blockquote{margin:0;font-size:12px;line-height:1.5;color:#536057;font-style:italic}.caseRow p{margin:0;font-size:12px;line-height:1.48;color:#536057}.caseNote{margin-top:14px;padding:13px 15px;border-radius:14px;background:#fff4de;border:1px solid #ecd8ad;color:#6f5123;font-size:13px}
      .retentionGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}.retentionGrid article{padding:20px;border:1px solid #dfe5dc;border-radius:20px;background:#fbfcfa}.retentionGrid article.featured{background:#173f28;color:#fff;transform:translateY(-4px)}.retentionGrid i{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#e8f0e3;font-style:normal;font-size:20px;color:#173f28}.retentionGrid small{display:block;color:#78904b;text-transform:uppercase;font-weight:900;margin-top:13px}.featured small{color:#dce98a}.retentionGrid h3{font:800 24px Georgia,serif;margin:6px 0 10px}.retentionGrid p{line-height:1.5;color:#59655d}.featured p{color:#d9e2dc}.retentionGrid b{display:block;margin-top:13px}.retentionGrid span{font-size:12px;line-height:1.45}.guardrail{margin-top:16px;padding:14px 16px;border-radius:14px;background:#fff1d9;border:1px solid #ecd6a8;color:#77521f}
      .toolboxGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}.toolboxGrid article{padding:20px;border:1px solid #dfe5dc;border-radius:20px;background:#fbfcfa}.toolboxGrid article.featured{background:#173f28;color:#fff}.toolboxGrid i{width:52px;height:52px;border-radius:15px;display:grid;place-items:center;background:#e8f0e3;color:#173f28;font-style:normal;font-size:15px;font-weight:900}.toolboxGrid small{display:block;color:#78904b;text-transform:uppercase;font-weight:900;margin-top:13px}.toolboxGrid .featured small{color:#dce98a}.toolboxGrid h3{font:800 24px Georgia,serif;margin:6px 0 10px}.toolboxGrid p{line-height:1.5;color:#59655d}.toolboxGrid .featured p{color:#d9e2dc}.toolboxGrid b{display:block;margin-top:13px}.toolboxGrid span{display:block;font-size:12px;line-height:1.45;margin-top:4px}.kpiHero{padding:24px;border-radius:20px;background:#173f28;color:#fff;margin-bottom:16px}.kpiHero small{color:#dce98a;text-transform:uppercase;font-weight:900}.kpiHero h3{font:800 34px Georgia,serif;margin:9px 0}.kpiHero p{max-width:760px;line-height:1.55;color:#dbe5de}.kpiHero strong{display:inline-block;margin-top:8px;padding:10px 13px;border-radius:12px;background:#fff;color:#173f28}.kpiGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}.kpiGrid article{padding:17px;border:1px solid #dfe5dc;border-radius:17px;background:#fbfcfa}.kpiGrid span{display:inline-grid;place-items:center;width:31px;height:31px;border-radius:9px;background:#e8f0e3;color:#173f28;font-size:10px;font-weight:900}.kpiGrid h3{margin:11px 0 7px;font-size:16px}.kpiGrid p{margin:0;font-size:13px;line-height:1.5;color:#59655d}.kpiNote{margin-top:14px;padding:13px 15px;border-radius:14px;background:#fff4de;border:1px solid #ecd8ad;color:#6f5123;font-size:13px}.decisionGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.decisionGrid article{display:grid;grid-template-columns:44px minmax(0,1fr);gap:14px;padding:18px;border:1px solid #e0e5dd;border-radius:18px;background:#fbfcfa;align-items:start}.decisionGrid article>span{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:#173f28;color:#fff;font-size:11px;font-weight:900}.decisionBody{min-width:0}.decisionGrid h3{margin:0 0 12px;font:800 20px/1.2 Georgia,serif;color:#123d24}.decisionGrid p{margin:12px 0 4px;color:#7c857e;font-size:10px;letter-spacing:.04em;text-transform:uppercase;font-weight:900}.decisionText,.ownerText{height:auto!important;min-height:0;border-bottom:1px solid #c7d0c8!important;padding:0 0 9px;font-size:14px;line-height:1.45;color:#17351f;overflow-wrap:anywhere}.ownerText{font-weight:800;padding-bottom:2px}.actionPlan{margin-top:28px;border:1px solid #dce5d9;border-radius:22px;overflow:hidden;background:#fbfcfa}.actionPlanHead{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;padding:22px 24px;background:#edf4e9;border-bottom:1px solid #dce5d9}.actionPlanHead small{color:#6b823a;text-transform:uppercase;font-weight:900}.actionPlanHead h3{font:800 28px/1.1 Georgia,serif;margin:5px 0 6px;color:#123d24}.actionPlanHead p{margin:0;color:#59655d}.actionPlanHead>span{white-space:nowrap;padding:9px 12px;border-radius:999px;background:#173f28;color:#fff;font-size:12px;font-weight:900}.actionTable{width:100%}.actionRow{display:grid;grid-template-columns:56px minmax(0,2.4fr) minmax(130px,.7fr) minmax(150px,.8fr);gap:16px;align-items:start;padding:15px 18px;border-top:1px solid #e4e9e2;font-size:13px;line-height:1.45}.actionRow:first-child{border-top:0}.actionHeader{background:#f6f8f4;color:#526057;font-size:10px;text-transform:uppercase;letter-spacing:.05em}.actionRow>span{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:#173f28;color:#fff;font-size:10px;font-weight:900}.actionRow>div:nth-child(3){font-weight:800;color:#173f28}.actionRow>div:nth-child(4){font-weight:800;color:#587138}
      @media(max-width:1150px){.sectionCard{grid-template-columns:1fr}.notes{border-left:0;border-top:1px solid #e7e5dc;min-height:300px}.issueGrid{grid-template-columns:repeat(3,1fr)}.optionsGrid,.benchmarkGrid,.retentionGrid,.toolboxGrid,.kpiGrid{grid-template-columns:1fr}.hero{grid-template-columns:1fr}}
      @media(max-width:900px){.actionPlanHead{align-items:flex-start;flex-direction:column}.actionPlanHead>span{white-space:normal}.actionRow{grid-template-columns:44px 1fr}.actionRow.actionHeader{display:none}.actionRow>div:nth-child(3),.actionRow>div:nth-child(4){grid-column:2}.actionRow>div:nth-child(3)::before{content:'Owner: ';font-weight:900}.actionRow>div:nth-child(4)::before{content:'Status: ';font-weight:900}}
      @media(max-width:760px){.page{padding:12px}.content{padding:20px}.hero h1{font-size:40px}.overviewGrid,.experienceGrid,.reasonIntro,.decisionGrid{grid-template-columns:1fr}.caseHeader{display:none}.caseRow{grid-template-columns:1fr;gap:10px}.caseRow>div:nth-child(3){justify-self:start}.issueGrid{grid-template-columns:1fr}.experienceGrid img{height:280px}.sectionTitle h2{font-size:24px}}
    `}</style>
  </>;
}
