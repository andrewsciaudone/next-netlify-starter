// Garment flats drawn as SVG. Every form is drawn in the same 400 × 480
// space so drawings, plates and the outfit figure can share geometry.

import type { GarmentKind } from "@/lib/data";

export type View = "front" | "back";
export type Mode = "fill" | "line";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function mix(hex: string, target: number, amt: number) {
  const [r, g, b] = hexToRgb(hex).map((c) => Math.round(c + (target - c) * amt));
  return `rgb(${r},${g},${b})`;
}

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export interface Tone {
  fill: string;
  edge: string;
  shade: string;
  rib: string;
  detail: string;
  fold: string;
  line: boolean;
}

export function tone(hex: string, mode: Mode = "fill"): Tone {
  if (mode === "line") {
    return {
      fill: "var(--color-paper)",
      edge: "var(--color-ink)",
      shade: "var(--color-paper-2)",
      rib: "var(--color-paper)",
      detail: "var(--color-ink)",
      fold: "transparent",
      line: true,
    };
  }
  const dark = luminance(hex) < 0.35;
  return {
    fill: hex,
    edge: mix(hex, 0, dark ? 0.35 : 0.28),
    shade: mix(hex, 0, dark ? 0.3 : 0.16),
    rib: mix(hex, dark ? 255 : 0, dark ? 0.05 : 0.04),
    detail: dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.26)",
    fold: dark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.06)",
    line: false,
  };
}

interface PartProps {
  t: Tone;
  view: View;
}

const sw = (t: Tone) => (t.line ? 1.1 : 0.9);

function Stitch({ d, t }: { d: string; t: Tone }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={t.detail}
      strokeWidth={t.line ? 0.8 : 0.9}
      strokeDasharray="3 2.5"
      vectorEffect="non-scaling-stroke"
    />
  );
}

function Seam({ d, t, w }: { d: string; t: Tone; w?: number }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={t.line ? t.edge : t.detail}
      strokeWidth={w ?? (t.line ? 0.9 : 0.9)}
      vectorEffect="non-scaling-stroke"
    />
  );
}

function Fold({ d, t }: { d: string; t: Tone }) {
  if (t.line) return null;
  return <path d={d} fill="none" stroke={t.fold} strokeWidth={6} strokeLinecap="round" />;
}

function Shape({ d, t, fill }: { d: string; t: Tone; fill?: string }) {
  return (
    <path
      d={d}
      fill={fill ?? t.fill}
      stroke={t.edge}
      strokeWidth={sw(t)}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  );
}

/* ------------------------------------------------------------------ TEE */

export const TEE_OUTLINE =
  "M163,56 C180,66 220,66 237,56 L302,76 L358,168 L318,188 L298,146 L301,400 C240,406 160,406 99,400 L102,146 L82,188 L42,168 L98,76 Z";

function Tee({ t, view }: PartProps) {
  return (
    <g>
      <Shape d={TEE_OUTLINE} t={t} />
      <Fold d="M150,250 C158,300 156,350 148,390" t={t} />
      <Fold d="M254,240 C246,290 250,350 258,390" t={t} />
      {view === "front" ? (
        <>
          <Shape d="M163,56 C180,66 220,66 237,56 C230,96 170,96 163,56 Z" t={t} fill={t.shade} />
          <Shape
            d="M163,56 C170,98 230,98 237,56 L229,57 C223,85 177,85 171,57 Z"
            t={t}
            fill={t.rib}
          />
          <Stitch d="M166,60 C173,95 227,95 234,60" t={t} />
        </>
      ) : (
        <>
          <Shape d="M163,56 C180,66 220,66 237,56 L236,62 C220,74 180,74 164,62 Z" t={t} fill={t.rib} />
          <rect x={193} y={70} width={14} height={8} fill={t.line ? "none" : "var(--color-paper)"} stroke={t.edge} strokeWidth={0.6} vectorEffect="non-scaling-stroke" opacity={0.9} />
                  </>
      )}
      <Seam d="M98,76 C108,100 106,126 102,146" t={t} />
      <Seam d="M302,76 C292,100 294,126 298,146" t={t} />
      <Stitch d="M101,391 C160,396 240,396 299,391" t={t} />
      <Stitch d="M46.7,160.3 L86.7,180.3" t={t} />
      <Stitch d="M353.3,160.3 L313.3,180.3" t={t} />
    </g>
  );
}

/* ---------------------------------------------------------------- SWEAT */

export const SWEAT_OUTLINE =
  "M165,54 C182,64 218,64 235,54 L300,72 C330,90 344,140 350,200 L364,392 L366,440 L330,444 L328,396 L306,196 L296,150 L300,396 L302,446 C240,450 160,450 98,446 L100,396 L104,150 L94,196 L72,396 L70,444 L34,440 L36,392 L50,200 C56,140 70,90 100,72 Z";

function Ribs({ x1, x2, y1, y2, t, n }: { x1: number; x2: number; y1: number; y2: number; t: Tone; n: number }) {
  const lines = [];
  for (let i = 1; i < n; i++) {
    const x = x1 + ((x2 - x1) * i) / n;
    lines.push(
      <line key={i} x1={x} x2={x} y1={y1 + 3} y2={y2 - 3} stroke={t.detail} strokeWidth={0.5} opacity={0.6} vectorEffect="non-scaling-stroke" />
    );
  }
  return <g>{lines}</g>;
}

function SweatBody({ t, view, hood }: PartProps & { hood?: boolean }) {
  return (
    <g>
      <Shape d={SWEAT_OUTLINE} t={t} />
      <Fold d="M146,220 C154,290 152,350 146,390" t={t} />
      <Fold d="M256,210 C248,280 252,340 258,390" t={t} />
      <Fold d="M318,240 C326,300 334,350 340,380" t={t} />
      <Fold d="M82,240 C74,300 66,350 60,380" t={t} />
      <Seam d="M100,72 C112,100 108,128 104,150" t={t} />
      <Seam d="M300,72 C288,100 292,128 296,150" t={t} />
      <Seam d="M100,396 C160,400 240,400 300,396" t={t} />
      <Seam d="M36,392 L72,396" t={t} />
      <Seam d="M364,392 L328,396" t={t} />
      <Ribs x1={100} x2={300} y1={397} y2={448} t={t} n={34} />
      <Ribs x1={36} x2={71} y1={393} y2={442} t={t} n={6} />
      <Ribs x1={329} x2={365} y1={393} y2={442} t={t} n={6} />
      {!hood && view === "front" && (
        <>
          <Shape d="M165,54 C182,64 218,64 235,54 C228,86 172,86 165,54 Z" t={t} fill={t.shade} />
          <Shape d="M165,54 C170,94 230,94 235,54 L227,55 C221,80 179,80 173,55 Z" t={t} fill={t.rib} />
          <Seam d="M191,88 L200,106 L209,88" t={t} />
          <Stitch d="M168,58 C174,90 226,90 232,58" t={t} />
        </>
      )}
      {!hood && view === "back" && (
        <Shape d="M165,54 C182,64 218,64 235,54 L234,62 C218,74 182,74 166,62 Z" t={t} fill={t.rib} />
      )}
    </g>
  );
}

function Sweat(p: PartProps) {
  return <SweatBody {...p} />;
}

/* ----------------------------------------------------------------- HOOD */

function Hood({ t, view }: PartProps) {
  return (
    <g>
      {view === "front" ? (
        <>
          <Shape d="M156,66 C138,32 150,6 200,4 C250,6 262,32 244,66 Z" t={t} />
          <SweatBody t={t} view={view} hood />
          <Shape
            d="M160,60 C150,34 168,12 200,10 C232,12 250,34 240,60 C232,90 214,96 200,96 C186,96 168,90 160,60 Z"
            t={t}
          />
          <Shape
            d="M172,62 C166,40 180,22 200,20 C220,22 234,40 228,62 C222,82 210,88 200,88 C190,88 178,82 172,62 Z"
            t={t}
            fill={t.shade}
          />
          <Seam d="M188,90 L186,160" t={t} w={1.4} />
          <Seam d="M212,90 L214,160" t={t} w={1.4} />
          <rect x={183.5} y={158} width={5} height={10} fill={t.line ? "none" : "#8d8b85"} stroke={t.edge} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
          <rect x={211.5} y={158} width={5} height={10} fill={t.line ? "none" : "#8d8b85"} stroke={t.edge} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
          <Seam d="M150,290 L250,290 L276,396 M150,290 L124,396" t={t} />
          <Stitch d="M154,295 L246,295" t={t} />
        </>
      ) : (
        <>
          <SweatBody t={t} view={view} hood />
          <Shape d="M152,74 C132,40 148,2 200,2 C252,2 268,40 248,74 C232,100 168,100 152,74 Z" t={t} />
          <Seam d="M200,4 L200,94" t={t} />
          <Fold d="M170,30 C164,50 166,70 176,86" t={t} />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------ OVERSHIRT */

export const OVERSHIRT_OUTLINE =
  "M168,50 C184,58 216,58 232,50 L304,70 C334,88 348,140 354,200 L366,430 L332,436 L308,196 L298,156 L302,462 L98,462 L102,156 L92,196 L68,436 L34,430 L46,200 C52,140 66,88 96,70 Z";

function Overshirt({ t, view, open }: PartProps & { open?: boolean }) {
  const clip = open ? "url(#os-open)" : undefined;
  return (
    <g>
      {open && (
        <defs>
          <clipPath id="os-open">
            <path d="M0,0 H400 V480 H0 Z M176,100 L224,100 L230,480 L170,480 Z" clipRule="evenodd" />
          </clipPath>
        </defs>
      )}
      <g clipPath={clip}>
        <Shape d={OVERSHIRT_OUTLINE} t={t} />
        <Fold d="M150,260 C156,330 154,400 150,452" t={t} />
        <Fold d="M252,250 C246,330 248,400 252,452" t={t} />
        <Seam d="M96,70 C110,100 108,130 102,156" t={t} />
        <Seam d="M304,70 C290,100 292,130 298,156" t={t} />
        <Seam d="M36,404 L70,410" t={t} />
        <Seam d="M364,404 L330,410" t={t} />
        <Stitch d="M100,452 L300,452" t={t} />
        {view === "front" ? (
          <>
            {!open && (
              <>
                <Seam d="M200,94 L200,462" t={t} />
                <Stitch d="M191,100 L191,462 M209,100 L209,462" t={t} />
                {[132, 192, 252, 312, 372, 432].map((y) => (
                  <circle key={y} cx={200} cy={y} r={3.6} fill={t.line ? "none" : t.shade} stroke={t.edge} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
                ))}
              </>
            )}
            {[
              [120, 180],
              [220, 280],
            ].map(([a, b]) => (
              <g key={a}>
                <Shape d={`M${a + 4},176 L${b - 4},176 L${b - 4},240 L${a + 4},240 Z`} t={t} />
                <Shape d={`M${a},166 L${b},166 L${b},190 L${a},190 Z`} t={t} />
                <Stitch d={`M${a + 3},186 L${b - 3},186`} t={t} />
                <circle cx={(a + b) / 2} cy={183} r={3} fill={t.line ? "none" : t.shade} stroke={t.edge} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            <Shape d="M168,48 C184,58 216,58 232,48 C226,62 210,70 200,70 C190,70 174,62 168,48 Z" t={t} fill={t.shade} />
            <Shape d="M168,48 C158,62 162,92 174,114 L200,96 L200,70 C186,68 174,60 168,48 Z" t={t} />
            <Shape d="M232,48 C242,62 238,92 226,114 L200,96 L200,70 C214,68 226,60 232,48 Z" t={t} />
          </>
        ) : (
          <>
            <Seam d="M100,124 C160,130 240,130 300,124" t={t} />
            <Shape d="M168,48 C184,58 216,58 232,48 L236,68 C214,76 186,76 164,68 Z" t={t} />
            <Seam d="M200,130 L200,168" t={t} />
          </>
        )}
      </g>
      {open && (
        <>
          <Seam d="M176,100 L170,462" t={t} />
          <Seam d="M224,100 L230,462" t={t} />
        </>
      )}
    </g>
  );
}

/* -------------------------------------------------------------- TROUSER */

export const TROUSER_OUTLINE =
  "M134,16 L266,16 L270,44 C286,120 290,200 286,260 L274,470 L212,470 L203,196 Q200,190 197,196 L188,470 L126,470 L114,260 C110,200 114,120 130,44 Z";

function Trouser({ t, view }: PartProps) {
  return (
    <g>
      <Shape d={TROUSER_OUTLINE} t={t} />
      <Fold d="M150,330 C154,380 152,420 146,462" t={t} />
      <Fold d="M252,330 C248,380 250,420 256,462" t={t} />
      <Seam d="M131,42 L269,42" t={t} />
      {[150, 186, 214, 250].map((x) => (
        <rect key={x} x={x - 3} y={16} width={6} height={30} fill="none" stroke={t.line ? t.edge : t.detail} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
      ))}
      {view === "front" ? (
        <>
          <Stitch d="M206,44 L206,146 Q206,160 198,166" t={t} />
          <Seam d="M172,44 L174,96" t={t} />
          <Seam d="M228,44 L226,96" t={t} />
          <Seam d="M134,48 L152,114" t={t} />
          <Seam d="M266,48 L248,114" t={t} />
          <Seam d="M163,96 L157,470" t={t} w={0.6} />
          <Seam d="M237,96 L243,470" t={t} w={0.6} />
          <rect x={120} y={22} width={10} height={14} fill="none" stroke={t.line ? t.edge : t.detail} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
          <rect x={270} y={22} width={10} height={14} fill="none" stroke={t.line ? t.edge : t.detail} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
        </>
      ) : (
        <>
          <Seam d="M200,16 L200,190" t={t} />
          <Seam d="M146,96 L184,96 M146,100 L184,100" t={t} />
          <Seam d="M216,96 L254,96 M216,100 L254,100" t={t} />
          <Seam d="M178,44 L180,90 M222,44 L220,90" t={t} />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------ PUBLIC API */

export function GarmentShape({
  kind,
  hex,
  view = "front",
  mode = "fill",
  open,
}: {
  kind: GarmentKind;
  hex: string;
  view?: View;
  mode?: Mode;
  open?: boolean;
}) {
  const t = tone(hex, mode);
  switch (kind) {
    case "tee":
      return <Tee t={t} view={view} />;
    case "sweat":
      return <Sweat t={t} view={view} />;
    case "hood":
      return <Hood t={t} view={view} />;
    case "overshirt":
      return <Overshirt t={t} view={view} open={open} />;
    case "trouser":
      return <Trouser t={t} view={view} />;
  }
}

export function GarmentSVG({
  kind,
  hex,
  view = "front",
  mode = "fill",
  className,
  title,
  viewBox = "0 0 400 480",
}: {
  kind: GarmentKind;
  hex: string;
  view?: View;
  mode?: Mode;
  className?: string;
  title?: string;
  viewBox?: string;
}) {
  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={title ?? `${kind} ${view}`}>
      <GarmentShape kind={kind} hex={hex} view={view} mode={mode} />
    </svg>
  );
}

/* ---------------------------------------------------- DIMENSION DIAGRAM */

type Pt = [number, number];
const DIMS: Record<GarmentKind, { k: string; a: Pt; b: Pt; off: number }[]> = {
  tee: [
    { k: "A", a: [102, 150], b: [298, 150], off: 0 },
    { k: "B", a: [163, 56], b: [163, 403], off: -150 },
    { k: "C", a: [98, 76], b: [302, 76], off: -44 },
    { k: "D", a: [302, 76], b: [358, 168], off: 26 },
    { k: "E", a: [358, 168], b: [318, 188], off: 20 },
  ],
  sweat: [
    { k: "A", a: [104, 160], b: [296, 160], off: 0 },
    { k: "B", a: [165, 54], b: [165, 448], off: -150 },
    { k: "C", a: [100, 72], b: [300, 72], off: -44 },
    { k: "D", a: [300, 72], b: [366, 440], off: 20 },
    { k: "E", a: [100, 446], b: [300, 446], off: 22 },
  ],
  hood: [
    { k: "A", a: [104, 160], b: [296, 160], off: 0 },
    { k: "B", a: [165, 54], b: [165, 448], off: -150 },
    { k: "C", a: [100, 72], b: [300, 72], off: -44 },
    { k: "D", a: [300, 72], b: [366, 440], off: 20 },
    { k: "E", a: [244, 4], b: [244, 66], off: 70 },
  ],
  overshirt: [
    { k: "A", a: [102, 160], b: [298, 160], off: 0 },
    { k: "B", a: [168, 50], b: [168, 462], off: -150 },
    { k: "C", a: [96, 70], b: [304, 70], off: -44 },
    { k: "D", a: [304, 70], b: [366, 430], off: 20 },
    { k: "E", a: [332, 436], b: [366, 430], off: 16 },
  ],
  trouser: [
    { k: "A", a: [134, 16], b: [266, 16], off: -10 },
    { k: "B", a: [200, 16], b: [200, 194], off: 110 },
    { k: "C", a: [113, 220], b: [199, 220], off: 0 },
    { k: "D", a: [198, 196], b: [188, 470], off: 60 },
    { k: "E", a: [126, 470], b: [188, 470], off: 12 },
  ],
};

function Dim({ a, b, off, k }: { a: Pt; b: Pt; off: number; k: string }) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const A: Pt = [a[0] + nx * off, a[1] + ny * off];
  const B: Pt = [b[0] + nx * off, b[1] + ny * off];
  const m: Pt = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const ux = dx / len;
  const uy = dy / len;
  const arrow = (p: Pt, s: number) =>
    `M${p[0] + ux * 7 * s + nx * 3},${p[1] + uy * 7 * s + ny * 3} L${p[0]},${p[1]} L${p[0] + ux * 7 * s - nx * 3},${p[1] + uy * 7 * s - ny * 3}`;
  return (
    <g className="text-accent" stroke="currentColor" fill="none">
      {off !== 0 && (
        <>
          <line x1={a[0]} y1={a[1]} x2={A[0] + nx * 4 * Math.sign(off)} y2={A[1] + ny * 4 * Math.sign(off)} strokeWidth={0.5} strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
          <line x1={b[0]} y1={b[1]} x2={B[0] + nx * 4 * Math.sign(off)} y2={B[1] + ny * 4 * Math.sign(off)} strokeWidth={0.5} strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        </>
      )}
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
      <path d={arrow(A, 1)} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
      <path d={arrow(B, -1)} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
      <circle cx={m[0]} cy={m[1]} r={9} fill="var(--color-paper)" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
      <text x={m[0]} y={m[1] + 3.4} textAnchor="middle" fontSize={10} fill="currentColor" stroke="none" fontFamily="var(--font-mono)">
        {k}
      </text>
    </g>
  );
}

export function MeasureDiagram({ kind, active, className }: { kind: GarmentKind; active?: string | null; className?: string }) {
  return (
    <svg viewBox="-20 -30 440 530" className={className} role="img" aria-label="Measurement diagram">
      <GarmentShape kind={kind} hex="#000000" mode="line" />
      {DIMS[kind].map((d) => (
        <g key={d.k} style={{ opacity: active && active !== d.k ? 0.18 : 1, transition: "opacity 300ms" }}>
          <Dim {...d} />
        </g>
      ))}
    </svg>
  );
}
