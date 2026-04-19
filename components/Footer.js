import Link from 'next/link';

export default function Footer() {
  const footerLink = (label, href) => (
    <Link href={href} passHref key={label}>
      <a style={{ color: 'var(--text-4)', fontSize: '0.875rem', textDecoration: 'none' }}>
        {label}
      </a>
    </Link>
  );

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-2)',
      padding: '48px 0 32px',
    }}>
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <Link href="/" passHref>
              <a style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, textDecoration: 'none' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  background: 'var(--gold)',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#000" />
                  </svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>VaultLink</span>
              </a>
            </Link>
            <p style={{ color: 'var(--text-4)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 260 }}>
              The sports card marketplace with 0% fees. Every card authenticated before it reaches your door.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 16 }}>Marketplace</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer'].map(label =>
                footerLink(label, '/marketplace')
              )}
            </div>
          </div>

          {/* Sellers */}
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 16 }}>Sellers</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {footerLink('Pricing', '/pricing')}
              {footerLink('How It Works', '/how-it-works')}
              {footerLink('Authentication', '/how-it-works')}
              {footerLink('Start Selling', '/pricing')}
            </div>
          </div>

          {/* Company */}
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 16 }}>Company</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {footerLink('About', '/')}
              {footerLink('Blog', '/')}
              {footerLink('Careers', '/')}
              {footerLink('Support', '/')}
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ color: 'var(--text-4)', fontSize: '0.8rem' }}>
            © 2025 VaultLink. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item =>
              footerLink(item, '/')
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
