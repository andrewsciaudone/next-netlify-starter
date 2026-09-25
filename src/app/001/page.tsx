import type { Metadata } from "next";
import type { ReactNode } from "react";
import { COLOURS, PRODUCTS, TROUSER } from "@/lib/data";
import { Figure, type Outfit } from "@/components/Figure";
import { GarmentSVG } from "@/components/garments";
import { Issue001 } from "@/components/Issue001";
import { MeasureTable } from "@/components/MeasureTable";
import { NextStep } from "@/components/NextStep";
import { Fabric, Plate } from "@/components/Plate";
import { SectionHead } from "@/components/ui";

export const metadata: Metadata = { title: "Uniform 001 — Short-Sleeve Jersey" };

const tee = PRODUCTS[0];
const navy = { kind: "tee" as const, hex: COLOURS.navy.hex };
const trouser = (hex: string) => ({ kind: "trouser" as const, hex });

const WEEK: { day: string; outfit: Outfit; note: string }[] = [
  { day: "Mon", outfit: { base: navy, bottom: TROUSER }, note: "001 Navy" },
  { day: "Tue", outfit: { base: navy, mid: { kind: "sweat", hex: COLOURS.grey.hex }, bottom: TROUSER }, note: "+ 002 Heather Grey" },
  { day: "Wed", outfit: { base: navy, bottom: trouser(COLOURS.stone.hex) }, note: "001 Navy, stone trouser" },
  { day: "Thu", outfit: { base: navy, mid: { kind: "sweat", hex: COLOURS.oatmeal.hex }, bottom: trouser(COLOURS.stone.hex) }, note: "+ 002 Oatmeal" },
  { day: "Fri", outfit: { base: navy, bottom: trouser(COLOURS.navy.hex) }, note: "001 Navy, navy trouser" },
  { day: "Sat", outfit: { base: navy, mid: { kind: "hood", hex: COLOURS.charcoal.hex }, bottom: TROUSER }, note: "+ 003 Charcoal" },
  { day: "Sun", outfit: { base: navy, mid: { kind: "sweat", hex: COLOURS.navy.hex }, bottom: trouser(COLOURS.stone.hex) }, note: "+ 002 Navy" },
];

function Chapter({ no, title, children, figure }: { no: string; title: string; children: ReactNode; figure: ReactNode }) {
  return (
    <article className="grid grid-cols-12 gap-x-4 gap-y-6 border-t border-ink pt-4">
      <div className="col-span-12 md:col-span-5">
        <div className="flex items-baseline gap-3">
          <span className="label text-muted">{no}</span>
          <h3 className="caps">{title}</h3>
        </div>
        <div className="mt-5 max-w-[28rem] space-y-4 text-[0.9375rem] leading-relaxed text-charcoal">{children}</div>
      </div>
      <div className="col-span-12 md:col-span-7">{figure}</div>
    </article>
  );
}

export default function Uniform001() {
  return (
    <>
      {/* Title */}
      <section className="shell pt-10 md:pt-16">
        <div className="grid grid-cols-2 gap-4 border-b rule pb-3 label text-muted md:grid-cols-4">
          <span>Form No. 001</span>
          <span className="text-right md:text-left">Issue 01 / 09.26</span>
          <span className="hidden md:block">280 gsm cotton jersey</span>
          <span className="hidden text-right md:block">Made in the USA</span>
        </div>
        <div className="grid grid-cols-12 gap-x-4 gap-y-8 pt-10 md:pt-16">
          <div className="col-span-12 animate-rise md:col-span-6">
            <p className="label text-muted">Uniform 001</p>
            <h1 className="mt-3 text-[2.5rem] font-medium leading-[0.95] tracking-[-0.03em] md:text-[4rem]">
              Short-Sleeve Jersey
            </h1>
          </div>
          <blockquote className="col-span-12 max-w-[30rem] animate-rise self-end text-xl leading-snug tracking-[-0.01em] text-charcoal [animation-delay:100ms] md:col-span-5 md:col-start-8 md:text-2xl">
            &ldquo;{tee.statement}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Five views */}
      <section className="shell mt-12 md:mt-16">
        <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-3 md:overflow-visible md:px-0">
          <Plate tone="stone" no="01 — Front" caption="Navy" meta="NVY-02" className="w-[80vw] shrink-0 snap-start md:col-span-2 md:row-span-2 md:w-auto" ratio="aspect-[4/5] md:aspect-auto md:h-full">
            <GarmentSVG kind="tee" hex={COLOURS.navy.hex} className="h-[70%] w-auto" />
          </Plate>
          <Plate tone="warm" no="02 — Back" caption="Cream" className="w-[80vw] shrink-0 snap-start md:w-auto">
            <GarmentSVG kind="tee" hex={COLOURS.cream.hex} view="back" className="h-[66%] w-auto" />
          </Plate>
          <Plate tone="charcoal" no="03 — Detail" caption="1×1 rib, ⅞ in" className="w-[80vw] shrink-0 snap-start md:w-auto">
            <GarmentSVG kind="tee" hex={COLOURS.grey.hex} viewBox="120 20 160 120" className="h-full w-full" />
          </Plate>
          <Plate tone="grey" no="04 — Fit" caption="6′1″ / 172 lb / M" className="w-[80vw] shrink-0 snap-start md:w-auto">
            <Figure outfit={{ base: { kind: "tee", hex: COLOURS.black.hex }, bottom: trouser(COLOURS.stone.hex) }} className="h-[90%] w-auto text-ink" animate={false} />
          </Plate>
          <Plate tone="paper" no="05 — Technical" caption="Flat, front" className="hairline-grid w-[80vw] shrink-0 snap-start md:w-auto">
            <GarmentSVG kind="tee" hex="#000" mode="line" className="h-[70%] w-auto" />
          </Plate>
        </div>
      </section>

      {/* The story */}
      <section className="shell mt-24 space-y-20 md:mt-32 md:space-y-28">
        <Chapter
          no="01"
          title="Proportion"
          figure={<MeasureTable product={tee} size="M" />}
        >
          <p>
            A shortened body that finishes at the belt. A chest with room to move. A sleeve that holds its line at
            mid-bicep.
          </p>
          <p>
            It is drawn from the Finest Form jacket block rather than a T-shirt blank — the same shoulder, the same
            balance front to back.
          </p>
        </Chapter>

        <Chapter
          no="02"
          title="Material"
          figure={
            <div className="grid grid-cols-2 gap-3">
              <div className="grain relative aspect-square overflow-hidden">
                <Fabric hex={COLOURS.navy.hex} id="st-navy" className="absolute inset-0 h-full w-full" scale={1.1} />
                <span className="label absolute bottom-3 left-3 text-paper/70">Navy, ×6</span>
              </div>
              <div className="grain relative aspect-square overflow-hidden">
                <Fabric hex={COLOURS.cream.hex} id="st-cream" className="absolute inset-0 h-full w-full" scale={1.1} />
                <span className="label absolute bottom-3 left-3 text-ink/60">Cream, ×6</span>
              </div>
            </div>
          }
        >
          <p>
            280gsm long-staple cotton, knitted slowly on circular machines in North Carolina. Dense enough to drape rather
            than cling; soft enough to forget.
          </p>
        </Chapter>

        <Chapter
          no="03"
          title="Construction"
          figure={
            <div className="grid grid-cols-12 gap-3">
              <div className="hairline-grid grain relative col-span-7 aspect-[4/3] bg-paper-2">
                <GarmentSVG kind="tee" hex="#000" mode="line" viewBox="120 30 160 100" className="absolute inset-0 h-full w-full" title="Collar detail" />
                <span className="label absolute bottom-3 left-3 text-muted">Collar, ×3</span>
              </div>
              <ol className="col-span-5 self-end">
                {tee.construction.map((x, i) => (
                  <li key={x} className="grid grid-cols-[2rem_1fr] border-b rule py-2 text-sm">
                    <span className="font-mono text-[0.75rem] text-muted">{String(i + 1).padStart(2, "0")}</span>
                    {x}
                  </li>
                ))}
              </ol>
            </div>
          }
        >
          <p>
            A 1×1 rib collar set flat and cut ⅞ in deep. Taped shoulders. Twin-needle hems. Each piece is garment
            washed, so it has done its shrinking before it reaches you.
          </p>
        </Chapter>

        <Chapter
          no="04"
          title="Purpose"
          figure={
            <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-7 md:gap-2 md:overflow-visible md:px-0">
              {WEEK.map((w, i) => (
                <div key={w.day} className="w-[36vw] shrink-0 snap-start sm:w-[24vw] md:w-auto">
                  <div className="flex items-baseline justify-between border-t border-ink pt-2">
                    <span className="caps">{w.day}</span>
                    <span className="label text-muted">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="grain relative mt-2 aspect-[2/5] bg-paper-2">
                    <Figure outfit={w.outfit} className="absolute inset-[6%] h-[88%] w-[88%] text-ink" animate={false} />
                  </div>
                  <p className="label mt-2 text-muted">{w.note}</p>
                </div>
              ))}
            </div>
          }
        >
          <p>
            To be worn three days a week, every week, for years. Monday to Sunday, the same 001 in Navy: nothing about
            it changes; everything around it can.
          </p>
          <p>Logos, seasonal colours and novelty have been left out.</p>
        </Chapter>
      </section>

      {/* Issue it */}
      <section className="shell mt-24 md:mt-32">
        <SectionHead index="001" title="Issue 001 — or 004, the polo" aside="T-shirt $88 / Polo $118 — XS–XXL" />
        <div className="mt-10">
          <Issue001 />
        </div>
      </section>

      <NextStep from={1} />
    </>
  );
}
