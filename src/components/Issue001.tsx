"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fmtPrice, getColour, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { GarmentSVG } from "./garments";
import { Plate, WovenLabel } from "./Plate";
import { SizeSelect, Swatches } from "./Swatches";
import { Action, Spec } from "./ui";

/** The one place in the story where you choose colour and size and add 001 to your issue. */
export function Issue001({ product: p }: { product: Product }) {
  const { addToIssue, profile, hydrated, count } = useStore();
  const [colour, setColour] = useState(p.colours[1].id);
  const [size, setSize] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const [added, setAdded] = useState(false);
  const c = getColour(p, colour);

  useEffect(() => {
    if (hydrated && !size) setSize(profile.size);
  }, [hydrated, profile.size, size]);

  const add = () => {
    if (!size) {
      setNudge(true);
      setTimeout(() => setNudge(false), 1600);
      return;
    }
    addToIssue([{ productId: p.id, colour, size }]);
    setAdded(true);
  };

  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-10 md:gap-x-8">
      <div className="col-span-12 lg:col-span-6">
        <Plate tone={["black", "navy"].includes(c.id) ? "stone" : "paper"} no={`001 — ${c.name}`} meta={c.code} className="lg:sticky lg:top-20">
          <div key={colour} className="fade-layer flex h-full w-full items-center justify-center">
            <GarmentSVG kind={p.kind} hex={c.hex} className="h-[72%] w-auto" />
          </div>
        </Plate>
      </div>

      <div className="col-span-12 lg:col-span-5 lg:col-start-8">
        <div className="flex items-baseline justify-between border-t border-ink pt-3">
          <span className="label">Uniform 001</span>
          <span className="label text-muted">Issue 01 / 09.26</span>
        </div>
        <h2 className="mt-5 text-[2rem] font-medium uppercase leading-none tracking-[-0.02em] md:text-[2.5rem]">{p.name}</h2>
        <div className="mt-4 flex items-baseline justify-between">
          <p className="font-mono text-lg tabular-nums">{fmtPrice(p.price)}</p>
          <p className="label text-muted">In stock — dispatches in 2 days</p>
        </div>

        <div className="mt-8 border-t rule pt-4">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="label text-muted">Colour</span>
            <span key={colour} className="label animate-fade">{c.name}</span>
          </div>
          <Swatches colours={p.colours} value={colour} onChange={setColour} />
        </div>

        <div className="mt-6 border-t rule pt-4">
          <span className={`label transition-colors ${nudge ? "text-ink" : "text-muted"}`}>
            {nudge ? "Select a size ↓" : "Size"}
          </span>
          <div className="-ml-2 mt-2">
            <SizeSelect sizes={p.sizes} value={size} onChange={setSize} />
          </div>
          {hydrated && size === profile.size && (
            <p className="label mt-2 text-muted">Your standard size, from your record.</p>
          )}
        </div>

        <div className="mt-6">
          <Action onClick={add} full>
            {added ? "Added to your issue" : "Add to your issue"}
          </Action>
          <p className={`label mt-3 text-muted transition-opacity duration-500 ${added ? "opacity-100" : "opacity-0"}`} aria-live="polite">
            {String(count).padStart(2, "0")} in your issue —{" "}
            <Link href="/issue" className="ulink text-ink">
              Review
            </Link>
          </p>
        </div>

        <dl className="mt-8">
          <Spec k="Purpose">{p.purpose}</Spec>
          <Spec k="Form">{p.form}</Spec>
          <Spec k="Material">{p.material}</Spec>
          <Spec k="Construction">
            <ul>
              {p.construction.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </Spec>
          <Spec k="Issue">
            <span className="font-mono text-sm">01 / {p.issueMonth}</span>
          </Spec>
          <Spec k="Origin">{p.origin}</Spec>
        </dl>

        <div className="mt-8 flex items-center gap-5 border-t rule pt-6">
          <WovenLabel lines={p.label} />
          <p className="label text-muted">Sewn at centre back neck. Each piece is numbered on a side-seam tag.</p>
        </div>
      </div>
    </div>
  );
}
