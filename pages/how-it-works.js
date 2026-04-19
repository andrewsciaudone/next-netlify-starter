import Head from 'next/head';
import Link from 'next/link';
import Header from '@components/Header';
import Footer from '@components/Footer';

function ProcessStep({ step, title, desc, detail, icon, color }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '60px 1fr',
      gap: 24,
      alignItems: 'flex-start',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: `${color}15`,
          border: `2px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
          zIndex: 1,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ paddingBottom: 40 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: color, textTransform: 'uppercase', marginBottom: 6 }}>
          Step {step}
        </p>
        <h3 style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 10 }}>
          {title}
        </h3>
        <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 12 }}>{desc}</p>
        <div style={{
          background: 'var(--bg-4)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
        }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-4)', lineHeight: 1.6 }}>{detail}</p>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ children }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'var(--green-bg)',
        border: '1px solid var(--green-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        color: 'var(--green)',
        flexShrink: 0,
        marginTop: 1,
      }}>
        ✓
      </div>
      <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', lineHeight: 1.65 }}>{children}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <>
      <Head>
        <title>How It Works — VaultLink</title>
        <meta name="description" content="Every card on VaultLink is authenticated by our expert team before reaching the buyer. Learn how the process works." />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1 }}>
          {/* Hero */}
          <section style={{
            padding: '72px 0 56px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border)',
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 70%)',
          }}>
            <div className="container">
              <p className="section-label">How It Works</p>
              <h1 style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                marginBottom: 16,
                color: 'var(--text)',
              }}>
                Every card. Expert verified.
              </h1>
              <p style={{
                color: 'var(--text-4)',
                fontSize: '1.05rem',
                maxWidth: 540,
                margin: '0 auto',
                lineHeight: 1.7,
              }}>
                Unlike peer-to-peer marketplaces, VaultLink physically inspects every single card before it reaches the buyer — so you always get exactly what you paid for.
              </p>
            </div>
          </section>

          {/* Buyer journey */}
          <section style={{ padding: '72px 0' }}>
            <div className="container-sm">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 44,
              }}>
                <div style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: 'var(--gold)',
                  letterSpacing: '0.06em',
                }}>
                  FOR BUYERS
                </div>
                <h2 style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  How to buy
                </h2>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 25,
                  top: 52,
                  bottom: 0,
                  width: 2,
                  background: 'var(--border)',
                }} />
                <ProcessStep
                  step={1}
                  icon="🔍"
                  color="#f59e0b"
                  title="Browse the Marketplace"
                  desc="Explore thousands of authenticated sports cards. Filter by sport, grade, brand, or price. Every listing shows the PSA or BGS grade, last sale price, and price trend."
                  detail="Listings are sorted by most recent activity. Use the search bar to find a specific player, team, or card type."
                />
                <ProcessStep
                  step={2}
                  icon="💳"
                  color="#f59e0b"
                  title="Purchase at the Listed Price"
                  desc="Click Buy Now to purchase at the seller's asking price, or submit a lower offer for the seller to review. You pay zero fees — the price you see is what you pay."
                  detail="All transactions are secured by VaultLink. Your payment is held in escrow until the card passes authentication and is delivered to you."
                />
                <ProcessStep
                  step={3}
                  icon="✅"
                  color="#10b981"
                  title="Card is Authenticated for You"
                  desc="After purchase, the seller ships the card to our Authentication Center. Our team inspects it within 48 hours (24 hours on Pro sellers). You receive status updates at each step."
                  detail="If the card fails authentication, you receive a full refund immediately. No questions asked."
                />
                <ProcessStep
                  step={4}
                  icon="📦"
                  color="#10b981"
                  title="Receive Sealed & Verified"
                  desc="Once authenticated, the card is securely packaged in a tamper-evident seal and shipped directly to your door with tracking. Your VaultLink Authentication Certificate is included."
                  detail="Standard shipping takes 3-5 business days. Expedited options available at checkout."
                />
              </div>
            </div>
          </section>

          {/* Seller journey */}
          <section style={{
            padding: '72px 0',
            background: 'var(--bg-2)',
            borderTop: '1px solid var(--border)',
          }}>
            <div className="container-sm">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 44,
              }}>
                <div style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: 'var(--green)',
                  letterSpacing: '0.06em',
                }}>
                  FOR SELLERS
                </div>
                <h2 style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  How to sell
                </h2>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 25,
                  top: 52,
                  bottom: 40,
                  width: 2,
                  background: 'var(--border)',
                }} />
                <ProcessStep
                  step={1}
                  icon="💳"
                  color="#f59e0b"
                  title="Subscribe to a Plan"
                  desc="Choose the Starter plan ($49/month) for up to 50 listings, or the Pro plan ($499/month) for unlimited listings. No contracts — cancel anytime."
                  detail="Both plans include 0% transaction fees. You keep 100% of every sale."
                />
                <ProcessStep
                  step={2}
                  icon="📋"
                  color="#f59e0b"
                  title="List Your Cards"
                  desc="Create a listing for each card. Enter the player, year, brand, grade (PSA, BGS, SGC, CGC, or raw), and your asking price. Listings go live immediately."
                  detail="We recommend including the card's serial number and a clear description to attract serious buyers faster."
                />
                <ProcessStep
                  step={3}
                  icon="🎉"
                  color="#10b981"
                  title="Card Sells — Ship to Us"
                  desc="When a buyer purchases your card, you receive an email with a prepaid shipping label. Send the card to our Authentication Center within 3 business days."
                  detail="Pack the card securely. We recommend a card saver sleeve, top loader, and padded bubble mailer."
                />
                <ProcessStep
                  step={4}
                  icon="💰"
                  color="#10b981"
                  title="Get Paid — Keep Everything"
                  desc="Once the card passes authentication and the buyer confirms receipt, payment is released to your account. You keep 100% of the sale price — we take $0."
                  detail="Payment arrives within 1-3 business days via direct deposit or check."
                />
              </div>
            </div>
          </section>

          {/* Authentication deep dive */}
          <section style={{ padding: '72px 0' }}>
            <div className="container-sm">
              <p className="section-label" style={{ textAlign: 'center' }}>Authentication</p>
              <h2 style={{
                fontWeight: 800,
                fontSize: '1.75rem',
                letterSpacing: '-0.02em',
                textAlign: 'center',
                marginBottom: 16,
                color: 'var(--text)',
              }}>
                What our experts check
              </h2>
              <p style={{
                color: 'var(--text-4)',
                textAlign: 'center',
                fontSize: '0.95rem',
                marginBottom: 48,
                lineHeight: 1.7,
              }}>
                Our team of sports card specialists performs a comprehensive multi-point inspection on every card that passes through our Authentication Center.
              </p>

              <div className="auth-checks-grid">
                <div style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '28px',
                }}>
                  <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 20, fontSize: '1rem' }}>
                    Authenticity & Integrity
                  </p>
                  <CheckItem>Card confirmed as a genuine original print, not a reprint or counterfeit</CheckItem>
                  <CheckItem>Edges inspected under magnification for trimming or shaving</CheckItem>
                  <CheckItem>Surface checked for artificial cleaning, polishing, or color enhancement</CheckItem>
                  <CheckItem>Corners examined for rounding restoration or touch-ups</CheckItem>
                </div>

                <div style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '28px',
                }}>
                  <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 20, fontSize: '1rem' }}>
                    Grade Verification
                  </p>
                  <CheckItem>Third-party grade (PSA, BGS, SGC, CGC) confirmed to match the slab label</CheckItem>
                  <CheckItem>Slab integrity checked — no evidence of cracking, resealing, or tampering</CheckItem>
                  <CheckItem>Card identity verified against the grading company's database</CheckItem>
                  <CheckItem>Serial number confirmed for autograph cards and serial-numbered parallels</CheckItem>
                </div>

                <div style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '28px',
                }}>
                  <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 20, fontSize: '1rem' }}>
                    Condition Assessment
                  </p>
                  <CheckItem>Card examined under UV light for hidden stains or moisture damage</CheckItem>
                  <CheckItem>Centering measured for accuracy against listing description</CheckItem>
                  <CheckItem>Print defects and factory flaws noted and disclosed to buyer</CheckItem>
                  <CheckItem>Overall condition confirmed to match the seller's description</CheckItem>
                </div>

                <div style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '28px',
                }}>
                  <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 20, fontSize: '1rem' }}>
                    Documentation
                  </p>
                  <CheckItem>High-resolution photos taken front and back for permanent record</CheckItem>
                  <CheckItem>VaultLink Authentication Certificate generated with unique serial number</CheckItem>
                  <CheckItem>Results logged to buyer and seller accounts for lifetime reference</CheckItem>
                  <CheckItem>QR code applied to packaging for instant verification at delivery</CheckItem>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section style={{
            padding: '72px 0',
            background: 'var(--bg-2)',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div className="container">
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                marginBottom: 16,
                color: 'var(--text)',
              }}>
                Ready to start?
              </h2>
              <p style={{ color: 'var(--text-4)', fontSize: '1rem', marginBottom: 36, maxWidth: 400, margin: '0 auto 36px' }}>
                Browse authenticated cards or start selling with zero fees.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/marketplace" passHref>
                  <a className="btn btn-primary btn-lg">Browse Marketplace</a>
                </Link>
                <Link href="/pricing" passHref>
                  <a className="btn btn-outline btn-lg">View Pricing</a>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
