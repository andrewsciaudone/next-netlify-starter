// Adds an email to the Finest Form "Waitlist" database in Notion.
// Requires a Notion integration secret (NOTION_TOKEN) with access to the database.
// GET returns a plain-language status check; it never reveals the secret.
const NOTION_VERSION = '2022-06-28'
const DATABASE_ID = process.env.NOTION_WAITLIST_DB_ID || 'ed924d377357498f961ce5c3047db148'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOKEN_NAMES = ['NOTION_TOKEN', 'NOTION_API', 'NOTION_API_KEY', 'NOTION_SECRET', 'NOTION_KEY', 'NOTION_INTEGRATION_TOKEN']

function findToken() {
  for (const name of TOKEN_NAMES) {
    const value = (process.env[name] || '').trim()
    if (value) return { name, value }
  }
  return null
}

// Bots fill the hidden "company" field, post straight to this route without
// the form's timing, submit faster than a person can type, or use Gmail
// addresses broken up with dots (Gmail ignores dots, so bots use them to
// make many "different" addresses).
function looksLikeSpam(body, email) {
  if (String(body?.company || '').trim()) return true
  const elapsed = Number(body?.elapsed)
  if (!Number.isFinite(elapsed) || elapsed < 2000) return true
  const [local, domain] = email.split('@')
  if ((domain === 'gmail.com' || domain === 'googlemail.com') && (local.match(/\./g) || []).length >= 4) return true
  return false
}

function notion(token, path, body) {
  return fetch(`https://api.notion.com/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function status(res) {
  const token = findToken()
  if (!token) {
    return res.status(200).json({
      ok: false,
      status: `Notion key missing. Add NOTION_TOKEN in Vercel (Production) and redeploy.`,
    })
  }
  const r = await notion(token.value, `databases/${DATABASE_ID}`)
  const data = await r.json().catch(() => ({}))
  const messages = {
    200: 'Connected. Signups will save to the Waitlist.',
    401: `Notion rejected the key in ${token.name}. Copy the Internal Integration Secret again, update it in Vercel, and redeploy.`,
    404: `The key in ${token.name} works, but its integration can't see the Waitlist. In Notion open Waitlist, then ⋯ → Connections, and add the integration.`,
  }
  return res.status(200).json({
    ok: r.status === 200,
    status: messages[r.status] || `Notion returned ${r.status}: ${data.message || 'unknown error'}`,
    key: token.name,
  })
}

export default async function handler(req, res) {
  if (req.method === 'GET') return status(res)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const email = String(req.body?.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email' })
  }
  if (looksLikeSpam(req.body, email)) {
    // Answer as if it worked so bots don't learn to adapt.
    console.warn('Dropped likely spam signup')
    return res.status(200).json({ ok: true })
  }
  const token = findToken()
  if (!token) {
    console.error('No Notion key set (looked for ' + TOKEN_NAMES.join(', ') + ')')
    return res.status(500).json({ error: 'Not configured' })
  }

  try {
    const existing = await notion(token.value, `databases/${DATABASE_ID}/query`, {
      filter: { property: 'Email', email: { equals: email } },
      page_size: 1,
    })
    if (existing.ok && (await existing.json()).results.length > 0) {
      return res.status(200).json({ ok: true })
    }

    const created = await notion(token.value, 'pages', {
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
