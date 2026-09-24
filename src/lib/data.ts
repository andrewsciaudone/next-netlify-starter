// Local mock catalogue for the Finest Uniform prototype.

export type Slot = "base" | "mid" | "outer" | "bottom";
export type GarmentKind = "tee" | "sweat" | "hood" | "overshirt" | "trouser";
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
  measurements: Record<string, number[]>; // size -> cm values by point
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
      "1×1 rib collar, 2.2 cm",
      "Reinforced shoulder, taped",
      "Twin-needle hems",
      "Garment washed",
    ],
    origin: "Made in Portugal",
    mill: "Knitted in Barcelos, cut and sewn in Guimarães",
    care: [
      "Wash cold, 30°C, inside out",
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
      XS: [52, 66, 45, 21, 17.5],
      S: [54, 67.5, 47, 21.5, 18],
      M: [56, 69, 49, 22, 18.5],
      L: [58.5, 70.5, 51, 22.5, 19],
      XL: [61, 72, 53, 23, 19.5],
      XXL: [63.5, 73.5, 55, 23.5, 20],
    },
    model: "Model is 186 cm / 78 kg. Chest 97 cm. Wears M.",
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
      "8 cm rib hem and cuff",
      "Garment washed",
    ],
    origin: "Made in Portugal",
    mill: "Loopback knitted in Barcelos",
    care: [
      "Wash cold, 30°C, inside out",
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
      XS: [54, 64, 44, 61, 44],
      S: [56, 65.5, 46, 62, 46],
      M: [58, 67, 48, 63, 48],
      L: [60.5, 68.5, 50, 64, 50.5],
      XL: [63, 70, 52, 65, 53],
      XXL: [65.5, 71.5, 54, 66, 55.5],
    },
    model: "Model is 186 cm / 78 kg. Wears M.",
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
    origin: "Made in Portugal",
    mill: "Loopback knitted in Barcelos",
    care: [
      "Wash cold, 30°C, inside out",
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
      XS: [55, 65, 45, 61, 34],
      S: [57, 66.5, 47, 62, 34.5],
      M: [59, 68, 49, 63, 35],
      L: [61.5, 69.5, 51, 64, 35.5],
      XL: [64, 71, 53, 65, 36],
      XXL: [66.5, 72.5, 55, 66, 36.5],
    },
    model: "Model is 186 cm / 78 kg. Wears M.",
    fitNote: "Same block as 002, with 1 cm added to the chest for ease over layers.",
    label: ["FINEST UNIFORM", "FORM NO. 003", "LOOPBACK COTTON", "STANDARD ISSUE"],
    compatible: ["001"],
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
