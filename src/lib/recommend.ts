import { getProduct, PRODUCTS } from "./data";
import type { Consultation } from "./store";

export interface Recommendation {
  items: { productId: string; colour: string; size: string; note: string }[];
  reasons: { k: string; v: string }[];
  sizeNote: string;
}

const COLOUR_ID: Record<string, string> = {
  Black: "black",
  Navy: "navy",
  Grey: "grey",
  Cream: "cream",
  White: "white",
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function recommend(c: Consultation): Recommendation {
  const tee = PRODUCTS[0];
  const prefs = c.colours.map((x) => COLOUR_ID[x]).filter(Boolean);
  const palette = prefs.length ? prefs : ["navy", "cream", "grey"];

  const teeCount = c.frequency === "1–2 days" ? 1 : c.frequency === "5+ days" ? 3 : 2;

  // Size: compact fits take one down, because 001's chest is deliberately generous.
  const i = SIZES.indexOf(c.size);
  let teeSize = c.size;
  let sizeNote = `Your usual ${c.size} gives the intended fit: easy through the chest, finishing at the belt.`;
  if (c.fit === "Compact" && i > 0) {
    teeSize = SIZES[i - 1];
    sizeNote = `We have taken 001 down to ${teeSize}. Its chest is cut generously; one size down gives the closer line you prefer without shortening the sleeve too far.`;
  }
  const h = parseInt(c.height, 10);
  if (c.length === "Long" && h >= 188 && i < SIZES.length - 1 && c.fit !== "Compact") {
    teeSize = SIZES[i + 1];
    sizeNote = `At ${h} cm with a preference for length, we have taken 001 up to ${teeSize}. It is a short body by design; the extra 1.5 cm matters.`;
  }

  const items: Recommendation["items"] = [];
  for (let n = 0; n < teeCount; n++) {
    const col = palette[n % palette.length];
    items.push({
      productId: "001",
      colour: tee.colours.some((x) => x.id === col) ? col : "navy",
      size: teeSize,
      note: n === 0 ? "Your first-reach jersey" : n === 1 ? "The alternate" : "The third day",
    });
  }

  const layered = c.wear === "Layered" || c.wear === "Both";
  if (layered) {
    const mid = prefs.includes("grey")
      ? "grey"
      : prefs.includes("navy")
        ? "navy"
        : prefs.includes("black")
          ? "black"
          : "oatmeal";
    items.push({ productId: "002", colour: mid, size: c.size, note: "Worn over 001, or alone" });
  }
  if (c.wear === "Layered" && c.frequency === "5+ days") {
    items.push({ productId: "003", colour: "charcoal", size: c.size, note: "For weekends and travel" });
  }

  const colourNames = items
    .filter((x) => x.productId === "001")
    .map((x) => getProduct("001")!.colours.find((y) => y.id === x.colour)!.name);

  const reasons: Recommendation["reasons"] = [
    {
      k: "Quantity",
      v:
        teeCount === 1
          ? "You wear T-shirts one or two days a week. One 001 is enough; it will not be worn out before it is worn in."
          : `At ${c.frequency.replace(" days", "")} days a week, ${teeCount} pieces of 001 let each one rest between wears — which is how they last.`,
    },
    {
      k: "Colour",
      v: prefs.length
        ? `${[...new Set(colourNames)].join(" and ")}, in the order you gave them. Each works with every other form in the system.`
        : "You left colour to us: Navy, Cream and Grey — the three that never argue with each other.",
    },
    {
      k: "Layer",
      v: layered
        ? `You wear T-shirts ${c.wear === "Both" ? "both alone and layered" : "mostly layered"}, so we have added 002. Its body is cut to sit over 001 without pulling at the hem.`
        : "You wear them on their own, so we have not added a mid layer. 001's weight is chosen for exactly that.",
    },
    {
      k: "Fit",
      v: `${c.fit} fit, ${c.length.toLowerCase()} length. ${
        c.length === "Long"
          ? "001 is short by design — it finishes at the belt. If that is a step too far, 002 and 003 are cut longer."
          : c.length === "Short"
            ? "001 was drawn for you: it finishes at the belt, no longer."
            : "001 finishes at the belt; worn untucked it reads as standard length."
      }`,
    },
  ];

  return { items, reasons, sizeNote };
}
