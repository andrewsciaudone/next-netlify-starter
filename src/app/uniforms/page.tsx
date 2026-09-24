import Link from "next/link";
import type { Metadata } from "next";
import { fmtPrice, PRODUCTS } from "@/lib/data";
import { FormCard, statusText } from "@/components/FormCard";
import { Action } from "@/components/ui";

export const metadata: Metadata = { title: "Uniforms" };

export default function UniformsPage() {
  return (
    <div className="shell pt-10 md:pt-16">
      <div className="grid grid-cols-12 gap-x-4 gap-y-6">
        <div className="col-span-12 md:col-span-6">
          <p className="label text-muted">01 — Uniforms</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.025em] md:text-5xl">The foundations</h1>
        </div>
        <p className="col-span-12 max-w-[30rem] self-end text-sm leading-relaxed text-charcoal md:col-span-5 md:col-start-8">
          Five numbered forms. Each has one job and does it every day. Forms are issued in sequence and never
          discontinued — only improved, and re-issued under the same number.
        </p>
      </div>

      {/* Index table */}
      <table className="mt-12 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-ink">
            {["No.", "Form", "Slot", "Material", "Issue", "Status", "Price"].map((h, i) => (
              <th
                key={h}
                className={`label py-2 font-normal text-muted ${i === 2 || i === 3 ? "hidden md:table-cell" : ""} ${i === 5 ? "hidden lg:table-cell" : ""} ${i === 6 ? "text-right" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PRODUCTS.map((p) => (
            <tr key={p.id} className="group border-b rule transition-colors hover:bg-paper-2">
              <td className="py-3 pr-4 font-mono text-sm">
                <Link href={`/uniforms/${p.id}`}>{p.id}</Link>
              </td>
              <td className="py-3 pr-4 text-sm">
                <Link href={`/uniforms/${p.id}`} className="ulink">
                  {p.name}
                </Link>
              </td>
              <td className="label hidden py-3 pr-4 text-muted md:table-cell">{p.slot}</td>
              <td className="hidden py-3 pr-4 text-sm text-charcoal md:table-cell">{p.material}</td>
              <td className="py-3 pr-4 font-mono text-[0.8125rem] text-muted">
                {p.issue} / {p.issueDate}
              </td>
              <td className="label hidden py-3 pr-4 text-muted lg:table-cell">{statusText(p)}</td>
              <td className="py-3 text-right font-mono text-[0.8125rem] tabular-nums">{fmtPrice(p.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-16 grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 md:gap-x-4">
        {PRODUCTS.map((p) => (
          <FormCard key={p.id} p={p} />
        ))}
        <div className="col-span-2 flex flex-col justify-between border-t border-ink pt-3 md:col-span-1">
          <div>
            <p className="label text-muted">Not sure where to begin?</p>
            <p className="mt-4 text-xl leading-snug tracking-[-0.01em]">
              A short consultation. Six questions, and we will recommend the foundation.
            </p>
          </div>
          <div className="mt-8 flex flex-col items-start gap-3">
            <Action href="/build">Build your uniform</Action>
            <Link href="/archive" className="label text-muted hover:text-ink">
              View the full archive →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
