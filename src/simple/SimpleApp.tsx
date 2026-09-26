"use client";

// A plain-language version of the Finest Uniform shop: standard shop words
// (Shop, Cart, Checkout), four products, a short "help me choose", and a
// simple checkout. It shares the product data, drawings and cart with the
// full site, and runs its own small in-page navigation.

import { useEffect, useState, type ReactNode } from "react";
import { fmtIn, fmtPrice, getColour, getProduct, PRODUCTS, type Product } from "@/lib/data";
import { recommend } from "@/lib/recommend";
import { useStore, type CompletedOrder } from "@/lib/store";
import { GarmentSVG } from "@/components/garments";

/* ------------------------------------------------------------------ words */

const NAME: Record<string, string> = {
  "001": "The T-shirt",
  "004": "The Polo",
  "002": "The Sweatshirt",
  "003": "The Hoodie",
};

const BLURB: Record<string, string> = {
  "001": "A heavy cotton T-shirt that keeps its shape. Roomy in the chest, a little shorter in the body.",
  "004": "Our T-shirt with a collar and three buttons. Same soft, heavy cotton.",
  "002": "A thick, soft crewneck that looks sharp over a T-shirt or on its own.",
  "003": "The same thick cotton as the sweatshirt, with a hood that holds its shape.",
};

const POINTS: Record<string, string[]> = {
  "001": ["Heavy 100% cotton", "Washed before it ships, so it won't shrink", "Made in the USA"],
  "004": ["Heavy 100% cotton", "Collar that stays flat after washing", "Made in the USA"],
  "002": ["Thick organic cotton", "Ribbed cuffs and hem that keep their shape", "Made in the USA"],
  "003": ["Thick organic cotton", "Front pocket and flat cotton drawcord", "Made in the USA"],
};

const SHOP_ORDER = ["001", "004", "002", "003"];

function shipping(p: Product) {
  if (p.status === "available") return "In stock";
  const [m, y] = p.issueDate.split(".");
  const month = new Date(2000 + Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "long" });
  return `Pre-order · ships in ${month}`;
}

/* ------------------------------------------------------------- navigation */

type View =
  | { name: "home" }
  | { name: "product"; id: string }
  | { name: "quiz" }
  | { name: "cart" }
  | { name: "checkout" }
  | { name: "done" };

const toHash = (v: View) => (v.name === "product" ? `shop-${v.id}` : v.name);
function fromHash(h: string): View {
  const t = h.replace(/^#/, "");
  if (t.startsWith("shop-") && getProduct(t.slice(5))) return { name: "product", id: t.slice(5) };
  if (t === "quiz" || t === "cart" || t === "checkout") return { name: t };
  return { name: "home" };
}

/* ----------------------------------------------------------------- pieces */

function Button({
  children,
  onClick,
  kind = "dark",
  full,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "dark" | "light";
  full?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-14 rounded-full px-8 text-base font-medium transition-colors disabled:opacity-40 ${full ? "w-full" : ""} ${
        kind === "dark" ? "bg-ink text-paper hover:bg-navy" : "border border-ink/30 bg-paper text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Picture({ p, colour, className = "" }: { p: Product; colour?: string; className?: string }) {
  const c = getColour(p, colour ?? p.colours[0].id);
  return (
    <div className={`flex items-center justify-center rounded-2xl bg-paper-2 ${className}`}>
      <GarmentSVG key={c.id} kind={p.kind} hex={c.hex} className="fade-layer h-[78%] w-auto" title={`${NAME[p.id]} in ${c.name}`} />
    </div>
  );
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`min-h-12 rounded-full border px-5 py-2 text-base transition-colors ${
        on ? "border-ink bg-ink text-paper" : "border-ink/25 hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ pages */

function Home({ go }: { go: (v: View) => void }) {
  return (
    <>
      <section className="grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">Better basics. Made in the USA.</h1>
          <p className="mt-5 max-w-md text-lg text-charcoal">
            Four everyday pieces in heavy cotton. Pick your size once and never think about it again.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}>Shop now</Button>
            <Button kind="light" onClick={() => go({ name: "quiz" })}>
              Help me choose
            </Button>
          </div>
        </div>
        <Picture p={getProduct("001")!} colour="navy" className="aspect-square" />
      </section>

      <section id="shop" className="scroll-mt-24 py-8">
        <h2 className="text-2xl font-semibold md:text-3xl">Shop</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {SHOP_ORDER.map((id) => {
            const p = getProduct(id)!;
            return (
              <button key={id} onClick={() => go({ name: "product", id })} className="group text-left">
                <Picture p={p} className="aspect-[4/5] transition-colors group-hover:bg-paper-3" />
                <p className="mt-3 text-lg font-medium">{NAME[id]}</p>
                <p className="text-charcoal">{fmtPrice(p.price)}</p>
                <p className="text-sm text-muted">{p.colours.length} colours · {shipping(p)}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-12 grid gap-6 rounded-2xl bg-navy p-8 text-paper md:grid-cols-3 md:p-12">
        {[
          ["Heavy cotton", "Thicker than most T-shirts, so it drapes well and lasts."],
          ["Won't shrink", "Every piece is washed before it ships."],
          ["Made in the USA", "Knitted in North Carolina, sewn in Los Angeles."],
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

function ProductPage({ id, go }: { id: string; go: (v: View) => void }) {
  const p = getProduct(id)!;
  const { addToIssue, profile, hydrated } = useStore();
  const [colour, setColour] = useState(p.colours[0].id);
  const [size, setSize] = useState<string | null>(null);
  const [chart, setChart] = useState(false);
  const [added, setAdded] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const c = getColour(p, colour);

  useEffect(() => {
    if (hydrated && !size && p.sizes.includes(profile.size)) setSize(profile.size);
  }, [hydrated, profile.size, size, p.sizes]);

  return (
    <section className="grid gap-10 py-8 md:grid-cols-2 md:py-12">
      <Picture p={p} colour={colour} className="aspect-square" />
      <div>
        <button onClick={() => go({ name: "home" })} className="text-sm text-muted hover:text-ink">
          ← Back to shop
        </button>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{NAME[id]}</h1>
        <p className="mt-2 text-2xl">{fmtPrice(p.price)}</p>
        <p className="mt-1 text-sm text-muted">{shipping(p)}</p>
        <p className="mt-5 text-lg text-charcoal">{BLURB[id]}</p>

        <p className="mt-8 font-medium">
          Colour: <span className="font-normal text-charcoal">{c.name}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {p.colours.map((x) => (
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
          <button onClick={() => setChart((v) => !v)} className="text-sm underline underline-offset-4">
            {chart ? "Hide size chart" : "Size chart"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {p.sizes.map((s) => (
            <Choice key={s} on={s === size} onClick={() => { setSize(s); setNeedSize(false); }}>
              {s}
            </Choice>
          ))}
        </div>
        {chart && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/15">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-paper-2">
                  <th className="px-3 py-2 font-medium">Size</th>
                  <th className="px-3 py-2 font-medium">Chest (across)</th>
                  <th className="px-3 py-2 font-medium">Length</th>
                </tr>
              </thead>
              <tbody>
                {p.sizes.map((s) => (
                  <tr key={s} className={`border-t border-ink/10 ${s === size ? "font-medium" : ""}`}>
                    <td className="px-3 py-2">{s}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtIn(p.measurements[s][0])} in</td>
                    <td className="px-3 py-2 tabular-nums">{fmtIn(p.measurements[s][1])} in</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-3 py-2 text-xs text-muted">Measured with the shirt lying flat. Between sizes? Take the larger one.</p>
          </div>
        )}

        <div className="mt-8">
          <Button
            full
            onClick={() => {
              if (!size) return setNeedSize(true);
              addToIssue([{ productId: id, colour, size }]);
              setAdded(true);
            }}
          >
            {added ? "Added to cart ✓" : `Add to cart · ${fmtPrice(p.price)}`}
          </Button>
          {added && (
            <button onClick={() => go({ name: "cart" })} className="mt-3 w-full text-center underline underline-offset-4">
              View cart
            </button>
          )}
        </div>

        <ul className="mt-8 space-y-2">
          {POINTS[id].map((pt) => (
            <li key={pt} className="flex gap-3 text-charcoal">
              <span aria-hidden>✓</span>
              {pt}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const QUESTIONS = [
  { key: "fit", q: "How do you like your shirts to fit?", options: ["Close", "Regular", "Loose"] },
  { key: "collar", q: "T-shirts, polos, or both?", options: ["T-shirts", "Polos", "Both"] },
  { key: "days", q: "How many days a week do you wear one?", options: ["1–2 days", "3–4 days", "5+ days"] },
  { key: "sweat", q: "Want a sweatshirt to go over it?", options: ["Yes", "No"] },
  { key: "size", q: "What size do you usually wear?", options: ["XS", "S", "M", "L", "XL", "XXL"] },
] as const;

function Quiz({ go }: { go: (v: View) => void }) {
  const { addToIssue } = useStore();
  const [a, setA] = useState<Record<string, string>>({});
  const done = QUESTIONS.every((q) => a[q.key]);

  const rec = done
    ? recommend({
        name: "",
        fit: { Close: "Compact", Regular: "Standard", Loose: "Relaxed" }[a.fit] ?? "Standard",
        length: "Standard",
        wear: a.sweat === "Yes" ? "Both" : "Alone",
        colours: [],
        frequency: a.days,
        collar: { "T-shirts": "Crew", Polos: "Polo", Both: "Both" }[a.collar] ?? "Crew",
        size: a.size,
        height: "",
        weight: "",
      })
    : null;
  const total = rec?.items.reduce((s, x) => s + getProduct(x.productId)!.price, 0) ?? 0;

  return (
    <section className="mx-auto max-w-2xl py-8 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Help me choose</h1>
      <p className="mt-2 text-lg text-charcoal">Five quick questions. We'll suggest what to get.</p>

      <ol className="mt-8 space-y-8">
        {QUESTIONS.map((q, i) => (
          <li key={q.key}>
            <p className="text-lg font-medium">
              {i + 1}. {q.q}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.options.map((o) => (
                <Choice key={o} on={a[q.key] === o} onClick={() => setA((x) => ({ ...x, [q.key]: o }))}>
                  {o}
                </Choice>
              ))}
            </div>
          </li>
        ))}
      </ol>

      {rec && (
        <div className="mt-10 rounded-2xl bg-paper-2 p-6 animate-rise md:p-8">
          <h2 className="text-2xl font-semibold">We suggest</h2>
          <ul className="mt-4 divide-y divide-ink/10">
            {rec.items.map((it, i) => {
              const p = getProduct(it.productId)!;
              return (
                <li key={i} className="flex items-center gap-4 py-3">
                  <Picture p={p} colour={it.colour} className="h-16 w-16 shrink-0 rounded-xl bg-paper" />
                  <div className="flex-1">
                    <p className="font-medium">{NAME[p.id]}</p>
                    <p className="text-sm text-muted">
                      {getColour(p, it.colour).name} · Size {it.size}
                    </p>
                  </div>
                  <p>{fmtPrice(p.price)}</p>
                </li>
              );
            })}
          </ul>
          {a.fit === "Close" && <p className="mt-2 text-sm text-charcoal">We went one size down for a closer fit.</p>}
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-lg">
              Total <span className="font-semibold">{fmtPrice(total)}</span>
            </p>
            <Button
              onClick={() => {
                addToIssue(rec.items.map(({ productId, colour, size }) => ({ productId, colour, size })));
                go({ name: "cart" });
              }}
            >
              Add all to cart
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function Cart({ go }: { go: (v: View) => void }) {
  const { lines, total, count, setQty, removeLine, hydrated } = useStore();
  if (!hydrated) return <div className="min-h-[50vh]" />;
  const ship = total >= 250 ? 0 : 12;

  if (!lines.length) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty</h1>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => go({ name: "home" })}>Shop now</Button>
          <Button kind="light" onClick={() => go({ name: "quiz" })}>
            Help me choose
          </Button>
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
            const p = getProduct(l.productId)!;
            return (
              <li key={l.key} className="flex gap-4 py-4">
                <Picture p={p} colour={l.colour} className="h-24 w-24 shrink-0" />
                <div className="flex flex-1 flex-col">
                  <p className="font-medium">{NAME[p.id]}</p>
                  <p className="text-sm text-muted">
                    {getColour(p, l.colour).name} · Size {l.size}
                  </p>
                  {p.status !== "available" && <p className="text-sm text-muted">{shipping(p)}</p>}
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
                <p className="tabular-nums">{fmtPrice(p.price * l.qty)}</p>
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
        {ship > 0 && <p className="mt-1 text-sm text-muted">Free shipping on orders over $250.</p>}
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
  const ship = total >= 250 ? 0 : 12;
  const field = "mt-1 h-12 w-full rounded-xl border border-ink/20 bg-paper px-4 outline-none focus:border-ink";
  if (!lines.length) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-3xl font-semibold">Nothing to check out</h1>
        <div className="mt-6">
          <Button onClick={() => go({ name: "home" })}>Shop now</Button>
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
        <p className="rounded-xl bg-paper-2 p-4 text-sm text-charcoal sm:col-span-2">
          This is a demo shop. No payment is taken.
        </p>
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
          Order {order.orderNo} · {order.garments.length} {order.garments.length === 1 ? "item" : "items"}. We'll email you when it
          ships.
        </p>
      )}
      <div className="mt-8">
        <Button onClick={() => go({ name: "home" })}>Keep shopping</Button>
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
      window.history.pushState(null, "", `#${toHash(v)}`);
    } catch {
      /* sandboxed frame: navigation still works in memory */
    }
    window.scrollTo(0, 0);
  };

  let page: ReactNode;
  switch (view.name) {
    case "product":
      page = <ProductPage key={view.id} id={view.id} go={go} />;
      break;
    case "quiz":
      page = <Quiz go={go} />;
      break;
    case "cart":
      page = <Cart go={go} />;
      break;
    case "checkout":
      page = <Checkout go={go} onDone={(o) => { setOrder(o); go({ name: "done" }); }} />;
      break;
    case "done":
      page = <Done order={order} go={go} />;
      break;
    default:
      page = <Home go={go} />;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-ink/10 bg-paper/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <button onClick={() => go({ name: "home" })} className="whitespace-nowrap text-xs font-semibold tracking-[0.18em] sm:text-sm sm:tracking-[0.2em]">
            FINEST UNIFORM
          </button>
          <nav className="flex items-center gap-5 text-sm md:gap-8" aria-label="Main">
            <button onClick={() => go({ name: "home" })} className="hidden hover:underline sm:inline">
              Shop
            </button>
            <button onClick={() => go({ name: "quiz" })} className="hidden whitespace-nowrap hover:underline sm:inline">
              Help me choose
            </button>
            <button onClick={() => go({ name: "cart" })} className="whitespace-nowrap rounded-full bg-ink px-4 py-2 text-paper">
              Cart{hydrated && count ? ` (${count})` : ""}
            </button>
          </nav>
        </div>
      </header>

      <main key={toHash(view)} className="mx-auto max-w-6xl px-4 animate-fade md:px-8">
        {page}
      </main>

      <footer className="mt-20 border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4 py-8 text-sm text-muted md:px-8">
          <p>Finest Uniform · Made in the USA</p>
          <p>Free shipping over $250 · Free returns within 30 days</p>
        </div>
      </footer>
    </div>
  );
}
