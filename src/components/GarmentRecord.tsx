"use client";

import Link from "next/link";
import { useState } from "react";
import { fmtDate, fmtDay, getColour, getProduct, REGISTRY } from "@/lib/data";
import { useStore } from "@/lib/store";
import { GarmentSVG } from "./garments";
import { MatrixCode, Plate, WovenLabel } from "./Plate";
import { Action } from "./ui";

function CareIcon({ i }: { i: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.2, vectorEffect: "non-scaling-stroke" as const };
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
      {i === 0 && (
        <>
          <path d="M4,9 L7,26 L25,26 L28,9" {...common} />
          <path d="M4,12 Q8,9 12,12 Q16,15 20,12 Q24,9 28,12" {...common} />
          <text x="16" y="23" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="var(--font-mono)">30</text>
        </>
      )}
      {i === 1 && (
        <>
          <rect x="5" y="5" width="22" height="22" {...common} />
          <line x1="9" y1="16" x2="23" y2="16" {...common} />
        </>
      )}
      {i === 2 && (
        <>
          <rect x="5" y="5" width="22" height="22" {...common} />
          <circle cx="16" cy="16" r="8" {...common} />
          <line x1="4" y1="4" x2="28" y2="28" {...common} />
          <line x1="28" y1="4" x2="4" y2="28" {...common} />
        </>
      )}
      {i >= 3 && (
        <>
          <path d="M6,23 L26,23 L24,13 Q23,10 20,10 L10,10 Q8,10 8,13 Z" {...common} />
          <circle cx="16" cy="18" r="1" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

function Stamp({ text, date }: { text: string; date: string }) {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-12 text-navy opacity-70" aria-hidden>
      <defs>
        <path id="stamp-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <text fontSize="9.5" letterSpacing="2.4" fill="currentColor" fontFamily="var(--font-mono)">
        <textPath href="#stamp-circle">{text}</textPath>
      </text>
      <text x="60" y="58" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="var(--font-mono)" letterSpacing="1">
        ISSUED
      </text>
      <text x="60" y="71" textAnchor="middle" fontSize="11" fill="currentColor" fontFamily="var(--font-mono)">
        {date}
      </text>
    </svg>
  );
}

export function GarmentRecord({ no }: { no: string }) {
  const { issued, hydrated, profile, addToIssue } = useStore();
  const [done, setDone] = useState(false);

  if (!hydrated) return <div className="min-h-[80vh]" />;

  const own = issued.find((g) => g.garmentNo === no);
  const g = own ?? REGISTRY.find((x) => x.garmentNo === no);
  const p = g && getProduct(g.productId);

  if (!g || !p) {
    return (
      <div className="shell flex min-h-[60vh] flex-col items-start justify-center gap-5">
        <p className="label text-muted">Garment record</p>
        <p className="font-mono text-2xl">{no}</p>
        <p className="max-w-[28rem] text-charcoal">
          No garment with this number is on the register. Check the number printed on the side-seam tag.
        </p>
        <Action href="/record" variant="outline">
          Return to your record
        </Action>
      </div>
    );
  }

  const c = getColour(p, g.colour);
  const sizeIdx = p.sizes.indexOf(g.size);
  const issued_ = new Date(g.issuedAt + "T12:00:00");
  const minus = (days: number) => {
    const d = new Date(issued_);
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };
  const [knit, sewn] = p.mill.split(", ");
  const history = [
    { d: minus(64), e: "Fabric knitted", w: knit?.replace(/^.*? in /, "") ?? "Portugal" },
    { d: minus(41), e: "Cut and sewn", w: sewn?.replace(/^.*? in /, "") ?? p.origin.replace("Made in ", "") },
    { d: minus(33), e: p.construction.includes("Garment washed") ? "Garment washed" : "Finished", w: "Guimarães" },
    { d: minus(30), e: "Inspected and numbered", w: "Inspector R.A." },
    { d: g.issuedAt, e: own ? `Issued to Record ${profile.recordNo}` : "Issued", w: g.orderNo },
  ];

  return (
    <div className="shell pt-8 md:pt-12">
      <nav className="flex items-center gap-2 label text-muted" aria-label="Breadcrumb">
        <Link href="/record" className="hover:text-ink">
          Your record
        </Link>
        <span>/</span>
        <span className="text-ink">{g.garmentNo}</span>
      </nav>

      <article className="relative mx-auto mt-8 max-w-[64rem] border border-ink bg-paper">
        {/* Header band */}
        <div className="flex items-center justify-between border-b border-ink bg-ink px-4 py-2 text-paper md:px-6">
          <span className="label">Garment record</span>
          <span className="label opacity-70">Finest Uniform — Register</span>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-12 border-b border-ink p-4 md:col-span-7 md:border-b-0 md:border-r md:p-6">
            <p className="label text-muted">Garment No.</p>
            <p className="mt-2 font-mono text-[2rem] leading-none tracking-[-0.02em] md:text-[2.75rem]">{g.garmentNo}</p>
            <div className="mt-8 grid grid-cols-[1fr_auto] items-end gap-4">
              <div>
                <p className="label">Uniform {p.id}</p>
                <p className="mt-1 text-2xl tracking-[-0.01em]">{p.name}</p>
                <p className="mt-2 text-sm text-charcoal">Issued {fmtDate(g.issuedAt, "long")}</p>
              </div>
              <Stamp text="FINEST UNIFORM · STANDARD ISSUE · " date={fmtDate(g.issuedAt)} />
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-x-6">
              {[
                ["Colour", `${c.name}`, c.code],
                ["Size", p.slot === "bottom" ? `W${g.size}` : g.size, p.sizes.join(" ")],
                ["Material", p.material.replace(".", ""), p.fibre],
                ["Origin", p.origin.replace("Made in ", ""), p.mill.split(", ")[0]],
              ].map(([k, v, sub]) => (
                <div key={k} className="border-t rule py-3">
                  <dt className="label text-muted">{k}</dt>
                  <dd className="mt-1 text-[0.9375rem]">{v}</dd>
                  <dd className="label mt-0.5 text-muted">{sub}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-span-12 grid grid-cols-2 md:col-span-5 md:grid-cols-1">
            <Plate tone="paper" ratio="aspect-square md:aspect-[5/4]" no={`${p.id} / ${c.code}`} className="border-r border-ink md:border-b md:border-r-0">
              <GarmentSVG kind={p.kind} hex={c.hex} className="h-[72%] w-auto" />
            </Plate>
            <div className="flex flex-col items-center justify-center gap-4 p-4 md:flex-row md:justify-between md:p-6">
              <div className="text-center md:text-left">
                <MatrixCode value={g.garmentNo} className="mx-auto h-24 w-24 text-ink md:mx-0 md:h-28 md:w-28" />
                <p className="label mt-2 text-muted">Scan tag · NFC 13.56 MHz</p>
              </div>
              <WovenLabel lines={p.label} className="hidden md:inline-flex" />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-12 border-t border-ink">
          <section className="col-span-12 border-b border-ink p-4 md:col-span-6 md:border-r md:p-6">
            <h2 className="label">Care</h2>
            <ul className="mt-4 space-y-3">
              {p.care.map((x, i) => (
                <li key={x} className="flex items-center gap-4 text-sm">
                  <CareIcon i={i} />
                  {x}
                </li>
              ))}
            </ul>
          </section>
          <section className="col-span-12 border-b border-ink p-4 md:col-span-6 md:p-6">
            <h2 className="label">Construction</h2>
            <ol className="mt-4">
              {p.construction.map((x, i) => (
                <li key={x} className="grid grid-cols-[2rem_1fr] border-b border-dashed rule py-2 text-sm last:border-0">
                  <span className="font-mono text-[0.75rem] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  {x}
                </li>
              ))}
            </ol>
          </section>

          <section className="col-span-12 border-b border-ink p-4 md:col-span-6 md:border-b-0 md:border-r md:p-6">
            <h2 className="label">Garment measurements — {p.slot === "bottom" ? `W${g.size}` : g.size}</h2>
            <dl className="mt-4">
              {p.measurementPoints.map((pt, i) => (
                <div key={pt.key} className="flex items-baseline justify-between border-b border-dashed rule py-2 text-sm last:border-0">
                  <dt>
                    <span className="mr-2 font-mono text-[0.75rem] text-accent">{pt.key}</span>
                    {pt.label}
                  </dt>
                  <dd className="font-mono text-[0.8125rem] tabular-nums">
                    {sizeIdx >= 0 ? p.measurements[g.size][i].toFixed(1) : "—"} cm
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="col-span-12 p-4 md:col-span-6 md:p-6">
            <h2 className="label">Issue history</h2>
            <ol className="relative mt-4">
              <span className="absolute bottom-2 left-[3px] top-2 w-px bg-rule" />
              {history.map((h, i) => (
                <li key={i} className="relative grid grid-cols-[1.25rem_4.5rem_1fr] items-baseline py-2 text-sm">
                  <span className={`relative top-[1px] h-[7px] w-[7px] ${i === history.length - 1 ? "bg-ink" : "border border-ink bg-paper"}`} />
                  <span className="font-mono text-[0.75rem] text-muted">{fmtDay(h.d)}</span>
                  <span>
                    {h.e}
                    <span className="block text-[0.75rem] text-muted">{h.w}</span>
                  </span>
                </li>
              ))}
            </ol>
            {own && typeof own.wears === "number" && (
              <p className="label mt-3 text-muted">Worn {own.wears} times since issue (self-reported)</p>
            )}
          </section>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-ink p-4 sm:flex-row sm:items-center md:p-6">
          <p className="label max-w-[26rem] text-muted">
            Reorder issues an identical {p.id} in {c.name}, size {g.size}. Your new piece will receive its own number.
          </p>
          {p.status === "fully-issued" ? (
            <Action href="/uniforms/001" variant="outline">
              View successor, 001
            </Action>
          ) : (
            <Action
              onClick={() => {
                addToIssue([{ productId: p.id, colour: g.colour, size: g.size }]);
                setDone(true);
              }}
            >
              {done ? "Added — Reorder again" : `Reorder ${p.id}`}
            </Action>
          )}
        </div>
      </article>
    </div>
  );
}
