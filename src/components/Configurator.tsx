"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtPrice, getColour, getProduct, PRODUCTS, type Slot } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Figure, type Outfit } from "./Figure";
import { Fabric } from "./Plate";
import { SizeSelect } from "./Swatches";
import { Action, Stepper } from "./ui";

const SLOTS: { slot: Slot; no: string; note: string }[] = [
  { slot: "base", no: "01", note: "Worn against the skin" },
  { slot: "mid", no: "02", note: "Over the base, or alone" },
  { slot: "outer", no: "03", note: "Over everything" },
  { slot: "bottom", no: "04", note: "The constant" },
];

type Counts = Record<string, number>; // "001:navy" -> n

const PRESETS: Record<number, Counts> = {
  3: { "001:navy": 1, "001:cream": 1, "002:grey": 1, "004:charcoal": 1 },
  5: { "001:navy": 2, "001:cream": 1, "001:grey": 1, "002:grey": 1, "002:navy": 1, "004:charcoal": 1, "004:stone": 1 },
  7: {
    "001:navy": 2,
    "001:cream": 1,
    "001:grey": 1,
    "001:black": 1,
    "002:grey": 1,
    "003:charcoal": 1,
    "005:olive": 1,
    "004:charcoal": 1,
    "004:stone": 1,
  },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function variants(counts: Counts, slot: Slot) {
  return Object.entries(counts)
    .filter(([k, n]) => n > 0 && getProduct(k.split(":")[0])?.slot === slot)
    .map(([k]) => k.split(":") as [string, string]);
}

const layer = ([id, colour]: [string, string]) => {
  const p = getProduct(id)!;
  return { kind: p.kind, hex: getColour(p, colour).hex };
};

export function Configurator() {
  const { addToIssue, profile, hydrated } = useStore();
  const [days, setDays] = useState(3);
  const [counts, setCounts] = useState<Counts>(PRESETS[3]);
  const [tab, setTab] = useState<Record<Slot, string>>({ base: "001", mid: "002", outer: "005", bottom: "004" });
  const [day, setDay] = useState(0);
  const [topSize, setTopSize] = useState("M");
  const [waist, setWaist] = useState("32");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (hydrated) setTopSize(profile.size);
  }, [hydrated, profile.size]);

  const preset = (d: number) => {
    setDays(d);
    setCounts(PRESETS[d]);
    setDay(0);
  };

  const bump = (key: string, n: number) => setCounts((c) => ({ ...c, [key]: n }));

  const v = useMemo(
    () => ({
      base: variants(counts, "base"),
      mid: variants(counts, "mid"),
      outer: variants(counts, "outer"),
      bottom: variants(counts, "bottom"),
    }),
    [counts]
  );

  const totals = useMemo(() => {
    const byProduct: Record<string, number> = {};
    let pieces = 0;
    let price = 0;
    for (const [k, n] of Object.entries(counts)) {
      if (!n) continue;
      const id = k.split(":")[0];
      byProduct[id] = (byProduct[id] ?? 0) + n;
      pieces += n;
      price += getProduct(id)!.price * n;
    }
    return { byProduct, pieces, price };
  }, [counts]);

  const B = v.base.length;
  const M = v.mid.length;
  const combos = (B + M + B * M) * (1 + v.outer.length) * Math.max(1, v.bottom.length);

  // A simple rotation: bases cycle daily, mid every other day, outer every third.
  const rotation: Outfit[] = DAYS.map((_, d) => ({
    base: B ? layer(v.base[d % B]) : null,
    mid: M && (d % 2 === 1 || !B) ? layer(v.mid[Math.floor(d / 2) % M]) : null,
    outer: v.outer.length && d % 3 === 2 ? layer(v.outer[0]) : null,
    bottom: v.bottom.length ? layer(v.bottom[d % v.bottom.length]) : null,
  }));
  const shown = rotation[day];
  const describe = (o: Outfit, d: number) => {
    const parts: string[] = [];
    if (o.base) parts.push(`001 ${getColour(getProduct("001")!, v.base[d % B][1]).name}`);
    if (o.mid) {
      const [id, col] = v.mid[Math.floor(d / 2) % M];
      parts.push(`${id} ${getColour(getProduct(id)!, col).name}`);
    }
    if (o.outer) parts.push(`005 ${getColour(getProduct("005")!, v.outer[0][1]).name}`);
    if (o.bottom) {
      const [, col] = v.bottom[d % v.bottom.length];
      parts.push(`004 ${getColour(getProduct("004")!, col).name}`);
    }
    return parts.join(" + ") || "—";
  };

  const cfgCode = `FU-${days}D-${String(totals.pieces).padStart(2, "0")}-${Object.keys(totals.byProduct).sort().join("")}`;

  const addAll = () => {
    const items = Object.entries(counts)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => {
        const [productId, colour] = k.split(":");
        return { productId, colour, qty: n, size: getProduct(productId)!.slot === "bottom" ? waist : topSize };
      });
    if (!items.length) return;
    addToIssue(items);
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  return (
    <div className="shell pt-8 md:pt-12">
      {/* Header strip */}
      <div className="grid grid-cols-12 items-end gap-x-4 gap-y-6 border-b border-ink pb-4">
        <div className="col-span-12 md:col-span-6">
          <p className="label text-muted">02.B — Uniform configurator</p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.025em] md:text-[2.75rem]">Configure your uniform</h1>
        </div>
        <div className="col-span-12 flex items-end justify-between gap-4 md:col-span-6 md:justify-end md:gap-10">
          <div>
            <p className="label mb-2 text-muted">Preset</p>
            <div className="flex border border-ink">
              {[3, 5, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => preset(d)}
                  className={`h-9 px-3 font-mono text-[0.75rem] uppercase tracking-[0.06em] transition-colors md:px-4 ${
                    days === d ? "bg-ink text-paper" : "hover:bg-paper-2"
                  }`}
                >
                  {d}-day
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="label text-muted">Configuration</p>
            <p className="mt-2 font-mono text-[0.8125rem]">{cfgCode}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-12 gap-x-4 gap-y-10 md:gap-x-6">
        {/* Visual */}
        <div className="col-span-12 md:col-span-5 lg:order-2 lg:col-span-4">
          <div className="md:sticky md:top-20">
            <div className="hairline-grid grain relative aspect-[3/4] bg-paper-2 md:aspect-[3/5]">
              <Figure outfit={shown} className="absolute inset-[5%] h-[90%] w-[90%] text-ink" />
              <span className="label absolute left-3 top-3">{DAYS[day]}</span>
              <span className="label absolute right-3 top-3 text-muted">Fig. {String(day + 1).padStart(2, "0")}/07</span>
              <span className="label absolute inset-x-3 bottom-3 text-muted">{describe(shown, day)}</span>
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setDay(i)}
                  className={`border-t-2 pt-1.5 text-left font-mono text-[0.625rem] uppercase tracking-[0.06em] transition-colors ${
                    day === i ? "border-ink text-ink" : "border-rule text-muted hover:text-ink"
                  } ${i >= days ? "opacity-40" : ""}`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="label mt-2 text-muted">
              Days {days + 1}–7 repeat the rotation.
            </p>
          </div>
        </div>

        {/* Slots */}
        <div className="col-span-12 md:col-span-7 lg:order-1 lg:col-span-5">
          {SLOTS.map(({ slot, no, note }) => {
            const options = PRODUCTS.filter((p) => p.slot === slot);
            const active = getProduct(tab[slot])!;
            const slotCount = Object.entries(counts)
              .filter(([k]) => getProduct(k.split(":")[0])?.slot === slot)
              .reduce((s, [, n]) => s + n, 0);
            return (
              <section key={slot} className="border-t border-ink pb-6 pt-3">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="label text-muted">{no}</span>
                    <h2 className="caps">{slot}</h2>
                    <span className="label hidden text-muted sm:inline">{note}</span>
                  </div>
                  <span className="label tabular-nums">{slotCount ? `${slotCount} ${slotCount === 1 ? "piece" : "pieces"}` : "None"}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {options.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setTab((t) => ({ ...t, [slot]: p.id }))}
                      className={`border px-3 py-1.5 text-left text-[0.8125rem] transition-colors ${
                        tab[slot] === p.id ? "border-ink" : "rule text-muted hover:text-ink"
                      }`}
                    >
                      <span className="font-mono">{p.id}</span> {p.name}
                    </button>
                  ))}
                  {slotCount > 0 && (
                    <button
                      onClick={() =>
                        setCounts((c) =>
                          Object.fromEntries(Object.entries(c).filter(([k]) => getProduct(k.split(":")[0])?.slot !== slot))
                        )
                      }
                      className="label px-2 text-muted hover:text-ink"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <ul className="mt-3">
                  {active.colours.map((c) => {
                    const key = `${active.id}:${c.id}`;
                    const n = counts[key] ?? 0;
                    return (
                      <li key={key} className="flex items-center gap-3 border-b rule py-2">
                        <span className="relative h-6 w-6 shrink-0 overflow-hidden">
                          <Fabric hex={c.hex} id={`cf-${key}`} className="absolute inset-0 h-full w-full" scale={0.5} />
                        </span>
                        <span className={`flex-1 text-sm transition-colors ${n ? "text-ink" : "text-muted"}`}>{c.name}</span>
                        <span className="label hidden text-muted sm:inline">{c.code}</span>
                        <Stepper value={n} onChange={(x) => bump(key, x)} label={`${c.name} quantity`} />
                      </li>
                    );
                  })}
                </ul>
                <p className="label mt-2 text-muted">
                  {active.id} / {fmtPrice(active.price)} / {active.dispatch ?? "Available now"}
                </p>
              </section>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="col-span-12 lg:order-3 lg:col-span-3">
          <div className="border-t border-ink pt-3 lg:sticky lg:top-20">
            <p className="caps">{days}-day uniform</p>
            <ul className="mt-4 font-mono text-[0.875rem]">
              {Object.entries(totals.byProduct)
                .sort()
                .map(([id, n]) => (
                  <li key={id} className="flex justify-between border-b rule py-1.5">
                    <span>
                      {n} × {id}
                    </span>
                    <span className="text-muted">{getProduct(id)!.name.split(" ").slice(-1)[0]}</span>
                  </li>
                ))}
              {!totals.pieces && <li className="py-1.5 text-muted">Nothing selected</li>}
            </ul>
            <p className="mt-5 text-2xl tracking-[-0.01em] tabular-nums">
              <span className="font-mono">{combos}</span>{" "}
              <span className="text-base text-charcoal">possible combinations</span>
            </p>

            <div className="mt-6 border-t rule pt-3">
              <p className="label text-muted">Top size</p>
              <div className="-ml-2 mt-1">
                <SizeSelect sizes={["XS", "S", "M", "L", "XL", "XXL"]} value={topSize} onChange={setTopSize} />
              </div>
              {v.bottom.length > 0 && (
                <>
                  <p className="label mt-3 text-muted">Waist</p>
                  <div className="-ml-2 mt-1">
                    <SizeSelect sizes={["28", "30", "32", "34", "36", "38"]} value={waist} onChange={setWaist} />
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex items-baseline justify-between border-t border-ink pt-3">
              <span className="label">
                {String(totals.pieces).padStart(2, "0")} garments
              </span>
              <span className="font-mono tabular-nums">{fmtPrice(totals.price)}</span>
            </div>
            <div className="mt-5">
              <Action onClick={addAll} full disabled={!totals.pieces}>
                {added ? "Added to your issue" : "Add uniform to issue"}
              </Action>
            </div>

            <ol className="mt-8">
              {rotation.slice(0, days).map((o, d) => (
                <li key={d}>
                  <button
                    onClick={() => setDay(d)}
                    className={`grid w-full grid-cols-[2.5rem_1fr] border-b rule py-1.5 text-left text-[0.75rem] transition-colors ${
                      day === d ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    <span className="label">{DAYS[d]}</span>
                    <span>{describe(o, d)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
