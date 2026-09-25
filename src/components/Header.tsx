"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FLOW, flowIndex } from "@/lib/flow";
import { useStore } from "@/lib/store";

export function Header() {
  const path = usePathname();
  const { count, hydrated } = useStore();
  const [menu, setMenu] = useState(false);
  const current = flowIndex(path);

  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  const issueCount = hydrated ? String(count).padStart(2, "0") : "00";
  const middle = FLOW.slice(1, 4);

  return (
    <>
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 bg-paper/95 backdrop-blur-[2px]">
        <div className="shell flex h-14 items-center justify-between gap-6">
          <Link href="/" className="whitespace-nowrap text-[0.8125rem] font-semibold tracking-[0.22em]">
            FINEST UNIFORM
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {middle.map((n) => {
              const on = FLOW[current].href === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="group flex items-baseline gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em]"
                >
                  <span className="font-mono text-[0.5625rem] text-muted transition-colors group-hover:text-ink">{n.no}</span>
                  <span className="ulink" aria-current={on ? "page" : undefined}>
                    {n.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/issue"
              className="group flex items-baseline gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em]"
            >
              <span className="hidden font-mono text-[0.5625rem] text-muted sm:inline">05</span>
              <span className="ulink" aria-current={current === 4 ? "page" : undefined}>
                Your Issue
              </span>
              <span className="font-mono text-[0.6875rem] tabular-nums">({issueCount})</span>
            </Link>
            <button
              onClick={() => setMenu((m) => !m)}
              className="flex h-8 w-8 flex-col items-end justify-center gap-[5px] lg:hidden"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
            >
              <span className={`block h-px w-5 bg-ink transition-all duration-300 ${menu ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`block h-px bg-ink transition-all duration-300 ${menu ? "w-5 -translate-y-[3px] -rotate-45" : "w-3"}`} />
            </button>
          </div>
        </div>

        {/* Where you are in the path: five segments, filled up to the current step */}
        <div className="shell">
          <ol className="grid grid-cols-5 gap-1" aria-label="Progress">
            {FLOW.map((s, i) => (
              <li key={s.href} className="relative h-px bg-rule">
                <span
                  className="absolute inset-y-0 left-0 bg-ink transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)]"
                  style={{ width: i <= current ? "100%" : "0%" }}
                />
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div
        className={`fixed inset-0 top-14 z-30 bg-paper transition-opacity duration-500 lg:hidden ${
          menu ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menu}
      >
        <nav className="shell flex h-full flex-col pb-10 pt-6" aria-label="Mobile">
          {FLOW.map((n, i) => (
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
              <span className={`label ${i === current ? "text-ink" : "text-muted"}`}>{n.no}</span>
              <span className="text-2xl font-medium tracking-tight">{n.label}</span>
            </Link>
          ))}
          <p className="label mt-auto text-muted">Issue 01 / 09.26 — Made in the USA</p>
        </nav>
      </div>
    </>
  );
}
