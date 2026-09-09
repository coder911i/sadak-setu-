import React, { useState } from 'react';
import { TopKPICards } from '../components/dashboard/TopKPICards';
import { RoadHealthOverview } from '../components/dashboard/RoadHealthOverview';
import { PriorityDistributionChart } from '../components/dashboard/PriorityDistributionChart';
import { DamageIntelligenceCard } from '../components/dashboard/DamageIntelligenceCard';
import { CommandCenterMap } from '../components/dashboard/CommandCenterMap';
import { MaintenancePipelineTracker } from '../components/dashboard/MaintenancePipelineTracker';
import { RecentInspectionsTable } from '../components/dashboard/RecentInspectionsTable';
import { RecentAlertsFeed } from '../components/dashboard/RecentAlertsFeed';
import { RoadDetailDrawer } from '../components/roads/RoadDetailDrawer';
import { InspectionTelemetryModal } from '../components/inspections/InspectionTelemetryModal';
import { WorkOrderModal } from '../components/maintenance/WorkOrderModal';
import { useRoads } from '../hooks/useRoads';
import { useMaintenance } from '../hooks/useMaintenance';
import { Alert } from '../components/ui/Alert';
import {
  Sparkles,
  Radio,
  Zap,
  Award,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export function DashboardPage() {
  const { roads } = useRoads();
  const { addWorkOrder } = useMaintenance();

  const [selectedRoadDetail, setSelectedRoadDetail] = useState(null);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [initialWorkOrderData, setInitialWorkOrderData] = useState(null);

  const handleOpenWorkOrder = (road) => {
    setInitialWorkOrderData({
      title: `Emergency Repair for ${road.code} (${road.name})`,
      roadId: road.id,
      chainageRange: `Km 0+000 – Km ${road.totalLengthKm}`,
      priority: road.priority === 'Immediate' ? 'CRITICAL' : 'HIGH',
      sanctionedBudget: 650000,
      materialSpec: 'Bituminous Concrete (VG-40 DBM + BC)',
    });
    setIsWorkOrderModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner: Smart India Hackathon & MoRTH Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-[#07172e] border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" /> Smart India Hackathon &bull; MoRTH &amp; PMGSY Edition
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Telemetry
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Central Road Health &amp; Maintenance Command Center
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            AI-driven pavement distress triage, real-time International Roughness telemetry, and automated maintenance work orders across rural and highway networks.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-750 text-right">
            <span className="text-[10px] text-slate-400 block">AI Neural Model</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> PavementNet v4.8
            </span>
          </div>
        </div>
      </div>

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
