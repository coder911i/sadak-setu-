import React from 'react';
import { StatCard } from '../ui/StatCard';
import { useRoads } from '../../hooks/useRoads';
import { useMaintenance } from '../../hooks/useMaintenance';
import { formatCurrency } from '../../utils/formatters';
import {
  Route,
  Activity,
  AlertTriangle,
  Wrench,
  Coins,
  TrendingUp,
} from 'lucide-react';

export function ExecutiveMetrics() {
  const { stats } = useRoads();
  const { workOrders } = useMaintenance();

  const activeWorkOrdersCount = workOrders.filter(
    (wo) => wo.status === 'in_progress' || wo.status === 'assigned'
  ).length;

  const totalSanctioned = workOrders.reduce((sum, wo) => sum + (wo.sanctionedBudget || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Network Monitored"
        value={stats.totalKm ? stats.totalKm.toLocaleString('en-IN') : '1,360'}
        unit="KM"
        icon={Route}
        iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
        trend="+140 KM"
        trendDirection="up"
        trendLabel="Surveyed this week"
      />

      <StatCard
        title="Avg Pavement Index (PCI)"
        value={stats.avgPci || 74}
        unit="/ 100"
        icon={Activity}
        iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        progress={stats.avgPci || 74}
        subtext="Good Condition (Grade B+)"
      />

      <StatCard
        title="Critical Hazard Alerts"
        value={stats.criticalDefects || 14}
        unit="Spots"
        icon={AlertTriangle}
        iconBg="bg-rose-500/10 text-rose-400 border-rose-500/20"
        trend="-4 Spots"
        trendDirection="up" // down is good for hazards, represented by green trend
        trendLabel="Resolved past 48h"
      />

      <StatCard
        title="Active Work Orders"
        value={activeWorkOrdersCount || 4}
        unit="Orders"
        icon={Wrench}
        iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
        subtext="2 Orders near SLA deadline"
      />

      <StatCard
        title="Sanctioned Maintenance"
        value={formatCurrency(totalSanctioned || 4740000)}
        icon={Coins}
        iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
        trend="94.2%"
        trendDirection="neutral"
        trendLabel="Fund Utilization Rate"
      />
    </div>
  );
}
