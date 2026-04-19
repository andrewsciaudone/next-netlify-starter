import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const path = router.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    ['/marketplace', 'Marketplace'],
    ['/how-it-works', 'How It Works'],
    ['/pricing', 'Pricing'],
  ];

  const isActive = (href) => path === href || path.startsWith(href + '/');

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(6, 9, 18, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}>
          {/* Logo */}
          <Link href="/" passHref>
            <a style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: 32,
                height: 32,
                background: 'var(--gold)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#000" />
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em', color: 'var(--text)' }}>
                VaultLink
              </span>
            </a>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {navLinks.map(([href, label]) => (
              <Link key={href} href={href} passHref>
                <a style={{
                  color: isActive(href) ? 'var(--gold)' : 'var(--text-3)',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  padding: '4px 0',
                  borderBottom: isActive(href) ? '2px solid var(--gold)' : '2px solid transparent',
                  transition: 'color 0.15s',
                }}>
                  {label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="header-cta-full" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dashboard" passHref>
              <a className="btn btn-ghost btn-sm">Dashboard</a>
            </Link>
            <Link href="/sell" passHref>
              <a className="btn btn-primary btn-sm">+ List a Card</a>
            </Link>
          </div>

          {/* Hamburger (mobile only — visible via CSS) */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none', // shown via CSS at ≤768px
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              background: 'transparent',
              border: '1px solid var(--border-2)',
              borderRadius: 8,
              color: 'var(--text)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div
          className="mobile-nav"
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            zIndex: 99,
            background: 'var(--bg-2)',
            borderBottom: '1px solid var(--border)',
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {navLinks.map(([href, label]) => (
            <Link key={href} href={href} passHref>
              <a
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: '12px 24px',
                  color: isActive(href) ? 'var(--gold)' : 'var(--text)',
                  fontWeight: 500,
                  textDecoration: 'none',
                  borderLeft: isActive(href) ? '3px solid var(--gold)' : '3px solid transparent',
                }}
              >
                {label}
              </a>
            </Link>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />
          <Link href="/dashboard" passHref>
            <a onClick={() => setMenuOpen(false)} style={{ padding: '12px 24px', color: 'var(--text-3)', textDecoration: 'none', fontWeight: 500 }}>
              Dashboard
            </a>
          </Link>
          <div style={{ padding: '8px 24px' }}>
            <Link href="/sell" passHref>
              <a onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center' }}>
                + List a Card
              </a>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
