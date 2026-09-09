import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search highway, chainage, contractor...',
  onClear,
  className,
}) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="w-4 h-4 text-brand-500 absolute left-3.5 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-[#ddeae0] text-[#1a3825] placeholder-[#7a9a83] text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all shadow-subtle"
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute right-2.5 text-[#7a9a83] hover:text-[#1a3825] p-0.5 rounded-full hover:bg-surface-100 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
