import Link from "next/link";
import { COLOURS, PRODUCTS, type GarmentKind } from "@/lib/data";
import { Figure, type Outfit } from "@/components/Figure";
import { GarmentSVG, MeasureDiagram } from "@/components/garments";
import { Fabric, MatrixCode, Plate, WovenLabel } from "@/components/Plate";
import { Action, SectionHead } from "@/components/ui";

const tee = PRODUCTS[0];
const L = (kind: GarmentKind, hex: string) => ({ kind, hex });

const WEEK: { day: string; outfit: Outfit; note: string }[] = [
  { day: "Mon", outfit: { base: L("tee", COLOURS.navy.hex), bottom: L("trouser", COLOURS.charcoal.hex) }, note: "001 Navy / 004 Charcoal" },
  { day: "Tue", outfit: { base: L("tee", COLOURS.navy.hex), mid: L("sweat", COLOURS.grey.hex), bottom: L("trouser", COLOURS.charcoal.hex) }, note: "+ 002 Heather Grey" },
  { day: "Wed", outfit: { base: L("tee", COLOURS.navy.hex), outer: L("overshirt", COLOURS.olive.hex), bottom: L("trouser", COLOURS.stone.hex) }, note: "+ 005 Field Olive" },
  { day: "Thu", outfit: { base: L("tee", COLOURS.navy.hex), bottom: L("trouser", COLOURS.stone.hex) }, note: "001 Navy / 004 Stone" },
  { day: "Fri", outfit: { base: L("tee", COLOURS.navy.hex), outer: L("overshirt", COLOURS.navy.hex), bottom: L("trouser", COLOURS.charcoal.hex) }, note: "+ 005 Navy" },
  { day: "Sat", outfit: { base: L("tee", COLOURS.navy.hex), mid: L("hood", COLOURS.charcoal.hex), bottom: L("trouser", COLOURS.navy.hex) }, note: "+ 003 Charcoal" },
  { day: "Sun", outfit: { base: L("tee", COLOURS.navy.hex), mid: L("sweat", COLOURS.oatmeal.hex), bottom: L("trouser", COLOURS.stone.hex) }, note: "+ 002 Oatmeal" },
];

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

const PRINCIPLES = [
  {
    no: "01",
    title: "Proportion",
    body: "A shortened body that finishes at the belt, a chest with room to move, a sleeve that holds its line at mid-bicep. Drawn from the Finest Form jacket block, not a T-shirt blank.",
    figure: (
      <MeasureDiagram kind="tee" active="B" className="h-full w-full" />
    ),
  },
  {
    no: "02",
    title: "Material",
    body: "280gsm long-staple cotton, knitted slowly on Portuguese circular machines. Dense enough to drape rather than cling; soft enough to forget you are wearing it.",
    figure: <Fabric hex={COLOURS.navy.hex} id="p-mat" className="h-full w-full" scale={1.6} />,
  },
  {
    no: "03",
    title: "Construction",
    body: "A 1×1 rib collar set flat and cut 2.2 cm deep. Taped shoulders. Twin-needle hems. Each piece is garment washed so it has already done its shrinking before it reaches you.",
    figure: (
      <GarmentSVG kind="tee" hex="#000" mode="line" viewBox="130 30 140 90" className="h-full w-full" title="Collar detail" />
    ),
  },
  {
    no: "04",
    title: "Purpose",
    body: "To be worn three days a week, every week, for years. Everything that does not serve that — logos, seasonal colours, novelty — has been left out.",
    figure: (
      <div className="flex h-full w-full flex-col justify-center gap-3 px-6">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="label w-3 text-muted">{d}</span>
            <span className={`h-2 flex-1 ${[0, 2, 4].includes(i) ? "bg-navy" : "border rule"}`} />
          </div>
        ))}
      </div>
    ),
  },
];

export default function Home() {
  return (
    <>
      {/* ---------------------------------------------------------- Opening */}
      <section className="shell pt-8 md:pt-12">
        <div className="grid grid-cols-2 gap-4 border-b rule pb-3 label text-muted md:grid-cols-4">
          <span>Issue 01 / <span className="hidden sm:inline">September 2026</span><span className="sm:hidden">09.26</span></span>
          <span className="text-right md:text-left">Form No. 001 — 005</span>
          <span className="hidden md:block">Made in Portugal &amp; Italy</span>
          <span className="hidden text-right md:block">Standard Issue</span>
        </div>

        <div className="grid grid-cols-12 gap-x-4 gap-y-8 pt-10 pb-10 md:pt-16 md:pb-14">
          <div className="col-span-12 md:col-span-7 animate-rise">
            <h1 className="text-[2.5rem] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4.5rem]">
              FINEST UNIFORM
            </h1>
            <p className="mt-5 text-lg leading-snug text-charcoal md:text-xl">Everyday clothing, issued with purpose.</p>
          </div>
          <div className="col-span-12 flex flex-col justify-end gap-6 md:col-span-5 md:items-end animate-rise [animation-delay:120ms]">
            <p className="max-w-[24rem] text-sm leading-relaxed text-charcoal md:text-right">
              A small, numbered wardrobe of T-shirts, sweatshirts and trousers — designed as a system, made to be
              reached for without a second thought.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Action href="/build">Build your uniform</Action>
              <Action href="/archive" variant="outline">
                View all issues
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
          caption="Uniform 001, Navy. Worn with 004, Charcoal."
          meta="Model 186 cm / M"
          className="animate-fade"
        >
          <div className="flex h-[88%] items-stretch gap-2 md:gap-4 lg:translate-x-[8%]">
            <div className="hidden py-[2%] sm:block">
              <HeightRule />
            </div>
            <Figure
              outfit={{ base: L("tee", COLOURS.navy.hex), bottom: L("trouser", COLOURS.charcoal.hex) }}
              className="h-full w-auto text-ink"
              animate={false}
            />
          </div>
          <div className="absolute right-4 top-4 hidden text-right label opacity-70 md:right-6 md:top-6 lg:block">
            <p>001 / Short-Sleeve Jersey</p>
            <p>280 gsm / Garment washed</p>
            <p>004 / Tailored Trouser</p>
            <p>340 gsm / Wool-cotton twill</p>
          </div>
        </Plate>
      </section>

      {/* ------------------------------------------------------ Uniform 001 */}
      <section className="shell mt-24 md:mt-36">
        <SectionHead index="001" title="Uniform 001" aside="Issue 01 / 09.26 — Available now" />
        <div className="mt-8 grid grid-cols-12 gap-x-4 gap-y-10 md:mt-12">
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <p className="label text-muted">Form No. 001</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] md:text-4xl">Short-Sleeve Jersey</h2>
              <blockquote className="mt-8 max-w-[26rem] text-xl leading-snug tracking-[-0.01em] text-charcoal md:text-2xl">
                &ldquo;{tee.statement}&rdquo;
              </blockquote>
              <dl className="mt-10 max-w-[26rem]">
                {[
                  ["Material", "280gsm cotton jersey"],
                  ["Form", "Shortened body / relaxed chest"],
                  ["Origin", "Made in Portugal"],
                  ["Price", "$88"],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[7rem_1fr] border-t rule py-2.5">
                    <dt className="label text-muted pt-[2px]">{k}</dt>
                    <dd className="text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8">
                <Action href="/uniforms/001" variant="outline">
                  View Uniform 001
                </Action>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:px-0">
              <Plate tone="paper" no="01 — Front" caption="Navy" meta="NVY-02" className="w-[80vw] shrink-0 snap-start md:col-span-2 md:w-auto" ratio="aspect-[4/5] md:aspect-[16/11]">
                <GarmentSVG kind="tee" hex={COLOURS.navy.hex} className="h-[78%] w-auto" />
              </Plate>
              <Plate tone="warm" no="02 — Back" caption="Cream" meta="CRM-04" className="w-[80vw] shrink-0 snap-start md:w-auto">
                <GarmentSVG kind="tee" hex={COLOURS.cream.hex} view="back" className="h-[70%] w-auto" />
              </Plate>
              <Plate tone="charcoal" no="03 — Detail" caption="1×1 rib, 2.2 cm" meta="×4" className="w-[80vw] shrink-0 snap-start md:w-auto">
                <GarmentSVG kind="tee" hex={COLOURS.grey.hex} viewBox="120 20 160 120" className="h-full w-full" />
              </Plate>
              <Plate tone="grey" no="04 — Fit" caption="186 cm / 78 kg" meta="Wears M" className="w-[80vw] shrink-0 snap-start md:w-auto">
                <Figure outfit={{ base: L("tee", COLOURS.black.hex), bottom: L("trouser", COLOURS.stone.hex) }} className="h-[90%] w-auto text-ink" animate={false} />
              </Plate>
              <Plate tone="paper" no="05 — Technical" caption="Points of measure A—E" meta="Scale 1:8" className="hairline-grid w-[80vw] shrink-0 snap-start md:w-auto">
                <MeasureDiagram kind="tee" className="h-[82%] w-auto" />
              </Plate>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Principles */}
      <section className="shell mt-24 md:mt-36">
        <SectionHead index="§" title="How 001 is made" aside="Four notes from the pattern room" />
        <div className="mt-10 grid gap-x-4 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p) => (
            <article key={p.no} className="flex flex-col">
              <div className="grain relative aspect-square overflow-hidden bg-paper-2">{p.figure}</div>
              <div className="mt-4 flex items-baseline gap-3 border-t border-ink pt-3">
                <span className="label text-muted">{p.no}</span>
                <h3 className="caps">{p.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-charcoal">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- One less decision */}
      <section className="mt-24 bg-navy text-paper md:mt-36">
        <div className="shell grid grid-cols-12 gap-x-4 gap-y-12 py-20 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <p className="label opacity-60">Principle 01</p>
            <h2 className="mt-4 text-[2.75rem] font-medium leading-[0.95] tracking-[-0.03em] md:text-[4.25rem]">
              One less
              <br />
              decision.
            </h2>
            <p className="mt-8 max-w-[30rem] leading-relaxed opacity-80">
              A man makes enough choices before nine o&rsquo;clock. We would rather he did not have to make this one.
              Choose your forms once, in the colours you trust, in the size that is right — and then stop thinking
              about it.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="label opacity-60">A morning, logged</p>
            <ol className="mt-4 font-mono text-[0.8125rem]">
              {[
                ["07:02", "Alarm."],
                ["07:10", "Shower."],
                ["07:21", "Reach for 001."],
                ["07:21", "Reach for 004."],
                ["07:22", "Dressed."],
                ["07:23", "Coffee, and the rest of the day."],
              ].map(([t, e], i) => (
                <li key={i} className="grid grid-cols-[4rem_1fr] border-t border-paper/15 py-2.5">
                  <span className="opacity-50">{t}</span>
                  <span>{e}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Monday—Sunday */}
      <section className="shell mt-24 md:mt-36">
        <SectionHead index="7/7" title="Monday — Sunday" aside="One garment, seven days: 001 in Navy" />
        <p className="mt-6 max-w-[34rem] text-sm leading-relaxed text-charcoal">
          The same 001 in Navy, worn across a week. Nothing about it changes. Everything around it can.
        </p>
        <div className="-mx-4 mt-10 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-7 md:overflow-visible md:px-0">
          {WEEK.map((w, i) => (
            <div key={w.day} className="group w-[42vw] shrink-0 snap-start sm:w-[28vw] md:w-auto">
              <div className="flex items-baseline justify-between border-t border-ink pt-2">
                <span className="caps">{w.day}</span>
                <span className="label text-muted">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="grain relative mt-3 aspect-[2/5] bg-paper-2 transition-colors duration-500 group-hover:bg-paper-3">
                <Figure outfit={w.outfit} className="absolute inset-[6%] h-[88%] w-[88%] text-ink" animate={false} />
              </div>
              <p className="label mt-3 text-muted transition-colors group-hover:text-ink">{w.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- Label & record */}
      <section className="shell mt-24 md:mt-36">
        <SectionHead index="§" title="Every garment has a record" aside="Woven label / sewn-in tag" />
        <div className="mt-10 grid grid-cols-12 gap-x-4 gap-y-10">
          <div className="col-span-12 grid grid-cols-2 gap-2 md:col-span-7 md:gap-3">
            <div className="grain relative flex aspect-square items-center justify-center bg-paper-2">
              <WovenLabel lines={tee.label} className="scale-110 md:scale-[1.35]" />
              <span className="label absolute bottom-3 left-3 text-muted">Neck label</span>
            </div>
            <div className="grain relative flex aspect-square flex-col items-center justify-center gap-3 bg-paper-3">
              <div className="border border-ink/60 bg-paper p-3">
                <MatrixCode value="001-26-00482" className="h-24 w-24 text-ink md:h-32 md:w-32" />
                <p className="mt-2 text-center font-mono text-[0.625rem] tracking-[0.1em]">001-26-00482</p>
              </div>
              <span className="label absolute bottom-3 left-3 text-muted">Side-seam tag</span>
            </div>
          </div>
          <div className="col-span-12 flex flex-col justify-between gap-8 md:col-span-4 md:col-start-9">
            <div>
              <p className="text-2xl leading-snug tracking-[-0.01em]">
                Each piece is numbered. Scan the tag in the side seam to open its record: where it was made, how to
                care for it, when it was issued to you.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Action href="/record/001-26-00482" variant="outline">
                Open a garment record
              </Action>
              <Link href="/record" className="label mt-2 text-muted transition-colors hover:text-ink">
                Or view your uniform record →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Close */}
      <section className="shell mt-24 md:mt-36">
        <div className="grid grid-cols-12 gap-x-4 border-t border-ink pt-10">
          <p className="label col-span-12 text-muted md:col-span-3">Finest Form / Finest Uniform</p>
          <p className="col-span-12 mt-4 text-2xl leading-snug tracking-[-0.015em] md:col-span-8 md:mt-0 md:text-[2rem]">
            Finest Form understands the individual.
            <br />
            <span className="text-muted">Finest Uniform understands what the individual reaches for every day.</span>
          </p>
        </div>
      </section>
    </>
  );
}
