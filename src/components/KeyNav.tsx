"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { FLOW, flowIndex } from "@/lib/flow";

/** ← and → move between the five steps — handy when presenting. Ignored while typing. */
export function KeyNav() {
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (path.startsWith("/simple") || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const i = flowIndex(path);
      const to = e.key === "ArrowRight" ? FLOW[i + 1] : e.key === "ArrowLeft" ? FLOW[i - 1] : undefined;
      if (!to) return;
      e.preventDefault();
      router.push(to.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [path, router]);

  return null;
}
