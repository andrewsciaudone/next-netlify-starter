import Head from 'next/head';
import Link from 'next/link';
import Header from '@components/Header';
import Footer from '@components/Footer';
import { cards } from '../../data/cards';

// Build a map of all unique sellers from card data
function buildSellerMap() {
  const map = {};
  cards.forEach(card => {
    if (!map[card.seller]) {
      map[card.seller] = {
        name: card.seller,
        rating: card.sellerRating,
        sales: card.sellerSales,
      };
    }
  });
  return map;
}

function ListingCard({ card }) {
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
          transition: 'border-color 0.15s, transform 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{
            height: 120,
            background: `linear-gradient(135deg, ${card.cardColor}18, ${card.cardColor}06)`,
            borderBottom: `2px solid ${card.cardColor}22`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `${card.cardColor}18`,
              border: `2px solid ${card.cardColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 16,
              color: card.cardColor,
            }}>
              {initials}
            </div>
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.75)', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
              {card.grade}
            </div>
            <span className="badge badge-green" style={{ position: 'absolute', top: 8, left: 8, fontSize: 9, padding: '2px 6px' }}>Auth</span>
          </div>
          <div style={{ padding: '12px 14px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 2 }}>{card.player}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginBottom: 8 }}>{card.year} {card.brand}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 800, color: 'var(--text)' }}>${card.price.toLocaleString()}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isUp ? 'var(--green)' : 'var(--red)' }}>
                {isUp ? '▲' : '▼'}{Math.abs(card.trendPct)}%
              </span>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}

export default function SellerProfile({ seller, listings }) {
  if (!seller) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-4)', marginBottom: 16 }}>Seller not found.</p>
          <Link href="/marketplace" passHref><a className="btn btn-primary">Browse Marketplace</a></Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  const stars = Math.round(seller.rating * 2) / 2;
  const fullStars = Math.floor(stars);

  return (
    <>
      <Head>
        <title>{seller.name} — VaultLink Seller</title>
        <meta name="description" content={`Browse ${listings.length} authenticated sports card listings from ${seller.name} on VaultLink.`} />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1 }}>

          {/* Seller header */}
          <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)', padding: '36px 0' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'var(--bg-4)',
                  border: '2px solid var(--border-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  color: 'var(--gold)',
                  flexShrink: 0,
                }}>
                  {seller.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                      {seller.name}
                    </h1>
                    <span className="badge badge-green">Verified Seller</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: 2 }}>Seller Rating</p>
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
                        {'★'.repeat(fullStars)}{'☆'.repeat(5 - fullStars)} {seller.rating}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: 2 }}>Total Sales</p>
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{seller.sales.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: 2 }}>Active Listings</p>
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{listings.length}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: 2 }}>Fees Charged to Buyers</p>
                      <p style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.95rem' }}>$0 — Always</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div className="container" style={{ padding: '36px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em', color: 'var(--text)' }}>
                Active Listings
              </h2>
              <p style={{ color: 'var(--text-4)', fontSize: '0.85rem' }}>
                {listings.length} card{listings.length !== 1 ? 's' : ''}
              </p>
            </div>

            {listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-4)' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: 12 }}>📭</p>
                <p>This seller has no active listings right now.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {listings.map(card => <ListingCard key={card.id} card={card} />)}
              </div>
            )}

            {/* Trust badges */}
            <div style={{
              marginTop: 48,
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
            }}>
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 16 }}>
                Why buy from VaultLink sellers?
              </p>
              <div className="steps-grid">
                {[
                  ['Every card authenticated', 'All cards pass our expert authentication check before reaching you.'],
                  ['0% buyer fees', 'The listed price is the final price. No transaction fees ever.'],
                  ['Full purchase protection', 'If a card fails authentication, you receive a complete refund.'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: 10 }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }}>✓</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 4 }}>{title}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const sellerNames = [...new Set(cards.map(c => c.seller))];
  return {
    paths: sellerNames.map(name => ({ params: { name: encodeURIComponent(name) } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const sellerName = decodeURIComponent(params.name);
  const sellerMap = buildSellerMap();
  const seller = sellerMap[sellerName] || null;
  const listings = cards.filter(c => c.seller === sellerName);
  return { props: { seller, listings } };
}
