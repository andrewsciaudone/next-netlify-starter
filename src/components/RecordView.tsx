"use client";

import Link from "next/link";
import { useState } from "react";
import { fmtDate, fmtDay, fmtHeight, fmtIn, fmtPrice, FOUNDATIONS, getColour, getProduct, PRODUCTS, type IssuedGarment } from "@/lib/data";
import { useStore } from "@/lib/store";
import { GarmentSVG } from "./garments";
import { MatrixCode } from "./Plate";
import { Action, SectionHead } from "./ui";

/** The garment record — what the tag sewn into each piece opens. Shown inline here. */
function GarmentDetail({ g }: { g: IssuedGarment }) {
  const { addToIssue, profile } = useStore();
  const [done, setDone] = useState(false);
  const p = getProduct(g.productId)!;
  const c = getColour(p, g.colour);
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-8 border-t border-dashed rule bg-paper-2/50 px-4 py-6 animate-fade md:px-6">
      <div className="col-span-12 flex items-start gap-5 md:col-span-4">
        <div className="border border-ink/50 bg-paper p-2">
          <MatrixCode value={g.garmentNo} className="h-20 w-20 text-ink" />
        </div>
        <div>
          <p className="label text-muted">Garment record</p>
          <p className="mt-1 font-mono text-lg">{g.garmentNo}</p>
          <p className="mt-2 text-sm text-charcoal">
            Uniform {p.id} / {c.name} / {g.size}
          </p>
          <p className="label mt-1 text-muted">Issued {fmtDate(g.issuedAt, "long")}</p>
        </div>
      </div>

      <dl className="col-span-6 text-sm md:col-span-3">
        <dt className="label mb-2 text-muted">Care</dt>
        {p.care.map((x) => (
          <dd key={x} className="border-b border-dashed rule py-1.5">
            {x}
          </dd>
        ))}
      </dl>

      <dl className="col-span-6 text-sm md:col-span-3">
        <dt className="label mb-2 text-muted">Measurements, in — {g.size}</dt>
        {p.measurementPoints.map((pt, i) => (
          <dd key={pt.key} className="flex justify-between border-b border-dashed rule py-1.5">
            <span>{pt.label}</span>
            <span className="font-mono text-[0.8125rem] tabular-nums">{fmtIn(p.measurements[g.size]?.[i] ?? 0)}</span>
          </dd>
        ))}
      </dl>

      <div className="col-span-12 flex flex-col justify-between gap-4 md:col-span-2">
        <dl className="text-sm">
          <dt className="label mb-2 text-muted">History</dt>
          <dd className="py-1">Made in {p.origin.replace("Made in ", "")}</dd>
          <dd className="py-1">
            Issued {fmtDay(g.issuedAt)} to Rec. {profile.recordNo}
          </dd>
          <dd className="py-1 text-muted">Order {g.orderNo}</dd>
        </dl>
        <Action
          variant="outline"
          className="!px-4"
          onClick={() => {
            addToIssue([{ productId: p.id, colour: g.colour, size: g.size }]);
            setDone(true);
          }}
        >
          {done ? "Added" : `Reorder ${p.id}`}
        </Action>
      </div>
    </div>
  );
}

export function RecordView() {
  const { profile, issued, hydrated, lines, count, total, consultation, addToIssue } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  if (!hydrated) return <div className="min-h-[80vh]" />;

  const issuedForms = new Set(issued.map((g) => g.productId));
  const done = FOUNDATIONS.filter((id) => issuedForms.has(id));
  const pending = PRODUCTS.filter((p) => !issuedForms.has(p.id));
  const waiting = new Set(lines.map((l) => l.productId));

  return (
    <div className="shell pt-10 md:pt-16">
      <div className="grid grid-cols-2 gap-4 border-b rule pb-3 label text-muted md:grid-cols-4">
        <span>Uniform record</span>
        <span className="text-right md:text-left">Opened {fmtDate(profile.since)}</span>
        <span className="hidden md:block">{issued.length} garments on record</span>
        <span className="hidden text-right md:block">
          {consultation ? `Consultation ${fmtDay(consultation.completedAt?.slice(0, 10) ?? profile.since)}` : "No consultation yet"}
        </span>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-x-4 gap-y-10 md:mt-14">
        <div className="col-span-12 md:col-span-6">
          <h1 className="text-[2.75rem] font-medium uppercase leading-none tracking-[-0.03em] md:text-[4.5rem]">
            {profile.name}
          </h1>
          <p className="mt-4 font-mono text-sm">Record No. {profile.recordNo}</p>
        </div>
        <dl className="col-span-12 grid grid-cols-2 gap-x-4 md:col-span-6">
          {[
            ["Preferred fit", `${profile.fit} / ${profile.length} / ${profile.collar === "Both" ? "Crew & polo" : profile.collar ?? "Crew"}`],
            ["Preferred colours", profile.colours.join(" / ")],
            ["Standard size", profile.size + (profile.height ? ` — ${fmtHeight(profile.height)}` : "")],
            ["Worn", `${profile.wear}, ${profile.frequency} a week`],
          ].map(([k, v]) => (
            <div key={k} className="border-t rule py-3">
              <dt className="label text-muted">{k}</dt>
              <dd key={v} className="mt-1.5 animate-fade text-[0.9375rem]">
                {v}
              </dd>
            </div>
          ))}
          <div className="col-span-2 border-t rule pt-3">
            <Link href="/build" className="label text-muted hover:text-ink">
              Update by consultation →
            </Link>
          </div>
        </dl>
      </div>

      {/* Awaiting issue */}
      {lines.length > 0 && (
        <section className="mt-16 animate-rise bg-ink px-4 py-6 text-paper md:px-6">
          <div className="grid grid-cols-12 items-center gap-x-4 gap-y-6">
            <div className="col-span-12 md:col-span-5">
              <p className="label opacity-60">Awaiting issue</p>
              <p className="mt-2 text-2xl tracking-[-0.01em]">
                {String(count).padStart(2, "0")} {count === 1 ? "garment is" : "garments are"} set aside for you.
              </p>
            </div>
            <ul className="col-span-12 flex gap-2 md:col-span-4">
              {lines.slice(0, 5).map((l) => {
                const p = getProduct(l.productId)!;
                return (
                  <li key={l.key} className="relative aspect-square w-14 bg-paper/10" title={`${p.id} ${getColour(p, l.colour).name}`}>
                    <GarmentSVG kind={p.kind} hex={getColour(p, l.colour).hex} className="absolute inset-[10%] h-[80%] w-[80%]" />
                  </li>
                );
              })}
            </ul>
            <div className="col-span-12 flex items-center justify-between gap-6 md:col-span-3 md:justify-end">
              <span className="font-mono tabular-nums">{fmtPrice(total)}</span>
              <Action href="/issue" className="bg-paper !text-ink hover:!bg-paper-2">
                Review your issue
              </Action>
            </div>
          </div>
        </section>
      )}

      {/* Completion */}
      <section className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-ink pt-3">
          <h2 className="caps">Your uniform</h2>
          <p className="label">
            {String(done.length).padStart(2, "0")} / {String(FOUNDATIONS.length).padStart(2, "0")} foundations issued
          </p>
        </div>
        <ol className="mt-5 grid grid-cols-4 gap-1">
          {PRODUCTS.map((p) => {
            const on = issuedForms.has(p.id);
            return (
              <li key={p.id}>
                <span className={`block h-1 ${on ? "bg-ink" : waiting.has(p.id) ? "bg-muted" : "bg-rule"}`} />
                <span className={`mt-2 block font-mono text-[0.8125rem] ${on ? "" : "text-muted"}`}>{p.id}</span>
                <span className="text-[0.75rem] text-muted">
                  {p.name}
                  {!on && waiting.has(p.id) ? " — awaiting issue" : ""}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Issued */}
      <section className="mt-20">
        <SectionHead index="A" title="Issued" aside="Select a garment to open its record" />
        <ul className="mt-4">
          {issued
            .slice()
            .reverse()
            .map((g) => {
              const p = getProduct(g.productId)!;
              const c = getColour(p, g.colour);
              const isOpen = open === g.garmentNo;
              return (
                <li key={g.garmentNo} className="border-b rule">
                  <button
                    onClick={() => setOpen(isOpen ? null : g.garmentNo)}
                    aria-expanded={isOpen}
                    className="group grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-4 py-3 text-left transition-colors hover:bg-paper-2 md:grid-cols-[4rem_1.2fr_1fr_1fr_auto] md:gap-6"
                  >
                    <span className="grain relative block aspect-square bg-paper-2 transition-colors group-hover:bg-paper-3">
                      <GarmentSVG kind={p.kind} hex={c.hex} className="absolute inset-[10%] h-[80%] w-[80%]" />
                    </span>
                    <span>
                      <span className="block text-[0.9375rem]">
                        <span className="font-mono">{p.id}</span> / {c.name} / {g.size}
                      </span>
                      <span className="label text-muted md:hidden">
                        {g.garmentNo} — {fmtDate(g.issuedAt)}
                      </span>
                      <span className="hidden text-[0.8125rem] text-muted md:block">{p.name}</span>
                    </span>
                    <span className="label hidden md:block">
                      <span className="text-muted">Issued </span>
                      {fmtDate(g.issuedAt)}
                    </span>
                    <span className="label hidden md:block">
                      <span className="text-muted">Garment No. </span>
                      {g.garmentNo}
                    </span>
                    <span className="label w-6 text-center text-muted">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && <GarmentDetail g={g} />}
                </li>
              );
            })}
        </ul>
      </section>

      {/* Not yet issued */}
      {pending.length > 0 && (
        <section className="mt-20">
          <SectionHead index="B" title="Not yet issued" aside="Foundations still open" />
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {pending.map((p) => {
              const set = waiting.has(p.id);
              return (
                <div key={p.id}>
                  <div className="hairline-grid relative aspect-[4/5] border rule bg-paper">
                    <GarmentSVG kind={p.kind} hex="#000" mode="line" className="absolute inset-[14%] h-[72%] w-[72%] opacity-60" />
                    <span className="label absolute left-3 top-3 text-muted">{set ? "Awaiting issue" : "Unissued"}</span>
                  </div>
                  <p className="mt-3 text-sm">
                    <span className="font-mono">{p.id}</span> / {p.name}
                  </p>
                  <p className="label mt-1 text-muted">
                    {fmtPrice(p.price)} — {p.dispatch ?? "Available now"}
                  </p>
                  {!set && (
                    <button
                      onClick={() => addToIssue([{ productId: p.id, colour: p.colours[0].id, size: profile.size }])}
                      className="label mt-3 text-ink hover:opacity-60"
                    >
                      + Add {p.colours[0].name}, {profile.size}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
