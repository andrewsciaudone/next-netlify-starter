/** The prototype is one linear path. Every page knows where it sits in it. */
export const FLOW = [
  { href: "/", no: "01", label: "Finest Uniform", blurb: "The idea: everyday clothing, issued with purpose." },
  { href: "/001", no: "02", label: "Uniform 001", blurb: "The Short-Sleeve Jersey, and why it is made the way it is." },
  { href: "/build", no: "03", label: "Build Your Uniform", blurb: "Seven questions. We recommend the foundation." },
  { href: "/record", no: "04", label: "Uniform Record", blurb: "Your preferences, and every garment issued to you." },
  { href: "/issue", no: "05", label: "Your Issue", blurb: "Review what is ready to be issued, and check out." },
] as const;

export function flowIndex(path: string) {
  const i = FLOW.findIndex((s) => (s.href === "/" ? path === "/" : path.startsWith(s.href)));
  return i < 0 ? 0 : i;
}
