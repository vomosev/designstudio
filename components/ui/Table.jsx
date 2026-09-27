'use client';

import EmptyState from './EmptyState';

function SkeletonRows({ columns, count = 5 }) {
  const rows = Array.from({ length: count });
  return (
    <>
      {rows.map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className="table__row table__row--skeleton">
          {columns.map((column, columnIndex) => (
            <td
              key={`skeleton-cell-${rowIndex}-${column.key || columnIndex}`}
              className="table__cell"
              style={column.align ? { textAlign: column.align } : undefined}
            >
              <span className="skeleton skeleton--text" aria-hidden="true" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function Table({
  columns = [],
  rows = [],
  getRowKey,
  emptyMessage = 'Nothing to show here yet.',
  emptyTitle = 'No records found',
  loading = false,
  caption,
}) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  if (safeColumns.length === 0) {
    return (
      <EmptyState
        variant="error"
        title="Table misconfigured"
        description="No columns were supplied to this table, so there is nothing to display."
      />
    );
  }

  const resolveKey = (row, index) => {
    if (typeof getRowKey === 'function') {
      try {
        const key = getRowKey(row, index);
        if (key !== undefined && key !== null && key !== '') return String(key);
      } catch (err) {
        // fall through to index-based key
      }
    }
    if (row && (row.id !== undefined && row.id !== null)) return String(row.id);
    return `row-${index}`;
  };

  const renderCell = (column, row, rowIndex) => {
    try {
      if (typeof column.render === 'function') {
        return column.render(row, rowIndex);
      }
      const value = row ? row[column.key] : undefined;
      if (value === undefined || value === null || value === '') return '—';
      if (typeof value === 'object') return String(value);
      return value;
    } catch (err) {
      return '—';
    }
  };

  const showEmpty = !loading && safeRows.length === 0;

  return (
    <div className="table-wrap">
      <div className="table-scroll" role="region" aria-live="polite" aria-busy={loading || undefined}>
        <table className="table">
          {caption ? <caption className="table__caption">{caption}</caption> : null}
          <thead className="table__head">
            <tr className="table__row">
              {safeColumns.map((column, index) => (
                <th
                  key={column.key || `column-${index}`}
                  scope="col"
                  className="table__header-cell"
                  style={{
                    ...(column.width ? { width: column.width } : null),
                    ...(column.align ? { textAlign: column.align } : null),
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table__body">
            {loading ? (
              <SkeletonRows columns={safeColumns} />
            ) : (
              safeRows.map((row, rowIndex) => (
                <tr key={resolveKey(row, rowIndex)} className="table__row">
                  {safeColumns.map((column, columnIndex) => (
                    <td
                      key={`${resolveKey(row, rowIndex)}-${column.key || columnIndex}`}
                      className="table__cell"
                      style={column.align ? { textAlign: column.align } : undefined}
                    >
                      {renderCell(column, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showEmpty ? (
        <div className="table__empty">
          <EmptyState variant="empty" title={emptyTitle} description={emptyMessage} />
        </div>
      ) : null}
    </div>
  );
}