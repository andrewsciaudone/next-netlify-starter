"use client";

import type { Colour } from "@/lib/data";
import { Fabric } from "./Plate";

/** Colour selection presented as physical cut swatches with mill codes. */
export function Swatches({
  colours,
  value,
  onChange,
  size = "md",
}: {
  colours: Colour[];
  value: string;
  onChange: (id: string) => void;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-9 w-9" : "h-14 w-12 md:h-16 md:w-14";
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Colour">
      {colours.map((c) => {
        const on = c.id === value;
        return (
          <button
            key={c.id}
            role="radio"
            aria-checked={on}
            aria-label={c.name}
            title={`${c.name} — ${c.code}`}
            onClick={() => onChange(c.id)}
            className="group flex flex-col items-start gap-1.5"
          >
            <span
              className={`relative block overflow-hidden ${dim} shadow-[0_1px_1px_rgba(0,0,0,0.12)] transition-transform duration-300 ${
                on ? "-translate-y-1" : "group-hover:-translate-y-0.5"
              }`}
            >
              <Fabric hex={c.hex} id={`sw-${c.id}-${size}`} className="absolute inset-0 h-full w-full" scale={0.7} />
              {/* pinked edge */}
              <span
                className="absolute inset-x-0 bottom-0 h-[5px]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-paper) 33%, transparent 33%) 0 0 / 6px 6px, linear-gradient(225deg, var(--color-paper) 33%, transparent 33%) 0 0 / 6px 6px",
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: "bottom",
                }}
              />
            </span>
            {size === "md" && (
              <span className={`font-mono text-[0.5625rem] tracking-[0.06em] transition-colors ${on ? "text-ink" : "text-muted"}`}>
                {c.code}
              </span>
            )}
            <span className={`block h-px w-full transition-colors ${on ? "bg-ink" : "bg-transparent"}`} />
          </button>
        );
      })}
    </div>
  );
}

export function SizeSelect({
  sizes,
  value,
  onChange,
  prefix = "",
}: {
  sizes: string[];
  value: string | null;
  onChange: (s: string) => void;
  prefix?: string;
}) {
  return (
    <div className="flex flex-wrap gap-x-1" role="radiogroup" aria-label="Size">
      {sizes.map((s) => {
        const on = s === value;
        return (
          <button
            key={s}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(s)}
            className={`relative h-9 min-w-10 px-2 font-mono text-[0.8125rem] transition-colors ${
              on ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {prefix}
            {s}
            <span
              className={`absolute inset-x-2 bottom-1 h-px bg-ink transition-transform duration-300 ${on ? "scale-x-100" : "scale-x-0"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
