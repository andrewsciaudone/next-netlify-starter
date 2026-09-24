import Link from "next/link";
import type { ReactNode } from "react";

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`label ${className}`}>{children}</span>;
}

/** A single specification row: small mono key on the left, value on the right. */
export function Spec({
  k,
  children,
  className = "",
}: {
  k: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-[7.5rem_1fr] gap-4 border-t rule py-3 md:grid-cols-[9rem_1fr] ${className}`}>
      <dt className="label text-muted pt-[2px]">{k}</dt>
      <dd className="text-[0.9375rem] leading-snug">{children}</dd>
    </div>
  );
}

type BtnProps = {
  children: ReactNode;
  variant?: "solid" | "outline" | "text";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  href?: string;
  full?: boolean;
};

/** Bracketed action: [ LABEL ]. The brackets are part of the voice. */
export function Action({
  children,
  variant = "solid",
  className = "",
  disabled,
  type = "button",
  onClick,
  href,
  full,
}: BtnProps) {
  const base =
    "group inline-flex h-12 items-center justify-center gap-3 whitespace-nowrap px-6 text-[0.75rem] font-medium uppercase tracking-[0.16em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40";
  const styles = {
    solid: "bg-ink text-paper hover:bg-navy",
    outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
    text: "px-0 h-auto text-ink",
  }[variant];
  const inner = (
    <>
      <span className="font-mono opacity-50 transition-transform duration-300 group-hover:-translate-x-0.5">[</span>
      <span>{children}</span>
      <span className="font-mono opacity-50 transition-transform duration-300 group-hover:translate-x-0.5">]</span>
    </>
  );
  const cls = `${base} ${styles} ${full ? "w-full" : ""} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/** Section header used across pages: index number, title, optional aside. */
export function SectionHead({
  index,
  title,
  aside,
  className = "",
}: {
  index: string;
  title: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-12 items-baseline gap-4 border-t border-ink pt-3 ${className}`}>
      <span className="label col-span-2 md:col-span-1">{index}</span>
      <h2 className="caps col-span-10 md:col-span-7">{title}</h2>
      {aside && <div className="label col-span-12 text-muted md:col-span-4 md:text-right">{aside}</div>}
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 9,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div className="inline-flex items-center border rule" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-7 w-7 font-mono text-sm text-muted transition-colors hover:text-ink disabled:opacity-30"
        disabled={value <= min}
        aria-label="Decrease"
      >
        −
      </button>
      <span className="w-6 text-center font-mono text-xs tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-7 w-7 font-mono text-sm text-muted transition-colors hover:text-ink disabled:opacity-30"
        disabled={value >= max}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
