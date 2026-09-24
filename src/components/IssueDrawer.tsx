"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { fmtPrice, getColour, getProduct } from "@/lib/data";
import { useStore, type IssueLine } from "@/lib/store";
import { GarmentSVG } from "./garments";
import { Action, Stepper } from "./ui";

export function IssueLineRow({ line, compact }: { line: IssueLine; compact?: boolean }) {
  const { setQty, removeLine } = useStore();
  const p = getProduct(line.productId);
  if (!p) return null;
  const c = getColour(p, line.colour);
  return (
    <li className="grid grid-cols-[4.5rem_1fr_auto] gap-4 border-t rule py-4 md:grid-cols-[5.5rem_1fr_auto]">
      <Link href={`/uniforms/${p.id}`} className="grain relative block aspect-[4/5] bg-paper-2">
        <GarmentSVG kind={p.kind} hex={c.hex} className="absolute inset-[10%] h-[80%] w-[80%]" />
      </Link>
      <div className="flex min-w-0 flex-col">
        <p className="text-[0.9375rem] leading-snug">
          <span className="font-mono text-[0.8125rem]">{p.id}</span>
          <span className="text-muted"> / </span>
          {p.name}
        </p>
        <p className="mt-0.5 text-[0.8125rem] text-muted">
          {c.name} / {p.slot === "bottom" ? `W${line.size}` : line.size}
        </p>
        {p.dispatch && <p className="label mt-1 text-muted">{p.dispatch}</p>}
        <div className="mt-auto flex items-center gap-4 pt-3">
          <Stepper value={line.qty} min={1} onChange={(n) => setQty(line.key, n)} label="Quantity" />
          <button onClick={() => removeLine(line.key)} className="label text-muted transition-colors hover:text-ink">
            Remove
          </button>
        </div>
      </div>
      <p className={`font-mono tabular-nums ${compact ? "text-[0.8125rem]" : "text-sm"}`}>{fmtPrice(p.price * line.qty)}</p>
    </li>
  );
}

export function IssueDrawer() {
  const { drawerOpen, setDrawerOpen, lines, count, total } = useStore();
  const path = usePathname();

  useEffect(() => setDrawerOpen(false), [path, setDrawerOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDrawerOpen]);

  useEffect(() => {
    document.documentElement.style.overflow = drawerOpen ? "hidden" : "";
  }, [drawerOpen]);

  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div
        onClick={() => setDrawerOpen(false)}
        className={`absolute inset-0 bg-ink/25 transition-opacity duration-500 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Your Issue"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[30rem] flex-col bg-paper transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)] ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b rule px-5 md:px-6">
          <h2 className="caps">Your Issue</h2>
          <button onClick={() => setDrawerOpen(false)} className="label text-muted transition-colors hover:text-ink">
            Close ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-6">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col justify-center py-16">
              <p className="label text-muted">00 garments</p>
              <p className="mt-3 max-w-[18rem] text-lg leading-snug">Nothing has been set aside yet.</p>
              <p className="mt-2 max-w-[20rem] text-sm text-muted">
                Start with 001, or let us recommend a foundation in a short consultation.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Action href="/uniforms/001" variant="outline" full>
                  View Uniform 001
                </Action>
                <Action href="/build" variant="text" className="self-start">
                  Build your uniform
                </Action>
              </div>
            </div>
          ) : (
            <ul className="pb-4 pt-2">
              {lines.map((l) => (
                <IssueLineRow key={l.key} line={l} compact />
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-ink px-5 pb-6 pt-4 md:px-6">
            <div className="flex items-baseline justify-between">
              <span className="label">
                {String(count).padStart(2, "0")} {count === 1 ? "garment" : "garments"} ready to be issued
              </span>
              <span className="font-mono text-sm tabular-nums">{fmtPrice(total)}</span>
            </div>
            <p className="label mt-1 text-muted">Shipping calculated at checkout. Complimentary over $250.</p>
            <div className="mt-5 grid gap-2">
              <Action href="/issue" full>
                Review &amp; check out
              </Action>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
