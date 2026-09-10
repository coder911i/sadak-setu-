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
  const avgHealth = 74.0;
  const immediateCount = 18;
  const highCount = 34;
  const monitorCount = 90;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Total Roads Monitored */}
      <StatCard
        title="Corridors Monitored"
        value={totalRoads}
        unit="National Routes"
        icon={Route}
        iconBg="bg-brand-50 text-brand-700 border-brand-200"
        accentColor="bg-brand-600"
        trend={`+${totalKm} KM`}
        trendDirection="up"
        trendLabel="Active GIS Grid"
      />

      {/* 2. Average Road Health Score */}
      <StatCard
        title="Average Health Score"
        value={avgHealth}
        unit="/ 100"
        icon={Activity}
        iconBg="bg-emerald-50 text-emerald-700 border-emerald-200"
        accentColor="bg-emerald-600"
        progress={avgHealth}
        trend="+3.4 pts"
        trendDirection="up"
        trendLabel="vs Q2 Cycle"
      />

      {/* 3. Immediate Priority */}
      <StatCard
        title="Immediate Priority"
        value={immediateCount}
        unit="Critical Sites"
        icon={AlertOctagon}
        iconBg="bg-red-50 text-red-700 border-red-200"
        accentColor="bg-red-600"
        trend="Critical Action"
        trendDirection="down"
        trendLabel="SLA Active"
      />

      {/* 4. High Priority */}
      <StatCard
        title="High Priority"
        value={highCount}
        unit="Repair Queue"
        icon={AlertTriangle}
        iconBg="bg-amber-50 text-amber-800 border-amber-200"
        accentColor="bg-amber-500"
        trend="Scheduled"
        trendDirection="neutral"
        trendLabel="Work Orders Sanctioned"
      />

      {/* 5. Monitor */}
      <StatCard
        title="Stable Corridors"
        value={monitorCount}
        unit="Green Zones"
        icon={ShieldCheck}
        iconBg="bg-forest-50 text-forest-700 border-forest-200"
        accentColor="bg-forest-600"
        subtext="Preventive Care Cycle"
      />
    </div>
  );
}
