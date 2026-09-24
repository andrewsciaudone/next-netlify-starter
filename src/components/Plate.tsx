import type { ReactNode } from "react";
import { luminance } from "./garments";

const BACKGROUNDS = {
  paper: "bg-paper-2 text-ink",
  stone: "bg-paper-3 text-ink",
  warm: "bg-[#d8d1c3] text-ink",
  charcoal: "bg-[#2e2e2c] text-paper",
  navy: "bg-[#20283a] text-paper",
  grey: "bg-[#bdbab2] text-ink",
} as const;

export type PlateTone = keyof typeof BACKGROUNDS;

/**
 * An image plate. Stands in for campaign photography with a drawn subject,
 * paper grain and catalogue annotations in the corners.
 */
export function Plate({
  children,
  tone = "paper",
  ratio = "aspect-[4/5]",
  no,
  caption,
  meta,
  className = "",
  inner = "",
}: {
  children?: ReactNode;
  tone?: PlateTone;
  ratio?: string;
  no?: string;
  caption?: ReactNode;
  meta?: ReactNode;
  className?: string;
  inner?: string;
}) {
  return (
    <figure className={`grain relative overflow-hidden ${BACKGROUNDS[tone]} ${ratio} ${className}`}>
      <div className={`absolute inset-0 flex items-center justify-center ${inner}`}>{children}</div>
      {no && <span className="label absolute left-3 top-3 opacity-60 md:left-4 md:top-4">{no}</span>}
      {(caption || meta) && (
        <figcaption className="label absolute inset-x-3 bottom-3 flex items-end justify-between gap-4 opacity-70 md:inset-x-4 md:bottom-4">
          <span>{caption}</span>
          <span className="hidden shrink-0 text-right sm:inline">{meta}</span>
        </figcaption>
      )}
    </figure>
  );
}

/** Knit texture at macro scale: the "fabric close-up" plate. */
export function Fabric({ hex, id, className = "", scale = 1 }: { hex: string; id: string; className?: string; scale?: number }) {
  const dark = luminance(hex) < 0.35;
  const hi = dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.35)";
  const lo = dark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.12)";
  const w = 14 * scale;
  const h = 18 * scale;
  return (
    <svg className={className} preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 400" aria-hidden>
      <defs>
        <pattern id={`knit-${id}`} width={w} height={h} patternUnits="userSpaceOnUse">
          <rect width={w} height={h} fill={hex} />
          <path d={`M${w * 0.06},0 Q${w * 0.2},${h * 0.55} ${w / 2},${h} M${w * 0.94},0 Q${w * 0.8},${h * 0.55} ${w / 2},${h}`} stroke={lo} strokeWidth={2.2 * scale} fill="none" />
          <path d={`M${w * 0.14},${h * 0.05} Q${w * 0.26},${h * 0.5} ${w * 0.47},${h * 0.9} M${w * 0.86},${h * 0.05} Q${w * 0.74},${h * 0.5} ${w * 0.53},${h * 0.9}`} stroke={hi} strokeWidth={1.4 * scale} fill="none" />
        </pattern>
        <radialGradient id={`light-${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fff" stopOpacity={dark ? 0.08 : 0.18} />
          <stop offset="100%" stopColor="#000" stopOpacity={dark ? 0.3 : 0.12} />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#knit-${id})`} />
      <rect width="400" height="400" fill={`url(#light-${id})`} />
    </svg>
  );
}

/** Woven neck label. */
export function WovenLabel({ lines, className = "" }: { lines: string[]; className?: string }) {
  return (
    <div
      className={`relative inline-flex shrink-0 flex-col items-center gap-[3px] whitespace-nowrap border border-ink/70 bg-paper px-5 py-3 text-center font-mono text-[0.625rem] leading-none tracking-[0.18em] text-ink shadow-[0_1px_0_rgba(0,0,0,0.08)] ${className}`}
    >
      <span className="absolute inset-x-0 top-0 h-[3px] border-b border-dashed border-ink/30" />
      {lines.map((l, i) => (
        <span key={l} className={i === 0 ? "mb-1 font-medium tracking-[0.28em]" : "opacity-80"}>
          {l}
        </span>
      ))}
      <span className="absolute inset-x-0 bottom-0 h-[3px] border-t border-dashed border-ink/30" />
    </div>
  );
}

/** Deterministic matrix code for a garment number (decorative, not a real QR). */
export function MatrixCode({ value, size = 21, className = "" }: { value: string; size?: number; className?: string }) {
  let seed = 0;
  for (const ch of value) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) % 1000) / 1000;
  };
  const cells: ReactNode[] = [];
  const finder = (x: number, y: number) =>
    x >= 0 && y >= 0 && ((x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (finder(x, y)) continue;
      if (x === 7 || y === 7 || x === size - 8 || y === size - 8) {
        if ((x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9)) continue;
      }
      if (rand() > 0.52) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  }
  const F = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width={7} height={7} />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="var(--color-paper)" />
      <rect x={x + 2} y={y + 2} width={3} height={3} />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} className={className} shapeRendering="crispEdges" aria-label={`Garment tag ${value}`}>
      <rect x={-1} y={-1} width={size + 2} height={size + 2} fill="var(--color-paper)" />
      <g fill="currentColor">
        {cells}
        <F x={0} y={0} />
        <F x={size - 7} y={0} />
        <F x={0} y={size - 7} />
      </g>
    </svg>
  );
}
