import Head from 'next/head';
import Link from 'next/link';
import Header from '@components/Header';
import Footer from '@components/Footer';

// Mock seller data
const SELLER = {
  name: 'CardVault_Pro',
  plan: 'starter',
  planLimit: 50,
  memberSince: 'October 2024',
  rating: 4.9,
  totalSales: 312,
};

const ACTIVE_LISTINGS = [
  { id: 1, player: 'Patrick Mahomes', card: '2017 Panini Prizm RC Auto', grade: 'PSA 10', price: 4500, views: 284, sport: 'Football', cardColor: '#E31837', listed: '2025-01-10' },
  { id: 7, player: 'Josh Allen', card: '2018 Panini Prizm RC', grade: 'PSA 10', price: 850, views: 91, sport: 'Football', cardColor: '#00338D', listed: '2025-01-11' },
];

const RECENT_SALES = [
  { player: 'Travis Kelce', card: '2013 Topps Chrome RC', grade: 'PSA 9', salePrice: 420, date: '2025-01-09', status: 'auth_pending' },
  { player: 'Ja\'Marr Chase', card: '2021 Panini Prizm RC', grade: 'PSA 10', salePrice: 310, date: '2025-01-07', status: 'shipped' },
  { player: 'Davante Adams', card: '2014 Topps Chrome RC', grade: 'PSA 9', salePrice: 180, date: '2025-01-03', status: 'completed' },
  { player: 'Tyreek Hill', card: '2016 Panini Prizm RC', grade: 'PSA 10', salePrice: 280, date: '2024-12-29', status: 'completed' },
];

const STATUS_CONFIG = {
  auth_pending: { label: 'Auth Pending', color: 'var(--gold)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  shipped: { label: 'In Transit', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
  completed: { label: 'Completed', color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)' },
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.02em', color: accent || 'var(--text)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const usedListings = ACTIVE_LISTINGS.length;
  const listingPct = (usedListings / SELLER.planLimit) * 100;
  const totalRevenue = RECENT_SALES.reduce((sum, s) => sum + s.salePrice, 0);
  const pendingCount = RECENT_SALES.filter(s => s.status === 'auth_pending').length;

  return (
    <>
      <Head>
        <title>Dashboard — VaultLink</title>
        <meta name="description" content="Seller dashboard — manage your VaultLink listings." />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1, padding: '36px 0 72px' }}>
          <div className="container">

            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--bg-4)',
                    border: '2px solid var(--border-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: 'var(--gold)',
                  }}>
                    {SELLER.name[0]}
                  </div>
                  <div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em', color: 'var(--text)' }}>
                      {SELLER.name}
                    </h1>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-4)' }}>
                      Member since {SELLER.memberSince} · ★ {SELLER.rating} · {SELLER.totalSales} sales
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className={`badge badge-${SELLER.plan === 'pro' ? 'gold' : 'gray'}`} style={{ fontSize: '0.8rem' }}>
                  {SELLER.plan === 'pro' ? 'Pro Plan — $499/mo' : 'Starter Plan — $49/mo'}
                </span>
                <Link href="/sell" passHref>
                  <a className="btn btn-primary btn-sm">+ List a Card</a>
                </Link>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
              <StatCard label="Active Listings" value={usedListings} sub={SELLER.plan === 'starter' ? `of ${SELLER.planLimit} included` : 'Unlimited (Pro)'} />
              <StatCard label="Total Sales" value={SELLER.totalSales} sub="All time" />
              <StatCard label="Recent Revenue" value={`$${totalRevenue.toLocaleString()}`} sub="Last 30 days · 0% fees" accent="var(--green)" />
              <StatCard label="Auth Pending" value={pendingCount} sub="Awaiting our inspection" accent={pendingCount > 0 ? 'var(--gold)' : undefined} />
            </div>

            {/* Listing limit bar (Starter plan only) */}
            {SELLER.plan === 'starter' && (
              <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-3)' }}>Listing usage</p>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-4)' }}>
                      {usedListings} / {SELLER.planLimit} listings used
                    </span>
                    <Link href="/pricing" passHref>
                      <a style={{ fontSize: '0.8rem', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
                        Upgrade to Pro →
                      </a>
                    </Link>
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--bg-4)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${listingPct}%`,
                    background: listingPct > 80 ? 'var(--red)' : listingPct > 60 ? 'var(--gold)' : 'var(--green)',
                    borderRadius: 100,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                {listingPct > 80 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--red)', marginTop: 8 }}>
                    You're almost at your listing limit. Upgrade to Pro for unlimited listings.
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

              {/* Active Listings */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', color: 'var(--text)' }}>Active Listings</h2>
                  <Link href="/sell" passHref>
                    <a className="btn btn-outline btn-sm">+ Add listing</a>
                  </Link>
                </div>

                {ACTIVE_LISTINGS.length === 0 ? (
                  <div style={{
                    background: 'var(--bg-3)', border: '1px dashed var(--border-2)',
                    borderRadius: 'var(--radius)', padding: '48px', textAlign: 'center',
                  }}>
                    <p style={{ color: 'var(--text-4)', marginBottom: 16 }}>No active listings yet</p>
                    <Link href="/sell" passHref>
                      <a className="btn btn-primary btn-sm">List your first card</a>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {ACTIVE_LISTINGS.map(listing => {
                      const initials = listing.player.split(' ').map(w => w[0]).join('').slice(0, 2);
                      return (
                        <div key={listing.id} style={{
                          background: 'var(--bg-3)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          padding: '16px',
                          display: 'flex',
                          gap: 14,
                          alignItems: 'center',
                        }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            background: `${listing.cardColor}18`,
                            border: `1px solid ${listing.cardColor}33`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 14,
                            color: listing.cardColor,
                            flexShrink: 0,
                          }}>
                            {initials}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 2 }}>
                              {listing.player}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {listing.card} · {listing.grade}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1rem' }}>
                              ${listing.price.toLocaleString()}
                            </p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 2 }}>
                              {listing.views} views
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <Link href={`/listing/${listing.id}`} passHref>
                              <a className="btn btn-ghost btn-sm" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>View</a>
                            </Link>
                            <button className="btn btn-ghost btn-sm" style={{ padding: '5px 10px', fontSize: '0.75rem', color: 'var(--red)' }}>
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Sales */}
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 16 }}>
                  Recent Sales
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {RECENT_SALES.map((sale, i) => {
                    const s = STATUS_CONFIG[sale.status];
                    return (
                      <div key={i} style={{
                        background: 'var(--bg-3)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 2 }}>
                            {sale.player}
                          </p>
                          <p style={{ fontSize: '0.73rem', color: 'var(--text-4)' }}>
                            {sale.card} · {sale.grade} · {sale.date}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontWeight: 800, color: 'var(--green)', fontSize: '0.95rem' }}>
                            +${sale.salePrice.toLocaleString()}
                          </p>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            marginTop: 4,
                            padding: '2px 8px',
                            borderRadius: 100,
                            background: s.bg,
                            border: `1px solid ${s.border}`,
                            fontSize: 10,
                            fontWeight: 700,
                            color: s.color,
                            letterSpacing: '0.04em',
                          }}>
                            {s.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fee savings callout */}
                <div style={{
                  marginTop: 20,
                  background: 'var(--green-bg)',
                  border: '1px solid var(--green-border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px 20px',
                }}>
                  <p style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.85rem', marginBottom: 4 }}>
                    Fees saved this month
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--green)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                    ${Math.round(totalRevenue * 0.12).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', lineHeight: 1.5 }}>
                    Based on StockX's avg 12% seller fee. With VaultLink, you kept every dollar.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick tips */}
            <div style={{
              marginTop: 32,
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
            }}>
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 16 }}>Tips to sell faster</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  ['Write detailed descriptions', 'Cards with condition notes, centering details, and eye-appeal descriptions get 40% more views.'],
                  ['Price competitively', 'Check the last sale prices on similar cards. Pricing within 5–10% of market value leads to faster sales.'],
                  ['Ship quickly when sold', 'Sellers who ship within 24 hours of a sale receive higher ratings and more repeat buyers.'],
                ].map(([title, tip]) => (
                  <div key={title}>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--gold)', marginBottom: 6 }}>{title}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-4)', lineHeight: 1.6 }}>{tip}</p>
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
