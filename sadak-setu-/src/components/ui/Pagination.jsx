import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-line bg-surface-50 text-xs text-ink-500', className)}>
      <div>
        Showing <span className="font-semibold text-ink-900">{startItem}</span> to{' '}
        <span className="font-semibold text-ink-900">{endItem}</span> of{' '}
        <span className="font-semibold text-ink-900">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-line hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed text-ink-700 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 font-mono text-ink-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-line hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed text-ink-700 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
