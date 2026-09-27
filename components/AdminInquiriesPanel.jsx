'use client';

import { useCallback, useEffect, useState } from 'react';
import { getInquiries, updateInquiryStatus } from '../lib/api';
import Table from './ui/Table';
import Modal from './ui/Modal';
import { Field, Select } from './ui/Field';
import Badge from './ui/Badge';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In review' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In review' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_TONES = {
  new: 'accent',
  in_review: 'warning',
  replied: 'success',
  archived: 'neutral',
};

function statusLabel(value) {
  const found = STATUS_OPTIONS.find((option) => option.value === value);
  return found ? found.label : 'Unknown';
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminInquiriesPanel() {
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const load = useCallback(
    async (statusFilter) => {
      setLoading(true);
      setError(null);
      try {
        const status = statusFilter === 'all' ? undefined : statusFilter;
        const data = await getInquiries(status);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.inquiries)
            ? data.inquiries
            : [];
        setInquiries(list);
      } catch (err) {
        setInquiries([]);
        setError(err?.message || 'Unable to load inquiries right now.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;
    (async () => {
      if (!active) return;
      await load(filter);
    })();
    return () => {
      active = false;
    };
  }, [filter, load]);

  async function handleStatusChange(inquiry, nextStatus) {
    if (!inquiry || inquiry.status === nextStatus) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateInquiryStatus(inquiry.id, nextStatus);
      const nextRecord =
        updated && updated.inquiry
          ? updated.inquiry
          : updated && updated.id
            ? updated
            : { ...inquiry, status: nextStatus };

      setInquiries((current) => {
        const merged = current.map((item) =>
          item.id === inquiry.id ? { ...item, ...nextRecord } : item
        );
        if (filter !== 'all') {
          return merged.filter((item) => item.status === filter);
        }
        return merged;
      });
      setSelected((current) =>
        current && current.id === inquiry.id ? { ...current, ...nextRecord } : current
      );
    } catch (err) {
      setSaveError(err?.message || 'Could not update that inquiry status.');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Client',
      render: (row) => (
        <div className="stack stack--tight">
          <span className="table__primary truncate">{row.name}</span>
          <span className="table__meta truncate">{row.company || 'Independent'}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <a className="table__link truncate" href={`mailto:${row.email}`}>
          {row.email}
        </a>
      ),
    },
    {
      key: 'service',
      header: 'Service',
      render: (row) => <span className="truncate">{row.service || 'Not specified'}</span>,
    },
    {
      key: 'budgetRange',
      header: 'Budget',
      render: (row) => <span>{row.budgetRange || row.budget_range || '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Received',
      render: (row) => <span>{formatDate(row.createdAt || row.created_at)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={STATUS_TONES[row.status] || 'neutral'} size="sm">
          {statusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSaveError(null);
            setSelected(row);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  if (error && !loading) {
    return (
      <section className="panel stack">
        <div className="cluster panel__toolbar" role="group" aria-label="Filter inquiries by status">
          {STATUS_FILTERS.map((item) => (
            <Button
              key={item.value}
              variant={filter === item.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <EmptyState
          variant="error"
          title="We couldn't load the inbox"
          description={error}
          action={
            <Button variant="primary" size="md" onClick={() => load(filter)}>
              Try again
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section className="panel stack">
      <div className="panel__head">
        <div className="stack stack--tight">
          <h2 className="panel__title">Client inquiries</h2>
          <p className="panel__lead">
            Every enquiry sent through the contact form lands here. Update the status as your team
            picks the conversation up.
          </p>
        </div>
      </div>

      <div className="cluster panel__toolbar" role="group" aria-label="Filter inquiries by status">
        {STATUS_FILTERS.map((item) => (
          <Button
            key={item.value}
            variant={filter === item.value ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <Table
        columns={columns}
        rows={inquiries}
        loading={loading}
        getRowKey={(row) => row.id}
        emptyMessage={
          filter === 'all'
            ? 'No inquiries yet. New enquiries from the contact form will appear here.'
            : `No inquiries with the status "${statusLabel(filter)}" right now.`
        }
      />

      <Modal
        open={Boolean(selected)}
        title={selected ? `Inquiry from ${selected.name}` : 'Inquiry'}
        description={
          selected
            ? `Received ${formatDateTime(selected.createdAt || selected.created_at)}`
            : undefined
        }
        onClose={() => {
          setSelected(null);
          setSaveError(null);
        }}
        footer={
          <div className="cluster cluster--end">
            {selected ? (
              <Button
                as="a"
                variant="secondary"
                size="md"
                href={`mailto:${selected.email}?subject=Re:%20your%20enquiry%20to%20Prism%20Studio`}
              >
                Reply by email
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setSelected(null);
                setSaveError(null);
              }}
            >
              Close
            </Button>
          </div>
        }
      >
        {selected ? (
          <div className="stack">
            <dl className="detail-list">
              <div className="detail-list__row">
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                </dd>
              </div>
              <div className="detail-list__row">
                <dt>Company</dt>
                <dd>{selected.company || 'Independent'}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Service</dt>
                <dd>{selected.service || 'Not specified'}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Budget</dt>
                <dd>{selected.budgetRange || selected.budget_range || 'Not specified'}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Status</dt>
                <dd>
                  <Badge tone={STATUS_TONES[selected.status] || 'neutral'} size="sm">
                    {statusLabel(selected.status)}
                  </Badge>
                </dd>
              </div>
            </dl>

            <div className="inquiry-message prose">
              <h3>Message</h3>
              {String(selected.message || '')
                .split(/\n{2,}/)
                .filter((paragraph) => paragraph.trim().length > 0)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph.trim()}</p>
                ))}
              {!selected.message ? <p>No message was included with this enquiry.</p> : null}
            </div>

            <Field
              label="Update status"
              htmlFor="inquiry-status"
              hint="Changes are saved immediately."
              error={saveError}
            >
              <Select
                id="inquiry-status"
                name="status"
                value={selected.status || 'new'}
                disabled={saving}
                aria-invalid={saveError ? 'true' : undefined}
                onChange={(event) => handleStatusChange(selected, event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}