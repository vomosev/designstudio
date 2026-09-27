'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { getProject } from '../../../lib/api';
import { FALLBACK_PROJECTS } from '../../../lib/content';
import PageShell from '../../../components/layout/PageShell';
import ProjectCard from '../../../components/ProjectCard';
import Artwork from '../../../components/ui/Artwork';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import Spinner from '../../../components/ui/Spinner';

function parsePalette(palette) {
  if (!palette) return [];
  if (Array.isArray(palette)) return palette.filter(Boolean);
  if (typeof palette === 'string') {
    return palette
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean);
  }
  return [];
}

const PALETTE_TOKENS = {
  accent: 'var(--accent)',
  'accent-hover': 'var(--accent-hover)',
  surface: 'var(--surface)',
  'surface-raised': 'var(--surface-raised)',
  border: 'var(--border)',
  text: 'var(--text)',
  'text-muted': 'var(--text-muted)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  background: 'var(--bg)',
};

function swatchColor(token, index, project) {
  if (PALETTE_TOKENS[token]) return PALETTE_TOKENS[token];
  const baseHue = Number(project?.coverHue ?? project?.cover_hue ?? 12);
  const endHue = Number(project?.coverHueEnd ?? project?.cover_hue_end ?? baseHue + 48);
  const spread = (endHue - baseHue) / 4;
  return `hsl(${Math.round(baseHue + spread * index)} 62% 56%)`;
}

function bodyParagraphs(body) {
  if (!body || typeof body !== 'string') return [];
  return body
    .split(/\n{2,}|\r\n\r\n/)
    .map((para) => para.trim())
    .filter(Boolean);
}

export default function ProjectDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [offline, setOffline] = useState(false);

  const load = useCallback(
    async (signal) => {
      if (!slug) {
        setStatus('error');
        setErrorMessage('No project was requested.');
        return;
      }

      setStatus('loading');
      setErrorMessage('');
      setOffline(false);

      try {
        const data = await getProject(slug, { signal });
        if (signal?.aborted) return;
        const found = data?.project || data;
        if (!found || !found.slug) {
          throw Object.assign(new Error('Project not found'), { status: 404 });
        }
        setProject(found);
        setRelated(Array.isArray(data?.related) ? data.related : []);
        setStatus('success');
      } catch (err) {
        if (signal?.aborted || err?.name === 'AbortError') return;

        const fallback = FALLBACK_PROJECTS.find((item) => item.slug === slug);
        if (fallback && err?.status !== 404) {
          setProject(fallback);
          setRelated(
            FALLBACK_PROJECTS.filter(
              (item) => item.slug !== fallback.slug && item.category === fallback.category
            ).slice(0, 3)
          );
          setOffline(true);
          setStatus('success');
          return;
        }

        setProject(null);
        setRelated([]);
        setErrorMessage(
          err?.status === 404
            ? 'We could not find that project. It may have been retired from the portfolio.'
            : err?.message || 'Unable to reach the studio API.'
        );
        setStatus('error');
      }
    },
    [slug]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="stack stack--lg" aria-busy="true">
        <div className="skeleton skeleton--hero" />
        <div className="stack stack--sm">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
        </div>
        <div className="center-row">
          <Spinner size="md" label="Loading project" />
        </div>
      </div>
    );
  }

  if (status === 'error' || !project) {
    return (
      <div className="stack stack--lg">
        <EmptyState
          variant="error"
          title="This project is unavailable"
          description={errorMessage}
          action={
            <div className="cluster">
              <Button variant="primary" onClick={() => load()}>
                Try again
              </Button>
              <Button as={Link} href="/work" variant="secondary">
                Back to all work
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const palette = parsePalette(project.palette);
  const paragraphs = bodyParagraphs(project.body);
  const hue = project.coverHue ?? project.cover_hue ?? 12;
  const hueEnd = project.coverHueEnd ?? project.cover_hue_end ?? Number(hue) + 48;

  return (
    <div className="stack stack--xl">
      <PageShell
        eyebrow={project.category || 'Case study'}
        title={project.title}
        lead={project.summary}
        actions={
          <Button as={Link} href="/work" variant="ghost" size="sm">
            All work
          </Button>
        }
      >
        {offline ? (
          <p className="notice notice--warning" role="status">
            Showing an archived copy of this case study — the studio API is temporarily
            unreachable.
          </p>
        ) : null}

        <div className="project-hero">
          <Artwork
            hue={hue}
            hueEnd={hueEnd}
            label={`Cover artwork for ${project.title}`}
            ratio="16/9"
          />
        </div>

        <div className="cluster project-meta">
          {project.client ? <Badge tone="neutral">{project.client}</Badge> : null}
          {project.category ? <Badge tone="accent">{project.category}</Badge> : null}
          {project.year ? <Badge tone="neutral">{project.year}</Badge> : null}
          {project.featured ? <Badge tone="success">Featured</Badge> : null}
        </div>

        <div className="prose">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, index) => <p key={index}>{para}</p>)
          ) : (
            <p>{project.summary}</p>
          )}
        </div>

        {palette.length > 0 ? (
          <section className="stack stack--sm">
            <h2>Palette</h2>
            <ul className="palette-row" aria-label="Project colour palette">
              {palette.map((token, index) => (
                <li key={`${token}-${index}`} className="palette-swatch">
                  <span
                    className="palette-swatch__chip"
                    style={{ background: swatchColor(token, index, project) }}
                    aria-hidden="true"
                  />
                  <span className="palette-swatch__label">{token}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="stack stack--md">
          <h2>Related work</h2>
          {related.length > 0 ? (
            <div className="project-grid">
              {related.map((item) => (
                <ProjectCard key={item.id || item.slug} project={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="empty"
              title="No related projects yet"
              description="We are still adding case studies in this category. Browse the full portfolio in the meantime."
              action={
                <Button as={Link} href="/work" variant="secondary">
                  Browse all work
                </Button>
              }
            />
          )}
        </section>

        <section className="stack stack--sm">
          <h2>Have a project like this?</h2>
          <p>
            Tell us about the brand, the timeline and the audience — we will come back within two
            working days with a point of view and a proposed shape of work.
          </p>
          <div className="cluster">
            <Button as={Link} href="/contact" variant="primary">
              Start a project
            </Button>
            <Button as={Link} href="/services" variant="ghost">
              See our services
            </Button>
          </div>
        </section>
      </PageShell>
    </div>
  );
}