import React from 'react';
import { cn } from '../../utils/cn';
import { Filter } from 'lucide-react';

export function FilterBar({ children, className }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#ddeae0] shadow-card',
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-[#7a9a83] pl-1 pr-2 border-r border-[#ddeae0] flex-shrink-0">
        <Filter className="w-3.5 h-3.5 text-brand-600" />
        <span>Filters</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options = [], className }) {
  return (
    <div className={cn('flex items-center gap-1.5 text-xs', className)}>
      {label && <span className="text-[#7a9a83] font-medium whitespace-nowrap">{label}:</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-[#ddeae0] text-[#1a3825] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 cursor-pointer transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-[#1a3825]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
