import { useMemo, useState } from "react";

const brandGreen = "#174c2f";
const softGreen = "#eaf4ec";
const leafGreen = "#2f7d46";
const cream = "#fbf8ef";
const gold = "#c6a15b";
const dark = "#102018";

const sections = [
  {
    id: "brand",
    title: "Brand Basics",
    subtitle: "What agents should know before answering customers",
    badge: "Foundation",
    color: "#174c2f",
    bullets: [
      "Yves Rocher USA is the official U.S. online store for a French cosmetics brand.",
      "The brand focuses on plant-based beauty: skincare, haircare, body care and fragrance.",
      "Customers often care about natural ingredients, botanical expertise, eco-conscious values and accessible beauty."
    ],
    cards: [
      { label: "Skincare", text: "Cleansers, moisturizers, serums, masks, anti-aging." },
      { label: "Haircare", text: "Shampoo, conditioner, masks, scalp treatments." },
      { label: "Body Care", text: "Shower gels, body lotions, hand creams, scrubs." },
      { label: "Fragrance", text: "Eau de Parfum, Eau de Toilette, body sprays." }
    ],
    quiz: {
      q: "What is the strongest brand angle to keep in mind?",
      answers: ["Luxury-only positioning", "Plant-based accessible beauty", "Medical skincare"],
      correct: 1
    }
  },
  {
    id: "shopify",
    title: "Shopify: What to Check",
    subtitle: "Order lookup, tags, history and tracking",
    badge: "Tool",
    color: "#2f7d46",
    bullets: [
      "Search by order ID, customer name or email.",
      "Use Shopify tags to understand why the order was returned or what refund action is needed.",
      "Check history, tracking, fulfillment status, shipping address and customer details before taking action."
    ],
    cards: [
      { label: "Search", text: "Order ID, name, email." },
      { label: "Tags", text: "Explain return/refund/reship context." },
      { label: "History", text: "Review previous actions and notes." },
      { label: "Tracking", text: "Confirm delivery or transit status." }
    ],
    quiz: {
      q: "Where do you confirm if an order was delivered?",
      answers: ["Only in Gorgias", "Shopify tracking / fulfillment", "Instagram comments"],
      correct: 1
    }
  },
  {
    id: "gorgias",
    title: "Gorgias Workflow",
    subtitle: "Tickets, notes, snooze, close and customer timeline",
    badge: "Tool",
    color: "#20533a",
    bullets: [
      "Find tickets in the right folder and review the customer timeline.",
      "Use internal notes when leaving information for another agent.",
      "Close conversations when completed and snooze tickets when waiting for customer or external action.",
      "Use the customer timeline to review previous conversations and orders."
    ],
    cards: [
      { label: "Internal note", text: "Use when writing to the team, not the customer." },
      { label: "Close", text: "Close only when the action is completed." },
      { label: "Snooze", text: "Use when waiting for follow-up." },
      { label: "Timeline", text: "Check other conversations and order count." }
    ],
    quiz: {
      q: "When should you use an internal note?",
      answers: ["To reply to the customer", "To leave private context for the team", "To cancel an order"],
      correct: 1
    }
  },
  {
    id: "shipping",
    title: "Shipping Rules",
    subtitle: "Fees, remote destinations and hazmat restrictions",
    badge: "Policy",
    color: "#216b3e",
    bullets: [
      "Free shipping applies over $89.",
      "Orders under $89 have a $11.95 shipping fee.",
      "APO/FPO/DPO, Alaska, Hawaii and Puerto Rico can take up to 28 business days from shipment.",
      "PO Boxes are allowed only if the order does not contain hazmat items."
    ],
    cards: [
      { label: "Free shipping", text: "Orders over $89." },
      { label: "Under threshold", text: "$11.95 shipping fee." },
      { label: "Remote destinations", text: "Up to 28 business days." },
      { label: "PO Boxes", text: "Allowed only without hazmat." }
    ],
    quiz: {
      q: "What is the shipping fee under $89?",
      answers: ["$7.00", "$11.95", "$19.00"],
      correct: 1
    }
  },
  {
    id: "subscription",
    title: "Subscribe & Save",
    subtitle: "Auto-replenishment rules and returns",
    badge: "Policy",
    color: "#174c2f",
    bullets: [
      "Subscribe & Save means products ship automatically on a regular schedule.",
      "Customers manage subscriptions in My Account > My Subscriptions.",
      "Before BC number: order/subscription changes may be possible.",
      "After BC number: the order is already in packing and cannot be cancelled in Shopify.",
      "First subscription order returns follow standard returns. Recurring subscription returns deduct a $7 return fee."
    ],
    cards: [
      { label: "Manage", text: "My Account > My Subscriptions." },
      { label: "Reminder", text: "Email reminder is sent before shipment." },
      { label: "First order", text: "Standard return handling." },
      { label: "Recurring order", text: "Deduct $7 return fee." }
    ],
    quiz: {
      q: "Where is the subscription cancelled?",
      answers: ["Only in Shopify", "Ordergroove", "FedEx"],
      correct: 1
    }
  },
  {
    id: "coupons",
    title: "Coupons & Loyalty",
    subtitle: "Keep-the-order coupon and Beauty Circle points",
    badge: "Policy",
    color: "#607d3b",
    bullets: [
      "If the customer keeps the order in exchange for a coupon, create a discount code in Shopify.",
      "Use a code like return-[customer name].",
      "Coupon value should match the products the customer wanted to return, based on what they paid.",
      "Set coupon validity to 6 months.",
      "Beauty Circle: customers earn 1 point for every $1 spent. Rewards are redeemed in increments of 100 points."
    ],
    cards: [
      { label: "100 points", text: "$5 reward / discount." },
      { label: "1000 points", text: "$50 reward / discount." },
      { label: "Earn points", text: "Account, reviews, Instagram, TikTok, photo review." },
      { label: "Expiration", text: "Points expire after 6 months with no transaction." }
    ],
    quiz: {
      q: "What is 100 Beauty Circle points worth?",
      answers: ["$1", "$5", "$10"],
      correct: 1
    }
  },
  {
    id: "damaged",
    title: "Damaged Items & Allergic Reaction",
    subtitle: "How to handle sensitive product cases",
    badge: "Case type",
    color: "#8a5a28",
    bullets: [
      "For damaged items, ask for a photo of the damaged item.",
      "Damaged items do not need to be returned.",
      "Send a free replacement / reship, except for marketing or influencer orders.",
      "For allergic reaction cases, collect detailed information: date, first reaction, usage, symptoms, duration, doctor consultation and hospitalization."
    ],
    cards: [
      { label: "Damaged", text: "Photo required. No return needed." },
      { label: "Reship", text: "Free replacement for standard orders." },
      { label: "Tag", text: "Reship – Damaged Item." },
      { label: "Exception", text: "Do not reship marketing/influencer orders." }
    ],
    quiz: {
      q: "Do damaged items need to be returned?",
      answers: ["Yes always", "No", "Only if opened"],
      correct: 1
    }
  },
  {
    id: "not-satisfied",
    title: "Not Satisfied / Returns / Refunds",
    subtitle: "Offer coupon first, then return label if refused",
    badge: "Case type",
    color: "#174c2f",
    bullets: [
      "Customers have 30 days to return items.",
      "First offer a 100% coupon that can be used within 6 months and lets the customer keep the product.",
      "If the customer refuses, issue a return label.",
      "Always choose the cheapest UPS method, not USPS.",
      "Refund after tracking confirms the item was shipped back. Refund excludes the $11.95 shipping fee and is based on the actual price paid."
    ],
    cards: [
      { label: "Step 1", text: "Offer 100% coupon." },
      { label: "Step 2", text: "If refused, create return label." },
      { label: "Refund", text: "After return tracking is confirmed." },
      { label: "Important", text: "Refund actual paid price, not full list price." }
    ],
    quiz: {
      q: "Which carrier method should be chosen for return labels?",
      answers: ["Cheapest UPS", "Any USPS", "Most expensive option"],
      correct: 0
    }
  },
  {
    id: "missing",
    title: "Missing Items",
    subtitle: "Investigate, then reship when confirmed",
    badge: "Case type",
    color: "#2f7d46",
    bullets: [
      "If an item is missing, investigate Shopify first to confirm it was really shipped from our side.",
      "If confirmed missing, reship the item.",
      "Use tag: Reship – Missing item.",
      "Do not reship missing items for marketing/influencer orders."
    ],
    cards: [
      { label: "Check first", text: "Confirm in Shopify." },
      { label: "Action", text: "Reship missing item." },
      { label: "Tag", text: "Reship – Missing item." },
      { label: "Exception", text: "Marketing/influencer orders." }
    ],
    quiz: {
      q: "What should you do before reshipping a missing item?",
      answers: ["Reship immediately", "Investigate Shopify", "Refund shipping only"],
      correct: 1
    }
  },
  {
    id: "wismo",
    title: "WISMO: Wrong Address, DNR, RTS",
    subtitle: "Where Is My Order decision rules",
    badge: "WISMO",
    color: "#20533a",
    bullets: [
      "Wrong address: reshipment costs $19. Create/duplicate a new order with the correct address and send an invoice for $19.",
      "DNR: allow 7 business days even if status shows delivered. Ask the customer to sign the non-receipt form.",
      "If address is correct and confirmed with photo, reship costs $19.",
      "If FedEx delivered to wrong location / no proof of delivery, reship is free and details go to Bonnie.",
      "Returned to sender: provide a free reship and ask for a different address or warn that the next shipment will not be refundable."
    ],
    cards: [
      { label: "Wrong address", text: "$19 reship." },
      { label: "DNR", text: "Wait 7 business days + non-receipt form." },
      { label: "Lost / no POD", text: "Free reship." },
      { label: "RTS", text: "Free reship with new address warning." }
    ],
    quiz: {
      q: "For DNR, how long should we allow even if delivered?",
      answers: ["24 hours", "7 business days", "30 days"],
      correct: 1
    }
  },
  {
    id: "changes",
    title: "Changes Before Shipping",
    subtitle: "BC number decides what is possible",
    badge: "Critical",
    color: "#8a1e1e",
    bullets: [
      "Always check for the BC number on the Shopify order page.",
      "Before BC number: edit the order in Shopify, remove item/change address, and inform NJ3CS and Brad/Staci as needed.",
      "After BC number: cancellation or edits are not possible because the order is already in packing.",
      "Alternative: inform the customer they can request a return label after delivery."
    ],
    cards: [
      { label: "No BC", text: "Edit may be possible." },
      { label: "BC exists", text: "No edit / no cancellation." },
      { label: "Email", text: "Always email NJ3CS for cancellation flow." },
      { label: "Customer option", text: "Use return policy after delivery." }
    ],
    quiz: {
      q: "What is the key thing to check before cancelling or editing?",
      answers: ["Coupon code", "BC number", "Customer birthday"],
      correct: 1
    }
  },
  {
    id: "tags",
    title: "Shopify Tags Cheat Sheet",
    subtitle: "Use the right tag so the history stays clean",
    badge: "Cheat Sheet",
    color: "#174c2f",
    bullets: [
      "DNR: Reship – DNR.",
      "Lost in transit: Reship – Lost in Transit.",
      "Wrong address: Reship – Wrong address.",
      "Returned to sender: Reship – Returned to sender.",
      "Damaged: Reship – Damaged Item or FULL REFUND DAMAGED.",
      "Not satisfied: 100% coupon, Return Label Sent, Return Label Sent – Subscription, Returned by customer.",
      "Missing item: Reship – Missing item."
    ],
    cards: [
      { label: "WISMO", text: "DNR / Lost / Wrong Address / RTS." },
      { label: "Damaged", text: "Reship or full refund damaged." },
      { label: "NS", text: "100% coupon or return label." },
      { label: "Missing", text: "Reship – Missing item." }
    ],
    quiz: {
      q: "Which tag is used for a missing item reship?",
      answers: ["Returned by customer", "Reship – Missing item", "100% coupon"],
      correct: 1
    }
  }
];

function Progress({ current, total }) {
  return (
    <div style={{ height: 10, background: "#dfe8de", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${((current + 1) / total) * 100}%`, height: "100%", background: leafGreen }} />
    </div>
  );
}

function Quiz({ quiz }) {
  const [selected, setSelected] = useState(null);
  const isCorrect = selected === quiz.correct;

  return (
    <div style={{ marginTop: 24, padding: 18, borderRadius: 22, background: "#fff", border: "1px solid #e2e8d8" }}>
      <div style={{ fontSize: 13, fontWeight: 900, color: leafGreen, textTransform: "uppercase", letterSpacing: 1 }}>
        Quick check
      </div>
      <h3 style={{ margin: "8px 0 14px", color: dark }}>{quiz.q}</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {quiz.answers.map((answer, idx) => {
          const active = selected === idx;
          const bg = active ? (idx === quiz.correct ? "#e4f5e8" : "#fdecec") : "#f8faf7";
          const border = active ? (idx === quiz.correct ? "#2f7d46" : "#b91c1c") : "#e5e7eb";
          return (
            <button
              key={answer}
              onClick={() => setSelected(idx)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 14,
                border: `1px solid ${border}`,
                background: bg,
                cursor: "pointer",
                fontWeight: 700,
                color: dark
              }}
            >
              {answer}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div style={{
          marginTop: 12,
          fontWeight: 900,
          color: isCorrect ? leafGreen : "#b91c1c"
        }}>
          {isCorrect ? "Correct." : "Not quite — try again or review the slide."}
        </div>
      )}
    </div>
  );
}

export default function PoliciesTraining() {
  const [index, setIndex] = useState(0);
  const [view, setView] = useState("slides");
  const slide = sections[index];

  const checklist = useMemo(() => [
    "Check Shopify order status, tags, history and tracking.",
    "Check Gorgias timeline for previous conversations.",
    "Confirm whether the order is standard, subscription, marketing/influencer, or B2B.",
    "Check BC number before promising cancellation, edit, or address change.",
    "Apply the correct tag after the action."
  ], []);

  const go = (nextIndex) => {
    setIndex(Math.max(0, Math.min(sections.length - 1, nextIndex)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${cream} 0%, #eef7ed 55%, #fff 100%)`, color: dark }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button
            onClick={() => { window.location.href = "/"; }}
            style={{
              border: "1px solid #d7e3d4",
              background: "#ffffff",
              color: "#174c2f",
              borderRadius: 999,
              padding: "10px 14px",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(16,32,24,.06)"
            }}
          >
            ← Back to Hub
          </button>
          <div style={{ color: "#174c2f", fontWeight: 900, fontSize: 13 }}>
            /customer-service-policies
          </div>
        </div>
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          alignItems: "center",
          padding: 22,
          borderRadius: 28,
          background: "#fff",
          border: "1px solid #e6ebdf",
          boxShadow: "0 18px 60px rgba(16,32,24,.08)"
        }}>
          <div>
            <div style={{ color: brandGreen, fontWeight: 950, letterSpacing: 1, textTransform: "uppercase" }}>
              Yves Rocher Customer Service Hub
            </div>
            <h1 style={{ margin: "6px 0 4px", fontSize: 38, lineHeight: 1.05 }}>
              Policy Training Slides
            </h1>
            <p style={{ margin: 0, color: "#526052", maxWidth: 720 }}>
              Friendly interactive guide for agents: policy rules, workflows, decision points and Shopify tags.
            </p>
          </div>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, #ffffff 0 18%, ${softGreen} 19% 42%, ${brandGreen} 43% 100%)`,
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontWeight: 950,
            textAlign: "center",
            border: `5px solid ${gold}`
          }}>
            YR<br />USA
          </div>
        </header>

        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "22px 0" }}>
          <button onClick={() => setView("slides")} style={tabStyle(view === "slides")}>Slides</button>
          <button onClick={() => setView("overview")} style={tabStyle(view === "overview")}>Overview</button>
          <button onClick={() => setView("checklist")} style={tabStyle(view === "checklist")}>Agent Checklist</button>
        </nav>

        {view === "slides" && (
          <>
            <Progress current={index} total={sections.length} />

            <div style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: 18
            }}>
              <aside style={{
                background: "#fff",
                borderRadius: 24,
                border: "1px solid #e4eadf",
                padding: 14,
                height: "fit-content",
                position: "sticky",
                top: 16
              }}>
                {sections.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => go(i)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 12px",
                      borderRadius: 16,
                      border: i === index ? `2px solid ${leafGreen}` : "1px solid transparent",
                      background: i === index ? softGreen : "transparent",
                      color: dark,
                      cursor: "pointer",
                      fontWeight: i === index ? 900 : 700,
                      marginBottom: 6
                    }}
                  >
                    <div style={{ fontSize: 12, color: i === index ? brandGreen : "#647067" }}>
                      {String(i + 1).padStart(2, "0")} · {s.badge}
                    </div>
                    {s.title}
                  </button>
                ))}
              </aside>

              <main style={{
                borderRadius: 32,
                background: "#fff",
                border: "1px solid #e4eadf",
                overflow: "hidden",
                boxShadow: "0 18px 70px rgba(16,32,24,.08)"
              }}>
                <div style={{ padding: 30, background: `linear-gradient(135deg, ${slide.color}, #102018)`, color: "#fff" }}>
                  <div style={{
                    display: "inline-flex",
                    padding: "7px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.14)",
                    border: "1px solid rgba(255,255,255,.18)",
                    fontWeight: 900,
                    marginBottom: 14
                  }}>
                    Slide {index + 1} / {sections.length} · {slide.badge}
                  </div>
                  <h2 style={{ fontSize: 44, lineHeight: 1.02, margin: 0 }}>{slide.title}</h2>
                  <p style={{ fontSize: 18, opacity: .9, marginBottom: 0 }}>{slide.subtitle}</p>
                </div>

                <div style={{ padding: 30 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 24 }}>
                    <section>
                      <h3 style={{ marginTop: 0, color: brandGreen }}>What to remember</h3>
                      <div style={{ display: "grid", gap: 12 }}>
                        {slide.bullets.map((b, i) => (
                          <div key={b} style={{
                            display: "grid",
                            gridTemplateColumns: "34px 1fr",
                            gap: 12,
                            alignItems: "start",
                            padding: 14,
                            borderRadius: 18,
                            background: "#f7faf5",
                            border: "1px solid #e5eadf"
                          }}>
                            <div style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: softGreen,
                              color: brandGreen,
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 950
                            }}>
                              {i + 1}
                            </div>
                            <div style={{ lineHeight: 1.55, color: "#2b392e" }}>{b}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 style={{ marginTop: 0, color: brandGreen }}>Friendly cards</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {slide.cards.map((c) => (
                          <div key={c.label} style={{
                            padding: 16,
                            borderRadius: 20,
                            background: cream,
                            border: "1px solid #eee2c9"
                          }}>
                            <div style={{ color: slide.color, fontWeight: 950, marginBottom: 7 }}>{c.label}</div>
                            <div style={{ color: "#4a554b", lineHeight: 1.45 }}>{c.text}</div>
                          </div>
                        ))}
                      </div>

                      <Quiz quiz={slide.quiz} />
                    </section>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 28 }}>
                    <button onClick={() => go(index - 1)} disabled={index === 0} style={navButton(index === 0)}>
                      ← Previous
                    </button>
                    <button onClick={() => go(index + 1)} disabled={index === sections.length - 1} style={navButton(index === sections.length - 1)}>
                      Next →
                    </button>
                  </div>
                </div>
              </main>
            </div>
          </>
        )}

        {view === "overview" && (
          <div style={{
            background: "#fff",
            border: "1px solid #e4eadf",
            borderRadius: 28,
            padding: 24,
            boxShadow: "0 18px 70px rgba(16,32,24,.08)"
          }}>
            <h2 style={{ marginTop: 0, color: brandGreen }}>All policy modules</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setView("slides"); go(i); }}
                  style={{
                    textAlign: "left",
                    padding: 18,
                    borderRadius: 20,
                    border: "1px solid #e4eadf",
                    background: "#fbfdf9",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ color: s.color, fontWeight: 950, marginBottom: 8 }}>
                    {String(i + 1).padStart(2, "0")} · {s.badge}
                  </div>
                  <h3 style={{ margin: "0 0 8px", color: dark }}>{s.title}</h3>
                  <p style={{ margin: 0, color: "#526052", lineHeight: 1.5 }}>{s.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "checklist" && (
          <div style={{
            background: "#fff",
            border: "1px solid #e4eadf",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 18px 70px rgba(16,32,24,.08)"
          }}>
            <h2 style={{ marginTop: 0, color: brandGreen }}>Agent decision checklist</h2>
            <p style={{ color: "#526052" }}>Use this before taking action on refund, reship, coupon, cancellation or return requests.</p>
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              {checklist.map((item, i) => (
                <label key={item} style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: 16,
                  borderRadius: 18,
                  background: "#f7faf5",
                  border: "1px solid #e4eadf",
                  fontWeight: 800
                }}>
                  <input type="checkbox" style={{ width: 20, height: 20 }} />
                  <span>{i + 1}. {item}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function tabStyle(active) {
  return {
    padding: "11px 15px",
    borderRadius: 999,
    border: active ? `2px solid ${brandGreen}` : "1px solid #dce5d7",
    background: active ? brandGreen : "#fff",
    color: active ? "#fff" : brandGreen,
    fontWeight: 900,
    cursor: "pointer"
  };
}

function navButton(disabled) {
  return {
    padding: "13px 18px",
    borderRadius: 16,
    border: "none",
    background: disabled ? "#d7ded5" : brandGreen,
    color: "#fff",
    fontWeight: 950,
    cursor: disabled ? "not-allowed" : "pointer"
  };
}
