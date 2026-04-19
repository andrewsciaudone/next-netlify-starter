import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import Header from '@components/Header';
import Footer from '@components/Footer';
import { cards } from '../data/cards';

function CardListing({ card }) {
  const initials = card.player.split(' ').map(w => w[0]).join('').slice(0, 2);
  const isUp = card.trend === 'up';

  return (
    <Link href={`/listing/${card.id}`} passHref>
      <a style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div style={{
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          transition: 'transform 0.18s, border-color 0.18s, box-shadow 0.18s',
          height: '100%',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,158,11,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Card image */}
          <div style={{
            height: 160,
            background: `linear-gradient(135deg, ${card.cardColor}20 0%, ${card.cardColor}06 100%)`,
            borderBottom: `2px solid ${card.cardColor}33`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: `${card.cardColor}18`,
              border: `2px solid ${card.cardColor}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 800,
              color: card.cardColor,
            }}>
              {initials}
            </div>
            <p style={{
              marginTop: 8,
              fontSize: 10,
              fontWeight: 700,
              color: `${card.cardColor}99`,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {card.sport}
            </p>
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.75)',
              border: `1px solid ${card.cardColor}33`,
              borderRadius: 5,
              padding: '2px 7px',
              fontSize: 10,
              fontWeight: 700,
              color: '#fff',
              fontFamily: 'monospace',
            }}>
              {card.grade}
            </div>
            <div style={{ position: 'absolute', top: 8, left: 8 }}>
              <span className="badge badge-green" style={{ fontSize: 9, padding: '2px 7px' }}>Auth</span>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '12px 14px 14px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 1 }}>{card.player}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: 10, lineHeight: 1.4 }}>
              {card.year} {card.brand}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginBottom: 10 }}>{card.card}</p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>
                ${card.price.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isUp ? 'var(--green)' : 'var(--red)' }}>
                {isUp ? '▲' : '▼'} {Math.abs(card.trendPct)}%
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 2 }}>
              Last: ${card.lastSale.toLocaleString()}
            </p>
          </div>
        </div>
      </a>
    </Link>
  );
}

const SPORTS = ['All', 'Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer'];
const GRADES = ['All', 'PSA 10', 'PSA 9', 'BGS 9.5'];
const BRANDS = ['All', 'Panini Prizm', 'Topps Chrome', 'Upper Deck'];
const SORTS = [
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Trending Up', value: 'trend-up' },
  { label: 'Recently Listed', value: 'recent' },
];

export default function Marketplace() {
  const [sport, setSport] = useState('All');
  const [grade, setGrade] = useState('All');
  const [brand, setBrand] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('price-desc');

  const filtered = useMemo(() => {
    let result = cards.filter(c => {
      if (sport !== 'All' && c.sport !== sport) return false;
      if (grade !== 'All' && c.grade !== grade) return false;
      if (brand !== 'All' && c.brand !== brand) return false;
      if (maxPrice && c.price > parseInt(maxPrice)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.player.toLowerCase().includes(q) && !c.card.toLowerCase().includes(q) && !c.team.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (sort === 'price-desc') result = result.sort((a, b) => b.price - a.price);
    else if (sort === 'price-asc') result = result.sort((a, b) => a.price - b.price);
    else if (sort === 'trend-up') result = result.sort((a, b) => b.trendPct - a.trendPct);
    else if (sort === 'recent') result = result.sort((a, b) => b.listed.localeCompare(a.listed));

    return result;
  }, [sport, grade, brand, maxPrice, search, sort]);

  const filterPills = (opts, val, set) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {opts.map(o => (
        <button key={o} onClick={() => set(o)} style={{
          padding: '5px 12px',
          borderRadius: 100,
          border: `1px solid ${val === o ? 'var(--gold)' : 'var(--border-2)'}`,
          background: val === o ? 'rgba(245,158,11,0.1)' : 'transparent',
          color: val === o ? 'var(--gold)' : 'var(--text-4)',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}>
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Head>
        <title>Marketplace — VaultLink</title>
        <meta name="description" content="Browse authenticated sports cards with 0% fees." />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1 }}>
          {/* Top bar */}
          <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)', padding: '20px 0' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', color: 'var(--text)', marginRight: 8 }}>
                  Marketplace
                </h1>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <input
                    className="input"
                    placeholder="Search player, team, or card..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 380 }}
                  />
                </div>
                <select className="input" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="container marketplace-layout">
            {/* Sidebar */}
            <aside className="marketplace-sidebar">
              <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
                <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                  Filters
                </p>

                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 10 }}>Sport</p>
                  {filterPills(SPORTS, sport, setSport)}
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 20px' }} />

                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 10 }}>Grade</p>
                  {filterPills(GRADES, grade, setGrade)}
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 20px' }} />

                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 10 }}>Brand</p>
                  {filterPills(BRANDS, brand, setBrand)}
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 20px' }} />

                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 10 }}>Max Price ($)</p>
                  <input
                    className="input"
                    type="number"
                    placeholder="e.g. 500"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                </div>

                {(sport !== 'All' || grade !== 'All' || brand !== 'All' || maxPrice || search) && (
                  <button
                    onClick={() => { setSport('All'); setGrade('All'); setBrand('All'); setMaxPrice(''); setSearch(''); }}
                    style={{
                      marginTop: 16,
                      width: '100%',
                      padding: '8px',
                      background: 'transparent',
                      border: '1px solid var(--border-2)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-4)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </aside>

            {/* Grid */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'var(--text-4)', fontSize: '0.85rem', marginBottom: 16 }}>
                {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
              </p>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-4)' }}>
                  <p style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</p>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>No cards match your filters</p>
                  <p style={{ fontSize: '0.875rem' }}>Try adjusting your search or filters</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
                  {filtered.map(card => <CardListing key={card.id} card={card} />)}
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
