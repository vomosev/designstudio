import Link from 'next/link';

const SITEMAP = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'Studio' },
  { href: '/contact', label: 'Contact' },
];

const RESOURCES = [
  { href: '/login', label: 'Studio sign in' },
  { href: '/signup', label: 'Request an account' },
  { href: '/admin', label: 'Dashboard' },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-col">
            <span className="wordmark wordmark--footer" aria-hidden="true">
              Prism Studio
            </span>
            <p className="footer-blurb">
              A ten-person graphic design studio building brand systems, packaging and
              digital products for founders, museums and independent labels since 2014.
            </p>
            <address className="footer-address">
              42 Wharfside Lane, Studio 3B
              <br />
              Bristol BS1 4RN, United Kingdom
            </address>
          </div>

          <nav className="footer-col" aria-label="Footer sitemap">
            <h2 className="footer-heading">Explore</h2>
            <ul className="footer-links">
              {SITEMAP.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Studio access">
            <h2 className="footer-heading">Studio</h2>
            <ul className="footer-links">
              {RESOURCES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col">
            <h2 className="footer-heading">Get in touch</h2>
            <ul className="footer-links">
              <li>
                <a href="mailto:studio@prismdesign.co">studio@prismdesign.co</a>
              </li>
              <li>
                <a href="tel:+441179460112">+44 117 946 0112</a>
              </li>
              <li>
                <a href="https://www.behance.net" rel="noreferrer noopener" target="_blank">
                  Behance
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com" rel="noreferrer noopener" target="_blank">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-fineprint">
            © {year} Prism Studio Ltd. All rights reserved.
          </p>
          <p className="footer-fineprint">
            Mondays to Thursdays, 09:00–18:00 GMT. New projects booking from next quarter.
          </p>
        </div>
      </div>
    </footer>
  );
}