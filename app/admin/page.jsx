'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import PageShell from '../../components/layout/PageShell';
import AdminProjectsPanel from '../../components/AdminProjectsPanel';
import AdminInquiriesPanel from '../../components/AdminInquiriesPanel';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { getProjects, getInquiries } from '../../lib/api';

const TABS = [
  { id: 'projects', label: 'Portfolio projects' },
  { id: 'inquiries', label: 'Client inquiries' }
];

export default function AdminPage() {
  const { user, status, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('projects');
  const [counts, setCounts] = useState({ projects: null, inquiries: null, newInquiries: null });
  const [countsError, setCountsError] = useState('');

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/login');
    }
  }, [status, router]);

  const loadCounts = useCallback(async () => {
    if (status !== 'authenticated') return;
    setCountsError('');
    try {
      const [projects, inquiries] = await Promise.all([getProjects(), getInquiries()]);
      const projectList = Array.isArray(projects) ? projects : [];
      const inquiryList = Array.isArray(inquiries) ? inquiries : [];
      setCounts({
        projects: projectList.length,
        inquiries: inquiryList.length,
        newInquiries: inquiryList.filter((item) => item && item.status === 'new').length
      });
    } catch (err) {
      setCountsError(err && err.message ? err.message : 'Unable to load dashboard totals.');
      setCounts({ projects: null, inquiries: null, newInquiries: null });
    }
  }, [status]);

  useEffect(() => {
    let active = true;
    if (status === 'authenticated') {
      loadCounts().catch(() => {
        if (active) setCountsError('Unable to load dashboard totals.');
      });
    }
    return () => {
      active = false;
    };
  }, [status, loadCounts]);

  if (status === 'loading') {
    return (
      <section className="panel panel--centred" aria-busy="true">
        <Spinner size="lg" label="Checking your studio session" />
        <p className="text-muted">Checking your studio session…</p>
      </section>
    );
  }

  if (status !== 'authenticated' || !user) {
    return (
      <section className="panel panel--centred" aria-live="polite">
        <Spinner size="md" label="Redirecting to sign in" />
        <p className="text-muted">Redirecting you to the sign-in page…</p>
      </section>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      /* signOut already records the error in context state */
    } finally {
      router.replace('/');
    }
  };

  const formatCount = (value) => (typeof value === 'number' ? String(value) : '—');

  return (
    <PageShell
      eyebrow="Studio dashboard"
      title={`Welcome back, ${user.name || 'Prism team'}`}
      lead="Manage the published portfolio and reply to incoming client inquiries. Everything here loads live from the studio API."
      actions={
        <>
          <Button variant="secondary" size="md" onClick={loadCounts}>
            Refresh totals
          </Button>
          <Button variant="ghost" size="md" onClick={handleSignOut}>
            Sign out
          </Button>
        </>
      }
    >
      <div className="stack">
        <section className="stat-strip" aria-label="Dashboard summary">
          <div className="stat">
            <span className="stat__value">{formatCount(counts.projects)}</span>
            <span className="stat__label">Projects in the catalogue</span>
          </div>
          <div className="stat">
            <span className="stat__value">{formatCount(counts.inquiries)}</span>
            <span className="stat__label">Inquiries received</span>
          </div>
          <div className="stat">
            <span className="stat__value">{formatCount(counts.newInquiries)}</span>
            <span className="stat__label">Awaiting a first reply</span>
          </div>
          <div className="stat">
            <span className="stat__value">{user.role === 'admin' ? 'Admin' : 'Editor'}</span>
            <span className="stat__label">Your access level</span>
          </div>
        </section>

        {countsError ? (
          <p className="alert alert--danger" role="alert">
            {countsError}
          </p>
        ) : null}

        <div className="tabs cluster" role="tablist" aria-label="Dashboard sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              className={`tab${tab === item.id ? ' tab--active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id="panel-projects"
          aria-labelledby="tab-projects"
          hidden={tab !== 'projects'}
        >
          {tab === 'projects' ? <AdminProjectsPanel onChange={loadCounts} /> : null}
        </div>

        <div
          role="tabpanel"
          id="panel-inquiries"
          aria-labelledby="tab-inquiries"
          hidden={tab !== 'inquiries'}
        >
          {tab === 'inquiries' ? <AdminInquiriesPanel onChange={loadCounts} /> : null}
        </div>
      </div>
    </PageShell>
  );
}