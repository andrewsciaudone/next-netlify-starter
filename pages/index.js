import Head from 'next/head';
import Link from 'next/link';
import Header from '@components/Header';
import Footer from '@components/Footer';
import { cards } from '../data/cards';

function CardPreview({ card }) {
  const initials = card.player.split(' ').map(w => w[0]).join('').slice(0, 2);
  const isUp = card.trend === 'up';

  return (
    <Link href={`/listing/${card.id}`} passHref>
      <a style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          transition: 'transform 0.18s, border-color 0.18s, box-shadow 0.18s',
          cursor: 'pointer',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,158,11,0.12)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Card visual */}
          <div style={{
            height: 180,
            background: `linear-gradient(135deg, ${card.cardColor}22 0%, ${card.cardColor}08 100%)`,
            borderBottom: `2px solid ${card.cardColor}44`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `${card.cardColor}22`,
              border: `2px solid ${card.cardColor}66`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              color: card.cardColor,
            }}>
              {initials}
            </div>
            <div style={{
              marginTop: 10,
              fontSize: 11,
              fontWeight: 600,
              color: `${card.cardColor}cc`,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {card.sport}
            </div>
            <div style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${card.cardColor}44`,
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              fontFamily: 'monospace',
            }}>
              {card.grade}
            </div>
            <div style={{ position: 'absolute', top: 10, left: 10 }}>
              <span className="badge badge-green" style={{ fontSize: 10 }}>Authenticated</span>
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '14px 16px 16px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 2 }}>
              {card.player}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', marginBottom: 12 }}>
              {card.year} {card.brand} · {card.card}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>
                ${card.price.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isUp ? 'var(--green)' : 'var(--red)' }}>
                {isUp ? '▲' : '▼'} {Math.abs(card.trendPct)}%
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginTop: 2 }}>
              Last sale: ${card.lastSale.toLocaleString()}
            </p>
          </div>
        </div>
      </a>
    </Link>
  );
}

function StatBox({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--gold)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-4)', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function Step({ num, title, desc }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        fontWeight: 800,
        fontSize: '1.1rem',
        color: 'var(--gold)',
      }}>
        {num}
      </div>
      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8, color: 'var(--text)' }}>{title}</h3>
      <p style={{ color: 'var(--text-4)', fontSize: '0.9rem', lineHeight: 1.65, maxWidth: 240, margin: '0 auto' }}>{desc}</p>
    </div>
  );
}

export default function Home() {
  const featured = cards.slice(0, 6);

  return (
    <>
      <Head>
        <title>VaultLink — Sports Card Marketplace with 0% Fees</title>
        <meta name="description" content="Buy and sell authenticated sports cards with zero marketplace fees. Every card authenticated before delivery." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1 }}>

          {/* ── Hero ── */}
          <section style={{
            padding: 'clamp(60px, 10vw, 120px) 0 80px',
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)',
            textAlign: 'center',
          }}>
            <div className="container">
              <span className="badge badge-gold" style={{ marginBottom: 24 }}>
                0% Marketplace Fees · Always
              </span>
              <h1 style={{
                fontSize: 'clamp(2.8rem, 6vw, 5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                marginBottom: 24,
                color: 'var(--text)',
              }}>
                The Sports Card<br />
                <span style={{ color: 'var(--gold)' }}>Marketplace</span> Built<br />
                for Collectors
              </h1>
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'var(--text-3)',
                maxWidth: 560,
                margin: '0 auto 40px',
                lineHeight: 1.7,
              }}>
                Buy and sell authenticated sports cards. Zero marketplace fees. Every single card verified by our expert team before it reaches your door.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/marketplace" passHref>
                  <a className="btn btn-primary btn-lg">Browse Marketplace</a>
                </Link>
                <Link href="/pricing" passHref>
                  <a className="btn btn-outline btn-lg">Start Selling — $49/mo</a>
                </Link>
              </div>
            </div>
          </section>

          {/* ── Stats ── */}
          <section style={{
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-2)',
            padding: '40px 0',
          }}>
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                <StatBox value="0%" label="Marketplace Fees" />
                <StatBox value="48hr" label="Authentication Turnaround" />
                <StatBox value="10,000+" label="Cards Listed" />
                <StatBox value="$50M+" label="In Total Sales" />
              </div>
            </div>
          </section>

          {/* ── How It Works ── */}
          <section style={{ padding: '80px 0' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <p className="section-label">How It Works</p>
                <h2 style={{
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                }}>
                  Every card, fully authenticated
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
                <Step num="1" title="Seller Lists" desc="Sellers list their graded cards on VaultLink. Subscription covers 50 or unlimited listings." />
                <Step num="2" title="Buyer Purchases" desc="Buyers browse and purchase with confidence — no hidden fees added to any transaction." />
                <Step num="3" title="Card Verified" desc="Seller ships to our Authentication Center. Our expert team verifies every card in 48 hours." />
                <Step num="4" title="Delivered Sealed" desc="Authenticated cards are securely packaged and shipped directly to the buyer's door." />
              </div>
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <Link href="/how-it-works" passHref>
                  <a className="btn btn-ghost">Learn more about authentication →</a>
                </Link>
              </div>
            </div>
          </section>

          {/* ── Featured Listings ── */}
          <section style={{ padding: '80px 0', background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40 }}>
                <div>
                  <p className="section-label">Featured Listings</p>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                    Top cards right now
                  </h2>
                </div>
                <Link href="/marketplace" passHref>
                  <a className="btn btn-outline btn-sm">View all →</a>
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {featured.map(card => <CardPreview key={card.id} card={card} />)}
              </div>
            </div>
          </section>

          {/* ── Pricing section ── */}
          <section style={{ padding: '80px 0' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <p className="section-label">Pricing</p>
                <h2 style={{
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                  marginBottom: 12,
                }}>
                  Simple, transparent pricing
                </h2>
                <p style={{ color: 'var(--text-4)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
                  One flat monthly fee. Zero sales commissions. Zero buyer fees. Keep everything you earn.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800, margin: '0 auto' }}>
                {/* Starter */}
                <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '36px 32px' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-3)', marginBottom: 8 }}>Starter</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em' }}>$49</span>
                    <span style={{ color: 'var(--text-4)' }}>/month</span>
                  </div>
                  <p style={{ color: 'var(--text-4)', fontSize: '0.875rem', marginBottom: 28 }}>Up to 50 card listings</p>
                  {['Up to 50 active listings', '0% marketplace fees', 'Expert card authentication', 'Buyer & seller protection', 'Analytics dashboard'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
                      <span style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>{f}</span>
                    </div>
                  ))}
                  <Link href="/pricing" passHref>
                    <a className="btn btn-outline w-full" style={{ justifyContent: 'center', marginTop: 12, display: 'flex' }}>Get Started</a>
                  </Link>
                </div>

                {/* Pro */}
                <div style={{ background: 'var(--bg-3)', border: '2px solid var(--gold)', borderRadius: 'var(--radius-lg)', padding: '36px 32px', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--gold)', color: '#000', fontWeight: 700, fontSize: '0.75rem',
                    padding: '3px 14px', borderRadius: 100, letterSpacing: '0.06em',
                  }}>
                    BEST VALUE
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--text-3)', marginBottom: 8 }}>Pro</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '-0.03em' }}>$499</span>
                    <span style={{ color: 'var(--text-4)' }}>/month</span>
                  </div>
                  <p style={{ color: 'var(--text-4)', fontSize: '0.875rem', marginBottom: 28 }}>Unlimited card listings</p>
                  {['Unlimited active listings', '0% marketplace fees', 'Priority 24hr authentication', 'Dedicated account manager', 'Advanced analytics & insights', 'API access'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      <span style={{ color: 'var(--gold)', flexShrink: 0 }}>✓</span>
                      <span style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>{f}</span>
                    </div>
                  ))}
                  <Link href="/pricing" passHref>
                    <a className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 12, display: 'flex' }}>Go Pro</a>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA banner ── */}
          <section style={{
            padding: '80px 0',
            background: 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(245,158,11,0.07) 0%, transparent 70%)',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div className="container">
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16, color: 'var(--text)' }}>
                Ready to sell with <span style={{ color: 'var(--gold)' }}>zero fees?</span>
              </h2>
              <p style={{ color: 'var(--text-4)', fontSize: '1rem', marginBottom: 36, maxWidth: 440, margin: '0 auto 36px' }}>
                Join thousands of collectors who keep 100% of what they earn.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/pricing" passHref>
                  <a className="btn btn-primary btn-lg">Start Selling Today</a>
                </Link>
                <Link href="/marketplace" passHref>
                  <a className="btn btn-ghost btn-lg">Browse Cards</a>
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
