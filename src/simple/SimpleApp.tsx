"use client";

// A plain-language, single-product shop for the Funnel Neck half-zip. It shares the
// product data, drawings and cart with the full site and runs its own small
// in-page navigation (product → cart → checkout → done).

import { useEffect, useState, type ReactNode } from "react";
import { fmtIn, fmtPrice, getColour, HALF_ZIP as P } from "@/lib/data";
import { useStore, type CompletedOrder } from "@/lib/store";
import { GarmentSVG, type View as Side } from "@/components/garments";

const NAME = "The Funnel Neck";
const BLURB =
  "A heavyweight 460gsm French terry half-zip with a funnel neck and a YKK metal zip. Cut shorter and boxy, with ribbed cuffs and an elastic hem.";
const POINTS = ["Heavyweight 460gsm French terry", "Funnel neck with a YKK metal zip", "Elastic hem and ribbed cuffs", "Made in Portugal"];
const SHIP_FREE = 250;
const SHIP_FEE = 12;

// Supplied product photography. Paths are relative so they resolve both at
// /simple in the app and beside the standalone page.
const PHOTO: Record<string, string> = { navy: "simple/halfzip-navy.jpg" };
const MEASURE_PHOTO = "simple/halfzip-measure.jpg";
const PHOTO_BG = "#F7F6F3"; // the photos' own background
const GUIDE_BLUE = "#2F6FD6"; // matches the lines on the measurement photo

/* ------------------------------------------------------------- navigation */

type View = { name: "home" } | { name: "cart" } | { name: "checkout" } | { name: "done" };

function fromHash(h: string): View {
  const t = h.replace(/^#/, "");
  return t === "cart" || t === "checkout" ? { name: t } : { name: "home" };
}

/* ----------------------------------------------------------------- pieces */

function Button({
  children,
  onClick,
  kind = "dark",
  full,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "dark" | "light";
  full?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`h-14 rounded-full px-8 text-base font-medium transition-colors ${full ? "w-full" : ""} ${
        kind === "dark" ? "bg-ink text-paper hover:bg-navy" : "border border-ink/30 bg-paper text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Picture({ colour, side = "front", className = "" }: { colour: string; side?: Side; className?: string }) {
  const c = getColour(P, colour);
  const photo = side === "front" ? PHOTO[c.id] : undefined;
  if (photo) {
    return (
      <div className={`flex items-center justify-center overflow-hidden rounded-2xl ${className}`} style={{ background: PHOTO_BG }}>
        <img key={photo} src={photo} alt={`${NAME} in ${c.name}, front`} className="fade-layer h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center rounded-2xl ${className}`} style={{ background: PHOTO_BG }}>
      <GarmentSVG key={`${c.id}-${side}`} kind={P.kind} hex={c.hex} view={side} className="fade-layer h-[80%] w-auto" title={`${NAME} in ${c.name}, ${side}`} />
    </div>
  );
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`min-h-12 min-w-12 rounded-full border px-5 py-2 text-base transition-colors ${
        on ? "border-ink bg-ink text-paper" : "border-ink/25 hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

const scrollToGuide = () => document.getElementById("size-guide")?.scrollIntoView({ behavior: "smooth" });

/* ---------------------------------------------------------- product page */

function ProductPage({ go }: { go: (v: View) => void }) {
  const { addToIssue, profile, hydrated } = useStore();
  const [colour, setColour] = useState(P.colours[0].id);
  const [side, setSide] = useState<Side>("front");
  const [size, setSize] = useState<string | null>(null);
  const [needSize, setNeedSize] = useState(false);
  const [added, setAdded] = useState(false);
  const [usual, setUsual] = useState<string | null>(null);
  const [fit, setFit] = useState<string | null>(null);
  const c = getColour(P, colour);

  useEffect(() => {
    if (hydrated && !size && P.sizes.includes(profile.size)) setSize(profile.size);
  }, [hydrated, profile.size, size]);

  // Size finder: the fit is shorter and boxy, so "closer" goes one size down and "roomier" one up.
  const suggestion = (() => {
    if (!usual || !fit) return null;
    const i = P.sizes.indexOf(usual);
    const j = Math.min(P.sizes.length - 1, Math.max(0, i + (fit === "Closer" ? -1 : fit === "Roomier" ? 1 : 0)));
    return P.sizes[j];
  })();

  return (
    <>
      <section className="grid gap-8 py-8 md:grid-cols-2 md:gap-12 md:py-12">
        <div>
          <Picture colour={colour} side={side} className="aspect-square" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["front", "back"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setSide(v)}
                aria-pressed={side === v}
                className={`rounded-xl border-2 ${side === v ? "border-ink" : "border-transparent"}`}
              >
                <Picture colour={colour} side={v} className="aspect-[4/3]" />
                <span className="sr-only">Show {v}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{NAME}</h1>
          <p className="mt-3 text-2xl">{fmtPrice(P.price)}</p>
          <p className="mt-1 text-sm text-muted">In stock · Free shipping over {fmtPrice(SHIP_FREE)}</p>
          <p className="mt-5 text-lg text-charcoal">{BLURB}</p>

          <p className="mt-8 font-medium">
            Colour: <span className="font-normal text-charcoal">{c.name}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {P.colours.map((x) => (
              <button
                key={x.id}
                onClick={() => setColour(x.id)}
                aria-label={x.name}
                aria-pressed={x.id === colour}
                title={x.name}
                className={`h-11 w-11 rounded-full border-2 transition-transform ${x.id === colour ? "scale-110 border-ink" : "border-ink/15"}`}
                style={{ background: x.hex }}
              />
            ))}
          </div>

          <div className="mt-8 flex items-baseline justify-between">
            <p className={`font-medium ${needSize ? "text-[#9a3b1f]" : ""}`}>{needSize ? "Please pick a size" : "Size"}</p>
            <button onClick={scrollToGuide} className="text-sm underline underline-offset-4">
              Size guide
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {P.sizes.map((s) => (
              <Choice
                key={s}
                on={s === size}
                onClick={() => {
                  setSize(s);
                  setNeedSize(false);
                  setAdded(false);
                }}
              >
                {s}
              </Choice>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">Shorter, boxy fit. Take your usual size.</p>

          <div className="mt-8">
            <Button
              full
              onClick={() => {
                if (!size) return setNeedSize(true);
                addToIssue([{ productId: P.id, colour, size }]);
                setAdded(true);
              }}
            >
              {added ? "Added to cart ✓" : `Add to cart · ${fmtPrice(P.price)}`}
            </Button>
            {added && (
              <button onClick={() => go({ name: "cart" })} className="mt-3 w-full text-center underline underline-offset-4">
                View cart
              </button>
            )}
          </div>

          <ul className="mt-8 space-y-2">
            {POINTS.map((pt) => (
              <li key={pt} className="flex gap-3 text-charcoal">
                <span aria-hidden>✓</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Size guide */}
      <section id="size-guide" className="scroll-mt-24 border-t border-ink/10 py-12">
        <h2 className="text-2xl font-semibold md:text-3xl">Size guide</h2>
        <p className="mt-2 text-charcoal">Measured with the garment lying flat.</p>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="self-start overflow-hidden rounded-2xl" style={{ background: PHOTO_BG }}>
            <img src={MEASURE_PHOTO} alt="Funnel neck half-zip with measurement lines A (chest), B (body length) and C (sleeve length)" className="h-auto w-full" />
          </div>
          <div className="min-w-0">
            <div className="overflow-x-auto rounded-xl border border-ink/15">
              <table className="w-full min-w-[34rem] text-left">
                <thead>
                  <tr className="bg-paper-2 text-sm">
                    <th className="px-3 py-3 font-medium">Inches</th>
                    {P.sizes.map((s) => (
                      <th key={s} className={`px-3 py-3 text-center font-medium ${s === size ? "underline underline-offset-4" : ""}`}>
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {P.measurementPoints.map((pt, i) => (
                    <tr key={pt.key} className="border-t border-ink/10">
                      <td className="px-3 py-3 text-sm">
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-paper"
                          style={{ background: GUIDE_BLUE }}>
                          {pt.key}
                        </span>
                        {pt.label}
                      </td>
                      {P.sizes.map((s) => (
                        <td key={s} className={`px-3 py-3 text-center tabular-nums ${s === size ? "font-semibold" : ""}`}>
                          {fmtIn(P.measurements[s][i])}
                          <span className="block text-xs font-normal text-muted">{P.measurementsCm?.[s][i]} cm</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted">
              A: armpit to armpit. B: top of the shoulder to the hem. C: shoulder seam to the end of the cuff.
            </p>

            {/* Size finder */}
            <div className="mt-8 rounded-2xl bg-paper-2 p-6">
              <h3 className="text-xl font-semibold">Not sure? Find your size</h3>
              <p className="mt-4 font-medium">What size do you usually wear?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {P.sizes.map((s) => (
                  <Choice key={s} on={usual === s} onClick={() => setUsual(s)}>
                    {s}
                  </Choice>
                ))}
              </div>
              <p className="mt-5 font-medium">How do you like it to fit?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Closer", "As designed", "Roomier"].map((f) => (
                  <Choice key={f} on={fit === f} onClick={() => setFit(f)}>
                    {f}
                  </Choice>
                ))}
              </div>
              {suggestion && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-5 animate-rise">
                  <p className="text-lg">
                    We suggest <span className="font-semibold">{suggestion}</span>
                    <span className="text-charcoal"> · {fmtIn(P.measurements[suggestion][0])} in across the chest</span>
                  </p>
                  <Button
                    kind="light"
                    onClick={() => {
                      setSize(suggestion);
                      setNeedSize(false);
                      setAdded(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Choose {suggestion}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-6 rounded-2xl bg-navy p-8 text-paper md:grid-cols-3 md:p-12">
        {[
          ["Heavyweight French terry", "460gsm, looped on the inside, and holds its shape."],
          ["YKK zip", "A metal YKK zip that runs smoothly and lasts."],
          ["Made in Portugal", "Knitted and sewn in Portugal."],
        ].map(([t, d]) => (
          <div key={t}>
            <p className="text-xl font-semibold">{t}</p>
            <p className="mt-2 text-paper/80">{d}</p>
          </div>
        ))}
      </section>
    </>
  );
}

/* ------------------------------------------------------ cart and checkout */

function Cart({ go }: { go: (v: View) => void }) {
  const { lines, total, count, setQty, removeLine, hydrated } = useStore();
  if (!hydrated) return <div className="min-h-[50vh]" />;
  const ship = total >= SHIP_FREE ? 0 : SHIP_FEE;

  if (!lines.length) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty</h1>
        <div className="mt-6">
          <Button onClick={() => go({ name: "home" })}>Shop the Funnel Neck</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-10 py-8 md:grid-cols-[1fr_22rem] md:py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your cart ({count})</h1>
        <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          {lines.map((l) => {
            const isHz = l.productId === P.id;
            return (
              <li key={l.key} className="flex gap-4 py-4">
                {isHz ? (
                  <Picture colour={l.colour} className="h-24 w-24 shrink-0" />
                ) : (
                  <div className="h-24 w-24 shrink-0 rounded-2xl bg-paper-2" />
                )}
                <div className="flex flex-1 flex-col">
                  <p className="font-medium">{isHz ? NAME : `Item ${l.productId}`}</p>
                  <p className="text-sm text-muted">
                    {isHz ? getColour(P, l.colour).name : l.colour} · Size {l.size}
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <div className="flex items-center rounded-full border border-ink/20">
                      <button className="h-9 w-9" aria-label="One less" onClick={() => setQty(l.key, l.qty - 1)}>
                        −
                      </button>
                      <span className="w-6 text-center tabular-nums">{l.qty}</span>
                      <button className="h-9 w-9" aria-label="One more" onClick={() => setQty(l.key, l.qty + 1)}>
                        +
                      </button>
                    </div>
                    <button onClick={() => removeLine(l.key)} className="text-sm text-muted underline underline-offset-4">
                      Remove
                    </button>
                  </div>
                </div>
                <p className="tabular-nums">{isHz ? fmtPrice(P.price * l.qty) : ""}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <aside className="h-fit rounded-2xl bg-paper-2 p-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="tabular-nums">{fmtPrice(total)}</span>
        </div>
        <div className="mt-2 flex justify-between">
          <span>Shipping</span>
          <span>{ship ? fmtPrice(ship) : "Free"}</span>
        </div>
        {ship > 0 && <p className="mt-1 text-sm text-muted">Free shipping on orders over {fmtPrice(SHIP_FREE)}.</p>}
        <div className="mt-4 flex justify-between border-t border-ink/15 pt-4 text-lg font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{fmtPrice(total + ship)}</span>
        </div>
        <div className="mt-6">
          <Button full onClick={() => go({ name: "checkout" })}>
            Checkout
          </Button>
        </div>
      </aside>
    </section>
  );
}

function Checkout({ go, onDone }: { go: (v: View) => void; onDone: (o: CompletedOrder) => void }) {
  const { total, lines, completeIssue } = useStore();
  const ship = total >= SHIP_FREE ? 0 : SHIP_FEE;
  const field = "mt-1 h-12 w-full rounded-xl border border-ink/20 bg-paper px-4 outline-none focus:border-ink";
  if (!lines.length) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-3xl font-semibold">Nothing to check out</h1>
        <div className="mt-6">
          <Button onClick={() => go({ name: "home" })}>Shop the Funnel Neck</Button>
        </div>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-xl py-8 md:py-12">
      <button onClick={() => go({ name: "cart" })} className="text-sm text-muted hover:text-ink">
        ← Back to cart
      </button>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Checkout</h1>
      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const o = completeIssue();
          if (o) onDone(o);
        }}
      >
        {[
          ["s-name", "Full name", "name", "sm:col-span-2"],
          ["s-email", "Email", "email", "sm:col-span-2"],
          ["s-address", "Street address", "street-address", "sm:col-span-2"],
          ["s-city", "City", "address-level2", ""],
          ["s-zip", "ZIP code", "postal-code", ""],
        ].map(([id, label, auto, span]) => (
          <label key={id} htmlFor={id} className={`block ${span}`}>
            <span className="text-sm font-medium">{label}</span>
            <input id={id} required type={id === "s-email" ? "email" : "text"} autoComplete={auto} className={field} />
          </label>
        ))}
        <p className="rounded-xl bg-paper-2 p-4 text-sm text-charcoal sm:col-span-2">This is a demo shop. No payment is taken.</p>
        <div className="sm:col-span-2">
          <Button full type="submit">
            Place order · {fmtPrice(total + ship)}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Done({ order, go }: { order: CompletedOrder | null; go: (v: View) => void }) {
  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <p className="text-5xl" aria-hidden>
        ✓
      </p>
      <h1 className="mt-4 text-3xl font-semibold">Thanks for your order!</h1>
      {order && (
        <p className="mt-3 text-lg text-charcoal">
          Order {order.orderNo} · {order.garments.length} {order.garments.length === 1 ? "item" : "items"}. We&rsquo;ll email you
          when it ships.
        </p>
      )}
      <div className="mt-8">
        <Button onClick={() => go({ name: "home" })}>Back to the Funnel Neck</Button>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- app */

export function SimpleApp() {
  const { count, hydrated } = useStore();
  const [view, setView] = useState<View>({ name: "home" });
  const [order, setOrder] = useState<CompletedOrder | null>(null);

  useEffect(() => {
    setView(fromHash(window.location.hash));
    const onPop = () => setView(fromHash(window.location.hash));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (v: View) => {
    setView(v);
    try {
      window.history.pushState(null, "", v.name === "home" ? "#" : `#${v.name}`);
    } catch {
      /* sandboxed frame: navigation still works in memory */
    }
    window.scrollTo(0, 0);
  };

  let page: ReactNode;
  switch (view.name) {
    case "cart":
      page = <Cart go={go} />;
      break;
    case "checkout":
      page = (
        <Checkout
          go={go}
          onDone={(o) => {
            setOrder(o);
            go({ name: "done" });
          }}
        />
      );
      break;
    case "done":
      page = <Done order={order} go={go} />;
      break;
    default:
      page = <ProductPage go={go} />;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-ink/10 bg-paper/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <button
            onClick={() => go({ name: "home" })}
            className="whitespace-nowrap text-xs font-semibold tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]"
          >
            FINEST UNIFORM
          </button>
          <nav className="flex items-center gap-5 text-sm md:gap-8" aria-label="Main">
            <button
              onClick={() => {
                if (view.name !== "home") go({ name: "home" });
                setTimeout(scrollToGuide, 50);
              }}
              className="hidden whitespace-nowrap hover:underline sm:inline"
            >
              Size guide
            </button>
            <button onClick={() => go({ name: "cart" })} className="whitespace-nowrap rounded-full bg-ink px-4 py-2 text-paper">
              Cart{hydrated && count ? ` (${count})` : ""}
            </button>
          </nav>
        </div>
      </header>

      <main key={view.name} className="mx-auto max-w-6xl animate-fade px-4 md:px-8">
        {page}
      </main>

      <footer className="mt-20 border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4 py-8 text-sm text-muted md:px-8">
          <p>Finest Uniform · Made in Portugal</p>
          <p>Free shipping over {fmtPrice(SHIP_FREE)} · Free returns within 30 days</p>
        </div>
      </footer>
    </div>
  );
}
