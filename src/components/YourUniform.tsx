"use client";

import Link from "next/link";
import { fmtDay, fmtPrice, getColour, getProduct } from "@/lib/data";
import { outfitOf } from "@/lib/outfit";
import { recommend } from "@/lib/recommend";
import { useStore } from "@/lib/store";
import { Figure } from "./Figure";
import { GarmentSVG } from "./garments";
import { Action } from "./ui";

export function YourUniform() {
  const { consultation, hydrated, addToIssue, profile } = useStore();

  if (!hydrated) return <div className="min-h-[70vh]" />;

  if (!consultation) {
    return (
      <div className="shell flex min-h-[60vh] flex-col items-start justify-center gap-6">
        <p className="label text-muted">No consultation on record</p>
        <p className="max-w-[26rem] text-2xl leading-snug">Answer a few questions and we will prepare your uniform.</p>
        <Action href="/build">Begin the consultation</Action>
      </div>
    );
  }

  const rec = recommend(consultation);
  const total = rec.items.reduce((s, x) => s + getProduct(x.productId)!.price, 0);
  const first = rec.items[0];
  const mid = rec.items.find((x) => x.productId === "002" || x.productId === "003");
  const date = consultation.completedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

  return (
    <div className="shell pt-10 md:pt-16">
      <div className="grid grid-cols-2 gap-4 border-b rule pb-3 label text-muted md:grid-cols-4">
        <span>Record No. {profile.recordNo}</span>
        <span className="text-right md:text-left">Consultation {fmtDay(date)}</span>
        <span className="hidden md:block">Standard size {consultation.size}</span>
        <span className="hidden text-right md:block">Prepared by Finest Uniform</span>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-x-4 gap-y-12 md:mt-14">
        <div className="col-span-12 lg:col-span-7">
          <h1 className="text-[2.5rem] font-medium uppercase leading-[0.95] tracking-[-0.03em] md:text-[4rem] animate-rise">
            Your uniform
          </h1>
          <p className="mt-4 text-lg text-charcoal animate-rise [animation-delay:80ms]">
            Prepared for <span className="text-ink">{consultation.name || profile.name}</span>
          </p>

          <ol className="mt-12 border-b border-ink">
            {rec.items.map((it, i) => {
              const p = getProduct(it.productId)!;
              const c = getColour(p, it.colour);
              return (
                <li
                  key={i}
                  className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 border-t border-ink py-4 animate-rise md:grid-cols-[4.5rem_1fr_auto_auto] md:gap-6"
                  style={{ animationDelay: `${150 + i * 90}ms` }}
                >
                  <div className="grain relative aspect-square bg-paper-2">
                    <GarmentSVG kind={p.kind} hex={c.hex} className="absolute inset-[8%] h-[84%] w-[84%]" />
                  </div>
                  <div>
                    <p className="text-lg tracking-[-0.01em] md:text-xl">
                      <span className="font-mono">{p.id}</span>
                      <span className="text-muted"> / </span>
                      {p.name}
                      <span className="text-muted"> / </span>
                      {c.name}
                    </p>
                    <p className="label mt-1 text-muted">
                      {it.note} — Size {it.size}
                      {p.dispatch ? ` — ${p.dispatch}` : ""}
                    </p>
                  </div>
                  <span className="hidden font-mono text-[0.8125rem] text-muted md:block">{c.code}</span>
                  <span className="font-mono text-sm tabular-nums">{fmtPrice(p.price)}</span>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex items-baseline justify-between">
            <p className="caps">
              Recommended issue: {rec.items.length} {rec.items.length === 1 ? "garment" : "garments"}
            </p>
            <p className="font-mono tabular-nums">{fmtPrice(total)}</p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Action onClick={() => addToIssue(rec.items.map(({ productId, colour, size }) => ({ productId, colour, size })))}>
              Issue my uniform
            </Action>
            <Action href="/build/configure" variant="outline">
              Refine in configurator
            </Action>
          </div>
          <Link href="/build" className="label mt-5 inline-block text-muted hover:text-ink">
            Retake consultation →
          </Link>
        </div>

        <div className="col-span-12 lg:col-span-4 lg:col-start-9">
          <div className="grain relative aspect-[3/5] bg-paper-3 animate-fade">
            <Figure
              outfit={outfitOf([[first.productId, first.colour], ...(mid ? [[mid.productId, mid.colour] as [string, string]] : [])])}
              className="absolute inset-[6%] h-[88%] w-[88%] text-ink"
            />
            <span className="label absolute left-3 top-3 text-muted">Fig. — Day one</span>
          </div>
        </div>
      </div>

      <section className="mt-20 grid grid-cols-12 gap-x-4 gap-y-8 border-t border-ink pt-4 md:mt-28">
        <h2 className="caps col-span-12 md:col-span-3">Why these were selected</h2>
        <dl className="col-span-12 md:col-span-9">
          {rec.reasons.map((r, i) => (
            <div key={r.k} className="grid grid-cols-[2rem_6rem_1fr] gap-4 border-b rule py-4 md:grid-cols-[3rem_9rem_1fr]">
              <span className="label text-muted">{String(i + 1).padStart(2, "0")}</span>
              <dt className="label pt-[3px]">{r.k}</dt>
              <dd className="max-w-[40rem] text-[0.9375rem] leading-relaxed text-charcoal">{r.v}</dd>
            </div>
          ))}
          <div className="grid grid-cols-[2rem_6rem_1fr] gap-4 border-b rule py-4 md:grid-cols-[3rem_9rem_1fr]">
            <span className="label text-muted">{String(rec.reasons.length + 1).padStart(2, "0")}</span>
            <dt className="label pt-[3px]">Size</dt>
            <dd className="max-w-[40rem] text-[0.9375rem] leading-relaxed text-charcoal">{rec.sizeNote}</dd>
          </div>
        </dl>
        {rec.next && (
          <p className="col-span-12 text-sm text-muted md:col-span-9 md:col-start-4">
            When you are ready for the next foundation:{" "}
            <Link href={`/uniforms/${rec.next}`} className="ulink text-ink">
              {rec.next} / {getProduct(rec.next)!.name}
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
