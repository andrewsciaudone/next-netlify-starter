import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  const path = router.pathname;

  const navLink = (href, label) => (
    <Link href={href} passHref>
      <a style={{
        color: path === href ? 'var(--gold)' : 'var(--text-3)',
        fontWeight: 500,
        fontSize: '0.95rem',
        transition: 'color 0.15s',
        padding: '4px 0',
        borderBottom: path === href ? '2px solid var(--gold)' : '2px solid transparent',
        textDecoration: 'none',
      }}>
        {label}
      </a>
    </Link>
  );

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(6, 9, 18, 0.9)',
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
          <a style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
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

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {navLink('/marketplace', 'Marketplace')}
          {navLink('/how-it-works', 'How It Works')}
          {navLink('/pricing', 'Pricing')}
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" passHref>
            <a className="btn btn-ghost btn-sm">Dashboard</a>
          </Link>
          <Link href="/sell" passHref>
            <a className="btn btn-primary btn-sm">+ List a Card</a>
          </Link>
        </div>
      </div>
    </header>
  );
}
