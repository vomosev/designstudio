'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProjects } from '../lib/api';
import { FALLBACK_PROJECTS } from '../lib/content';
import ProjectCard from './ProjectCard';
import EmptyState from './ui/EmptyState';
import Button from './ui/Button';

const CATEGORIES = ['All', 'Branding', 'Packaging', 'Editorial', 'Digital'];

function SkeletonCard() {
  return (
    <div className="card project-card project-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--artwork" />
      <div className="card-body stack">
        <div className="skeleton skeleton--line skeleton--line-sm" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line skeleton--line-lg" />
      </div>
    </div>
  );
}

export default function ProjectGrid({
  category,
  featuredOnly = false,
  limit,
  showFilters = false,
}) {
  const [activeCategory, setActiveCategory] = useState(category || 'All');
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading');
  const [usedFallback, setUsedFallback] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const effectiveCategory = showFilters ? activeCategory : category || 'All';

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setStatus('loading');
      setUsedFallback(false);

      const params = {};
      if (effectiveCategory && effectiveCategory !== 'All') {
        params.category = effectiveCategory;
      }
      if (featuredOnly) params.featured = 1;
      if (limit) params.limit = limit;

      try {
        const data = await getProjects(params, { signal: controller.signal });
        if (cancelled) return;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data && data.projects)
            ? data.projects
            : [];
        setProjects(list);
        setStatus('ready');
      } catch (err) {
        if (cancelled || (err && err.name === 'AbortError')) return;
        const fallback = FALLBACK_PROJECTS.filter((project) => {
          if (effectiveCategory && effectiveCategory !== 'All' && project.category !== effectiveCategory) {
            return false;
          }
          if (featuredOnly && !project.featured) return false;
          return true;
        }).slice(0, limit || FALLBACK_PROJECTS.length);

        if (fallback.length > 0) {
          setProjects(fallback);
          setUsedFallback(true);
          setStatus('ready');
        } else {
          setProjects([]);
          setStatus('error');
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [effectiveCategory, featuredOnly, limit, reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  const skeletonCount = useMemo(() => {
    const n = limit && limit > 0 ? Math.min(limit, 6) : 6;
    return Array.from({ length: n }, (_, i) => i);
  }, [limit]);

  return (
    <div className="project-grid-wrap stack">
      {showFilters ? (
        <div className="cluster filter-cluster" role="group" aria-label="Filter projects by category">
          {CATEGORIES.map((item) => (
            <Button
              key={item}
              variant={item === activeCategory ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(item)}
              aria-pressed={item === activeCategory}
            >
              {item}
            </Button>
          ))}
        </div>
      ) : null}

      {usedFallback && status === 'ready' ? (
        <p className="notice notice--warning" role="status">
          Showing our archived selection — live studio data is temporarily unavailable.
        </p>
      ) : null}

      {status === 'loading' ? (
        <div className="project-grid" aria-busy="true" aria-live="polite">
          {skeletonCount.map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <EmptyState
          variant="error"
          title="We couldn't load the portfolio"
          description="The studio API didn't respond. Check your connection and try again — the work is still there, we promise."
          action={
            <Button variant="primary" size="md" onClick={retry}>
              Retry
            </Button>
          }
        />
      ) : null}

      {status === 'ready' && projects.length === 0 ? (
        <EmptyState
          variant="empty"
          title="No projects in this category yet"
          description="We're still photographing and writing up this part of the archive. Browse another category or get in touch to see more."
          action={
            showFilters && activeCategory !== 'All' ? (
              <Button variant="secondary" size="md" onClick={() => setActiveCategory('All')}>
                View all work
              </Button>
            ) : null
          }
        />
      ) : null}

      {status === 'ready' && projects.length > 0 ? (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id || project.slug} project={project} />
          ))}
        </div>
      ) : null}
    </div>
  );
}