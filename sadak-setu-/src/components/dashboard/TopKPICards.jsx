import React from 'react';
import { StatCard } from '../ui/StatCard';
import { useRoads } from '../../hooks/useRoads';
import {
  Route,
  Activity,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

export function TopKPICards() {
  const { allRoads } = useRoads();

  const totalRoads = 142;
  const totalKm = 1840;
  const avgHealth = 73.4;
  const immediateCount = 18;
  const highCount = 34;
  const monitorCount = 90;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Roads Monitored */}
      <StatCard
        title="Total Roads Monitored"
        value={totalRoads}
        unit="Corridors"
        icon={Route}
        iconBg="bg-brand-100 text-brand-600 border-brand-200"
        accentColor="bg-brand-500"
        trend={`+${totalKm} KM`}
        trendDirection="up"
        trendLabel="Active PMGSY & State Grid"
      />

      {/* 2. Average Road Health Score */}
      <StatCard
        title="Average Health Score"
        value={avgHealth}
        unit="/ 100"
        icon={Activity}
        iconBg="bg-green-100 text-green-600 border-green-200"
        accentColor="bg-green-500"
        progress={avgHealth}
        trend="+3.4 pts"
        trendDirection="up"
        trendLabel="vs previous cycle"
      />

      {/* 3. Immediate Priority */}
      <StatCard
        title="Immediate Priority"
        value={immediateCount}
        unit="Roads"
        icon={AlertOctagon}
        iconBg="bg-red-100 text-red-600 border-red-200"
        accentColor="bg-red-500"
        trend="Critical Action"
        trendDirection="down"
        trendLabel="High Hazard Risk"
      />

      {/* 4. High Priority */}
      <StatCard
        title="High Priority"
        value={highCount}
        unit="Roads"
        icon={AlertTriangle}
        iconBg="bg-amber-100 text-amber-600 border-amber-200"
        accentColor="bg-amber-500"
        trend="Scheduled"
        trendDirection="neutral"
        trendLabel="Fatigue Accelerated"
      />

      {/* 5. Monitor */}
      <StatCard
        title="Monitor (Stable)"
        value={monitorCount}
        unit="Roads"
        icon={ShieldCheck}
        iconBg="bg-brand-100 text-brand-600 border-brand-200"
        accentColor="bg-brand-400"
        subtext="Routine Preventive Care"
      />
    </div>
  );
}
