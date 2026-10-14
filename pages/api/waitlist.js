// Adds an email to the Finest Form "Waitlist" database in Notion.
// Requires NOTION_TOKEN (an internal integration with access to the database).
const NOTION_VERSION = '2022-06-28'
const DATABASE_ID = process.env.NOTION_WAITLIST_DB_ID || 'ed924d377357498f961ce5c3047db148'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function notion(path, body) {
  return fetch(`https://api.notion.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const email = String(req.body?.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email' })
  }
  if (!process.env.NOTION_TOKEN) {
    console.error('NOTION_TOKEN is not set')
    return res.status(500).json({ error: 'Not configured' })
  }

  try {
    const existing = await notion(`databases/${DATABASE_ID}/query`, {
      filter: { property: 'Email', email: { equals: email } },
      page_size: 1,
    })
    if (existing.ok && (await existing.json()).results.length > 0) {
      return res.status(200).json({ ok: true })
    }

    const created = await notion('pages', {
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: email } }] },
        Email: { email },
        Status: { select: { name: 'New' } },
      },
    })
    if (!created.ok) {
      console.error('Notion error', created.status, await created.text())
      return res.status(502).json({ error: 'Could not save' })
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Could not save' })
  }
}
