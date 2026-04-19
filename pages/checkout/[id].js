import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Header from '@components/Header';
import Footer from '@components/Footer';
import { cards, getCardById } from '../../data/cards';

const STEPS = ['Review Order', 'Shipping', 'Payment', 'Confirmed'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
      {STEPS.map((label, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: i < current ? 'var(--green)' : i === current ? 'var(--gold)' : 'var(--bg-4)',
              border: `2px solid ${i < current ? 'var(--green)' : i === current ? 'var(--gold)' : 'var(--border-2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
              color: i <= current ? '#000' : 'var(--text-4)',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: i === current ? 700 : 400,
              color: i === current ? 'var(--text)' : 'var(--text-4)',
            }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 1, background: i < current ? 'var(--green)' : 'var(--border)', margin: '0 12px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function CardSummary({ card, compact }) {
  const initials = card.player.split(' ').map(w => w[0]).join('').slice(0, 2);
  return (
    <div style={{
      display: 'flex',
      gap: 16,
      alignItems: compact ? 'center' : 'flex-start',
    }}>
      <div style={{
        width: compact ? 48 : 64,
        height: compact ? 48 : 64,
        borderRadius: 10,
        background: `${card.cardColor}18`,
        border: `2px solid ${card.cardColor}33`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: compact ? 14 : 18,
        color: card.cardColor,
        flexShrink: 0,
      }}>
        {initials}
      </div>
      <div>
        <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: compact ? '0.9rem' : '1rem', marginBottom: 2 }}>
          {card.player}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', lineHeight: 1.5 }}>
          {card.year} {card.brand} · {card.card}<br />
          {card.grade} · {card.sport}
        </p>
      </div>
    </div>
  );
}

export default function Checkout({ card }) {
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', state: '', zip: '', country: 'US' });
  const [payment, setPayment] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [shippingErrors, setShippingErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});
  const [orderNum] = useState(() => 'VL-' + Math.random().toString(36).slice(2, 8).toUpperCase());

  if (!card) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-4)', marginBottom: 16 }}>Card not found.</p>
          <Link href="/marketplace" passHref><a className="btn btn-primary">Back to Marketplace</a></Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  const setS = k => e => setShipping(s => ({ ...s, [k]: e.target.value }));
  const setP = k => e => setPayment(p => ({ ...p, [k]: e.target.value }));

  const validateShipping = () => {
    const e = {};
    if (!shipping.name.trim()) e.name = 'Required';
    if (!shipping.address.trim()) e.address = 'Required';
    if (!shipping.city.trim()) e.city = 'Required';
    if (!shipping.state.trim()) e.state = 'Required';
    if (!shipping.zip.trim()) e.zip = 'Required';
    setShippingErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e = {};
    if (!payment.name.trim()) e.name = 'Required';
    if (!payment.number.trim() || payment.number.replace(/\s/g, '').length < 16) e.number = 'Enter a valid card number';
    if (!payment.expiry.trim()) e.expiry = 'Required';
    if (!payment.cvv.trim() || payment.cvv.length < 3) e.cvv = 'Required';
    setPaymentErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatCardNumber = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = v => v.replace(/\D/g, '').slice(0, 4).replace(/^(.{2})(.+)/, '$1/$2');

  const fieldErr = (errs, key) => errs[key] ? (
    <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errs[key]}</p>
  ) : null;

  const inputCls = (errs, key) => errs[key] ? { borderColor: 'var(--red)' } : {};

  return (
    <>
      <Head>
        <title>Checkout — VaultLink</title>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1, padding: '48px 0 80px' }}>
          <div className="container-sm">

            <StepIndicator current={step} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}
              className="checkout-layout">

              {/* Left: Step content */}
              <div>

                {/* Step 0: Review */}
                {step === 0 && (
                  <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 24, color: 'var(--text)' }}>
                      Review your order
                    </h1>

                    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: 20 }}>
                      <CardSummary card={card} />
                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                          ['Card price', `$${card.price.toLocaleString()}`],
                          ['Buyer fee', '$0 — always'],
                          ['Estimated shipping', 'Free'],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-4)', fontSize: '0.9rem' }}>{k}</span>
                            <span style={{ color: k === 'Buyer fee' ? 'var(--green)' : 'var(--text)', fontWeight: k === 'Buyer fee' ? 600 : 400, fontSize: '0.9rem' }}>{v}</span>
                          </div>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text)' }}>Total</span>
                          <span style={{ fontWeight: 900, color: 'var(--text)', fontSize: '1.1rem' }}>${card.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                      borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: 24,
                    }}>
                      <p style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.85rem', marginBottom: 6 }}>
                        Protected by VaultLink Authentication
                      </p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-4)', lineHeight: 1.6 }}>
                        Your card is inspected by our expert team before it ships to you. If it fails authentication, you get a full refund — no questions asked.
                      </p>
                    </div>

                    <button className="btn btn-primary" onClick={() => setStep(1)} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
                      Continue to Shipping
                    </button>
                  </div>
                )}

                {/* Step 1: Shipping */}
                {step === 1 && (
                  <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 24, color: 'var(--text)' }}>
                      Shipping address
                    </h1>

                    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: 24 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
                            Full Name <span style={{ color: 'var(--gold)' }}>*</span>
                          </label>
                          <input className="input" placeholder="John Smith" value={shipping.name} onChange={setS('name')} style={inputCls(shippingErrors, 'name')} />
                          {fieldErr(shippingErrors, 'name')}
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
                            Street Address <span style={{ color: 'var(--gold)' }}>*</span>
                          </label>
                          <input className="input" placeholder="123 Main St, Apt 4B" value={shipping.address} onChange={setS('address')} style={inputCls(shippingErrors, 'address')} />
                          {fieldErr(shippingErrors, 'address')}
                        </div>

                        <div className="form-row">
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
                              City <span style={{ color: 'var(--gold)' }}>*</span>
                            </label>
                            <input className="input" placeholder="New York" value={shipping.city} onChange={setS('city')} style={inputCls(shippingErrors, 'city')} />
                            {fieldErr(shippingErrors, 'city')}
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
                              State <span style={{ color: 'var(--gold)' }}>*</span>
                            </label>
                            <input className="input" placeholder="NY" value={shipping.state} onChange={setS('state')} style={inputCls(shippingErrors, 'state')} />
                            {fieldErr(shippingErrors, 'state')}
                          </div>
                        </div>

                        <div className="form-row">
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
                              ZIP Code <span style={{ color: 'var(--gold)' }}>*</span>
                            </label>
                            <input className="input" placeholder="10001" value={shipping.zip} onChange={setS('zip')} style={inputCls(shippingErrors, 'zip')} />
                            {fieldErr(shippingErrors, 'zip')}
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>Country</label>
                            <select className="input" value={shipping.country} onChange={setS('country')}>
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="GB">United Kingdom</option>
                              <option value="AU">Australia</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn btn-ghost" onClick={() => setStep(0)} style={{ flexShrink: 0 }}>← Back</button>
                      <button className="btn btn-primary" onClick={() => { if (validateShipping()) setStep(2); }} style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 24, color: 'var(--text)' }}>
                      Payment
                    </h1>

                    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: 20 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        {['VISA', 'MC', 'AMEX', 'DISC'].map(b => (
                          <div key={b} style={{
                            padding: '4px 10px',
                            background: 'var(--bg-4)',
                            border: '1px solid var(--border-2)',
                            borderRadius: 5,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--text-4)',
                          }}>{b}</div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
                            Name on card <span style={{ color: 'var(--gold)' }}>*</span>
                          </label>
                          <input className="input" placeholder="John Smith" value={payment.name} onChange={setP('name')} style={inputCls(paymentErrors, 'name')} />
                          {fieldErr(paymentErrors, 'name')}
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
                            Card number <span style={{ color: 'var(--gold)' }}>*</span>
                          </label>
                          <input
                            className="input"
                            placeholder="1234 5678 9012 3456"
                            value={payment.number}
                            onChange={e => setPayment(p => ({ ...p, number: formatCardNumber(e.target.value) }))}
                            style={{ fontFamily: 'monospace', letterSpacing: '0.08em', ...inputCls(paymentErrors, 'number') }}
                          />
                          {fieldErr(paymentErrors, 'number')}
                        </div>

                        <div className="form-row">
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
                              Expiry <span style={{ color: 'var(--gold)' }}>*</span>
                            </label>
                            <input
                              className="input"
                              placeholder="MM/YY"
                              value={payment.expiry}
                              onChange={e => setPayment(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                              style={{ fontFamily: 'monospace', ...inputCls(paymentErrors, 'expiry') }}
                            />
                            {fieldErr(paymentErrors, 'expiry')}
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
                              CVV <span style={{ color: 'var(--gold)' }}>*</span>
                            </label>
                            <input
                              className="input"
                              placeholder="123"
                              maxLength={4}
                              value={payment.cvv}
                              onChange={e => setPayment(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))}
                              style={{ fontFamily: 'monospace', ...inputCls(paymentErrors, 'cvv') }}
                            />
                            {fieldErr(paymentErrors, 'cvv')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: 'var(--text-4)', fontSize: '0.78rem', marginBottom: 20,
                    }}>
                      <span>🔒</span>
                      <span>Payments are encrypted and secure. VaultLink never stores your card details.</span>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flexShrink: 0 }}>← Back</button>
                      <button
                        className="btn btn-primary"
                        onClick={() => { if (validatePayment()) setStep(3); }}
                        style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
                      >
                        Place Order — ${card.price.toLocaleString()}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmed */}
                {step === 3 && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'var(--green-bg)',
                      border: '2px solid var(--green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      color: 'var(--green)',
                      margin: '0 auto 24px',
                    }}>
                      ✓
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--text)' }}>
                      Order confirmed!
                    </h1>
                    <p style={{ color: 'var(--text-4)', marginBottom: 4 }}>
                      Order <span style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{orderNum}</span>
                    </p>
                    <p style={{ color: 'var(--text-4)', fontSize: '0.88rem', marginBottom: 32, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 32px' }}>
                      We've notified the seller to ship the card to our Authentication Center. You'll receive email updates at each step — authentication typically completes within 48 hours.
                    </p>

                    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: 28, textAlign: 'left', maxWidth: 380, margin: '0 auto 28px' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 14 }}>What happens next</p>
                      {[
                        ['Seller ships to us', 'Within 3 business days'],
                        ['Authentication check', 'Within 48 hours of receipt'],
                        ['Ships to you', '3–5 business days after auth'],
                      ].map(([step, time]) => (
                        <div key={step} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: 6 }} />
                          <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>{step}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Link href="/marketplace" passHref>
                        <a className="btn btn-primary">Continue Shopping</a>
                      </Link>
                      <Link href="/dashboard" passHref>
                        <a className="btn btn-outline">View Dashboard</a>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Order summary sidebar */}
              {step < 3 && (
                <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', position: 'sticky', top: 80 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 16 }}>Order Summary</p>
                  <CardSummary card={card} compact />
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      ['Subtotal', `$${card.price.toLocaleString()}`],
                      ['Buyer fee', '$0'],
                      ['Shipping', 'Free'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-4)' }}>{k}</span>
                        <span style={{ color: k === 'Buyer fee' ? 'var(--green)' : 'var(--text)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>Total</span>
                    <span style={{ fontWeight: 900, color: 'var(--gold)', fontSize: '1.2rem' }}>${card.price.toLocaleString()}</span>
                  </div>
                  <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--green)' }}>
                    ✓ Authentication included — expert verified before delivery
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: cards.map(c => ({ params: { id: String(c.id) } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const card = getCardById(params.id);
  return { props: { card: card || null } };
}
