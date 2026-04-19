import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Header from '@components/Header';
import Footer from '@components/Footer';

const SPORTS = ['Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer', 'Golf', 'Tennis', 'MMA'];
const BRANDS = ['Panini Prizm', 'Topps Chrome', 'Bowman Chrome', 'Upper Deck', 'Topps', 'Panini Optic', 'Leaf', 'Donruss Optic', 'Select', 'National Treasures'];
const GRADERS = ['PSA', 'BGS (Beckett)', 'SGC', 'CGC', 'Raw (Ungraded)'];
const GRADES_BY_GRADER = {
  'PSA': ['PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'PSA 6'],
  'BGS (Beckett)': ['BGS 9.5', 'BGS 9', 'BGS 8.5', 'BGS 8'],
  'SGC': ['SGC 10', 'SGC 9.5', 'SGC 9', 'SGC 8'],
  'CGC': ['CGC 10', 'CGC 9.5', 'CGC 9', 'CGC 8'],
  'Raw (Ungraded)': ['Raw'],
};

function PlanCard({ name, price, limit, features, isGold, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: 'var(--bg-3)',
        border: `2px solid ${selected ? 'var(--gold)' : isGold ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        position: 'relative',
        transform: selected ? 'scale(1.01)' : 'scale(1)',
        boxShadow: selected ? '0 0 0 3px rgba(245,158,11,0.15)' : 'none',
      }}
    >
      {isGold && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--gold)', color: '#000', fontWeight: 800, fontSize: '0.7rem',
          padding: '3px 12px', borderRadius: 100, letterSpacing: '0.08em', whiteSpace: 'nowrap',
        }}>
          BEST VALUE
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontWeight: 700, color: isGold ? 'var(--gold)' : 'var(--text-3)', marginBottom: 6 }}>{name}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: isGold ? 'var(--gold)' : 'var(--text)', letterSpacing: '-0.03em' }}>
              ${price}
            </span>
            <span style={{ color: 'var(--text-4)', fontSize: '0.9rem' }}>/month</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-4)', marginTop: 4 }}>{limit}</p>
        </div>
        <div style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: `2px solid ${selected ? 'var(--gold)' : 'var(--border-2)'}`,
          background: selected ? 'var(--gold)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 4,
        }}>
          {selected && <span style={{ fontSize: 12, color: '#000', fontWeight: 700 }}>✓</span>}
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        {features.map(f => (
          <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{ color: isGold ? 'var(--gold)' : 'var(--green)', fontSize: '0.8rem', flexShrink: 0 }}>✓</span>
            <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormField({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--text-3)',
        marginBottom: 6,
      }}>
        {label}{required && <span style={{ color: 'var(--gold)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

const EMPTY_FORM = {
  player: '',
  year: '',
  brand: '',
  card: '',
  sport: '',
  team: '',
  grader: '',
  grade: '',
  serial: '',
  price: '',
  description: '',
};

export default function Sell() {
  const [step, setStep] = useState(1); // 1=plan, 2=form, 3=success
  const [plan, setPlan] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const gradeOptions = form.grader ? GRADES_BY_GRADER[form.grader] || [] : [];

  const validate = () => {
    const e = {};
    if (!form.player.trim()) e.player = 'Required';
    if (!form.year || isNaN(form.year) || form.year < 1900 || form.year > 2030) e.year = 'Enter a valid year';
    if (!form.brand) e.brand = 'Required';
    if (!form.card.trim()) e.card = 'Required';
    if (!form.sport) e.sport = 'Required';
    if (!form.grader) e.grader = 'Required';
    if (!form.grade) e.grade = 'Required';
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) e.price = 'Enter a valid price';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) setStep(3);
  };

  const inputStyle = (field) => ({
    ...{},
    borderColor: errors[field] ? 'var(--red)' : undefined,
  });

  return (
    <>
      <Head>
        <title>List a Card — VaultLink</title>
        <meta name="description" content="List your sports card on VaultLink. 0% marketplace fees." />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1, padding: '48px 0 80px' }}>
          <div className="container-sm">

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
              {[['1', 'Choose Plan'], ['2', 'Card Details'], ['3', 'Done']].map(([num, label], i) => (
                <div key={num} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--gold)' : 'var(--bg-4)',
                      border: `2px solid ${step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--gold)' : 'var(--border-2)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                      color: step >= i + 1 ? '#000' : 'var(--text-4)',
                    }}>
                      {step > i + 1 ? '✓' : num}
                    </div>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: step === i + 1 ? 700 : 400,
                      color: step === i + 1 ? 'var(--text)' : 'var(--text-4)',
                    }}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div style={{ flex: 1, height: 1, background: step > i + 1 ? 'var(--green)' : 'var(--border)', margin: '0 12px' }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 1: Choose Plan ── */}
            {step === 1 && (
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--text)' }}>
                  Choose your plan
                </h1>
                <p style={{ color: 'var(--text-4)', marginBottom: 32 }}>
                  Both plans include 0% transaction fees. Cancel anytime.
                </p>

                <div className="pricing-grid" style={{ marginBottom: 32 }}>
                  <PlanCard
                    name="Starter"
                    price="49"
                    limit="Up to 50 active listings"
                    selected={plan === 'starter'}
                    onSelect={() => setPlan('starter')}
                    features={['Up to 50 active listings', '0% marketplace fees', 'Expert authentication', 'Buyer & seller protection', 'Analytics dashboard']}
                  />
                  <PlanCard
                    name="Pro"
                    price="499"
                    limit="Unlimited listings"
                    isGold
                    selected={plan === 'pro'}
                    onSelect={() => setPlan('pro')}
                    features={['Unlimited active listings', '0% marketplace fees', 'Priority 24hr authentication', 'Dedicated account manager', 'API access & bulk tools']}
                  />
                </div>

                <div style={{
                  background: 'var(--green-bg)',
                  border: '1px solid var(--green-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 18px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 28,
                }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
                    No commissions, no per-sale fees — ever. Your subscription is the only charge.
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  disabled={!plan}
                  onClick={() => setStep(2)}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '16px',
                    fontSize: '1rem',
                    opacity: plan ? 1 : 0.4,
                    cursor: plan ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continue with {plan === 'starter' ? 'Starter — $49/mo' : plan === 'pro' ? 'Pro — $499/mo' : 'a plan'}
                </button>

                <p style={{ textAlign: 'center', color: 'var(--text-4)', fontSize: '0.8rem', marginTop: 12 }}>
                  Already a member?{' '}
                  <Link href="/dashboard" passHref>
                    <a style={{ color: 'var(--gold)', textDecoration: 'none' }}>Go to dashboard →</a>
                  </Link>
                </p>
              </div>
            )}

            {/* ── Step 2: Listing Form ── */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                    List your card
                  </h1>
                  <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>
                    {plan === 'pro' ? 'Pro Plan' : 'Starter Plan'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-4)', marginBottom: 32 }}>
                  Fill in the details below. Your card will be live immediately after submission.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: 20 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 20, fontSize: '0.95rem' }}>Card Identity</p>

                    <div className="form-row">
                      <FormField label="Player / Subject" required>
                        <input className="input" placeholder="e.g. Patrick Mahomes" value={form.player} onChange={set('player')} style={inputStyle('player')} />
                        {errors.player && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.player}</p>}
                      </FormField>

                      <FormField label="Year" required>
                        <input className="input" type="number" placeholder="e.g. 2017" value={form.year} onChange={set('year')} style={inputStyle('year')} min="1900" max="2030" />
                        {errors.year && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.year}</p>}
                      </FormField>

                      <FormField label="Brand / Set" required>
                        <select className="input" value={form.brand} onChange={set('brand')} style={inputStyle('brand')}>
                          <option value="">Select brand…</option>
                          {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        {errors.brand && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.brand}</p>}
                      </FormField>

                      <FormField label="Sport" required>
                        <select className="input" value={form.sport} onChange={set('sport')} style={inputStyle('sport')}>
                          <option value="">Select sport…</option>
                          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.sport && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.sport}</p>}
                      </FormField>
                    </div>

                    <FormField label="Card Name / Variation" required hint="e.g. Rookie Autograph Silver Prizm, or simply Rookie Card">
                      <input className="input" placeholder="e.g. Rookie Autograph Silver Prizm" value={form.card} onChange={set('card')} style={inputStyle('card')} />
                      {errors.card && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.card}</p>}
                    </FormField>

                    <FormField label="Team" hint="Optional but helps buyers find the card">
                      <input className="input" placeholder="e.g. Kansas City Chiefs" value={form.team} onChange={set('team')} />
                    </FormField>
                  </div>

                  <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: 20 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 20, fontSize: '0.95rem' }}>Grading</p>

                    <div className="form-row">
                      <FormField label="Grading Company" required>
                        <select className="input" value={form.grader} onChange={e => { set('grader')(e); setForm(f => ({ ...f, grader: e.target.value, grade: '' })); }} style={inputStyle('grader')}>
                          <option value="">Select grader…</option>
                          {GRADERS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        {errors.grader && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.grader}</p>}
                      </FormField>

                      <FormField label="Grade" required>
                        <select className="input" value={form.grade} onChange={set('grade')} disabled={!form.grader} style={inputStyle('grade')}>
                          <option value="">Select grade…</option>
                          {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        {errors.grade && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.grade}</p>}
                      </FormField>
                    </div>

                    <FormField label="Cert / Serial Number" hint="The certification number on the slab (helps buyers verify authenticity)">
                      <input className="input" placeholder="e.g. 12345678" value={form.serial} onChange={set('serial')} />
                    </FormField>
                  </div>

                  <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: 20 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 20, fontSize: '0.95rem' }}>Pricing & Description</p>

                    <FormField label="Asking Price (USD)" required hint="You receive 100% of this amount — no deductions">
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                          color: 'var(--text-4)', fontWeight: 600,
                        }}>$</span>
                        <input
                          className="input"
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="0.00"
                          value={form.price}
                          onChange={set('price')}
                          style={{ paddingLeft: 24, ...inputStyle('price') }}
                        />
                      </div>
                      {errors.price && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.price}</p>}
                      {form.price && !errors.price && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--green)', marginTop: 5 }}>
                          You receive: ${parseFloat(form.price).toLocaleString(undefined, { minimumFractionDigits: 2 })} (0% fees)
                        </p>
                      )}
                    </FormField>

                    <FormField label="Description" hint="Describe the card's condition, eye appeal, centering, any notable attributes">
                      <textarea
                        className="input"
                        rows={4}
                        placeholder="e.g. Pristine gem mint example. Perfect centering 50/50. Sharp corners. Clean surfaces with no print lines..."
                        value={form.description}
                        onChange={set('description')}
                        style={{ resize: 'vertical' }}
                      />
                    </FormField>
                  </div>

                  {/* Auth notice */}
                  <div style={{
                    background: 'var(--green-bg)',
                    border: '1px solid var(--green-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px 20px',
                    marginBottom: 24,
                  }}>
                    <p style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.88rem', marginBottom: 6 }}>
                      Authentication included
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-4)', lineHeight: 1.6 }}>
                      When your card sells, ship it to our Authentication Center. We inspect it within {plan === 'pro' ? '24' : '48'} hours before it reaches the buyer. If it fails, the buyer is refunded and the card is returned to you.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: '0 0 auto' }}>
                      ← Back
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
                      List Card for ${form.price ? parseFloat(form.price).toLocaleString() : '—'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Step 3: Success ── */}
            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'var(--green-bg)',
                  border: '2px solid var(--green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  margin: '0 auto 24px',
                  color: 'var(--green)',
                }}>
                  ✓
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12, color: 'var(--text)' }}>
                  Card listed!
                </h1>
                <p style={{ color: 'var(--text-4)', marginBottom: 8, maxWidth: 440, margin: '0 auto 8px' }}>
                  <strong style={{ color: 'var(--text)' }}>{form.player}</strong> — {form.year} {form.brand} {form.card} is now live on the marketplace.
                </p>
                <p style={{ color: 'var(--text-4)', fontSize: '0.88rem', maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7 }}>
                  When a buyer purchases your card, you will receive shipping instructions to send it to our Authentication Center.
                </p>

                <div style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '20px 24px',
                  maxWidth: 400,
                  margin: '0 auto 32px',
                  textAlign: 'left',
                }}>
                  {[
                    ['Player', form.player],
                    ['Card', `${form.year} ${form.brand} ${form.card}`],
                    ['Grade', form.grade],
                    ['Asking Price', `$${parseFloat(form.price).toLocaleString()} (0% fees)`],
                    ['Plan', plan === 'pro' ? 'Pro — $499/mo' : 'Starter — $49/mo'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', gap: 16 }}>
                      <span style={{ color: 'var(--text-4)', fontSize: '0.85rem' }}>{k}</span>
                      <span style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/dashboard" passHref>
                    <a className="btn btn-primary">View Dashboard</a>
                  </Link>
                  <button className="btn btn-outline" onClick={() => { setForm(EMPTY_FORM); setStep(2); }}>
                    List Another Card
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
