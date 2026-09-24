"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export const NAV = [
  { href: "/uniforms", label: "Uniforms", no: "01" },
  { href: "/build", label: "Build Your Uniform", no: "02" },
  { href: "/archive", label: "Archive", no: "03" },
  { href: "/record", label: "Your Record", no: "04" },
];

export function Header() {
  const path = usePathname();
  const { count, hydrated, setDrawerOpen } = useStore();
  const [menu, setMenu] = useState(false);

  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  const active = (href: string) => path === href || path.startsWith(href + "/");
  const issueCount = hydrated ? String(count).padStart(2, "0") : "00";

  return (
    <>
      <header className="sticky top-0 z-40 border-b rule bg-paper/95 backdrop-blur-[2px]">
        <div className="shell flex h-14 items-center justify-between gap-6">
          <Link href="/" className="text-[0.8125rem] font-semibold tracking-[0.22em] whitespace-nowrap">
            FINEST UNIFORM
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active(n.href) ? "page" : undefined}
                className="group flex items-baseline gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em]"
              >
                <span className="font-mono text-[0.5625rem] text-muted transition-colors group-hover:text-ink">{n.no}</span>
                <span className="ulink" aria-current={active(n.href) ? "page" : undefined}>
                  {n.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setDrawerOpen(true)}
              className="group flex items-baseline gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em]"
            >
              <span className="hidden font-mono text-[0.5625rem] text-muted sm:inline">05</span>
              <span className="ulink">Your Issue</span>
              <span className="font-mono text-[0.6875rem] tabular-nums">({issueCount})</span>
            </button>
            <button
              onClick={() => setMenu((m) => !m)}
              className="flex h-8 w-8 flex-col items-end justify-center gap-[5px] lg:hidden"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
            >
              <span className={`block h-px bg-ink transition-all duration-300 ${menu ? "w-5 translate-y-[3px] rotate-45" : "w-5"}`} />
              <span className={`block h-px bg-ink transition-all duration-300 ${menu ? "w-5 -translate-y-[3px] -rotate-45" : "w-3"}`} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 top-14 z-30 bg-paper transition-opacity duration-500 lg:hidden ${
          menu ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menu}
      >
        <nav className="shell flex h-full flex-col pt-6 pb-10" aria-label="Mobile">
          {[...NAV, { href: "/issue", label: "Your Issue", no: "05" }].map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              tabIndex={menu ? 0 : -1}
              className="flex items-baseline gap-4 border-b rule py-5"
              style={{
                transition: "opacity 500ms, transform 500ms",
                transitionDelay: menu ? `${80 + i * 50}ms` : "0ms",
                opacity: menu ? 1 : 0,
                transform: menu ? "none" : "translateY(6px)",
              }}
            >
              <span className="label text-muted">{n.no}</span>
              <span className="text-2xl font-medium tracking-tight">{n.label}</span>
            </Link>
          ))}
          <div className="mt-auto grid grid-cols-2 gap-4 label text-muted">
            <span>Issue 01 / 09.26</span>
            <span className="text-right">Made in Portugal</span>
          </div>
        </nav>
      </div>
    </>
  );
}
