'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../lib/api';
import Table from './ui/Table';
import Modal from './ui/Modal';
import { Field, Input, Textarea, Select } from './ui/Field';
import Button from './ui/Button';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';

const CATEGORIES = ['Branding', 'Packaging', 'Editorial', 'Digital', 'Motion'];
const STATUSES = ['published', 'draft'];

const EMPTY_FORM = {
  title: '',
  client: '',
  category: 'Branding',
  year: String(new Date().getFullYear()),
  summary: '',
  body: '',
  coverHue: '18',
  coverHueEnd: '284',
  featured: 'no',
  status: 'published',
  sortOrder: '0',
};

function toForm(project) {
  if (!project) return { ...EMPTY_FORM };
  return {
    title: project.title || '',
    client: project.client || '',
    category: project.category || 'Branding',
    year: project.year != null ? String(project.year) : String(new Date().getFullYear()),
    summary: project.summary || '',
    body: project.body || '',
    coverHue: project.coverHue != null ? String(project.coverHue) : '18',
    coverHueEnd: project.coverHueEnd != null ? String(project.coverHueEnd) : '284',
    featured: project.featured ? 'yes' : 'no',
    status: project.status || 'published',
    sortOrder: project.sortOrder != null ? String(project.sortOrder) : '0',
  };
}

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'A project title is required.';
  else if (form.title.trim().length > 160) errors.title = 'Keep the title under 160 characters.';
  if (!form.client.trim()) errors.client = 'Name the client or internal owner.';
  if (!form.summary.trim()) errors.summary = 'Write a one-line summary for the card.';
  else if (form.summary.trim().length > 280) errors.summary = 'Summaries are limited to 280 characters.';

  const year = Number(form.year);
  if (!form.year.trim() || Number.isNaN(year) || year < 1970 || year > 2100) {
    errors.year = 'Enter a year between 1970 and 2100.';
  }
  const hue = Number(form.coverHue);
  if (Number.isNaN(hue) || hue < 0 || hue > 360) errors.coverHue = 'Hue must be 0–360.';
  const hueEnd = Number(form.coverHueEnd);
  if (Number.isNaN(hueEnd) || hueEnd < 0 || hueEnd > 360) errors.coverHueEnd = 'Hue must be 0–360.';
  const sortOrder = Number(form.sortOrder);
  if (Number.isNaN(sortOrder)) errors.sortOrder = 'Sort order must be a number.';
  return errors;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getProjects({ limit: 100 });
      const list = Array.isArray(data) ? data : Array.isArray(data?.projects) ? data.projects : [];
      setProjects(list);
    } catch (err) {
      setLoadError(err?.message || 'Unable to load the portfolio right now.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getProjects({ limit: 100 });
        if (!active) return;
        const list = Array.isArray(data) ? data : Array.isArray(data?.projects) ? data.projects : [];
        setProjects(list);
      } catch (err) {
        if (!active) return;
        setLoadError(err?.message || 'Unable to load the portfolio right now.');
        setProjects([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFieldErrors({});
    setSaveError(null);
    setEditorOpen(true);
  }

  function openEdit(project) {
    setEditing(project);
    setForm(toForm(project));
    setFieldErrors({});
    setSaveError(null);
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving) return;
    setEditorOpen(false);
    setEditing(null);
    setSaveError(null);
  }

  function setValue(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      client: form.client.trim(),
      category: form.category,
      year: Number(form.year),
      summary: form.summary.trim(),
      body: form.body.trim(),
      coverHue: Number(form.coverHue),
      coverHueEnd: Number(form.coverHueEnd),
      featured: form.featured === 'yes',
      status: form.status,
      sortOrder: Number(form.sortOrder),
    };

    setSaving(true);
    setSaveError(null);
    try {
      if (editing) {
        await updateProject(editing.id, payload);
        setNotice(`“${payload.title}” has been updated.`);
      } else {
        await createProject(payload);
        setNotice(`“${payload.title}” has been added to the portfolio.`);
      }
      setEditorOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      setSaveError(err?.message || 'The project could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProject(pendingDelete.id);
      setNotice(`“${pendingDelete.title}” has been removed.`);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setDeleteError(err?.message || 'The project could not be deleted.');
    } finally {
      setDeleting(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Project',
        render: (row) => (
          <div className="stack stack--tight">
            <span className="project-title table__primary">{row.title}</span>
            <span className="text-muted text-sm">{row.slug}</span>
          </div>
        ),
      },
      { key: 'client', header: 'Client', render: (row) => row.client || '—' },
      { key: 'category', header: 'Category', render: (row) => <Badge tone="neutral" size="sm">{row.category || 'Uncategorised'}</Badge> },
      { key: 'year', header: 'Year', align: 'right', width: '88px', render: (row) => row.year || '—' },
      {
        key: 'status',
        header: 'Status',
        width: '140px',
        render: (row) => (
          <div className="cluster cluster--tight">
            <Badge tone={row.status === 'published' ? 'success' : 'warning'} size="sm">
              {row.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
            {row.featured ? (
              <Badge tone="accent" size="sm">
                Featured
              </Badge>
            ) : null}
          </div>
        ),
      },
      { key: 'updatedAt', header: 'Updated', width: '140px', render: (row) => formatDate(row.updatedAt || row.createdAt) },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        width: '180px',
        render: (row) => (
          <div className="cluster cluster--tight cluster--end">
            <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setDeleteError(null);
                setPendingDelete(row);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <section className="panel stack" aria-labelledby="admin-projects-heading">
      <header className="panel__header cluster cluster--between">
        <div className="stack stack--tight">
          <h2 id="admin-projects-heading">Portfolio projects</h2>
          <p className="text-muted">
            Create, refine and retire the case studies shown on the public Work pages.
          </p>
        </div>
        <div className="cluster cluster--tight">
          <Button variant="ghost" size="md" onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={openCreate}>
            New project
          </Button>
        </div>
      </header>

      {notice ? (
        <p className="alert alert--success" role="status">
          {notice}
        </p>
      ) : null}

      {loadError && !loading ? (
        <EmptyState
          variant="error"
          title="We couldn’t load the portfolio"
          description={loadError}
          action={
            <Button variant="primary" size="md" onClick={load}>
              Try again
            </Button>
          }
        />
      ) : (
        <Table
          columns={columns}
          rows={projects}
          loading={loading}
          getRowKey={(row) => row.id ?? row.slug}
          emptyMessage="No projects yet — add your first case study to fill the Work page."
        />
      )}

      <Modal
        open={editorOpen}
        onClose={closeEditor}
        title={editing ? `Edit ${editing.title}` : 'New project'}
        description="Details here appear on the public portfolio grid and project detail page."
        footer={
          <div className="cluster cluster--end cluster--tight">
            <Button variant="ghost" size="md" onClick={closeEditor} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              form="project-editor-form"
              loading={saving}
            >
              {editing ? 'Save changes' : 'Create project'}
            </Button>
          </div>
        }
      >
        <form id="project-editor-form" className="stack" onSubmit={handleSubmit} noValidate>
          {saveError ? (
            <p className="alert alert--danger" role="alert">
              {saveError}
            </p>
          ) : null}

          <Field label="Title" htmlFor="project-title" required error={fieldErrors.title}>
            <Input
              id="project-title"
              name="title"
              value={form.title}
              onChange={(e) => setValue('title', e.target.value)}
              placeholder="Aster Botanicals — Packaging System"
              aria-invalid={fieldErrors.title ? 'true' : undefined}
            />
          </Field>

          <div className="grid grid--two">
            <Field label="Client" htmlFor="project-client" required error={fieldErrors.client}>
              <Input
                id="project-client"
                name="client"
                value={form.client}
                onChange={(e) => setValue('client', e.target.value)}
                placeholder="Aster Botanicals"
                aria-invalid={fieldErrors.client ? 'true' : undefined}
              />
            </Field>

            <Field label="Category" htmlFor="project-category">
              <Select
                id="project-category"
                name="category"
                value={form.category}
                onChange={(e) => setValue('category', e.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid--two">
            <Field label="Year" htmlFor="project-year" required error={fieldErrors.year}>
              <Input
                id="project-year"
                name="year"
                inputMode="numeric"
                value={form.year}
                onChange={(e) => setValue('year', e.target.value)}
                aria-invalid={fieldErrors.year ? 'true' : undefined}
              />
            </Field>

            <Field
              label="Sort order"
              htmlFor="project-sort"
              hint="Lower numbers appear first on the Work page."
              error={fieldErrors.sortOrder}
            >
              <Input
                id="project-sort"
                name="sortOrder"
                inputMode="numeric"
                value={form.sortOrder}
                onChange={(e) => setValue('sortOrder', e.target.value)}
                aria-invalid={fieldErrors.sortOrder ? 'true' : undefined}
              />
            </Field>
          </div>

          <Field
            label="Summary"
            htmlFor="project-summary"
            required
            hint="One sentence, up to 280 characters, shown on the project card."
            error={fieldErrors.summary}
          >
            <Textarea
              id="project-summary"
              name="summary"
              rows={3}
              value={form.summary}
              onChange={(e) => setValue('summary', e.target.value)}
              placeholder="A refillable packaging system for a botanical skincare range, built around a single-plate print process."
              aria-invalid={fieldErrors.summary ? 'true' : undefined}
            />
          </Field>

          <Field
            label="Case study body"
            htmlFor="project-body"
            hint="Separate paragraphs with a blank line."
          >
            <Textarea
              id="project-body"
              name="body"
              rows={8}
              value={form.body}
              onChange={(e) => setValue('body', e.target.value)}
              placeholder="We began with a shelf audit across twelve stockists…"
            />
          </Field>

          <div className="grid grid--two">
            <Field
              label="Cover hue (start)"
              htmlFor="project-hue"
              hint="0–360, drives the gradient artwork."
              error={fieldErrors.coverHue}
            >
              <Input
                id="project-hue"
                name="coverHue"
                inputMode="numeric"
                value={form.coverHue}
                onChange={(e) => setValue('coverHue', e.target.value)}
                aria-invalid={fieldErrors.coverHue ? 'true' : undefined}
              />
            </Field>

            <Field
              label="Cover hue (end)"
              htmlFor="project-hue-end"
              hint="0–360, the second gradient stop."
              error={fieldErrors.coverHueEnd}
            >
              <Input
                id="project-hue-end"
                name="coverHueEnd"
                inputMode="numeric"
                value={form.coverHueEnd}
                onChange={(e) => setValue('coverHueEnd', e.target.value)}
                aria-invalid={fieldErrors.coverHueEnd ? 'true' : undefined}
              />
            </Field>
          </div>

          <div className="grid grid--two">
            <Field label="Featured" htmlFor="project-featured" hint="Featured projects lead the home page.">
              <Select
                id="project-featured"
                name="featured"
                value={form.featured}
                onChange={(e) => setValue('featured', e.target.value)}
              >
                <option value="no">Not featured</option>
                <option value="yes">Featured</option>
              </Select>
            </Field>

            <Field label="Status" htmlFor="project-status">
              <Select
                id="project-status"
                name="status"
                value={form.status}
                onChange={(e) => setValue('status', e.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === 'published' ? 'Published' : 'Draft'}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        title="Delete this project?"
        description="The case study will be removed from the public site immediately. This cannot be undone."
        footer={
          <div className="cluster cluster--end cluster--tight">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
            >
              Keep project
            </Button>
            <Button variant="danger" size="md" onClick={handleDelete} loading={deleting}>
              Delete project
            </Button>
          </div>
        }
      >
        <div className="stack">
          {deleteError ? (
            <p className="alert alert--danger" role="alert">
              {deleteError}
            </p>
          ) : null}
          <p className="prose">
            You are about to delete <strong>{pendingDelete ? pendingDelete.title : ''}</strong>
            {pendingDelete && pendingDelete.client ? ` for ${pendingDelete.client}` : ''}.
          </p>
        </div>
      </Modal>
    </section>
  );
}