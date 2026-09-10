import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EmptyState } from './EmptyState';
import { SkeletonList } from './Skeleton';
import { LoadingSpinner } from './LoadingSpinner';

const alignClass = (align) =>
  align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

const cellValue = (col, row, index) => (col.render ? col.render(row[col.key], row, index) : row[col.key]);

/**
 * Renders a real table from `md` upwards and a stacked card list on phones, so
 * dense government data never forces horizontal scrolling on mobile.
 *
 * Column options: { key, label, render, align, width, primary, mobileHidden }
 */
export function DataTable({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  emptyDescription = 'Try adjusting your filters or search query.',
  onRowClick,
  rowClassName,
  className,
}) {
  const primaryColumn = columns.find((col) => col.primary) || columns[0];
  const detailColumns = columns.filter((col) => col !== primaryColumn && !col.mobileHidden);

  return (
    <div className={cn('w-full', className)}>
      {/* ---------- Mobile: stacked cards ---------- */}
      <div className="md:hidden">
        {loading ? (
          <SkeletonList rows={4} />
        ) : data.length === 0 ? (
          <div className="card-base">
            <EmptyState title={emptyMessage} description={emptyDescription} />
          </div>
        ) : (
          <ul className="space-y-2.5">
            {data.map((row, index) => {
              const rowKey = row.id || index;
              const isClickable = Boolean(onRowClick);
              const Wrapper = isClickable ? 'button' : 'div';

              return (
                <li key={rowKey}>
                  <Wrapper
                    {...(isClickable ? { type: 'button', onClick: () => onRowClick(row) } : {})}
                    className={cn(
                      'card-base w-full text-left p-4 space-y-3',
                      isClickable && 'press hover:border-brand-200 hover:shadow-card-hover',
                      typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 text-subhead font-semibold text-ink-900">
                        {cellValue(primaryColumn, row, index)}
                      </div>
                      {isClickable && (
                        <ChevronRight className="w-4 h-4 text-ink-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      )}
                    </div>

                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {detailColumns.map((col) => (
                        <div key={col.key || col.label} className="min-w-0">
                          <dt className="text-caption uppercase tracking-wide text-ink-400">{col.label}</dt>
                          <dd className="text-footnote text-ink-800 mt-0.5 truncate">
                            {cellValue(col, row, index)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Wrapper>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ---------- Desktop: table ---------- */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line bg-surface-50 text-caption font-semibold uppercase tracking-wider text-ink-400">
                {columns.map((col) => (
                  <th
                    key={col.key || col.label}
                    scope="col"
                    style={{ width: col.width }}
                    className={cn('px-4 py-3 select-none', alignClass(col.align), col.headerClassName)}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-footnote text-ink-900">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-ink-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <LoadingSpinner size="md" />
                      <span>Loading data…</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10">
                    <EmptyState title={emptyMessage} description={emptyDescription} />
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const rowKey = row.id || index;
                  const isClickable = Boolean(onRowClick);

                  return (
                    <tr
                      key={rowKey}
                      onClick={() => onRowClick && onRowClick(row)}
                      tabIndex={isClickable ? 0 : undefined}
                      onKeyDown={
                        isClickable
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onRowClick(row);
                              }
                            }
                          : undefined
                      }
                      className={cn(
                        'transition-colors hover:bg-surface-50',
                        isClickable && 'cursor-pointer',
                        typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName
                      )}
                    >
                      {columns.map((col) => (
                        <td
                          key={`${rowKey}-${col.key || col.label}`}
                          className={cn('px-4 py-3.5 align-middle', alignClass(col.align), col.className)}
                        >
                          {cellValue(col, row, index)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
