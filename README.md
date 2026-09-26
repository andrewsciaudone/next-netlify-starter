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

## The path

The prototype is one linear journey. A five-segment progress line under the header shows where you are, and every
page ends with a link to the next step.

| Step | Route | What it is |
| --- | --- | --- |
| 01 | `/` | Homepage: the idea, Plate 01, One Less Decision |
| 02 | `/001` | Uniform 001 story: five views, Proportion / Material / Construction / Purpose, Monday — Sunday, add to issue |
| 03 | `/build` | Build Your Uniform: seven-question consultation, then the recommendation and "Issue my uniform" |
| 04 | `/record` | Uniform Record: preferences, garments awaiting issue, issued garments (each opens its garment record), foundations still open |
| 05 | `/issue` | Your Issue: review → checkout → confirmation; completed garments are numbered and added to the record |

The footer has a **Reset prototype** link that clears local data. When presenting, **← / →** move between steps.

## Simple version

`/simple` is a plain-language version of the shop: Shop, Help me choose, Cart and Checkout, with the four
products named The T-shirt, The Polo, The Sweatshirt and The Hoodie. It shares the product data, drawings and
cart with the full site (`src/simple/SimpleApp.tsx`). `npm run build:simple` builds it as one standalone page,
`present/dist/finest-uniform-simple.html`.

## Presentation build

`npm run build:present` bundles the same components into one self-contained page,
`present/dist/finest-uniform.html` (React from cdnjs, everything else inlined). `present/shims/` stand in for
`next/link` and `next/navigation` with a small in-page router.

## Structure

```
src/
  app/            routes
  components/     UI: garments.tsx (SVG garment flats + measurement diagrams), Figure.tsx (outfit on a croquis),
                  Plate.tsx (image plates, fabric, woven label, tag code), Consultation, RecordView, IssueView, …
  lib/
    data.ts       products, colours, mock customer and garment register
    store.tsx     client store (issue, consultation, record) persisted to localStorage
    recommend.ts  consultation → recommendation logic
    outfit.ts     helper to compose figures
    flow.ts       the five-step path
```

Imagery is drawn: garments are SVG technical flats rendered in each colourway, standing in for campaign
photography until it exists.
