"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { COLOURS } from "@/lib/data";
import { useStore, type Consultation as C } from "@/lib/store";
import { TEE_OUTLINE } from "./garments";
import { Action } from "./ui";

const EMPTY: C = {
  name: "",
  fit: "",
  length: "",
  wear: "",
  colours: [],
  frequency: "",
  size: "",
  height: "",
  weight: "",
};

type Step = {
  key: keyof C;
  record: string;
  q: string;
  hint?: string;
};

const STEPS: Step[] = [
  { key: "name", record: "Name", q: "First — what should we call you?", hint: "Your record will be prepared in this name." },
  { key: "fit", record: "Fit", q: "How do you prefer your T-shirts to fit?", hint: "Through the chest and body." },
  { key: "length", record: "Length", q: "And the length?", hint: "Measured from the shoulder, worn untucked." },
  { key: "wear", record: "Worn", q: "How do you normally wear them?" },
  { key: "colours", record: "Colours", q: "Which colours do you reach for?", hint: "Choose as many as you like, in order of preference." },
  { key: "frequency", record: "Frequency", q: "How often do you wear a T-shirt each week?" },
  { key: "size", record: "Size", q: "Your usual size.", hint: "Height and weight are optional. They help us check length." },
];

function TeeGlyph({ sx = 1, sy = 1 }: { sx?: number; sy?: number }) {
  return (
    <svg viewBox="0 0 400 480" className="h-20 w-auto md:h-24" aria-hidden>
      <g transform={`translate(200,56) scale(${sx},${sy}) translate(-200,-56)`}>
        <path d={TEE_OUTLINE} fill="none" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </g>
      <line x1={0} x2={400} y1={420} y2={420} stroke="currentColor" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.4} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Choice({
  on,
  onClick,
  children,
  sub,
  glyph,
  idx,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  sub?: string;
  glyph?: ReactNode;
  idx: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`group relative flex flex-col items-start border-t py-4 text-left transition-colors duration-300 ${
        on ? "border-ink" : "rule hover:border-ink/60"
      }`}
    >
      <span className={`absolute left-0 top-0 h-px bg-ink transition-all duration-500 ${on ? "w-full" : "w-0"}`} />
      <span className="label text-muted">{String.fromCharCode(65 + idx)}</span>
      {glyph && <span className={`mt-3 transition-opacity ${on ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`}>{glyph}</span>}
      <span className="mt-3 text-xl tracking-[-0.01em] md:text-2xl">{children}</span>
      {sub && <span className="mt-1 text-[0.8125rem] text-muted">{sub}</span>}
    </button>
  );
}

export function Consultation() {
  const router = useRouter();
  const { saveConsultation, consultation, hydrated, profile } = useStore();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [a, setA] = useState<C>(EMPTY);

  useEffect(() => {
    if (hydrated && consultation) setA({ ...EMPTY, ...consultation });
  }, [hydrated, consultation]);

  const cur = STEPS[step];
  const set = <K extends keyof C>(k: K, v: C[K]) => setA((x) => ({ ...x, [k]: v }));
  const answered = (k: keyof C) => (k === "colours" ? true : k === "name" ? a.name.trim().length > 0 : !!a[k]);
  const canNext = answered(cur.key);

  const next = () => {
    if (!canNext) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      saveConsultation({ ...a, name: a.name.trim(), completedAt: new Date().toISOString() });
      router.push("/build/your-uniform");
    }
  };

  // Single choices advance on their own after a beat — like a tailor noting it down.
  const pick = (k: keyof C, v: string) => {
    set(k, v as never);
    if (k !== "size") setTimeout(() => setStep((s) => (STEPS[s].key === k ? Math.min(s + 1, STEPS.length - 1) : s)), 380);
  };

  const recordValue = (k: keyof C) => {
    const v = a[k];
    if (Array.isArray(v)) return v.length ? v.join(" / ") : "";
    if (k === "size" && v) return [v, a.height && `${a.height} cm`, a.weight && `${a.weight} kg`].filter(Boolean).join(" / ");
    return v as string;
  };

  if (!started) {
    return (
      <div className="shell grid min-h-[calc(100vh-3.5rem)] grid-cols-12 gap-x-4 pt-10 pb-16 md:pt-16">
        <div className="col-span-12 flex flex-col md:col-span-7">
          <p className="label text-muted animate-fade">02 — Build your uniform</p>
          <h1 className="mt-6 text-[2.5rem] font-medium leading-[0.95] tracking-[-0.03em] md:text-[4rem] animate-rise">
            Let&rsquo;s build
            <br />
            your uniform.
          </h1>
          <p className="mt-6 max-w-[28rem] text-lg leading-snug text-charcoal animate-rise [animation-delay:100ms]">
            Answer a few questions. We&rsquo;ll recommend the foundation.
          </p>
          <div className="mt-10 flex flex-col items-start gap-4 animate-rise [animation-delay:200ms]">
            <Action onClick={() => setStarted(true)}>{consultation ? "Begin again" : "Begin"}</Action>
            {consultation && (
              <Link href="/build/your-uniform" className="label text-muted hover:text-ink">
                View your last recommendation →
              </Link>
            )}
          </div>
        </div>
        <div className="col-span-12 mt-16 self-end md:col-span-4 md:col-start-9 md:mt-0">
          <dl className="label text-muted">
            {[
              ["Duration", "About two minutes"],
              ["Questions", "07"],
              ["Result", "A recommended issue"],
              ["Kept", "On your uniform record"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-t rule py-2.5">
                <dt>{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-muted">
            Already know what you want?{" "}
            <Link href="/build/configure" className="ulink text-ink">
              Open the configurator
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shell grid min-h-[calc(100vh-3.5rem)] grid-cols-12 gap-x-4 gap-y-10 pt-8 pb-16 md:pt-12">
      {/* Consultation record, filling in as we go */}
      <aside className="order-2 col-span-12 md:order-1 md:col-span-4 lg:col-span-3">
        <div className="md:sticky md:top-24">
          <div className="flex items-baseline justify-between border-t border-ink pt-2">
            <p className="label">Consultation</p>
            <p className="label text-muted">Rec. {profile.recordNo}</p>
          </div>
          <dl className="mt-2">
            {STEPS.map((s, i) => {
              const v = recordValue(s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => i <= step && setStep(i)}
                  disabled={i > step}
                  className={`grid w-full grid-cols-[1.75rem_5.5rem_1fr] items-baseline border-b rule py-2.5 text-left transition-colors ${
                    i === step ? "text-ink" : i < step ? "text-charcoal hover:text-ink" : "text-muted/60"
                  }`}
                >
                  <span className="label">{String(i + 1).padStart(2, "0")}</span>
                  <span className="label">{s.record}</span>
                  <span key={v} className="truncate text-[0.8125rem] animate-fade">
                    {v || (i === step ? "…" : "")}
                  </span>
                </button>
              );
            })}
          </dl>
        </div>
      </aside>

      {/* Question */}
      <section className="order-1 col-span-12 flex flex-col md:order-2 md:col-span-8 lg:col-span-8 lg:col-start-5">
        <div className="flex items-center gap-4">
          <span className="label tabular-nums">
            {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
          <span className="relative h-px flex-1 bg-rule">
            <span
              className="absolute inset-y-0 left-0 bg-ink transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)]"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </span>
        </div>

        <div key={step} className="mt-10 animate-rise md:mt-16">
          <h2 className="max-w-[36rem] text-[1.75rem] font-medium leading-tight tracking-[-0.02em] md:text-[2.5rem]">{cur.q}</h2>
          {cur.hint && <p className="mt-3 text-sm text-muted">{cur.hint}</p>}

          <div className="mt-10">
            {cur.key === "name" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
                className="max-w-[28rem]"
              >
                <input
                  autoFocus
                  value={a.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="First name"
                  className="w-full border-b border-ink bg-transparent pb-2 text-2xl tracking-[-0.01em] outline-none placeholder:text-muted/60 md:text-3xl"
                />
              </form>
            )}

            {cur.key === "fit" && (
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {[
                  ["Compact", "Close to the body", 0.9],
                  ["Standard", "Neither close nor loose", 1],
                  ["Relaxed", "Room through the chest", 1.12],
                ].map(([v, sub, sx], i) => (
                  <Choice key={v} idx={i} on={a.fit === v} onClick={() => pick("fit", v as string)} sub={sub as string} glyph={<TeeGlyph sx={sx as number} />}>
                    {v}
                  </Choice>
                ))}
              </div>
            )}

            {cur.key === "length" && (
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {[
                  ["Short", "At the belt", 0.9],
                  ["Standard", "Just below the belt", 1],
                  ["Long", "Covers the seat", 1.1],
                ].map(([v, sub, sy], i) => (
                  <Choice key={v} idx={i} on={a.length === v} onClick={() => pick("length", v as string)} sub={sub as string} glyph={<TeeGlyph sy={sy as number} />}>
                    {v}
                  </Choice>
                ))}
              </div>
            )}

            {cur.key === "wear" && (
              <div className="grid gap-0 md:grid-cols-3 md:gap-6">
                {[
                  ["Alone", "The T-shirt is the outfit"],
                  ["Layered", "Under a sweatshirt, shirt or jacket"],
                  ["Both", "Depends on the day"],
                ].map(([v, sub], i) => (
                  <Choice key={v} idx={i} on={a.wear === v} onClick={() => pick("wear", v)} sub={sub}>
                    {v}
                  </Choice>
                ))}
              </div>
            )}

            {cur.key === "colours" && (
              <div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {[COLOURS.black, COLOURS.navy, COLOURS.grey, COLOURS.cream, COLOURS.white].map((c) => {
                    const name = c.name === "Heather Grey" ? "Grey" : c.name;
                    const order = a.colours.indexOf(name);
                    const on = order >= 0;
                    return (
                      <button
                        key={c.id}
                        onClick={() => set("colours", on ? a.colours.filter((x) => x !== name) : [...a.colours, name])}
                        aria-pressed={on}
                        className="group text-left"
                      >
                        <span
                          className={`relative block aspect-[4/5] shadow-[0_1px_1px_rgba(0,0,0,0.1)] transition-transform duration-300 ${on ? "-translate-y-1.5" : "group-hover:-translate-y-0.5"}`}
                          style={{ background: c.hex }}
                        >
                          {on && (
                            <span className="label absolute right-2 top-2 flex h-5 w-5 items-center justify-center bg-paper text-ink animate-fade">
                              {order + 1}
                            </span>
                          )}
                        </span>
                        <span className={`mt-2 block border-t pt-2 text-[0.9375rem] transition-colors ${on ? "border-ink" : "rule text-muted"}`}>{name}</span>
                        <span className="label text-muted">{c.code}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="label mt-6 text-muted">
                  {a.colours.length ? `${a.colours.length} selected` : "None selected — we will choose for you"}
                </p>
              </div>
            )}

            {cur.key === "frequency" && (
              <div className="grid gap-0 md:grid-cols-3 md:gap-6">
                {[
                  ["1–2 days", "Occasionally"],
                  ["3–4 days", "Most of the week"],
                  ["5+ days", "Almost every day"],
                ].map(([v, sub], i) => (
                  <Choice key={v} idx={i} on={a.frequency === v} onClick={() => pick("frequency", v)} sub={sub}>
                    {v}
                  </Choice>
                ))}
              </div>
            )}

            {cur.key === "size" && (
              <div>
                <div className="flex flex-wrap border-t border-ink">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                    <button
                      key={s}
                      onClick={() => pick("size", s)}
                      aria-pressed={a.size === s}
                      className={`h-16 flex-1 border-b border-r rule font-mono text-lg transition-colors first:border-l ${
                        a.size === s ? "bg-ink text-paper" : "hover:bg-paper-2"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="mt-8 grid max-w-[28rem] grid-cols-2 gap-6">
                  {(
                    [
                      ["height", "Height", "cm"],
                      ["weight", "Weight", "kg"],
                    ] as const
                  ).map(([k, l, u]) => (
                    <label key={k} className="block">
                      <span className="label text-muted">
                        {l} <span className="opacity-60">(optional)</span>
                      </span>
                      <span className="mt-2 flex items-baseline border-b border-ink">
                        <input
                          inputMode="numeric"
                          value={a[k]}
                          onChange={(e) => set(k, e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                          className="w-full bg-transparent py-1.5 font-mono text-lg outline-none"
                          placeholder="—"
                        />
                        <span className="label text-muted">{u}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-14">
          <button
            onClick={() => (step === 0 ? setStarted(false) : setStep(step - 1))}
            className="label text-muted transition-colors hover:text-ink"
          >
            ← Back
          </button>
          <Action onClick={next} disabled={!canNext}>
            {step === STEPS.length - 1 ? "Prepare my uniform" : cur.key === "colours" && !a.colours.length ? "Skip" : "Continue"}
          </Action>
        </div>
      </section>
    </div>
  );
}
