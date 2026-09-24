import type { Outfit } from "@/components/Figure";
import { getColour, getProduct } from "./data";

/** Build a figure outfit from (form number, colour id) pairs. */
export function outfitOf(pieces: [string, string][], fillBottom = true): Outfit {
  const o: Outfit = {};
  for (const [id, colourId] of pieces) {
    const p = getProduct(id);
    if (!p) continue;
    o[p.slot] = { kind: p.kind, hex: getColour(p, colourId).hex };
  }
  if (fillBottom && !o.bottom) {
    const t = getProduct("004")!;
    o.bottom = { kind: t.kind, hex: t.colours[0].hex };
  }
  return o;
}
