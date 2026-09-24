// An outfit, drawn on a light croquis — the way a pattern room would draw a
// uniform, rather than a photograph.

import type { GarmentKind } from "@/lib/data";
import { GarmentShape, TROUSER_OUTLINE } from "./garments";

export interface Layer {
  kind: GarmentKind;
  hex: string;
}

export interface Outfit {
  base?: Layer | null;
  mid?: Layer | null;
  outer?: Layer | null;
  bottom?: Layer | null;
}

const TOP = "translate(20,70) scale(0.9)";
const BOTTOM = "translate(-24,412) scale(1.12)";

export function Figure({
  outfit,
  className,
  croquis = true,
  animate = true,
}: {
  outfit: Outfit;
  className?: string;
  croquis?: boolean;
  animate?: boolean;
}) {
  const { base, mid, outer, bottom } = outfit;
  const barearms = !mid && !outer;
  const fade = animate ? "fade-layer" : undefined;
  return (
    <svg viewBox="0 0 400 980" className={className} role="img" aria-label="Outfit figure">
      <defs>
        <clipPath id="fig-body">
          <rect x={100} y={0} width={200} height={480} />
        </clipPath>
      </defs>
      {croquis && (
        <g fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.45} vectorEffect="non-scaling-stroke">
          <ellipse cx={200} cy={62} rx={27} ry={34} vectorEffect="non-scaling-stroke" />
          <path d="M188,92 L187,124 M212,92 L213,124" vectorEffect="non-scaling-stroke" />
          {barearms && (
            <>
              <path d="M338,221 C342,300 344,400 344,470 M306,239 C310,320 316,400 318,470" vectorEffect="non-scaling-stroke" />
              <path d="M62,221 C58,300 56,400 56,470 M94,239 C90,320 84,400 82,470" vectorEffect="non-scaling-stroke" />
            </>
          )}
          <ellipse cx={331} cy={490} rx={12} ry={19} vectorEffect="non-scaling-stroke" />
          <ellipse cx={69} cy={490} rx={12} ry={19} vectorEffect="non-scaling-stroke" />
          {!bottom && <path d={TROUSER_OUTLINE} transform={BOTTOM} vectorEffect="non-scaling-stroke" />}
          <path d="M116,940 L186,940 L188,960 Q150,970 106,962 Q104,948 116,940 Z" vectorEffect="non-scaling-stroke" />
          <path d="M284,940 L214,940 L212,960 Q250,970 294,962 Q296,948 284,940 Z" vectorEffect="non-scaling-stroke" />
        </g>
      )}
      {bottom && (
        <g transform={BOTTOM} key={`b-${bottom.hex}`} className={fade}>
          <GarmentShape kind={bottom.kind} hex={bottom.hex} />
        </g>
      )}
      {base && (
        <g transform={TOP} key={`t-${base.hex}-${!barearms}`} className={fade} clipPath={barearms ? undefined : "url(#fig-body)"}>
          <GarmentShape kind={base.kind} hex={base.hex} />
        </g>
      )}
      {mid && (
        <g transform={TOP} key={`m-${mid.kind}-${mid.hex}`} className={fade}>
          <GarmentShape kind={mid.kind} hex={mid.hex} />
        </g>
      )}
      {outer && (
        <g transform={TOP} key={`o-${outer.hex}-${!!(base || mid)}`} className={fade}>
          <GarmentShape kind={outer.kind} hex={outer.hex} open={!!(base || mid)} />
        </g>
      )}
    </svg>
  );
}
