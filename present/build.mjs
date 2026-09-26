// Builds the prototype into one self-contained HTML file for presenting:
//   node present/build.mjs         →  present/dist/finest-uniform.html        (full site)
//   node present/build.mjs simple  →  present/dist/finest-uniform-simple.html (plain-language shop)
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const simple = process.argv[2] === "simple";
const out = path.join(root, "present/dist");
mkdirSync(out, { recursive: true });

// React comes from cdnjs as UMD globals; the page's own code is inlined.
const GLOBALS = { react: "React", "react-dom": "ReactDOM", "react-dom/client": "ReactDOM" };
const umdGlobals = {
  name: "umd-globals",
  setup(b) {
    b.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({ path: path.join(root, "present/shims/jsx-runtime.js") }));
    b.onResolve({ filter: /^(react|react-dom|react-dom\/client)$/ }, (a) => ({ path: a.path, namespace: "umd" }));
    b.onLoad({ filter: /.*/, namespace: "umd" }, (a) => ({ contents: `module.exports = window.${GLOBALS[a.path]};`, loader: "js" }));
  },
};

const js = await build({
  entryPoints: [path.join(root, simple ? "present/simple-main.tsx" : "present/main.tsx")],
  bundle: true,
  write: false,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "next/link": path.join(root, "present/shims/link.tsx"),
    "next/navigation": path.join(root, "present/shims/navigation.ts"),
  },
  plugins: [umdGlobals],
  tsconfig: path.join(root, "tsconfig.json"),
  logLevel: "warning",
});

const cssFile = path.join(out, "app.css");
execFileSync("npx", ["@tailwindcss/cli", "-i", "src/app/globals.css", "-o", cssFile, "--minify"], { cwd: root, stdio: "ignore" });
const css = readFileSync(cssFile, "utf8");
const code = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const meta = simple
  ? `<title>Finest Uniform Shop</title>\n<meta name="description" content="A simple shop for four everyday basics, made in the USA.">`
  : `<title>Finest Uniform</title>\n<meta name="description" content="Everyday clothing, issued with purpose. A five-step prototype: homepage, Uniform 001, Build Your Uniform, Uniform Record, Your Issue.">`;
const html = `${meta}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@300..700&display=swap">
<style>${css}</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>${code}</script>
`;
const file = simple ? "finest-uniform-simple.html" : "finest-uniform.html";
writeFileSync(path.join(out, file), html);
console.log(`present/dist/${file}  ${(html.length / 1024).toFixed(0)} KB`);
