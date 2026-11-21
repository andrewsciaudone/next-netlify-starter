// Booking page mockup. Everything here runs in the browser: availability is
// generated, and "Request appointment" only shows the confirmation. Nothing
// is sent anywhere yet.
import Head from 'next/head'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Monogram, Wordmark } from '@components/Logos'

const APPOINTMENTS = [
  {
    id: 'first',
    name: 'First Appointment',
    length: 90,
    detail: 'Measurements and consultation. Cloth, cut and details chosen together.',
    note: 'For new clients',
  },
  {
    id: 'fitting',
    name: 'Fitting',
    length: 45,
    detail: 'A fitting for a garment in progress, with adjustments taken on the spot.',
    note: 'For orders underway',
  },
  {
    id: 'reorder',
    name: 'Reorder',
    length: 45,
    detail: 'Your pattern is on file. Choose cloth and details for the next piece.',
    note: 'For returning clients',
  },
  {
    id: 'wardrobe',
    name: 'Private Wardrobe',
    length: 120,
    detail: 'A longer conversation to plan several pieces for the seasons ahead.',
    note: 'By consultation',
  },
]

const GARMENTS = ['Two-Piece Suit', 'Jacket', 'Pants', 'Overcoat', 'Not sure yet']

const PLACES = [
  { id: 'office', name: 'Your office', detail: 'A conference room or private office works well.' },
  { id: 'home', name: 'Your home', detail: 'Wherever there’s a mirror and good light.' },
  { id: 'club', name: 'Your club', detail: 'We’ll arrange it with the front desk.' },
]

const STEPS = ['Appointment', 'Place', 'Time', 'Details']
const NUMERALS = ['I', 'II', 'III', 'IV']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// --- Mock availability -----------------------------------------------------
// A small seeded hash so the same day always shows the same open times.
function hash(n) {
  let x = n | 0
  x = ((x >>> 16) ^ x) * 0x45d9f3b
  x = ((x >>> 16) ^ x) * 0x45d9f3b
  return ((x >>> 16) ^ x) >>> 0
}
const dayKey = (d) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const sameDay = (a, b) => a && b && dayKey(a) === dayKey(b)

const LEAD_DAYS = 2
const WINDOW_DAYS = 56

function isHoliday(d) {
  const m = d.getMonth() + 1
  const day = d.getDate()
  if ((m === 12 && (day === 24 || day === 25 || day === 31)) || (m === 1 && day === 1)) return true
  // Thanksgiving: fourth Thursday of November
  return m === 11 && d.getDay() === 4 && day >= 22 && day <= 28
}

function slotsFor(date, length) {
  const dow = date.getDay()
  if (dow === 0 || isHoliday(date)) return [] // closed Sundays and holidays
  const open = dow === 6 ? 10 * 60 : 8 * 60
  const close = dow === 6 ? 15 * 60 : dow === 4 ? 20 * 60 : 18 * 60 + 30
  const seed = dayKey(date)
  if (hash(seed) % 7 === 0) return [] // fully booked
  const slots = []
  for (let m = open; m + length <= close; m += 30) {
    const taken = hash(seed * 31 + m) % 5 < 2
    slots.push({ minutes: m, taken })
  }
  return slots
}

function fmtTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = ((h + 11) % 12) + 1
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}
const fmtDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const fmtLength = (m) => (m % 60 === 0 ? `${m / 60} hour${m > 60 ? 's' : ''}` : m > 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m} minutes`)

function icsFor(booking) {
  const start = new Date(booking.date)
  start.setHours(0, booking.time, 0, 0)
  const end = new Date(start.getTime() + booking.appointment.length * 60000)
  const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Finest Form//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${stamp(start)}-${booking.ref}@finest-form.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Finest Form — ${booking.appointment.name}`,
    `LOCATION:${booking.address.replace(/\n/g, ', ')}`,
    'DESCRIPTION:Made-to-measure appointment with Andrew. Questions: andrew@finest-form.com',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

// --- Page ------------------------------------------------------------------
export default function Book() {
  const [today, setToday] = useState(null) // set after mount so server and browser agree
  useEffect(() => setToday(startOfDay(new Date())), [])

  const [step, setStep] = useState(0)
  const [appointment, setAppointment] = useState(null)
  const [garments, setGarments] = useState([])
  const [place, setPlace] = useState(null)
  const [address, setAddress] = useState('')
  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)
  const [month, setMonth] = useState(null)
  const [details, setDetails] = useState({ name: '', email: '', phone: '', notes: '', referral: '' })
  const [booked, setBooked] = useState(null)

  useEffect(() => {
    if (today && !month) {
      const first = addDays(today, LEAD_DAYS)
      setMonth(new Date(first.getFullYear(), first.getMonth(), 1))
    }
  }, [today, month])

  const topRef = useRef(null)
  function go(n) {
    setStep(n)
    const el = topRef.current
    if (el && el.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
  }

  const length = appointment?.length || 60
  const slots = useMemo(() => (date ? slotsFor(date, length) : []), [date, length])
  // A different appointment length can make the chosen time no longer fit.
  useEffect(() => {
    if (time != null && !slots.some((s) => s.minutes === time && !s.taken)) setTime(null)
  }, [slots, time])

  const canContinue = [
    Boolean(appointment),
    Boolean(place) && address.trim().length > 3,
    Boolean(date) && time != null,
    details.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim()),
  ]

  function submit(e) {
    e.preventDefault()
    if (!canContinue.every(Boolean)) return
    const ref = 'FF-' + String(hash(Date.now()) % 100000).padStart(5, '0')
    setBooked({ ref, appointment, garments, place, address, date, time, ...details })
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="site book">
      <Head>
        <title>Book an Appointment · Finest Form</title>
        <meta name="description" content="Book a private made-to-measure appointment with Finest Form, at your office, home or club in Boston." />
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

      <main>
        {booked ? (
          <Confirmation booking={booked} />
        ) : (
          <>
            <section className="book-intro wrap" ref={topRef}>
              <p className="small-caps eyebrow">Private Appointments · Boston</p>
              <h1 className="book-title">Book an Appointment</h1>
              <p className="body">
                Andrew comes to you. Choose a time below and he’ll confirm personally, usually within the day.
              </p>
            </section>

            <ol className="stepper wrap" aria-label="Booking steps">
              {STEPS.map((label, i) => {
                const reachable = i <= step || canContinue.slice(0, i).every(Boolean)
                return (
                  <li key={label} className={i === step ? 'current' : i < step ? 'done' : ''}>
                    <button
                      type="button"
                      className="step-link"
                      onClick={() => reachable && go(i)}
                      disabled={!reachable}
                      aria-current={i === step ? 'step' : undefined}
                    >
                      <span className="step-num">{NUMERALS[i]}</span>
                      <span className="step-label">{label}</span>
                    </button>
                  </li>
                )
              })}
            </ol>

            <form className="book-layout wrap" onSubmit={submit} noValidate>
              <div className="book-main">
                {step === 0 && (
                  <fieldset className="panel">
                    <legend className="panel-title">What brings you in?</legend>
                    <div className="choices">
                      {APPOINTMENTS.map((a) => (
                        <label key={a.id} className={`choice${appointment?.id === a.id ? ' picked' : ''}`}>
                          <input
                            type="radio"
                            name="appointment"
                            value={a.id}
                            checked={appointment?.id === a.id}
                            onChange={() => setAppointment(a)}
                          />
                          <span className="choice-head">
                            <span className="choice-name">{a.name}</span>
                            <span className="choice-length">{fmtLength(a.length)}</span>
                          </span>
                          <span className="choice-detail">{a.detail}</span>
                          <span className="choice-note">{a.note}</span>
                        </label>
                      ))}
                    </div>

                    {appointment && appointment.id !== 'fitting' && (
                      <div className="garments">
                        <p className="small-caps sub">What are you considering?</p>
                        <div className="chips">
                          {GARMENTS.map((g) => {
                            const on = garments.includes(g)
                            return (
                              <button
                                type="button"
                                key={g}
                                className={`chip${on ? ' on' : ''}`}
                                aria-pressed={on}
                                onClick={() =>
                                  setGarments((list) => (on ? list.filter((x) => x !== g) : [...list, g]))
                                }
                              >
                                {g}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </fieldset>
                )}

                {step === 1 && (
                  <fieldset className="panel">
                    <legend className="panel-title">Where shall we meet?</legend>
                    <div className="choices three">
                      {PLACES.map((p) => (
                        <label key={p.id} className={`choice${place?.id === p.id ? ' picked' : ''}`}>
                          <input
                            type="radio"
                            name="place"
                            value={p.id}
                            checked={place?.id === p.id}
                            onChange={() => setPlace(p)}
                          />
                          <span className="choice-name">{p.name}</span>
                          <span className="choice-detail">{p.detail}</span>
                        </label>
                      ))}
                    </div>
                    {place && (
                      <div className="field">
                        <label htmlFor="address">
                          {place.id === 'club' ? 'Club name and address' : place.id === 'office' ? 'Company and address' : 'Address'}
                        </label>
                        <textarea
                          id="address"
                          rows={3}
                          autoComplete="street-address"
                          placeholder={place.id === 'club' ? 'Club name, street, city' : 'Street, suite or floor, city'}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                        <p className="hint">Greater Boston, within Route 128. Further afield? Mention it in your notes.</p>
                      </div>
                    )}
                  </fieldset>
                )}

                {step === 2 && (
                  <fieldset className="panel">
                    <legend className="panel-title">Choose a date and time</legend>
                    <div className="when">
                      <Calendar
                        today={today}
                        month={month}
                        setMonth={setMonth}
                        selected={date}
                        length={length}
                        onPick={(d) => setDate(d)}
                      />
                      <div className="times" aria-live="polite">
                        {!date ? (
                          <p className="times-empty">Select a day to see open times.</p>
                        ) : (
                          <>
                            <p className="times-day">{fmtDate(date)}</p>
                            <TimeGroups slots={slots} time={time} setTime={setTime} />
                          </>
                        )}
                      </div>
                    </div>
                    <p className="hint center">All times Eastern. Appointment length: {fmtLength(length)}.</p>
                  </fieldset>
                )}

                {step === 3 && (
                  <fieldset className="panel">
                    <legend className="panel-title">A little about you</legend>
                    <div className="fields">
                      <div className="field">
                        <label htmlFor="name">Full name</label>
                        <input
                          id="name"
                          autoComplete="name"
                          value={details.name}
                          onChange={(e) => setDetails({ ...details, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="field half">
                        <label htmlFor="bemail">Email</label>
                        <input
                          id="bemail"
                          type="email"
                          autoComplete="email"
                          value={details.email}
                          onChange={(e) => setDetails({ ...details, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="field half">
                        <label htmlFor="phone">Phone <span className="optional">optional</span></label>
                        <input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          value={details.phone}
                          onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="notes">Anything we should know? <span className="optional">optional</span></label>
                        <textarea
                          id="notes"
                          rows={4}
                          placeholder="An occasion you’re dressing for, a jacket you love, how you’d like it to feel…"
                          value={details.notes}
                          onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="referral">How did you hear about us? <span className="optional">optional</span></label>
                        <select
                          id="referral"
                          value={details.referral}
                          onChange={(e) => setDetails({ ...details, referral: e.target.value })}
                        >
                          <option value="">Select one</option>
                          <option>A friend or colleague</option>
                          <option>Instagram</option>
                          <option>Search</option>
                          <option>Press</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <p className="policy">
                      Need to change plans? Reschedule or cancel up to 24 hours ahead by replying to your confirmation.
                    </p>
                  </fieldset>
                )}

                <div className="nav">
                  {step > 0 ? (
                    <button type="button" className="ghost" onClick={() => go(step - 1)}>
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={() => go(step + 1)} disabled={!canContinue[step]}>
                      Continue
                    </button>
                  ) : (
                    <button type="submit" disabled={!canContinue.every(Boolean)}>
                      Request appointment
                    </button>
                  )}
                </div>
              </div>

              <Summary
                appointment={appointment}
                garments={garments}
                place={place}
                address={address}
                date={date}
                time={time}
                onEdit={go}
              />
            </form>
          </>
        )}
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

function Calendar({ today, month, setMonth, selected, length, onPick }) {
  if (!today || !month) return <div className="calendar" aria-busy="true" />
  const first = addDays(today, LEAD_DAYS)
  const last = addDays(today, WINDOW_DAYS)
  const firstMonth = new Date(first.getFullYear(), first.getMonth(), 1)
  const lastMonth = new Date(last.getFullYear(), last.getMonth(), 1)
  const lead = month.getDay()
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d))

  const shift = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1))

  return (
    <div className="calendar">
      <div className="cal-head">
        <button type="button" className="cal-arrow" onClick={() => shift(-1)} disabled={month <= firstMonth} aria-label="Previous month">
          ‹
        </button>
        <p className="cal-month">
          {MONTHS[month.getMonth()]} <span>{month.getFullYear()}</span>
        </p>
        <button type="button" className="cal-arrow" onClick={() => shift(1)} disabled={month >= lastMonth} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="cal-grid" role="grid">
        {WEEKDAYS.map((w) => (
          <span key={w} className="cal-dow" aria-hidden="true">{w.slice(0, 2)}</span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`x${i}`} />
          const inWindow = d >= first && d <= last
          const open = inWindow && slotsFor(d, length).some((s) => !s.taken)
          const isSel = sameDay(d, selected)
          return (
            <button
              type="button"
              key={dayKey(d)}
              className={`cal-day${open ? ' open' : ''}${isSel ? ' sel' : ''}${sameDay(d, today) ? ' today' : ''}`}
              disabled={!open}
              aria-pressed={isSel}
              aria-label={`${fmtDate(d)}${open ? '' : ', unavailable'}`}
              onClick={() => onPick(d)}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
      <p className="cal-key"><span className="dot" /> Times available</p>
    </div>
  )
}

function TimeGroups({ slots, time, setTime }) {
  const groups = [
    ['Morning', (m) => m < 12 * 60],
    ['Afternoon', (m) => m >= 12 * 60 && m < 17 * 60],
    ['Evening', (m) => m >= 17 * 60],
  ]
  const open = slots.filter((s) => !s.taken)
  if (!open.length) return <p className="times-empty">This day is fully booked.</p>
  return groups.map(([label, test]) => {
    const list = open.filter((s) => test(s.minutes))
    if (!list.length) return null
    return (
      <div key={label} className="time-group">
        <p className="small-caps time-label">{label}</p>
        <div className="time-list">
          {list.map((s) => (
            <button
              type="button"
              key={s.minutes}
              className={`slot${time === s.minutes ? ' on' : ''}`}
              aria-pressed={time === s.minutes}
              onClick={() => setTime(s.minutes)}
            >
              {fmtTime(s.minutes)}
            </button>
          ))}
        </div>
      </div>
    )
  })
}

function Summary({ appointment, garments, place, address, date, time, onEdit }) {
  const rows = [
    ['Appointment', appointment ? `${appointment.name}` : null, appointment ? fmtLength(appointment.length) : null, 0],
    ['Considering', garments.length ? garments.join(', ') : null, null, 0],
    ['Place', place ? place.name : null, address.trim() || null, 1],
    ['When', date ? fmtDate(date) : null, time != null ? fmtTime(time) : null, 2],
  ]
  return (
    <aside className="summary" aria-label="Your appointment">
      <Monogram className="summary-seal" />
      <p className="small-caps summary-title">Your Appointment</p>
      <dl>
        {rows.map(([label, value, sub, s]) =>
          label === 'Considering' && !value ? null : (
            <div key={label} className="summary-row">
              <dt>{label}</dt>
              <dd>
                {value ? (
                  <>
                    <span className="value">{value}</span>
                    {sub && <span className="sub-value">{sub}</span>}
                    <button type="button" className="edit" onClick={() => onEdit(s)}>Change</button>
                  </>
                ) : (
                  <span className="pending">—</span>
                )}
              </dd>
            </div>
          )
        )}
      </dl>
      <p className="summary-note">
        Complimentary. No deposit is taken until you place an order.
      </p>
    </aside>
  )
}

function Confirmation({ booking }) {
  const [href, setHref] = useState(null)
  useEffect(() => {
    const url = URL.createObjectURL(new Blob([icsFor(booking)], { type: 'text/calendar' }))
    setHref(url)
    return () => URL.revokeObjectURL(url)
  }, [booking])
  const first = booking.name.trim().split(/\s+/)[0]

  return (
    <section className="confirmation wrap">
      <div className="card">
        <Monogram className="seal" />
        <p className="small-caps eyebrow">Request received · {booking.ref}</p>
        <h1 className="book-title">Thank you, {first}.</h1>
        <p className="body">
          Andrew will confirm your appointment personally by email at <em>{booking.email}</em>, usually within the day.
        </p>
        <dl className="confirm-details">
          <div>
            <dt>Appointment</dt>
            <dd>{booking.appointment.name} · {fmtLength(booking.appointment.length)}</dd>
          </div>
          <div>
            <dt>When</dt>
            <dd>{fmtDate(booking.date)} at {fmtTime(booking.time)}</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>{booking.place.name}<br /><span className="sub-value">{booking.address}</span></dd>
          </div>
        </dl>
        <div className="confirm-actions">
          {href && (
            <a className="button" href={href} download="finest-form-appointment.ics">Add to calendar</a>
          )}
          <a className="place" href="/">Return to Finest Form</a>
        </div>
      </div>

      <div className="prepare">
        <h2 className="section-title">Before We Meet</h2>
        <div className="columns">
          <div className="column">
            <span className="numeral">I</span>
            <h3>Wear</h3>
            <p className="detail">The shoes and shirt you’d usually wear with a suit, so the proportions are right from the start.</p>
          </div>
          <div className="column">
            <span className="numeral">II</span>
            <h3>Bring</h3>
            <p className="detail">A jacket or pair of trousers you love, and a photo or two of anything that caught your eye.</p>
          </div>
          <div className="column">
            <span className="numeral">III</span>
            <h3>Allow</h3>
            <p className="detail">A little quiet time. We’ll bring cloth books, a mirror and everything else.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
