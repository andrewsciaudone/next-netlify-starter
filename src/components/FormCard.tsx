import Link from "next/link";
import { fmtPrice, type Product } from "@/lib/data";
import { GarmentSVG } from "./garments";

export function statusText(p: Product) {
  if (p.status === "fully-issued") return `Fully issued — ${p.edition ?? "archive"}`;
  if (p.status === "pre-issue") return `Pre-issue — ${p.dispatch?.replace("Dispatches ", "dispatch ")}`;
  return "Available now";
}

/** Catalogue card. Hover turns the garment to show its back. */
export function FormCard({ p, variant = "shop" }: { p: Product; variant?: "shop" | "archive" }) {
  const c = p.colours[0];
  const archived = p.status === "fully-issued";
  return (
    <Link href={`/uniforms/${p.id}`} className="group block">
      {variant === "archive" && (
        <div className="mb-3 flex items-baseline justify-between border-t border-ink pt-2">
          <span className="label">
            Issue {p.issue} / {p.issueDate}
          </span>
          <span className={`label ${archived ? "text-muted line-through decoration-1" : "text-muted"}`}>
            {archived ? "Fully issued" : p.status === "available" ? "Current" : "Forthcoming"}
          </span>
        </div>
      )}
      <div className={`grain relative aspect-[4/5] overflow-hidden bg-paper-2 transition-colors duration-500 group-hover:bg-paper-3`}>
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 group-hover:opacity-0 ${archived ? "opacity-70 grayscale-[40%]" : ""}`}>
          <GarmentSVG kind={p.kind} hex={c.hex} className="h-[70%] w-auto" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <GarmentSVG kind={p.kind} hex={p.colours[1]?.hex ?? c.hex} view="back" className="h-[70%] w-auto" />
        </div>
        <span className="label absolute left-3 top-3 text-muted">Form No. {p.id}</span>
        {archived && (
          <span className="label absolute right-3 top-3 border border-ink/60 px-1.5 py-0.5 text-ink/80">
            {p.edition}
          </span>
        )}
        <div className="absolute bottom-3 left-3 flex gap-1">
          {p.colours.map((x) => (
            <span key={x.id} className="h-2 w-2 border border-ink/15" style={{ background: x.hex }} title={x.name} />
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-baseline gap-3">
        <span className="font-mono text-2xl tracking-tight md:text-[1.75rem]">{p.id}</span>
        <span className="text-[0.9375rem] leading-tight">{p.name}</span>
        <span className="font-mono text-[0.8125rem] tabular-nums text-muted">{fmtPrice(p.price)}</span>
      </div>
      <p className="label mt-1.5 text-muted">
        {variant === "archive" ? `${p.material.replace(".", "")} / ${p.origin.replace("Made in ", "")}` : statusText(p)}
      </p>
    </Link>
  );
}
