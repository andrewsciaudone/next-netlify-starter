// Emails each appointment request to Andrew, using Resend (resend.com).
// Requires RESEND_API_KEY. Hitting Reply in the email answers the client.
// GET returns a plain-language status check; it never reveals the key.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TO = process.env.BOOKING_TO || 'andrew@finest-form.com'
const FROM = process.env.BOOKING_FROM || 'Finest Form <bookings@finest-form.com>'

const KINDS = ['First appointment', 'Fitting', 'Not sure yet']
const PLACES = ['Office', 'Home', 'Club']
const TIMES = ['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Saturdays']

const clean = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max)
const oneOf = (v, list) => (list.includes(v) ? v : '')
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// Bots fill the hidden "company" field or submit faster than a person can type.
function looksLikeSpam(body) {
  if (String(body?.company || '').trim()) return true
  const elapsed = Number(body?.elapsed)
  return !Number.isFinite(elapsed) || elapsed < 3000
}

async function status(res) {
  const key = (process.env.RESEND_API_KEY || '').trim()
  if (!key) {
    return res.status(200).json({ ok: false, status: 'RESEND_API_KEY missing. Add it in Vercel (Production) and redeploy.' })
  }
  const r = await fetch('https://api.resend.com/domains', { headers: { Authorization: `Bearer ${key}` } })
  const messages = {
    200: `Connected. Requests will be emailed to ${TO}.`,
    401: 'Resend rejected the key. Create a new API key in Resend, update RESEND_API_KEY in Vercel, and redeploy.',
    403: 'Resend rejected the key. Create a new API key in Resend, update RESEND_API_KEY in Vercel, and redeploy.',
  }
  return res.status(200).json({ ok: r.status === 200, status: messages[r.status] || `Resend returned ${r.status}.`, to: TO })
}

export default async function handler(req, res) {
  if (req.method === 'GET') return status(res)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const b = req.body || {}
  const request = {
    name: clean(b.name, 120),
    email: clean(b.email, 254).toLowerCase(),
    phone: clean(b.phone, 40),
    kind: oneOf(b.kind, KINDS),
    place: oneOf(b.place, PLACES),
    times: (Array.isArray(b.times) ? b.times : []).filter((t) => TIMES.includes(t)),
    notes: String(b.notes || '').trim().slice(0, 2000),
  }
  if (!request.name || !EMAIL_RE.test(request.email)) {
    return res.status(400).json({ error: 'Name and a valid email are required' })
  }
  if (looksLikeSpam(b)) {
    console.warn('Dropped likely spam booking request')
    return res.status(200).json({ ok: true })
  }
  const key = (process.env.RESEND_API_KEY || '').trim()
  if (!key) {
    console.error('RESEND_API_KEY is not set')
    return res.status(500).json({ error: 'Not configured' })
  }

  const rows = [
    ['Name', request.name],
    ['Email', request.email],
    ['Phone', request.phone || '—'],
    ['Appointment', request.kind || '—'],
    ['Where', request.place || '—'],
    ['When suits', request.times.join(', ') || '—'],
    ['Notes', request.notes || '—'],
  ]
  const text = `New appointment request\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nReply to this email to answer ${request.name} directly.`
  const html = `<div style="font-family:Georgia,serif;color:#161513;max-width:520px">
<p style="font-size:18px;margin:0 0 16px">New appointment request</p>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:15px">
${rows.map(([k, v]) => `<tr><td style="padding:8px 16px 8px 0;border-top:1px solid #cfc9bd;color:#76726a;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:8px 0;border-top:1px solid #cfc9bd;white-space:pre-line">${esc(v)}</td></tr>`).join('\n')}
</table>
<p style="font-size:14px;color:#76726a;margin-top:16px">Reply to this email to answer ${esc(request.name)} directly.</p>
</div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: request.email,
        subject: `Appointment request — ${request.name}${request.kind ? ` (${request.kind})` : ''}`,
        text,
        html,
      }),
    })
    if (!r.ok) {
      console.error('Resend error', r.status, await r.text())
      return res.status(502).json({ error: 'Could not send' })
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Could not send' })
  }
}
