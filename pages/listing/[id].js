import Head from 'next/head';
import Link from 'next/link';
import Header from '@components/Header';
import Footer from '@components/Footer';
import { cards, getCardById } from '../../data/cards';

function AuthBadge({ serial }) {
  return (
    <div style={{
      background: 'var(--green-bg)',
      border: '1px solid var(--green-border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(16,185,129,0.15)',
          border: '2px solid var(--green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
          color: 'var(--green)',
          fontWeight: 700,
        }}>
          ✓
        </div>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.95rem' }}>VaultLink Authenticated</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', fontFamily: 'monospace', marginTop: 2 }}>
            Serial: {serial}
          </p>
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        borderTop: '1px solid var(--green-border)',
        paddingTop: 14,
      }}>
        {[
          ['Grade Verified', 'Matches stated grade'],
          ['No Trimming', 'Edges intact & original'],
          ['No Alterations', 'Clean, unaltered surface'],
          ['Genuine Card', 'Confirmed authentic print'],
        ].map(([label, detail]) => (
          <div key={label}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--green)', marginBottom: 2 }}>✓ {label}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimilarCard({ card }) {
  const initials = card.player.split(' ').map(w => w[0]).join('').slice(0, 2);
  return (
    <Link href={`/listing/${card.id}`} passHref>
      <a style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{
            height: 100,
            background: `linear-gradient(135deg, ${card.cardColor}18, ${card.cardColor}06)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 800,
            color: card.cardColor,
            borderBottom: `1px solid ${card.cardColor}22`,
          }}>
            {initials}
          </div>
          <div style={{ padding: '10px 12px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)', marginBottom: 2 }}>{card.player}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginBottom: 6 }}>{card.grade} · {card.year}</p>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gold)' }}>${card.price.toLocaleString()}</p>
          </div>
        </div>
      </a>
    </Link>
  );
}

export default function Listing({ card }) {
  if (!card) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', marginBottom: 16 }}>404</p>
          <p style={{ color: 'var(--text-4)' }}>Card not found.</p>
          <Link href="/marketplace" passHref>
            <a className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>Back to Marketplace</a>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  const initials = card.player.split(' ').map(w => w[0]).join('').slice(0, 2);
  const isUp = card.trend === 'up';
  const similar = cards.filter(c => c.sport === card.sport && c.id !== card.id).slice(0, 4);

  return (
    <>
      <Head>
        <title>{card.player} {card.year} {card.brand} {card.grade} — VaultLink</title>
        <meta name="description" content={card.description} />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
            <div className="container" style={{ padding: '12px 24px', display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--text-4)', alignItems: 'center' }}>
              <Link href="/" passHref>
                <a style={{ color: 'var(--text-4)', textDecoration: 'none' }}>Home</a>
              </Link>
              <span>/</span>
              <Link href="/marketplace" passHref>
                <a style={{ color: 'var(--text-4)', textDecoration: 'none' }}>Marketplace</a>
              </Link>
              <span>/</span>
              <span style={{ color: 'var(--text-3)' }}>{card.player}</span>
            </div>
          </div>

          <div className="container" style={{ padding: '40px 24px' }}>
            <div className="listing-grid">

              {/* Left: Card Visual */}
              <div>
                <div style={{
                  background: `linear-gradient(145deg, ${card.cardColor}22 0%, ${card.cardColor}06 100%)`,
                  border: `2px solid ${card.cardColor}33`,
                  borderRadius: 'var(--radius-lg)',
                  height: 380,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginBottom: 24,
                }}>
                  <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `${card.cardColor}18`,
                    border: `3px solid ${card.cardColor}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    fontWeight: 900,
                    color: card.cardColor,
                    marginBottom: 16,
                  }}>
                    {initials}
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: card.cardColor, letterSpacing: '-0.01em' }}>
                    {card.player}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: `${card.cardColor}99`, marginTop: 4 }}>
                    {card.team} · {card.year}
                  </p>
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(0,0,0,0.8)',
                    border: `1px solid ${card.cardColor}44`,
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#fff',
                    fontFamily: 'monospace',
                  }}>
                    {card.grade}
                  </div>
                  <div style={{ position: 'absolute', top: 16, left: 16 }}>
                    <span className="badge badge-green">VaultLink Authenticated</span>
                  </div>
                </div>

                <AuthBadge serial={card.authSerial} />
              </div>

              {/* Right: Info */}
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span className="badge badge-gray">{card.sport}</span>
                  <span className="badge badge-gold">{card.brand}</span>
                  <span className="badge badge-gray">{card.grade}</span>
                </div>

                <h1 style={{
                  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                  marginBottom: 4,
                }}>
                  {card.player}
                </h1>
                <p style={{ color: 'var(--text-4)', fontSize: '1rem', marginBottom: 28 }}>
                  {card.year} {card.brand} · {card.card}
                </p>

                {/* Price block */}
                <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', marginBottom: 4 }}>Asking Price</p>
                      <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                        ${card.price.toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', marginBottom: 4 }}>vs. Last Sale</p>
                      <p style={{ fontWeight: 700, fontSize: '1.05rem', color: isUp ? 'var(--green)' : 'var(--red)' }}>
                        {isUp ? '▲' : '▼'} {Math.abs(card.trendPct)}%
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginBottom: 2 }}>Last Sale</p>
                      <p style={{ fontWeight: 600, color: 'var(--text-3)' }}>${card.lastSale.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginBottom: 2 }}>Buyer Fees</p>
                      <p style={{ fontWeight: 600, color: 'var(--green)' }}>$0 — Always</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginBottom: 2 }}>You Pay</p>
                      <p style={{ fontWeight: 600, color: 'var(--text)' }}>${card.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <Link href={`/checkout/${card.id}`} passHref>
                    <a className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '1rem', padding: '14px', display: 'flex' }}>
                      Buy Now — ${card.price.toLocaleString()}
                    </a>
                  </Link>
                  <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                    Make Offer
                  </button>
                </div>

                {/* Fee callout */}
                <div style={{
                  background: 'rgba(16,185,129,0.05)',
                  border: '1px solid var(--green-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  marginBottom: 24,
                }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.55 }}>
                    <strong style={{ color: 'var(--green)' }}>0% buyer fees</strong> — The price you see is the price you pay. No processing fees, no marketplace cut.
                  </p>
                </div>

                {/* Seller */}
                <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', marginBottom: 24 }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', marginBottom: 10 }}>Sold by</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--bg-4)',
                      border: '1px solid var(--border-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--text-3)',
                    }}>
                      {card.seller[0]}
                    </div>
                    <div>
                      <Link href={`/seller/${encodeURIComponent(card.seller)}`} passHref>
                        <a style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gold)', textDecoration: 'none' }}>
                          {card.seller}
                        </a>
                      </Link>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-4)' }}>
                        ★ {card.sellerRating} · {card.sellerSales.toLocaleString()} sales
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 8 }}>About this card</p>
                  <p style={{ color: 'var(--text-4)', fontSize: '0.9rem', lineHeight: 1.7 }}>{card.description}</p>
                </div>
              </div>
            </div>

            {/* Similar cards */}
            {similar.length > 0 && (
              <div style={{ marginTop: 64 }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.01em', marginBottom: 24 }}>
                  More {card.sport} Cards
                </h2>
                <div className="similar-grid">
                  {similar.map(c => <SimilarCard key={c.id} card={c} />)}
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
