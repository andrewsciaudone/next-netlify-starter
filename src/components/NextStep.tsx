import Link from "next/link";
import { FLOW } from "@/lib/flow";

/** Closing panel on every page: where you came from, and where to go next. */
export function NextStep({ from }: { from: number }) {
  const next = FLOW[from + 1];
  const prev = FLOW[from - 1];
  return (
    <nav className="shell mt-28 md:mt-40" aria-label="Next step">
      <div className="grid grid-cols-12 gap-x-4 gap-y-6 border-t border-ink pt-4">
        <div className="col-span-12 md:col-span-3">
          <p className="label text-muted">
            Step {FLOW[from].no} / 05
          </p>
          {prev && (
            <Link href={prev.href} className="label mt-2 inline-block text-muted transition-colors hover:text-ink">
              ← {prev.no} {prev.label}
            </Link>
          )}
        </div>
        {next && (
          <Link href={next.href} className="group col-span-12 block md:col-span-9">
            <p className="label text-muted">Next — {next.no}</p>
            <p className="mt-3 flex items-baseline justify-between gap-6 text-[2rem] font-medium leading-none tracking-[-0.025em] md:text-[3.25rem]">
              <span>{next.label}</span>
              <span className="font-mono text-2xl transition-transform duration-500 group-hover:translate-x-2 md:text-3xl">→</span>
            </p>
            <p className="mt-4 max-w-[28rem] text-sm text-charcoal">{next.blurb}</p>
          </Link>
        )}
      </div>
    </nav>
  );
}
