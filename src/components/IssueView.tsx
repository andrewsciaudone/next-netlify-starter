"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { fmtPrice, getColour, getProduct } from "@/lib/data";
import { useStore, type CompletedOrder, type IssueLine } from "@/lib/store";
import { Stepper } from "./ui";
import { GarmentSVG } from "./garments";
import { Action } from "./ui";

export function IssueLineRow({ line, compact }: { line: IssueLine; compact?: boolean }) {
  const { setQty, removeLine } = useStore();
  const p = getProduct(line.productId);
  if (!p) return null;
  const c = getColour(p, line.colour);
  return (
    <li className="grid grid-cols-[4.5rem_1fr_auto] gap-4 border-t rule py-4 md:grid-cols-[5.5rem_1fr_auto]">
      <div className="grain relative block aspect-[4/5] bg-paper-2">
        <GarmentSVG kind={p.kind} hex={c.hex} className="absolute inset-[10%] h-[80%] w-[80%]" />
      </div>
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

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label text-muted">{label}</span>
      {children}
    </label>
  );
}

const input =
  "mt-1.5 w-full border-b border-ink/40 bg-transparent py-2 text-[0.9375rem] outline-none transition-colors focus:border-ink placeholder:text-muted/60";

export function IssueView() {
  const { lines, count, total, hydrated, completeIssue, profile } = useStore();
  const [stage, setStage] = useState<"review" | "checkout" | "done">("review");
  const [ship, setShip] = useState<"standard" | "express">("standard");
  const [order, setOrder] = useState<CompletedOrder | null>(null);

  if (!hydrated) return <div className="min-h-[70vh]" />;

  const shipping = ship === "express" ? 25 : total >= 250 ? 0 : 12;
  const preIssue = lines.some((l) => getProduct(l.productId)?.status === "pre-issue");

  if (stage === "done" && order) {
    return (
      <div className="shell pt-10 md:pt-16">
        <div className="mx-auto max-w-[48rem]">
          <p className="label text-muted animate-fade">Order confirmed</p>
          <h1 className="mt-4 text-[2.5rem] font-medium leading-none tracking-[-0.03em] md:text-[3.5rem] animate-rise">
            Your issue is confirmed.
          </h1>
          <p className="mt-5 text-charcoal animate-rise [animation-delay:80ms]">
            Order <span className="font-mono text-ink">{order.orderNo}</span> — {order.garments.length} garments,{" "}
            {fmtPrice(order.total + shipping)}. A confirmation has been sent to your email. Each garment has been numbered
            and added to your record.
          </p>

          <ul className="mt-10 border-t border-ink">
            {order.garments.map((g, i) => {
              const p = getProduct(g.productId)!;
              const c = getColour(p, g.colour);
              return (
                <li key={g.garmentNo} className="animate-rise" style={{ animationDelay: `${160 + i * 80}ms` }}>
                  <Link
                    href="/record"
                    className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b rule py-3 hover:bg-paper-2"
                  >
                    <span className="grain relative block aspect-square bg-paper-2">
                      <GarmentSVG kind={p.kind} hex={c.hex} className="absolute inset-[10%] h-[80%] w-[80%]" />
                    </span>
                    <span className="text-sm">
                      <span className="font-mono">{p.id}</span> / {p.name} / {c.name} / {g.size}
                      <span className="label block text-muted">{p.dispatch ?? "Dispatches within 2 days"}</span>
                    </span>
                    <span className="font-mono text-[0.8125rem]">{g.garmentNo}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Action href="/record">View your record</Action>
            <Action href="/001" variant="outline">
              Continue
            </Action>
          </div>
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="shell pt-10 md:pt-16">
        <p className="label text-muted">05 — Your issue</p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.025em] md:text-5xl">Your issue</h1>
        <div className="mt-12 border-t border-ink pt-8">
          <p className="max-w-[26rem] text-xl leading-snug">Nothing is waiting to be issued.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Action href="/build">Build your uniform</Action>
            <Action href="/001" variant="outline">
              View Uniform 001
            </Action>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell pt-10 md:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-muted">05 — {stage === "review" ? "Your issue" : "Checkout"}</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.025em] md:text-5xl">
            {stage === "review" ? "Your issue" : "Checkout"}
          </h1>
        </div>
        <ol className="flex gap-6 label">
          {["Review", "Delivery & payment", "Confirmation"].map((s, i) => (
            <li key={s} className={i === (stage === "review" ? 0 : 1) ? "text-ink" : "text-muted"}>
              <span className="mr-1.5 text-muted">{String(i + 1).padStart(2, "0")}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-x-4 gap-y-12 md:gap-x-10">
        <div className="col-span-12 lg:col-span-7">
          {stage === "review" ? (
            <ul className="border-b rule">
              {lines.map((l) => (
                <IssueLineRow key={l.key} line={l} />
              ))}
            </ul>
          ) : (
            <form
              id="checkout"
              onSubmit={(e) => {
                e.preventDefault();
                const o = completeIssue();
                if (o) {
                  setOrder(o);
                  setStage("done");
                  window.scrollTo({ top: 0 });
                }
              }}
              className="animate-fade"
            >
              <fieldset className="border-t border-ink pt-4">
                <legend className="caps float-left mb-6 w-full">Contact</legend>
                <div className="clear-both grid gap-6 md:grid-cols-2">
                  <Field label="Email">
                    <input required type="email" className={input} placeholder="you@example.com" />
                  </Field>
                  <Field label="Phone (for delivery)">
                    <input type="tel" className={input} />
                  </Field>
                </div>
              </fieldset>

              <fieldset className="mt-12 border-t border-ink pt-4">
                <legend className="caps float-left mb-6 w-full">Delivery address</legend>
                <div className="clear-both grid gap-6 md:grid-cols-2">
                  <Field label="First name">
                    <input required defaultValue={profile.name} className={input} />
                  </Field>
                  <Field label="Last name">
                    <input required className={input} />
                  </Field>
                  <Field label="Address" className="md:col-span-2">
                    <input required className={input} />
                  </Field>
                  <Field label="City">
                    <input required className={input} />
                  </Field>
                  <Field label="Postcode">
                    <input required className={input} />
                  </Field>
                  <Field label="Country" className="md:col-span-2">
                    <select className={`${input} appearance-none`} defaultValue="United States">
                      {["United States", "United Kingdom", "Portugal", "France", "Germany", "Japan", "Canada"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </fieldset>

              <fieldset className="mt-12 border-t border-ink pt-4">
                <legend className="caps float-left mb-4 w-full">Shipping</legend>
                <div className="clear-both">
                  {(
                    [
                      ["standard", "Standard", "3–5 working days", total >= 250 ? "Free" : "$12"],
                      ["express", "Express", "1–2 working days", "$25"],
                    ] as const
                  ).map(([id, name, sub, price]) => (
                    <label key={id} className="flex cursor-pointer items-center gap-4 border-b rule py-3">
                      <input type="radio" name="ship" checked={ship === id} onChange={() => setShip(id)} className="accent-ink" />
                      <span className="flex-1 text-sm">
                        {name} <span className="text-muted">— {sub}</span>
                      </span>
                      <span className="font-mono text-[0.8125rem]">{price}</span>
                    </label>
                  ))}
                  {preIssue && (
                    <p className="label mt-3 text-muted">
                      Pre-issue garments are dispatched on their issue date. Everything else ships now.
                    </p>
                  )}
                </div>
              </fieldset>

              <fieldset className="mt-12 border-t border-ink pt-4">
                <legend className="caps float-left mb-4 w-full">Payment</legend>
                <p className="clear-both border border-dashed rule p-4 text-sm text-charcoal">
                  This is a prototype. No payment details are collected and nothing will be charged. Completing the
                  issue will number your garments and add them to your record.
                </p>
              </fieldset>
            </form>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
          <div className="border-t border-ink pt-4 lg:sticky lg:top-20">
            <p className="caps">Summary</p>
            <dl className="mt-4 text-sm">
              <div className="flex justify-between border-b rule py-2">
                <dt className="text-muted">Garments</dt>
                <dd className="font-mono tabular-nums">{fmtPrice(total)}</dd>
              </div>
              <div className="flex justify-between border-b rule py-2">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-mono tabular-nums">
                  {stage === "review" ? (total >= 250 ? "Free" : "From $12") : shipping ? fmtPrice(shipping) : "Free"}
                </dd>
              </div>
              <div className="flex justify-between border-b rule py-2">
                <dt className="text-muted">Duties &amp; tax</dt>
                <dd className="font-mono">Included</dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="label">
                {String(count).padStart(2, "0")} {count === 1 ? "garment" : "garments"} ready to be issued
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="caps">Total</span>
                <span className="font-mono text-2xl tabular-nums">
                  {fmtPrice(total + (stage === "review" ? 0 : shipping))}
                </span>
              </div>
            </div>

            <div className="mt-6">
              {stage === "review" ? (
                <Action
                  full
                  onClick={() => {
                    setStage("checkout");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Complete issue
                </Action>
              ) : (
                <>
                  <Action full onClick={() => (document.getElementById("checkout") as HTMLFormElement | null)?.requestSubmit()}>
                    Place order
                  </Action>
                  <button onClick={() => setStage("review")} className="label mt-4 text-muted hover:text-ink">
                    ← Back to review
                  </button>
                </>
              )}
            </div>
            <p className="label mt-6 text-muted">
              Free returns within 30 days. Every garment is numbered on dispatch and recorded to Record No. {profile.recordNo}.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
