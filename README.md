# Finest Uniform — prototype

A working ecommerce prototype for **Finest Uniform**, the everyday extension of the tailoring brand Finest Form.

> The clothes you wear when you don't want to think about clothes.

Built with Next.js (App Router), React, TypeScript and Tailwind CSS v4. All data is local mock data; the
customer's issue (cart), consultation answers and uniform record persist in `localStorage`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Editorial homepage: Plate 01, Uniform 001, how it is made, One Less Decision, Monday — Sunday |
| `/uniforms` | Index of the five foundations (001 – 005) |
| `/uniforms/[id]` | Product specification sheet: plates, swatches, sizes, measurement diagram, how it fits your uniform |
| `/build` | Build Your Uniform — a seven-step consultation |
| `/build/your-uniform` | Personalised recommendation with reasoning, "Issue my uniform" |
| `/build/configure` | Uniform configurator: Base / Mid / Outer / Bottom, 3/5/7-day presets, combinations, weekly rotation |
| `/archive` | Permanent catalogue, including fully issued forms (000) |
| `/record` | Uniform Record: preferences, foundations issued, issued garments, issue history |
| `/record/[garmentNo]` | Garment record (the page behind the sewn-in NFC/QR tag), e.g. `/record/001-26-00482` |
| `/issue` | Your Issue (cart) → checkout → confirmation; completed garments are numbered and added to the record |

"Your Issue" also opens as a drawer from the header. The footer has a **Reset prototype data** link.

## Structure

```
src/
  app/            routes
  components/     UI: garments.tsx (SVG garment flats + measurement diagrams), Figure.tsx (outfit on a croquis),
                  Plate.tsx (image plates, fabric, woven label, tag code), Configurator, Consultation, …
  lib/
    data.ts       products, colours, mock customer and garment register
    store.tsx     client store (issue, consultation, record) persisted to localStorage
    recommend.ts  consultation → recommendation logic
    outfit.ts     helper to compose figures
```

Imagery is drawn: garments are SVG technical flats rendered in each colourway, standing in for campaign
photography until it exists.
