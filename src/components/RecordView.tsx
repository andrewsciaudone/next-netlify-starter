"use client";

import Link from "next/link";
import { fmtDate, fmtDay, FOUNDATIONS, getColour, getProduct, PRODUCTS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { GarmentSVG } from "./garments";
import { Action, SectionHead } from "./ui";

export function RecordView() {
  const { profile, issued, hydrated } = useStore();
  if (!hydrated) return <div className="min-h-[80vh]" />;

  const issuedForms = new Set(issued.map((g) => g.productId));
  const done = FOUNDATIONS.filter((id) => issuedForms.has(id));
  const pending = PRODUCTS.filter((p) => !issuedForms.has(p.id));
  const orders = [...new Set(issued.map((g) => g.orderNo))].map((o) => ({
    orderNo: o,
    items: issued.filter((g) => g.orderNo === o),
  }));

  return (
    <div className="shell pt-10 md:pt-16">
      <div className="grid grid-cols-2 gap-4 border-b rule pb-3 label text-muted md:grid-cols-4">
        <span>04 — Uniform record</span>
        <span className="text-right md:text-left">Opened {fmtDate(profile.since)}</span>
        <span className="hidden md:block">{issued.length} garments on record</span>
        <span className="hidden text-right md:block">Signed in</span>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-x-4 gap-y-10 md:mt-14">
        <div className="col-span-12 md:col-span-6">
          <p className="label text-muted">Uniform record</p>
          <h1 className="mt-3 text-[2.75rem] font-medium uppercase leading-none tracking-[-0.03em] md:text-[4.5rem]">{profile.name}</h1>
          <p className="mt-4 font-mono text-sm">Record No. {profile.recordNo}</p>
        </div>
        <dl className="col-span-12 grid grid-cols-2 gap-x-4 md:col-span-6">
          {[
            ["Preferred fit", `${profile.fit} / ${profile.length}`],
            ["Preferred colours", profile.colours.join(" / ")],
            ["Standard size", profile.size + (profile.height ? ` — ${profile.height} cm` : "")],
            ["Worn", `${profile.wear}, ${profile.frequency} a week`],
          ].map(([k, v]) => (
            <div key={k} className="border-t rule py-3">
              <dt className="label text-muted">{k}</dt>
              <dd className="mt-1.5 text-[0.9375rem]">{v}</dd>
            </div>
          ))}
          <div className="col-span-2 border-t rule pt-3">
            <Link href="/build" className="label text-muted hover:text-ink">
              Update preferences by consultation →
            </Link>
          </div>
        </dl>
      </div>

      {/* Completion */}
      <section className="mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-ink pt-3">
          <h2 className="caps">Your uniform</h2>
          <p className="label">
            {String(done.length).padStart(2, "0")} / {String(FOUNDATIONS.length).padStart(2, "0")} foundations issued
          </p>
        </div>
        <ol className="mt-5 grid grid-cols-5 gap-1">
          {PRODUCTS.map((p) => {
            const on = issuedForms.has(p.id);
            return (
              <li key={p.id}>
                <Link href={`/uniforms/${p.id}`} className="group block">
                  <span className={`block h-1 transition-colors ${on ? "bg-ink" : "bg-rule group-hover:bg-muted"}`} />
                  <span className={`mt-2 block font-mono text-[0.8125rem] ${on ? "" : "text-muted"}`}>{p.id}</span>
                  <span className="hidden text-[0.75rem] text-muted sm:block">{p.name}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Issued */}
      <section className="mt-20">
        <SectionHead index="A" title="Issued" aside={`${issued.length} garments`} />
        <ul className="mt-4">
          {issued
            .slice()
            .reverse()
            .map((g) => {
              const p = getProduct(g.productId)!;
              const c = getColour(p, g.colour);
              return (
                <li key={g.garmentNo}>
                  <Link
                    href={`/record/${g.garmentNo}`}
                    className="group grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 border-b rule py-3 transition-colors hover:bg-paper-2 md:grid-cols-[4rem_1.2fr_1fr_1fr_auto] md:gap-6"
                  >
                    <span className="grain relative block aspect-square bg-paper-2 transition-colors group-hover:bg-paper-3">
                      <GarmentSVG kind={p.kind} hex={c.hex} className="absolute inset-[10%] h-[80%] w-[80%]" />
                    </span>
                    <span>
                      <span className="block text-[0.9375rem]">
                        <span className="font-mono">{p.id}</span> / {c.name} / {g.size}
                      </span>
                      <span className="label text-muted md:hidden">
                        {g.garmentNo} — Issued {fmtDate(g.issuedAt)}
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
                    <span className="label text-muted transition-transform group-hover:translate-x-0.5">Record →</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </section>

      {/* Not yet issued */}
      <section className="mt-20">
        <SectionHead index="B" title="Not yet issued" aside="Foundations still open" />
        {pending.length === 0 ? (
          <p className="mt-6 text-sm text-muted">All five foundations are on your record.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {pending.map((p) => (
              <Link key={p.id} href={`/uniforms/${p.id}`} className="group block">
                <div className="hairline-grid relative aspect-[4/5] border rule bg-paper transition-colors group-hover:bg-paper-2">
                  <GarmentSVG kind={p.kind} hex="#000" mode="line" className="absolute inset-[14%] h-[72%] w-[72%] opacity-60 transition-opacity group-hover:opacity-100" />
                  <span className="label absolute left-3 top-3 text-muted">Unissued</span>
                </div>
                <p className="mt-3 text-sm">
                  <span className="font-mono">{p.id}</span> / {p.name}
                </p>
                <p className="label mt-1 text-muted">{p.dispatch ?? "Available now"}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="mt-20">
        <SectionHead index="C" title="Issue history" aside="Orders" />
        <table className="mt-4 w-full border-collapse text-left">
          <tbody>
            {orders
              .slice()
              .reverse()
              .map((o) => (
                <tr key={o.orderNo} className="border-b rule">
                  <td className="py-3 pr-4 font-mono text-[0.8125rem]">{o.orderNo}</td>
                  <td className="py-3 pr-4 font-mono text-[0.8125rem] text-muted">{fmtDay(o.items[0].issuedAt)}</td>
                  <td className="py-3 text-right text-[0.8125rem] md:text-left">
                    {o.items.map((g) => `${g.productId} ${getColour(getProduct(g.productId)!, g.colour).name}`).join(", ")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="mt-10">
          <Action href="/build/configure" variant="outline">
            Plan the next issue
          </Action>
        </div>
      </section>
    </div>
  );
}
