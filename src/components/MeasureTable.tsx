"use client";

import { useState } from "react";
import { fmtIn, type Product } from "@/lib/data";
import { MeasureDiagram } from "./garments";

/** Points-of-measure table linked to the technical drawing. */
export function MeasureTable({ product, size, highlightSize = true }: { product: Product; size?: string | null; highlightSize?: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const prefix = product.slot === "bottom" ? "W" : "";
  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-8">
      <div className="hairline-grid grain relative col-span-12 aspect-[5/6] bg-paper-2 md:col-span-5">
        <MeasureDiagram kind={product.kind} active={active} className="absolute inset-[6%] h-[88%] w-[88%]" />
        <span className="label absolute bottom-3 left-3 text-muted">Fig. {product.id}-M / flat, front</span>
      </div>
      <div className="col-span-12 overflow-x-auto md:col-span-7">
        <table className="w-full min-w-[30rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink">
              <th className="label py-2 pr-4 font-normal text-muted">Point / in</th>
              {product.sizes.map((s) => (
                <th
                  key={s}
                  className={`label py-2 text-right font-normal ${highlightSize && s === size ? "text-ink" : "text-muted"}`}
                >
                  {prefix}
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {product.measurementPoints.map((pt, i) => (
              <tr
                key={pt.key}
                onMouseEnter={() => setActive(pt.key)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive((a) => (a === pt.key ? null : pt.key))}
                className={`cursor-default border-b rule transition-colors ${active === pt.key ? "bg-paper-2" : ""}`}
              >
                <td className="py-3 pr-4 text-sm">
                  <span className="mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full border border-accent font-mono text-[0.625rem] text-accent">
                    {pt.key}
                  </span>
                  {pt.label}
                </td>
                {product.sizes.map((s) => (
                  <td
                    key={s}
                    className={`py-3 text-right font-mono text-[0.8125rem] tabular-nums ${
                      highlightSize && s === size ? "text-ink" : "text-muted"
                    }`}
                  >
                    {fmtIn(product.measurements[s][i])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="label mt-4 text-muted">Garment measured flat, in inches. Tolerance ±⅜ in.</p>
      </div>
    </div>
  );
}
