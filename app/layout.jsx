import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/AuthContext';
import SiteHeader from '../components/layout/SiteHeader';
import SiteFooter from '../components/layout/SiteFooter';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  fallback: [
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
});

export const metadata = {
  metadataBase: new URL('https://designstudio.arx-app.com'),
  title: 'Prism Studio — Graphic Design & Brand Systems',
  description:
    'Prism Studio is an independent graphic design practice building brand identities, packaging systems, editorial work and digital products for ambitious teams.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Prism Studio — Graphic Design & Brand Systems',
    description:
      'Identity, packaging and digital systems designed to be lived in. See selected work from Prism Studio.',
    url: 'https://designstudio.arx-app.com',
    siteName: 'Prism Studio',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0f14',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="site-body">
        <AuthProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" className="shell site-main">
            {children}
          </main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}