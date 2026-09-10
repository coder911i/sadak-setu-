import React from 'react';
import { cn } from '../../utils/cn';

// Canonical status vocabulary shared by complaints, work orders and verification.
const TONES = {
  open:        'bg-blue-50 text-blue-700 border-blue-200',
  assigned:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  progress:    'bg-amber-50 text-amber-700 border-amber-200',
  submitted:   'bg-violet-50 text-violet-700 border-violet-200',
  verification:'bg-cyan-50 text-cyan-700 border-cyan-200',
  closed:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  critical:    'bg-red-50 text-red-700 border-red-200',
  neutral:     'bg-surface-100 text-ink-600 border-line',
};

const DOTS = {
  open: 'bg-blue-500',
  assigned: 'bg-indigo-500',
  progress: 'bg-amber-500',
  submitted: 'bg-violet-500',
  verification: 'bg-cyan-500',
  closed: 'bg-emerald-500',
  critical: 'bg-red-500',
  neutral: 'bg-ink-400',
};

const ALIASES = {
  OPEN: 'open',
  NEW: 'open',
  PENDING: 'open',
  ASSIGNED: 'assigned',
  'IN PROGRESS': 'progress',
  IN_PROGRESS: 'progress',
  ONGOING: 'progress',
  'REPAIR SUBMITTED': 'submitted',
  SUBMITTED: 'submitted',
  COMPLETED: 'submitted',
  VERIFICATION: 'verification',
  'VERIFICATION PENDING': 'verification',
  VERIFYING: 'verification',
  CLOSED: 'closed',
  VERIFIED: 'closed',
  RESOLVED: 'closed',
  CRITICAL: 'critical',
  IMMEDIATE: 'critical',
  HIGH: 'progress',
  MONITOR: 'open',
};

export function statusTone(status) {
  if (!status) return 'neutral';
  return ALIASES[String(status).toUpperCase().replace(/[_-]/g, ' ')] || 'neutral';
}

export function StatusPill({ status, label, tone, size = 'sm', pulse = false, className }) {
  const resolved = tone || statusTone(status);
  const sizes = {
    xs: 'text-caption px-2 py-0.5 gap-1',
    sm: 'text-footnote px-2.5 py-1 gap-1.5',
    md: 'text-subhead px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold whitespace-nowrap',
        TONES[resolved] || TONES.neutral,
        sizes[size],
        className
      )}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', DOTS[resolved] || DOTS.neutral, pulse && 'animate-pulse')}
        aria-hidden="true"
      />
      {label || status}
    </span>
  );
}
