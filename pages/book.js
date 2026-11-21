// Simple appointment request mockup. The client says what they'd like and
// roughly when suits them; Andrew replies to set an exact time.
// Nothing is sent yet: submitting only shows the thank-you message.
// (The full scheduler with a calendar is saved in git history, commit 3356b32.)
import Head from 'next/head'
import { useState } from 'react'
import { Monogram, Wordmark } from '@components/Logos'

const KINDS = ['First appointment', 'Fitting', 'Not sure yet']
const PLACES = ['Office', 'Home', 'Club']
const TIMES = ['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Saturdays']

function Chips({ options, value, onChange, multiple, label }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => {
        const on = multiple ? value.includes(o) : value === o
        return (
          <button
            type="button"
            key={o}
            className={`chip${on ? ' on' : ''}`}
            aria-pressed={on}
            onClick={() =>
              onChange(multiple ? (on ? value.filter((x) => x !== o) : [...value, o]) : o)
            }
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

export default function Book() {
  const [kind, setKind] = useState('First appointment')
  const [place, setPlace] = useState('')
  const [times, setTimes] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [sent, setSent] = useState(false)

  const ready = name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  function submit(e) {
    e.preventDefault()
    if (!ready) return
    setSent(true)
  }

  return (
    <div className="site book">
      <Head>
        <title>Book an Appointment · Finest Form</title>
        <meta name="description" content="Request a private made-to-measure appointment with Finest Form in Boston." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#faf7f0" />
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>

      <header className="masthead">
        <div className="wrap masthead-inner">
          <a href="/" className="mark-link" aria-label="Finest Form, home">
            <Monogram />
          </a>
          <Wordmark className="masthead-word shown" />
          <a href="/" className="masthead-back">Return</a>
        </div>
      </header>

      <main className="book-main wrap">
        <div className="card">
          <Monogram className="seal" />
          {sent ? (
            <div role="status">
              <h1 className="book-title">Thank you, {name.trim().split(/\s+/)[0]}.</h1>
              <p className="body">
                Andrew will be in touch at <em>{email.trim()}</em> to find a time that suits you.
              </p>
              <a href="/" className="place">Return to Finest Form</a>
            </div>
          ) : (
            <>
              <h1 className="book-title">Book an Appointment</h1>
              <p className="body">
                Andrew comes to you. Tell us a little about what you’d like, and he’ll reply personally to set a time.
              </p>

              <form className="book-form" onSubmit={submit} noValidate>
                <div className="question">
                  <p className="small-caps q">What would you like?</p>
                  <Chips label="What would you like?" options={KINDS} value={kind} onChange={setKind} />
                </div>
                <div className="question">
                  <p className="small-caps q">Where shall we meet?</p>
                  <Chips label="Where shall we meet?" options={PLACES} value={place} onChange={setPlace} />
                </div>
                <div className="question">
                  <p className="small-caps q">When suits you? <span className="optional">choose any</span></p>
                  <Chips label="When suits you?" options={TIMES} value={times} onChange={setTimes} multiple />
                </div>

                <div className="fields">
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label htmlFor="bemail">Email</label>
                    <input id="bemail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Phone <span className="optional">optional</span></label>
                    <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="notes">Anything else? <span className="optional">optional</span></label>
                    <input
                      id="notes"
                      placeholder="An occasion, a garment in mind…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" disabled={!ready}>Request an appointment</button>
              </form>
            </>
          )}
        </div>
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
