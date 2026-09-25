// Local mock catalogue for the Finest Uniform prototype.

export type Slot = "base" | "mid" | "outer" | "bottom";
export type GarmentKind = "tee" | "polo" | "sweat" | "hood" | "overshirt" | "trouser";
export type Status = "available" | "pre-issue" | "fully-issued";

export interface Colour {
  id: string;
  name: string;
  code: string;
  hex: string;
  soldOut?: boolean;
}

export interface Product {
  id: string; // form number, e.g. "001"
  name: string;
  kind: GarmentKind;
  slot: Slot;
  price: number;
  issue: string; // "01"
  issueDate: string; // "09.26"
  issueMonth: string; // "September 2026"
  status: Status;
  dispatch?: string;
  statement: string;
  purpose: string;
  form: string;
  material: string;
  weight: string;
  fibre: string;
  construction: string[];
  origin: string;
  mill: string;
  care: string[];
  colours: Colour[];
  sizes: string[];
  measurementPoints: { key: string; label: string }[];
  measurements: Record<string, number[]>; // size -> inches by point, garment measured flat
  model: string;
  fitNote: string;
  label: string[];
  compatible: string[];
  edition?: string;
}

export const COLOURS = {
  black: { id: "black", name: "Black", code: "BLK-01", hex: "#1f1f1d" },
  navy: { id: "navy", name: "Navy", code: "NVY-02", hex: "#252c3b" },
  grey: { id: "grey", name: "Heather Grey", code: "HGR-03", hex: "#a6a49e" },
  cream: { id: "cream", name: "Cream", code: "CRM-04", hex: "#e6dfcf" },
  white: { id: "white", name: "White", code: "WHT-05", hex: "#f2f0ea" },
  charcoal: { id: "charcoal", name: "Charcoal", code: "CHR-06", hex: "#434446" },
  oatmeal: { id: "oatmeal", name: "Oatmeal", code: "OAT-07", hex: "#d3c9b5" },
  stone: { id: "stone", name: "Stone", code: "STN-08", hex: "#b7ae9a" },
  olive: { id: "olive", name: "Field Olive", code: "FOL-09", hex: "#56574a" },
  undyed: { id: "undyed", name: "Undyed", code: "UND-00", hex: "#e3dccb" },
} satisfies Record<string, Colour>;

const TOP_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const WAIST_SIZES = ["28", "30", "32", "34", "36", "38"];

export const PRODUCTS: Product[] = [
  {
    id: "001",
    name: "Short-Sleeve Jersey",
    kind: "tee",
    slot: "base",
    price: 88,
    issue: "01",
    issueDate: "09.26",
    issueMonth: "September 2026",
    status: "available",
    statement:
      "The T-shirt we think a man should be able to wear three days a week.",
    purpose: "Daily base layer.",
    form: "Shortened body / relaxed chest / structured sleeve.",
    material: "280gsm cotton jersey.",
    weight: "280 gsm",
    fibre: "100% long-staple cotton",
    construction: [
      "1×1 rib collar, ⅞ in",
      "Reinforced shoulder, taped",
      "Twin-needle hems",
      "Garment washed",
    ],
    origin: "Made in the USA",
    mill: "Knitted in North Carolina, cut and sewn in Los Angeles",
    care: [
      "Machine wash cold, inside out",
      "Dry flat or line dry",
      "Do not tumble dry",
      "Iron on reverse, low heat",
    ],
    colours: [
      COLOURS.black,
      COLOURS.navy,
      COLOURS.grey,
      COLOURS.cream,
      COLOURS.white,
    ],
    sizes: TOP_SIZES,
    measurementPoints: [
      { key: "A", label: "Chest, ½" },
      { key: "B", label: "Body length, HPS" },
      { key: "C", label: "Shoulder" },
      { key: "D", label: "Sleeve length" },
      { key: "E", label: "Sleeve opening" },
    ],
    measurements: {
      XS: [20, 26, 17.5, 8, 6.75],
      S: [21, 26.5, 18.25, 8.25, 7],
      M: [22, 27, 19, 8.5, 7.25],
      L: [23, 27.5, 19.75, 8.75, 7.5],
      XL: [24, 28, 20.5, 9, 7.75],
      XXL: [25, 28.5, 21.25, 9.25, 8],
    },
    model: "Model is 6′1″ / 172 lb. Chest 38 in. Wears M.",
    fitNote:
      "Cut to finish at the belt line. Take your usual size for the intended fit; one size down for a closer chest.",
    label: ["FINEST UNIFORM", "FORM NO. 001", "COTTON JERSEY", "STANDARD ISSUE"],
    compatible: ["002", "003"],
  },
  {
    id: "002",
    name: "Crewneck Sweatshirt",
    kind: "sweat",
    slot: "mid",
    price: 168,
    issue: "02",
    issueDate: "11.26",
    issueMonth: "November 2026",
    status: "pre-issue",
    dispatch: "Dispatches 11.26",
    statement: "A sweatshirt cut with the discipline of a knitted jacket.",
    purpose: "Mid layer. Worn over 001 or alone.",
    form: "Boxed body / set-in sleeve / deep rib hem.",
    material: "460gsm loopback cotton.",
    weight: "460 gsm",
    fibre: "100% organic cotton, loopback",
    construction: [
      "Front V-insert, coverstitched",
      "Set-in sleeve, flat-locked",
      "3 in rib hem and cuff",
      "Garment washed",
    ],
    origin: "Made in the USA",
    mill: "Loopback knitted in North Carolina, sewn in Los Angeles",
    care: [
      "Machine wash cold, inside out",
      "Reshape and dry flat",
      "Do not tumble dry",
    ],
    colours: [COLOURS.grey, COLOURS.navy, COLOURS.black, COLOURS.oatmeal],
    sizes: TOP_SIZES,
    measurementPoints: [
      { key: "A", label: "Chest, ½" },
      { key: "B", label: "Body length, HPS" },
      { key: "C", label: "Shoulder" },
      { key: "D", label: "Sleeve length" },
      { key: "E", label: "Hem, relaxed" },
    ],
    measurements: {
      XS: [21, 25, 17.25, 24, 17.5],
      S: [22, 25.5, 18, 24.5, 18.5],
      M: [23, 26, 18.75, 25, 19.5],
      L: [24, 26.5, 19.5, 25.5, 20.5],
      XL: [25, 27, 20.25, 26, 21.5],
      XXL: [26, 27.5, 21, 26.5, 22.5],
    },
    model: "Model is 6′1″ / 172 lb. Wears M.",
    fitNote: "Cut to sit over 001 without pulling. Take your usual size.",
    label: ["FINEST UNIFORM", "FORM NO. 002", "LOOPBACK COTTON", "STANDARD ISSUE"],
    compatible: ["001"],
  },
  {
    id: "003",
    name: "Hooded Sweatshirt",
    kind: "hood",
    slot: "mid",
    price: 198,
    issue: "03",
    issueDate: "01.27",
    issueMonth: "January 2027",
    status: "pre-issue",
    dispatch: "Dispatches 01.27",
    statement: "A hood with a structured crown. It stands, it does not slump.",
    purpose: "Mid layer for weekends and travel.",
    form: "Boxed body / three-panel hood / bound pocket.",
    material: "460gsm loopback cotton.",
    weight: "460 gsm",
    fibre: "100% organic cotton, loopback",
    construction: [
      "Three-panel hood, double-layered",
      "Flat cotton drawcord, metal tipped",
      "Bound kangaroo pocket",
      "Garment washed",
    ],
    origin: "Made in the USA",
    mill: "Loopback knitted in North Carolina, sewn in Los Angeles",
    care: [
      "Machine wash cold, inside out",
      "Reshape and dry flat",
      "Do not tumble dry",
    ],
    colours: [COLOURS.charcoal, COLOURS.navy, COLOURS.grey],
    sizes: TOP_SIZES,
    measurementPoints: [
      { key: "A", label: "Chest, ½" },
      { key: "B", label: "Body length, HPS" },
      { key: "C", label: "Shoulder" },
      { key: "D", label: "Sleeve length" },
      { key: "E", label: "Hood height" },
    ],
    measurements: {
      XS: [21.5, 25.5, 17.25, 24, 13.25],
      S: [22.5, 26, 18, 24.5, 13.5],
      M: [23.5, 26.5, 18.75, 25, 13.75],
      L: [24.5, 27, 19.5, 25.5, 14],
      XL: [25.5, 27.5, 20.25, 26, 14.25],
      XXL: [26.5, 28, 21, 26.5, 14.5],
    },
    model: "Model is 6′1″ / 172 lb. Wears M.",
    fitNote: "Same block as 002, with ½ in added to the chest for ease over layers.",
    label: ["FINEST UNIFORM", "FORM NO. 003", "LOOPBACK COTTON", "STANDARD ISSUE"],
    compatible: ["001"],
  },
  {
    id: "004",
    name: "Jersey Polo",
    kind: "polo",
    slot: "base",
    price: 118,
    issue: "01",
    issueDate: "09.26",
    issueMonth: "September 2026",
    status: "available",
    statement: "The same jersey as 001, given a collar for the days that ask for one.",
    purpose: "Daily base layer, dressed up.",
    form: "Shortened body / relaxed chest / self-fabric collar.",
    material: "280gsm cotton jersey.",
    weight: "280 gsm",
    fibre: "100% long-staple cotton",
    construction: [
      "Self-fabric collar, interlined",
      "Three-button placket, corozo buttons",
      "Rib sleeve bands",
      "Garment washed",
    ],
    origin: "Made in the USA",
    mill: "Knitted in North Carolina, cut and sewn in Los Angeles",
    care: [
      "Machine wash cold, inside out",
      "Dry flat or line dry",
      "Do not tumble dry",
      "Iron collar on reverse, low heat",
    ],
    colours: [COLOURS.navy, COLOURS.white, COLOURS.black, COLOURS.grey, COLOURS.cream],
    sizes: TOP_SIZES,
    measurementPoints: [
      { key: "A", label: "Chest, ½" },
      { key: "B", label: "Body length, HPS" },
      { key: "C", label: "Shoulder" },
      { key: "D", label: "Sleeve length" },
      { key: "E", label: "Sleeve opening" },
    ],
    measurements: {
      XS: [20, 26.5, 17.5, 8, 6.75],
      S: [21, 27, 18.25, 8.25, 7],
      M: [22, 27.5, 19, 8.5, 7.25],
      L: [23, 28, 19.75, 8.75, 7.5],
      XL: [24, 28.5, 20.5, 9, 7.75],
      XXL: [25, 29, 21.25, 9.25, 8],
    },
    model: "Model is 6′1″ / 172 lb. Chest 38 in. Wears M.",
    fitNote: "Cut on the 001 block, ½ in longer. Take your 001 size.",
    label: ["FINEST UNIFORM", "FORM NO. 004", "JERSEY POLO", "STANDARD ISSUE"],
    compatible: ["002", "003"],
  },
];


export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getColour(product: Product, colourId: string): Colour {
  return product.colours.find((c) => c.id === colourId) ?? product.colours[0];
}

/** Tailored trouser used for styling in figures. Not sold in this prototype. */
export const TROUSER = { kind: "trouser" as GarmentKind, hex: COLOURS.charcoal.hex };

export const FOUNDATIONS = PRODUCTS.map((p) => p.id);

// ---------------------------------------------------------------------------
// Customer record (mock, merged with local state at runtime)

export interface IssuedGarment {
  garmentNo: string;
  productId: string;
  colour: string;
  size: string;
  issuedAt: string; // ISO date
  orderNo: string;
  wears?: number;
}

export interface Profile {
  name: string;
  recordNo: string;
  fit: string;
  length: string;
  wear: string;
  colours: string[];
  frequency: string;
  collar: string;
  size: string;
  height?: string;
  weight?: string;
  since: string;
}

export const DEFAULT_PROFILE: Profile = {
  name: "Andrew",
  recordNo: "00284",
  fit: "Relaxed",
  length: "Short",
  wear: "Both",
  colours: ["Navy", "Grey", "Cream"],
  frequency: "3–4 days",
  collar: "Crew",
  size: "M",
  since: "2026-09-08",
};

export const DEFAULT_ISSUED: IssuedGarment[] = [
  {
    garmentNo: "001-26-00482",
    productId: "001",
    colour: "navy",
    size: "M",
    issuedAt: "2026-09-08",
    orderNo: "IS-26-0117",
    wears: 14,
  },
  {
    garmentNo: "001-26-00513",
    productId: "001",
    colour: "cream",
    size: "M",
    issuedAt: "2026-09-08",
    orderNo: "IS-26-0117",
    wears: 9,
  },
];

/** Inches to the nearest quarter, written the way a US spec sheet writes it: 22¼. */
export function fmtIn(inches: number) {
  const q = Math.round(inches * 4) / 4;
  const whole = Math.floor(q);
  const frac = ["", "¼", "½", "¾"][Math.round((q - whole) * 4)];
  return `${whole}${frac}`;
}

/** Height in inches → 6′1″. */
export function fmtHeight(inches: number | string) {
  const n = typeof inches === "string" ? parseInt(inches, 10) : inches;
  if (!n) return "";
  return `${Math.floor(n / 12)}′${n % 12}″`;
}

export const fmtPrice = (n: number) =>
  "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function fmtDate(iso: string, style: "short" | "long" = "short") {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (style === "short") {
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getFullYear()
    ).slice(2)}`;
  }
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function fmtDay(iso: string) {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  return `${String(d.getDate()).padStart(2, "0")}.${String(
    d.getMonth() + 1
  ).padStart(2, "0")}.${String(d.getFullYear()).slice(2)}`;
}
