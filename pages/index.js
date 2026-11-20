import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { Lockup, Monogram, Wordmark } from '@components/Logos'

const INCLUDED = [
  {
    title: 'Cloth',
    items: [
      ['American Woolen', 'Worsteds and flannels woven in Connecticut'],
      ['Fox Brothers', 'English flannel from Somerset, since 1772'],
      ['Holland & Sherry', 'Savile Row cloth merchant, since 1836'],
    ],
  },
  {
    title: 'Construction',
    items: [
      ['Made in New York', 'Cut and sewn by hand in a New York workroom'],
      ['Soft horsehair canvassing', 'Natural structure that shapes to you with wear'],
      ['Your own pattern', 'Kept on file, so every order starts from your fit'],
    ],
  },
  {
    title: 'Fitting',
    items: [
      ['Private appointment', 'At your office, home or club, at a time that suits you'],
      ['Measurements & consultation', 'Cloth, cut and details chosen together'],
      ['Fittings until it’s right', 'Adjustments included, with a final fitting before delivery'],
    ],
  },
]

const PRICING = [
  { item: 'Two-Piece Suit', price: '$3,000' },
  { item: 'Jacket', price: '$2,295' },
  { item: 'Pants', price: '$885' },
  { item: 'Overcoat', price: '$3,000' },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [company, setCompany] = useState('') // spam trap: hidden from people
  const loadedAt = useRef(0)
  useEffect(() => { loadedAt.current = Date.now() }, [])

  // The header wordmark appears only once the big lockup has scrolled away,
  // so the name never shows twice on the same screen.
  const lockupRef = useRef(null)
  const [lockupGone, setLockupGone] = useState(false)
  useEffect(() => {
    const el = lockupRef.current
    if (!el || !('IntersectionObserver' in window)) return setLockupGone(true)
    const io = new IntersectionObserver(([entry]) => setLockupGone(!entry.isIntersecting), {
      rootMargin: '-80px 0px 0px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

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
    <div className="site">
      <Head>
        <title>Made-to-Measure Relaxed Tailoring in Boston</title>
        <meta name="description" content="A considered approach to getting dressed. Relaxed tailoring, thoughtful proportions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#faf7f0" />
        <meta property="og:title" content="Made-to-Measure Relaxed Tailoring in Boston" />
        <meta property="og:site_name" content="Finest Form" />
        <meta property="og:image" content="/og.png" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>

      <header className="masthead">
        <div className="wrap masthead-inner">
          <a href="#top" className="mark-link" aria-label="Finest Form, home">
            <Monogram />
          </a>
          <Wordmark aria-hidden="true" className={`masthead-word${lockupGone ? ' shown' : ''}`} />
          <a href="#waitlist" className="masthead-join">Join</a>
        </div>
      </header>

      <main id="top">
        <section className="spread wrap" aria-label="Finest Form, Boston">
          <div className="opening">
            <h1>
              <Lockup ref={lockupRef} className="lockup" />
            </h1>
            <p className="made">Made to Measure</p>
            <p className="tagline">
              Relaxed tailoring.<br />
              Thoughtful proportions.<br />
              A wardrobe built around the way you live.
            </p>
            <p className="lede">A considered approach to getting dressed.</p>
            <a href="#waitlist" className="place">Stay informed</a>
          </div>
        </section>

        <section className="pricing wrap" id="pricing" aria-labelledby="pricing-title">
          <Monogram className="ornament" />
          <h2 className="section-title" id="pricing-title">Made in New York</h2>
          <p className="small-caps">Starting at</p>
          <dl>
            {PRICING.map((p) => (
              <div key={p.item} className="row">
                <dt>{p.item}</dt>
                <dd>{p.price}</dd>
              </div>
            ))}
            <div className="row inquire">
              <dt>Private Wardrobe</dt>
              <dd>
                <a href="mailto:andrew@finest-form.com?subject=Private%20Wardrobe%20inquiry">Inquire for pricing</a>
              </dd>
            </div>
          </dl>
        </section>

        <section className="included wrap" id="included" aria-labelledby="included-title">
          <h2 className="section-title" id="included-title">Included in Every Garment</h2>
          <div className="columns">
            {INCLUDED.map((group, i) => (
              <div key={group.title} className="column">
                <span className="numeral">{['I', 'II', 'III'][i]}</span>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map(([name, detail]) => (
                    <li key={name}>
                      <span className="name">{name}</span>
                      <span className="detail">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="waitlist wrap" id="waitlist" aria-labelledby="waitlist-title">
          <div className="card">
            <Monogram className="seal" />
            <h2 className="section-title" id="waitlist-title">The First Look</h2>
            <p className="body">
              We’re refining our offering. Leave your email for the first look and upcoming appointment availability.
            </p>

            {status === 'done' ? (
              <p className="confirm" role="status">Thank you for signing up — Andrew will reach out to you personally.</p>
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
                  <p className="error" role="alert">Something went wrong. Please try again.</p>
                )}
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <Wordmark className="footer-word" />
          <p className="small-caps">Boston · <a href="mailto:andrew@finest-form.com">andrew@finest-form.com</a></p>
          <p className="small-caps legal">© {new Date().getFullYear()} Finest Form LLC</p>
        </div>
      </footer>
    </div>
  )
}
