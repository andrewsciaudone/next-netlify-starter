import Head from 'next/head';
import Link from 'next/link';
import Header from '@components/Header';
import Footer from '@components/Footer';

const STARTER_FEATURES = [
  ['Up to 50 active card listings', true],
  ['0% marketplace fees', true],
  ['Expert authentication on every sale', true],
  ['Buyer & seller protection', true],
  ['Sales analytics dashboard', true],
  ['Email support', true],
  ['Priority 24-hour authentication', false],
  ['Dedicated account manager', false],
  ['API access', false],
  ['Bulk listing tools', false],
];

const PRO_FEATURES = [
  ['Unlimited active card listings', true],
  ['0% marketplace fees', true],
  ['Expert authentication on every sale', true],
  ['Buyer & seller protection', true],
  ['Advanced analytics & insights', true],
  ['Priority support', true],
  ['Priority 24-hour authentication', true],
  ['Dedicated account manager', true],
  ['API access', true],
  ['Bulk listing tools', true],
];

const FAQS = [
  {
    q: 'Are there really zero fees?',
    a: 'Yes. VaultLink charges sellers a flat monthly subscription ($49 or $499) and nothing else. Buyers pay no fees at all — the listed price is exactly what you pay. We never take a cut of your sales.',
  },
  {
    q: 'How does authentication work?',
    a: 'When a card sells, the seller ships it to our Authentication Center. Our expert team inspects the card within 48 hours (24 hours on Pro). We verify the grade, check for trimming or alterations, and confirm it is genuine. Once it passes, we ship it sealed directly to the buyer.',
  },
  {
    q: 'What happens if my card fails authentication?',
    a: 'If a card fails our authentication check, we return it to the seller and the buyer receives a full refund. Sellers who repeatedly list misrepresented cards may be suspended.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes, you can change your plan at any time. If you upgrade, you will be charged the prorated difference immediately. If you downgrade, the change takes effect at the next billing cycle.',
  },
  {
    q: 'What grades do you accept?',
    a: 'We accept cards graded by PSA, BGS (Beckett), SGC, and CGC. We also accept ungraded raw cards — buyers will see them listed as "Raw" and our team still authenticates genuineness and condition.',
  },
  {
    q: 'How long does it take to get paid as a seller?',
    a: 'Once a buyer confirms receipt of the authenticated card, payment is released to your account within 1-3 business days via bank transfer or check.',
  },
];

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing — VaultLink</title>
        <meta name="description" content="Simple, transparent pricing. $49/mo for up to 50 listings, $499/mo for unlimited. Zero sales fees." />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1 }}>
          {/* Hero */}
          <section style={{
            padding: '72px 0 60px',
            textAlign: 'center',
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 70%)',
            borderBottom: '1px solid var(--border)',
          }}>
            <div className="container">
              <p className="section-label">Pricing</p>
              <h1 style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                marginBottom: 16,
                color: 'var(--text)',
              }}>
                One flat fee. Zero commissions.
              </h1>
              <p style={{
                color: 'var(--text-4)',
                fontSize: '1.05rem',
                maxWidth: 520,
                margin: '0 auto',
                lineHeight: 1.7,
              }}>
                Pay a predictable monthly subscription. Sell as much as your plan allows and keep every dollar.
              </p>
            </div>
          </section>

          {/* Plans */}
          <section style={{ padding: '64px 0' }}>
            <div className="container">
              <div className="pricing-grid">
                {/* Starter */}
                <div style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '40px 36px',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <div style={{ marginBottom: 32 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-3)', fontSize: '0.9rem', marginBottom: 16 }}>
                      Starter
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text)' }}>
                        $49
                      </span>
                      <span style={{ color: 'var(--text-4)', fontSize: '0.95rem' }}>/month</span>
                    </div>
                    <p style={{ color: 'var(--text-4)', fontSize: '0.875rem' }}>
                      Perfect for individual collectors and casual sellers.
                    </p>
                    <div style={{
                      marginTop: 16,
                      padding: '8px 14px',
                      background: 'rgba(100,116,139,0.08)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'inline-block',
                    }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.875rem' }}>
                        Up to 50 listings
                      </span>
                    </div>
                  </div>

                  <div style={{ flex: 1, marginBottom: 32 }}>
                    {STARTER_FEATURES.map(([label, included]) => (
                      <div key={label} style={{
                        display: 'flex',
                        gap: 10,
                        marginBottom: 14,
                        opacity: included ? 1 : 0.35,
                      }}>
                        <span style={{ color: included ? 'var(--green)' : 'var(--text-4)', flexShrink: 0, fontWeight: 700 }}>
                          {included ? '✓' : '✗'}
                        </span>
                        <span style={{ color: included ? 'var(--text-2)' : 'var(--text-4)', fontSize: '0.9rem' }}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-outline w-full" style={{ justifyContent: 'center', padding: '14px' }}>
                    Get Started — $49/mo
                  </button>
                </div>

                {/* Pro */}
                <div style={{
                  background: 'var(--bg-3)',
                  border: '2px solid var(--gold)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '40px 36px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--gold)',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    padding: '4px 16px',
                    borderRadius: 100,
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                  }}>
                    MOST POPULAR
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <p style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem', marginBottom: 16 }}>
                      Pro
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--gold)' }}>
                        $499
                      </span>
                      <span style={{ color: 'var(--text-4)', fontSize: '0.95rem' }}>/month</span>
                    </div>
                    <p style={{ color: 'var(--text-4)', fontSize: '0.875rem' }}>
                      For serious dealers and high-volume sellers.
                    </p>
                    <div style={{
                      marginTop: 16,
                      padding: '8px 14px',
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.25)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'inline-block',
                    }}>
                      <span style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.875rem' }}>
                        Unlimited listings
                      </span>
                    </div>
                  </div>

                  <div style={{ flex: 1, marginBottom: 32 }}>
                    {PRO_FEATURES.map(([label, included]) => (
                      <div key={label} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <span style={{ color: 'var(--gold)', flexShrink: 0, fontWeight: 700 }}>✓</span>
                        <span style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '14px' }}>
                    Go Pro — $499/mo
                  </button>
                </div>
              </div>

              {/* Zero fee callout */}
              <div style={{
                maxWidth: 860,
                margin: '32px auto 0',
                background: 'var(--green-bg)',
                border: '1px solid var(--green-border)',
                borderRadius: 'var(--radius)',
                padding: '20px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💰</span>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>
                    0% fees on every transaction — for both plans
                  </p>
                  <p style={{ color: 'var(--text-4)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    Unlike StockX (9-12% seller fee) or eBay (12-15% seller fee), VaultLink charges absolutely nothing per transaction. Your subscription is all you pay.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison table */}
          <section style={{ padding: '0 0 64px', background: 'var(--bg)' }}>
            <div className="container">
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                textAlign: 'center',
                marginBottom: 36,
                color: 'var(--text)',
              }}>
                How we compare
              </h2>
              <div style={{ maxWidth: 700, margin: '0 auto', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      {['', 'VaultLink', 'StockX', 'eBay'].map((h, i) => (
                        <th key={h} style={{
                          textAlign: i === 0 ? 'left' : 'center',
                          padding: '12px 16px',
                          background: i === 1 ? 'rgba(245,158,11,0.06)' : 'var(--bg-3)',
                          color: i === 1 ? 'var(--gold)' : 'var(--text-3)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          border: '1px solid var(--border)',
                          borderBottom: '2px solid var(--border-2)',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Seller fees', '0%', '9–12%', '12–15%'],
                      ['Buyer fees', '$0', '3–5%', 'Varies'],
                      ['Authentication', '✓ Included', '✓ Included', '✗ Not included'],
                      ['Monthly fee', '$49 or $499', '$0', '$0'],
                      ['Unlimited listings', '✓ (Pro)', '✓', '✓'],
                    ].map(([label, ...vals]) => (
                      <tr key={label}>
                        <td style={{ padding: '12px 16px', background: 'var(--bg-3)', color: 'var(--text-3)', fontWeight: 500, border: '1px solid var(--border)' }}>
                          {label}
                        </td>
                        {vals.map((v, i) => (
                          <td key={i} style={{
                            padding: '12px 16px',
                            textAlign: 'center',
                            background: i === 0 ? 'rgba(245,158,11,0.04)' : 'var(--bg-2)',
                            color: i === 0 ? (v.startsWith('✓') ? 'var(--green)' : v === '0%' || v === '$0' ? 'var(--green)' : 'var(--text)') : (v.startsWith('✗') ? 'var(--text-4)' : 'var(--text-4)'),
                            fontWeight: i === 0 ? 700 : 400,
                            border: '1px solid var(--border)',
                          }}>
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section style={{
            padding: '64px 0 80px',
            background: 'var(--bg-2)',
            borderTop: '1px solid var(--border)',
          }}>
            <div className="container-sm">
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 40,
                textAlign: 'center',
                color: 'var(--text)',
              }}>
                Frequently asked questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {FAQS.map(({ q, a }) => (
                  <div key={q} style={{
                    background: 'var(--bg-3)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '24px',
                  }}>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{q}</p>
                    <p style={{ color: 'var(--text-4)', fontSize: '0.9rem', lineHeight: 1.7 }}>{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
