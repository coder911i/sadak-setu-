import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopKPICards } from '../components/dashboard/TopKPICards';
import { RoadHealthOverview } from '../components/dashboard/RoadHealthOverview';
import { PriorityDistributionChart } from '../components/dashboard/PriorityDistributionChart';
import { DamageIntelligenceCard } from '../components/dashboard/DamageIntelligenceCard';
import { CommandCenterMap } from '../components/dashboard/CommandCenterMap';
import { MaintenancePipelineTracker } from '../components/dashboard/MaintenancePipelineTracker';
import { RecentInspectionsTable } from '../components/dashboard/RecentInspectionsTable';
import { RecentAlertsFeed } from '../components/dashboard/RecentAlertsFeed';
import { RoadDetailDrawer } from '../components/roads/RoadDetailDrawer';
import { WorkOrderModal } from '../components/maintenance/WorkOrderModal';
import { useRoads } from '../hooks/useRoads';
import { useMaintenance } from '../hooks/useMaintenance';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { AlertTriangle, ArrowRight, Radio, Sparkles } from 'lucide-react';

const greetingFor = (hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export function DashboardPage() {
  const { roads, stats } = useRoads();
  const { addWorkOrder } = useMaintenance();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedRoadDetail, setSelectedRoadDetail] = useState(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [initialWorkOrderData, setInitialWorkOrderData] = useState(null);

  const firstName = (user?.fullName || '').split(' ')[0];
  const greeting = greetingFor(new Date().getHours());
  const criticalCount = stats.criticalDefects || 0;
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting & network context */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-footnote text-ink-400">{today}</p>
          <h1 className="text-title1 font-semibold text-ink-900 tracking-tight">
            {greeting}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-subhead text-ink-500 mt-1">
            {stats.totalCorridors || roads.length} corridors monitored · {Math.round(stats.totalKm || 0)} km under watch
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-caption font-medium">
            <Radio className="w-3 h-3 animate-pulse" aria-hidden="true" /> Live telemetry
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100 text-caption font-medium">
            <Sparkles className="w-3 h-3" aria-hidden="true" /> PavementNet v4.8
          </span>
        </div>
      </div>

      {/* Critical alert strip */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-red-50 border border-red-100">
          <span className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-[18px] h-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-subhead font-semibold text-red-800">
              {criticalCount} critical defect{criticalCount === 1 ? '' : 's'} need attention
            </p>
            <p className="text-caption text-red-700/80 truncate">
              Raise work orders before these corridors degrade further.
            </p>
          </div>
          <Button
            size="sm"
            variant="danger"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/maintenance')}
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Review</span>
          </Button>
        </div>
      )}

      {/* 1. TOP 5 KPI CARDS */}
      <TopKPICards />

      {/* 2. THREE-PANEL ANALYTICS ROW: Health Overview (0-100), Priority Distribution, Damage Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Road Health Overview (Large 0-100 Score Visualization) */}
        <RoadHealthOverview />

        {/* Priority Distribution Donut (Immediate, High, Monitor) */}
        <PriorityDistributionChart />

        {/* Damage Intelligence (Potholes, Cracks, Others, Severity, Confidence) */}
        <DamageIntelligenceCard />
      </div>

      {/* 3. INTERACTIVE ROAD MAP (Leaflet GIS with Indian Road Locations) */}
      <CommandCenterMap onSelectRoad={(road) => setSelectedRoadDetail(road)} />

      {/* 4. MAINTENANCE PIPELINE TRACKER (Open -> Assigned -> In Progress -> Completed -> Verification Pending -> Verified) */}
      <MaintenancePipelineTracker />

      {/* 5. RECENT INSPECTIONS TABLE + RECENT ALERTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentInspectionsTable
            roads={roads}
            onSelectRoad={(road) => setSelectedRoadDetail(road)}
          />
        </div>

        <div className="xl:col-span-1">
          <RecentAlertsFeed />
        </div>
      </div>

      {/* Modals */}
      <RoadDetailDrawer
        road={selectedRoadDetail}
        isOpen={Boolean(selectedRoadDetail)}
        onClose={() => setSelectedRoadDetail(null)}
      />

      <WorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        onSubmit={async (data) => {
          await addWorkOrder(data);
          setIsWorkOrderModalOpen(false);
        }}
        initialData={initialWorkOrderData}
      />
    </div>
  );
}
