import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

const PRICING = [
  { origin: 'Made in New York', price: '$2,700' },
  { origin: 'Made Overseas', price: '$1,500' },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [company, setCompany] = useState('') // spam trap: hidden from people
  const loadedAt = useRef(0)
  useEffect(() => { loadedAt.current = Date.now() }, [])

  async function submit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, elapsed: Date.now() - loadedAt.current }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="page">
      <Head>
        <title>Made-to-Measure Relaxed Tailoring in Boston</title>
        <meta name="description" content="A considered approach to getting dressed. Relaxed tailoring, thoughtful proportions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f3f0e9" />
        <meta property="og:title" content="Made-to-Measure Relaxed Tailoring in Boston" />
        <meta property="og:site_name" content="Finest Form" />
        <meta property="og:image" content="/hero.jpg" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <figure className="hero">
        <img
          src="/hero.jpg"
          width="1113"
          height="1670"
          alt="A man walks along a sunlit garden path, a grey linen jacket over his shoulder."
        />
      </figure>

      <main>
        <h1 className="sr-only">Finest Form</h1>
        <p className="label eyebrow">Boston</p>
        <p className="lede">A considered approach to getting dressed.</p>
        <p className="body">
          Relaxed tailoring. Thoughtful proportions. A wardrobe built around the way you live.
        </p>

        <section className="pricing" aria-label="Pricing">
          <p className="label muted">Two-piece suit, starting at</p>
          <dl>
            {PRICING.map((p) => (
              <div key={p.origin} className="row">
                <dt>{p.origin}</dt>
                <dd>{p.price}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="body">
          We’re refining our offering. Leave your email for the first look and upcoming appointment availability.
        </p>

        {status === 'done' ? (
          <p className="label confirm" role="status">Thank you — we’ll be in touch.</p>
        ) : (
          <form onSubmit={submit}>
            <div className="trap" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Stay informed'}
            </button>
            {status === 'error' && (
              <p className="label error" role="alert">Something went wrong. Please try again.</p>
            )}
          </form>
        )}
      </main>

      <footer className="label muted">© {new Date().getFullYear()} Finest Form</footer>
    </div>
  )
}
