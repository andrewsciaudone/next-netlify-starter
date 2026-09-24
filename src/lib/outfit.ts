import type { Outfit } from "@/components/Figure";
import { getColour, getProduct, TROUSER } from "./data";

/** Build a figure outfit from (form number, colour id) pairs, styled with the trouser. */
export function outfitOf(pieces: [string, string][]): Outfit {
  const o: Outfit = { bottom: TROUSER };
  for (const [id, colourId] of pieces) {
    const p = getProduct(id);
    if (p) o[p.slot] = { kind: p.kind, hex: getColour(p, colourId).hex };
  }
  return o;
}
