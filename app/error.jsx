'use client';

import { useEffect } from 'react';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (error) {
      // Surface the failure in the browser console for debugging.
      // eslint-disable-next-line no-console
      console.error('Prism Studio page error:', error);
    }
  }, [error]);

  const message =
    (error && typeof error.message === 'string' && error.message.trim()) ||
    'Something interrupted this page while it was loading.';

  return (
    <section className="section stack" aria-labelledby="route-error-heading">
      <h1 id="route-error-heading" className="visually-hidden">
        Page error
      </h1>
      <EmptyState
        variant="error"
        title="This page could not be displayed"
        description={`${message} You can try again, or head back to the studio work index while we look into it.`}
        action={
          <div className="cluster">
            <Button variant="primary" size="md" onClick={() => reset()}>
              Try again
            </Button>
            <Button as="a" href="/work" variant="secondary" size="md">
              Browse the work
            </Button>
            <Button as="a" href="/" variant="ghost" size="md">
              Back to home
            </Button>
          </div>
        }
      />
    </section>
  );
}