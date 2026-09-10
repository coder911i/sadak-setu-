import React from 'react';
import { cn } from '../../utils/cn';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

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
  return (
    <div className={cn('w-full overflow-hidden rounded-2xl border border-[#ddeae0] bg-white', className)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ddeae0] bg-surface-50 text-[11px] font-bold uppercase tracking-wider text-[#7a9a83]">
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  style={{ width: col.width }}
                  className={cn(
                    'px-4 py-3 select-none',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                    col.headerClassName
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ddeae0] text-xs text-[#1a3825]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[#7a9a83]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <LoadingSpinner size="md" />
                    <span>Loading data...</span>
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
                    className={cn(
                      'transition-colors hover:bg-surface-50',
                      isClickable && 'cursor-pointer',
                      typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={`${rowKey}-${col.key || col.label}`}
                        className={cn(
                          'px-4 py-3.5 align-middle',
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                          col.className
                        )}
                      >
                        {col.render ? col.render(row[col.key], row, index) : row[col.key]}
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
  );
}
