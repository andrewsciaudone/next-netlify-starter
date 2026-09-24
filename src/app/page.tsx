import { COLOURS, TROUSER } from "@/lib/data";
import { Figure } from "@/components/Figure";
import { NextStep } from "@/components/NextStep";
import { Plate } from "@/components/Plate";
import { Action } from "@/components/ui";

function HeightRule() {
  return (
    <svg viewBox="0 0 40 980" className="h-full w-auto text-ink/50" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => {
        const y = 28 + i * 47;
        return (
          <g key={i}>
            <line x1={i % 2 ? 30 : 22} x2={40} y1={y} y2={y} stroke="currentColor" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
            {i % 2 === 0 && (
              <text x={0} y={y + 3} fontSize={9} fill="currentColor" fontFamily="var(--font-mono)">
                {String(190 - i * 10).padStart(3, "0")}
              </text>
            )}
          </g>
        );
      })}
      <line x1={40} x2={40} y1={28} y2={921} stroke="currentColor" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      {/* Opening */}
      <section className="shell pt-8 md:pt-12">
        <div className="grid grid-cols-2 gap-4 border-b rule pb-3 label text-muted md:grid-cols-4">
          <span>
            Issue 01 / <span className="hidden sm:inline">September 2026</span>
            <span className="sm:hidden">09.26</span>
          </span>
          <span className="text-right md:text-left">Form No. 001</span>
          <span className="hidden md:block">Made in Portugal</span>
          <span className="hidden text-right md:block">Standard Issue</span>
        </div>

        <div className="grid grid-cols-12 gap-x-4 gap-y-8 pb-10 pt-10 md:pb-14 md:pt-16">
          <div className="col-span-12 animate-rise md:col-span-7">
            <h1 className="text-[2.5rem] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4.5rem]">
              FINEST UNIFORM
            </h1>
            <p className="mt-5 text-lg leading-snug text-charcoal md:text-xl">Everyday clothing, issued with purpose.</p>
          </div>
          <div className="col-span-12 flex animate-rise flex-col justify-end gap-6 [animation-delay:120ms] md:col-span-5 md:items-end">
            <p className="max-w-[24rem] text-sm leading-relaxed text-charcoal md:text-right">
              A small, numbered wardrobe — designed as a system, made to be reached for without a second thought.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Action href="/build">Build your uniform</Action>
              <Action href="/001" variant="outline">
                Meet Uniform 001
              </Action>
            </div>
          </div>
        </div>
      </section>

      <section className="md:shell">
        <Plate
          tone="stone"
          ratio="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/8]"
          no="Plate 01"
          caption="Uniform 001, Navy. Worn with a tailored trouser."
          meta="Model 186 cm / M"
          className="animate-fade"
        >
          <div className="flex h-[88%] items-stretch gap-2 md:gap-4 lg:translate-x-[8%]">
            <div className="hidden py-[2%] sm:block">
              <HeightRule />
            </div>
            <Figure
              outfit={{ base: { kind: "tee", hex: COLOURS.navy.hex }, bottom: TROUSER }}
              className="h-full w-auto text-ink"
              animate={false}
            />
          </div>
          <div className="label absolute right-4 top-4 hidden text-right opacity-70 md:right-6 md:top-6 lg:block">
            <p>001 / Short-Sleeve Jersey</p>
            <p>280 gsm / Garment washed</p>
            <p>Made in Portugal</p>
          </div>
        </Plate>
      </section>

      {/* One less decision */}
      <section className="mt-24 bg-navy text-paper md:mt-36">
        <div className="shell grid grid-cols-12 gap-x-4 gap-y-12 py-20 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <p className="label opacity-60">The idea</p>
            <h2 className="mt-4 text-[2.75rem] font-medium leading-[0.95] tracking-[-0.03em] md:text-[4.25rem]">
              One less
              <br />
              decision.
            </h2>
            <p className="mt-8 max-w-[30rem] leading-relaxed opacity-80">
              A man makes enough choices before nine o&rsquo;clock. Choose your forms once — in the colours you trust,
              in the size that is right — and stop thinking about it. We number every garment and keep a record, so
              the next one is exactly the same.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="label opacity-60">How it works</p>
            <ol className="mt-4">
              {[
                ["02", "Meet the foundation, Uniform 001."],
                ["03", "Answer seven questions. We recommend your uniform."],
                ["04", "It is kept on your Uniform Record."],
                ["05", "Your Issue is prepared and sent."],
              ].map(([n, t]) => (
                <li key={n} className="grid grid-cols-[3rem_1fr] border-t border-paper/15 py-3 text-sm">
                  <span className="font-mono text-[0.8125rem] opacity-50">{n}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <NextStep from={0} />
    </>
  );
}
