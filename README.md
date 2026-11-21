# Finest Form — Boston

Single landing page with a waitlist form that writes to the Finest Form **Waitlist** database in Notion.

## Setup

Set these environment variables in Vercel (Project → Settings → Environment Variables):

- `NOTION_TOKEN` — secret for a Notion internal integration that has been given access to the Waitlist database (Notion → Waitlist → ••• → Connections).
- `NOTION_WAITLIST_DB_ID` — optional; defaults to the existing Waitlist database.

Each signup creates a row with Name and Email set to the address and Status set to `New`. A repeat signup with the same email is ignored.

## Appointment requests (/book)

The booking form at `/book` emails each request via [Resend](https://resend.com). Replying to the email answers the client directly. Set these in Vercel:

- `RESEND_API_KEY` — an API key from Resend.
- `BOOKING_TO` — optional; where requests go. Defaults to `andrew@finest-form.com`.
- `BOOKING_FROM` — optional; the sender. Defaults to `Finest Form <bookings@finest-form.com>`, which needs finest-form.com verified as a domain in Resend.

Visit `/api/book` in a browser to check the setup.

## Develop

```bash
npm install
npm run dev
```
