"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FLOW } from "@/lib/flow";
import { useStore } from "@/lib/store";

export function Footer() {
  const { resetPrototype } = useStore();
  if (usePathname().startsWith("/simple")) return null;
  return (
    <footer className="mt-24 border-t rule">
      <div className="shell grid grid-cols-2 gap-x-6 gap-y-10 py-10 md:grid-cols-12">
        <div className="col-span-2 md:col-span-5">
          <p className="text-[0.8125rem] font-semibold tracking-[0.22em]">FINEST UNIFORM</p>
          <p className="mt-4 max-w-[22rem] text-sm leading-relaxed text-charcoal">
            The clothes you wear when you don&rsquo;t want to think about clothes. The everyday extension of Finest
            Form, tailors.
          </p>
        </div>
        <ol className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 md:col-span-7 md:grid-cols-5">
          {FLOW.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="group block">
                <span className="label block text-muted">{s.no}</span>
                <span className="ulink">{s.label}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <div className="shell flex justify-between gap-4 border-t rule py-4 label text-muted">
        <span>Form No. FU-000 — A Finest Form company</span>
        <span className="hidden md:inline">Use ← → to move between steps</span>
        <button
          onClick={resetPrototype}
          className="transition-colors hover:text-ink"
          title="Clears the locally stored issue, consultation and record"
        >
          Reset prototype
        </button>
      </div>
    </footer>
  );
}
