import Link from 'next/link';
import PageShell from '../components/layout/PageShell';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export const metadata = {
  title: 'Page not found — Prism Studio',
  description:
    'The page you were looking for is no longer part of the Prism Studio site. Browse our work or head back to the homepage.',
};

export default function NotFound() {
  return (
    <PageShell
      eyebrow="Error 404"
      title="That page has been retired"
      lead="The link you followed points to a page we have archived or renamed. Our case studies move around as projects go public — the work index below is always current."
    >
      <EmptyState
        variant="error"
        title="We couldn't find that page"
        description="Check the address for a typo, or jump straight to the portfolio. If you arrived here from a link on another site, we'd genuinely like to know — email studio@prismdesign.co."
        action={
          <div className="cluster">
            <Button as={Link} href="/" variant="primary" size="md">
              Back to homepage
            </Button>
            <Button as={Link} href="/work" variant="secondary" size="md">
              Browse the work
            </Button>
          </div>
        }
      />
    </PageShell>
  );
}