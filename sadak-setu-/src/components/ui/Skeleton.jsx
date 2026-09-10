import React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-lg bg-surface-100', className)}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('card-base p-5 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function SkeletonList({ rows = 4, className }) {
  return (
    <div className={cn('space-y-2.5', className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card-base p-4 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-2/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
