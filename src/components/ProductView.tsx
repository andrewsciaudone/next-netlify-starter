"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fmtPrice, getColour, getProduct, type Product } from "@/lib/data";
import { outfitOf } from "@/lib/outfit";
import { useStore } from "@/lib/store";
import { Figure } from "./Figure";
import { GarmentSVG, MeasureDiagram } from "./garments";
import { MeasureTable } from "./MeasureTable";
import { Fabric, Plate, WovenLabel } from "./Plate";
import { SizeSelect, Swatches } from "./Swatches";
import { Action, SectionHead, Spec } from "./ui";

const SLOTS = ["base", "mid", "outer", "bottom"] as const;

export function ProductView({ product: p }: { product: Product }) {
  const { addToIssue, profile, hydrated } = useStore();
  const [colour, setColour] = useState(p.colours[0].id);
  const [size, setSize] = useState<string | null>(null);
  const [guide, setGuide] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [added, setAdded] = useState(false);
  const c = getColour(p, colour);
  const archived = p.status === "fully-issued";
  const isBottom = p.slot === "bottom";

  // Pre-select the customer's standard size once their record has loaded.
  useEffect(() => {
    if (hydrated && !size && !isBottom && p.sizes.includes(profile.size)) setSize(profile.size);
  }, [hydrated, profile.size, p.sizes, size, isBottom]);

  const add = () => {
    if (!size) {
      setNudge(true);
      setTimeout(() => setNudge(false), 1600);
      return;
    }
    addToIssue([{ productId: p.id, colour, size }]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  const plateTone = (["black", "navy", "charcoal", "olive"].includes(c.id) ? "stone" : "paper") as "stone" | "paper";

  return (
    <>
      <div className="shell pt-6">
        <nav className="flex items-center gap-2 label text-muted" aria-label="Breadcrumb">
          <Link href={archived ? "/archive" : "/uniforms"} className="hover:text-ink">
            {archived ? "Archive" : "Uniforms"}
          </Link>
          <span>/</span>
          <span className="text-ink">{p.id}</span>
        </nav>
      </div>

      <div className="shell mt-6 grid grid-cols-12 gap-x-4 gap-y-10 md:gap-x-8">
        {/* Gallery */}
        <div className="col-span-12 lg:col-span-7">
          <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:px-0">
            <Plate tone={plateTone} no={`${p.id} — Front`} caption={c.name} meta={c.code} className="w-[86vw] shrink-0 snap-start md:col-span-2 md:w-auto" ratio="aspect-[4/5]">
              <div key={colour} className="fade-layer flex h-full w-full items-center justify-center">
                <GarmentSVG kind={p.kind} hex={c.hex} className="h-[74%] w-auto" />
              </div>
            </Plate>
            <Plate tone="warm" no={`${p.id} — Back`} caption={c.name} className="w-[86vw] shrink-0 snap-start md:w-auto">
              <div key={colour} className="fade-layer flex h-full w-full items-center justify-center">
                <GarmentSVG kind={p.kind} hex={c.hex} view="back" className="h-[66%] w-auto" />
              </div>
            </Plate>
            <Plate tone="charcoal" no={`${p.id} — Fabric`} caption={p.weight} meta="×6" className="w-[86vw] shrink-0 snap-start md:w-auto" inner="">
              <Fabric key={colour} hex={c.hex} id={`pv-${colour}`} className="fade-layer absolute inset-0 h-full w-full" scale={1.5} />
            </Plate>
            <Plate tone="grey" no={`${p.id} — Fit`} caption={p.model.replace("Model is ", "").replace(/\. Chest.*| Wears.*/, "")} meta={p.model.match(/Wears \w+/)?.[0]} className="w-[86vw] shrink-0 snap-start md:w-auto">
              <Figure outfit={outfitOf([[p.id, colour], ...(p.slot !== "base" ? [["001", "white"] as [string, string]] : [])])} className="h-[90%] w-auto text-ink" />
            </Plate>
            <Plate tone="paper" no={`${p.id} — Detail`} caption={p.construction[0]} className="w-[86vw] shrink-0 snap-start md:w-auto">
              <div key={colour} className="fade-layer h-full w-full">
                <GarmentSVG
                  kind={p.kind}
                  hex={c.hex}
                  viewBox={p.kind === "trouser" ? "110 0 180 130" : p.kind === "hood" ? "130 0 140 170" : "120 20 160 120"}
                  className="h-full w-full"
                />
              </div>
            </Plate>
            <Plate tone="paper" no={`${p.id} — Technical`} caption="Flat, front" meta="Scale 1:8" className="hairline-grid w-[86vw] shrink-0 snap-start md:col-span-2 md:w-auto" ratio="aspect-[4/5] md:aspect-[16/10]">
              <div className="flex h-full w-full items-center justify-center gap-[4%] p-[6%]">
                <GarmentSVG kind={p.kind} hex="#000" mode="line" className="h-full w-auto" />
                <GarmentSVG kind={p.kind} hex="#000" mode="line" view="back" className="hidden h-full w-auto md:block" />
              </div>
            </Plate>
          </div>
        </div>

        {/* Specification sheet */}
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-20">
            <div className="flex items-baseline justify-between border-t border-ink pt-3">
              <span className="label">Uniform {p.id}</span>
              <span className="label text-muted">
                Issue {p.issue} / {p.issueDate}
              </span>
            </div>
            <h1 className="mt-5 text-[2rem] font-medium uppercase leading-none tracking-[-0.02em] md:text-[2.5rem]">{p.name}</h1>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="font-mono text-lg tabular-nums">{fmtPrice(p.price)}</p>
              <p className="label text-muted">
                {archived ? `Fully issued — ${p.edition}` : p.dispatch ?? "In stock — dispatches in 2 days"}
              </p>
            </div>
            <p className="mt-6 max-w-[30rem] text-[0.9375rem] leading-relaxed text-charcoal">{p.statement}</p>

            {/* Colour */}
            <div className="mt-8 border-t rule pt-4">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="label text-muted">Colour</span>
                <span key={colour} className="label animate-fade">{c.name}</span>
              </div>
              <Swatches colours={p.colours} value={colour} onChange={setColour} />
            </div>

            {/* Size */}
            {!archived && (
              <div className="mt-6 border-t rule pt-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className={`label transition-colors ${nudge ? "text-ink" : "text-muted"}`}>
                    {nudge ? "Select a size ↓" : isBottom ? "Waist" : "Size"}
                  </span>
                  <button onClick={() => setGuide((g) => !g)} className="label text-muted transition-colors hover:text-ink">
                    {guide ? "Close measurements" : "Measurements"}
                  </button>
                </div>
                <div className="-ml-2">
                  <SizeSelect sizes={p.sizes} value={size} onChange={setSize} prefix={isBottom ? "W" : ""} />
                </div>
                <div className={`grid transition-[grid-template-rows] duration-500 ${guide ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto] gap-4 pt-4">
                      <dl className="text-sm">
                        {p.measurementPoints.map((pt, i) => (
                          <div key={pt.key} className="flex justify-between border-b rule py-1.5">
                            <dt className="text-muted">
                              <span className="font-mono text-[0.6875rem] text-accent">{pt.key}</span> {pt.label}
                            </dt>
                            <dd className="font-mono text-[0.8125rem] tabular-nums">
                              {size ? p.measurements[size][i].toFixed(1) : "—"}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <MeasureDiagram kind={p.kind} className="h-40 w-auto" />
                    </div>
                    <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">{p.fitNote}</p>
                  </div>
                </div>
                {hydrated && size === profile.size && !isBottom && (
                  <p className="label mt-2 text-muted">Your standard size, from your record.</p>
                )}
              </div>
            )}

            <div className="mt-6">
              {archived ? (
                <div>
                  <Action disabled full variant="outline">
                    Fully issued
                  </Action>
                  <p className="mt-3 text-[0.8125rem] text-muted">
                    Kept in the archive as part of the permanent catalogue. Its pattern became{" "}
                    <Link href="/uniforms/001" className="ulink text-ink">
                      Uniform 001
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <Action onClick={add} full>
                  {added ? "Added to your issue" : "Add to your issue"}
                </Action>
              )}
            </div>

            {/* The sheet */}
            <dl className="mt-10">
              <Spec k="Purpose">{p.purpose}</Spec>
              <Spec k="Form">{p.form}</Spec>
              <Spec k="Material">
                {p.material}
                <span className="block text-[0.8125rem] text-muted">{p.fibre}</span>
              </Spec>
              <Spec k="Construction">
                <ul>
                  {p.construction.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </Spec>
              <Spec k="Issue">
                <span className="font-mono text-sm">
                  {p.issue} / {p.issueMonth}
                </span>
              </Spec>
              <Spec k="Origin">
                {p.origin}
                <span className="block text-[0.8125rem] text-muted">{p.mill}</span>
              </Spec>
              <Spec k="Fit">
                {p.model}
              </Spec>
            </dl>

            <div className="mt-8 flex items-center gap-5 border-t rule pt-6">
              <WovenLabel lines={p.label} />
              <p className="label text-muted">Label sewn at centre back neck. Garment no. printed on side-seam tag.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Measurements */}
      <section className="shell mt-24 md:mt-32">
        <SectionHead index={`${p.id}.M`} title="Garment measurements" aside={p.model} />
        <div className="mt-10">
          <MeasureTable product={p} size={size} />
        </div>
      </section>

      {/* How it fits */}
      {p.compatible.length > 0 && (
        <section className="shell mt-24 md:mt-32">
          <SectionHead index={`${p.id}.U`} title="How it fits your uniform" aside={`Slot: ${p.slot}`} />
          <div className="mt-6 grid grid-cols-4 border-b rule">
            {SLOTS.map((s) => {
              const here = s === p.slot;
              const holder = here ? p : getProduct(p.compatible.find((id) => getProduct(id)?.slot === s) ?? "");
              return (
                <div key={s} className={`border-t-2 py-3 pr-2 ${here ? "border-ink" : "border-transparent"}`}>
                  <p className={`label ${here ? "" : "text-muted"}`}>{s}</p>
                  <p className="mt-1 text-[0.8125rem]">
                    {holder ? (
                      <>
                        <span className="font-mono">{holder.id}</span>
                        <span className="hidden text-muted sm:inline"> {holder.name}</span>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {p.compatible.map((id) => {
              const q = getProduct(id)!;
              return (
                <Link key={id} href={`/uniforms/${id}`} className="group">
                  <div className="grain relative aspect-[3/4] bg-paper-2 transition-colors duration-500 group-hover:bg-paper-3">
                    <Figure outfit={outfitOf([[p.id, colour], [q.id, q.colours[0].id]])} className="absolute inset-[6%] h-[88%] w-[88%] text-ink" />
                    <span className="label absolute left-3 top-3 text-muted">
                      {p.id} + {q.id}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-2 border-t rule pt-2">
                    <p className="text-sm">
                      <span className="font-mono text-[0.8125rem]">{q.id}</span> {q.name}
                    </p>
                    <p className="font-mono text-[0.8125rem] text-muted">{fmtPrice(q.price)}</p>
                  </div>
                  <p className="label mt-1 text-muted">
                    {q.colours[0].name} — {q.purpose}
                  </p>
                </Link>
              );
            })}
          </div>
          <div className="mt-10">
            <Action href="/build/configure" variant="outline">
              Configure a full uniform
            </Action>
          </div>
        </section>
      )}
    </>
  );
}
