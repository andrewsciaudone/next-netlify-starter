# Finest Form — Boston

Single landing page with a waitlist form that writes to the Finest Form **Waitlist** database in Notion.

## Setup

Set these environment variables in Netlify (Site settings → Environment variables):

- `NOTION_TOKEN` — secret for a Notion internal integration that has been given access to the Waitlist database (Notion → Waitlist → ••• → Connections).
- `NOTION_WAITLIST_DB_ID` — optional; defaults to the existing Waitlist database.

Each signup creates a row with Name and Email set to the address and Status set to `New`. A repeat signup with the same email is ignored.

## Develop

```bash
npm install
npm run dev
```
