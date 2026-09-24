// In-page router for the single-file presentation build. Each step gets a
// plain hash token (#001, #build …) so the browser's back button still works.
const TOKENS: Record<string, string> = { "/": "home", "/001": "001", "/build": "build", "/record": "record", "/issue": "issue" };

const toPath = (hash: string) => Object.keys(TOKENS).find((k) => TOKENS[k] === hash.replace(/^#/, "")) ?? "/";

let path = typeof window === "undefined" ? "/" : toPath(window.location.hash);
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    path = toPath(window.location.hash);
    emit();
  });
}

export const tokenFor = (href: string) => "#" + (TOKENS[href] ?? "home");

export function navigate(href: string) {
  const next = TOKENS[href] ? href : "/";
  if (next !== path) {
    try {
      window.history.pushState(null, "", tokenFor(next));
    } catch {
      /* sandboxed frame: navigation still works in memory */
    }
    path = next;
    emit();
  }
  window.scrollTo(0, 0);
}

export const subscribe = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};
export const getPath = () => path;
