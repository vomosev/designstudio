'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import Button from '../ui/Button';

const NAV_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'Studio' },
  { href: '/contact', label: 'Contact' },
];

function isActivePath(pathname, href) {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  let auth = { user: null, status: 'anonymous', signOut: async () => {} };
  try {
    // useAuth throws outside the provider; the header must still render.
    auth = useAuth();
  } catch (err) {
    auth = { user: null, status: 'anonymous', signOut: async () => {} };
  }

  const { user, status, signOut } = auth;

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close the panel whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll + close on Escape while the mobile panel is open.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      setMenuOpen(false);
      router.push('/');
    } catch (err) {
      // Session is cleared locally by the context even if the request failed.
      setMenuOpen(false);
    } finally {
      setSigningOut(false);
    }
  };

  const authenticated = status === 'authenticated' && user;

  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <Link href="/" className="wordmark" aria-label="Prism Studio — home">
          <span className="wordmark__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" focusable="false" aria-hidden="true">
              <path d="M12 2.5 22 20.5H2L12 2.5Z" fill="currentColor" opacity="0.9" />
              <path d="M12 2.5 22 20.5H12V2.5Z" fill="currentColor" opacity="0.45" />
            </svg>
          </span>
          <span className="wordmark__text">Prism Studio</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul className="site-nav__list cluster">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={active ? 'site-nav__link is-active' : 'site-nav__link'}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header__actions cluster">
          {status === 'loading' ? (
            <span className="site-header__status" aria-live="polite">
              Checking session…
            </span>
          ) : authenticated ? (
            <>
              <span className="site-header__user truncate" title={user.name || user.email}>
                {user.name || user.email}
              </span>
              <Button as="link" href="/admin" variant="secondary" size="sm">
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} loading={signingOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button as="link" href="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button as="link" href="/contact" variant="primary" size="sm">
                Start a project
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
            {menuOpen ? (
              <path
                d="M5 5 19 19M19 5 5 19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen ? (
        <>
          <div
            className="site-mobile__backdrop"
            role="presentation"
            onClick={closeMenu}
          />
          <div className="site-mobile" id="site-mobile-nav">
            <nav aria-label="Mobile">
              <ul className="site-mobile__list stack">
                {NAV_LINKS.map((link) => {
                  const active = isActivePath(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={active ? 'site-mobile__link is-active' : 'site-mobile__link'}
                        aria-current={active ? 'page' : undefined}
                        onClick={closeMenu}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="site-mobile__actions stack">
              {authenticated ? (
                <>
                  <span className="site-header__user truncate">
                    Signed in as {user.name || user.email}
                  </span>
                  <Button as="link" href="/admin" variant="secondary" size="md" onClick={closeMenu}>
                    Dashboard
                  </Button>
                  <Button variant="ghost" size="md" onClick={handleSignOut} loading={signingOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button as="link" href="/login" variant="secondary" size="md" onClick={closeMenu}>
                    Sign in
                  </Button>
                  <Button as="link" href="/signup" variant="ghost" size="md" onClick={closeMenu}>
                    Create account
                  </Button>
                  <Button as="link" href="/contact" variant="primary" size="md" onClick={closeMenu}>
                    Start a project
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}