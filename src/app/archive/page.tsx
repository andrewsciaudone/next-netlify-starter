import type { Metadata } from "next";
import { ALL_FORMS } from "@/lib/data";
import { FormCard } from "@/components/FormCard";

export const metadata: Metadata = { title: "Archive" };

export default function ArchivePage() {
  const forms = [...ALL_FORMS].sort((a, b) => a.issue.localeCompare(b.issue));
  return (
    <div className="shell pt-10 md:pt-16">
      <div className="grid grid-cols-12 gap-x-4 gap-y-6">
        <div className="col-span-12 md:col-span-6">
          <p className="label text-muted">03 — Archive</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.025em] md:text-5xl">A permanent catalogue</h1>
        </div>
        <p className="col-span-12 max-w-[30rem] self-end text-sm leading-relaxed text-charcoal md:col-span-5 md:col-start-8">
          Nothing is deleted. Every form we have issued stays here with its number, date and specification — including
          the ones that have been fully issued and will not be made again.
        </p>
      </div>

      {/* Timeline */}
      <div className="mt-14 overflow-x-auto">
        <div className="relative min-w-[40rem]">
          <div className="absolute inset-x-0 top-[7px] h-px bg-ink" />
          <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${forms.length}, minmax(0, 1fr))` }}>
            {forms.map((p) => {
              const past = p.status !== "pre-issue";
              return (
                <li key={p.id} className="pr-4">
                  <span className={`block h-[15px] w-[15px] border border-ink ${past ? "bg-ink" : "bg-paper"}`} />
                  <p className="label mt-3">{p.issueDate}</p>
                  <p className="label text-muted">Issue {p.issue}</p>
                  <p className="mt-2 text-[0.8125rem]">
                    <span className="font-mono">{p.id}</span> <span className="text-muted">{p.name}</span>
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-x-3 gap-y-14 md:grid-cols-3 md:gap-x-4">
        {forms.map((p) => (
          <FormCard key={p.id} p={p} variant="archive" />
        ))}
      </div>

      <div className="mt-20 grid grid-cols-12 gap-x-4 border-t border-ink pt-6">
        <p className="label col-span-12 text-muted md:col-span-3">Numbering</p>
        <div className="col-span-12 mt-4 grid gap-6 text-sm leading-relaxed text-charcoal md:col-span-9 md:mt-0 md:grid-cols-3">
          <p>
            <span className="font-mono text-ink">Form No.</span> — the pattern. 001 is the jersey, and will always be the
            jersey.
          </p>
          <p>
            <span className="font-mono text-ink">Issue</span> — the release a form first appeared in, numbered and dated
            MM.YY.
          </p>
          <p>
            <span className="font-mono text-ink">Garment No.</span> — the individual piece: form, year, sequence.
            001-26-00482.
          </p>
        </div>
      </div>
    </div>
  );
}
