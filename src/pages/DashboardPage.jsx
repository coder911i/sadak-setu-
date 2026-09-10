import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { TopKPICards } from '../components/dashboard/TopKPICards';
import { RoadHealthOverview } from '../components/dashboard/RoadHealthOverview';
import { PriorityDistributionChart } from '../components/dashboard/PriorityDistributionChart';
import { DamageIntelligenceCard } from '../components/dashboard/DamageIntelligenceCard';
import { CommandCenterMap } from '../components/dashboard/CommandCenterMap';
import { RecentDefectStream } from '../components/dashboard/RecentDefectStream';
import { RepairTrackingTimeline } from '../components/maintenance/RepairTrackingTimeline';
import { RecentInspectionsTable } from '../components/dashboard/RecentInspectionsTable';
import { RecentAlertsFeed } from '../components/dashboard/RecentAlertsFeed';
import { RoadDetailDrawer } from '../components/roads/RoadDetailDrawer';
import { DamageDetailModal } from '../components/damage/DamageDetailModal';
import { WorkOrderModal } from '../components/maintenance/WorkOrderModal';
import { useRoads } from '../hooks/useRoads';
import { useMaintenance } from '../hooks/useMaintenance';
import { useInspections } from '../hooks/useInspections';
import {
  Sparkles,
  Radio,
  Map as MapIcon,
  PlusCircle,
  BrainCircuit,
  Wrench,
  ArrowRight,
  Route,
  AlertTriangle,
  Activity,
  Award,
} from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { roads } = useRoads();
  const { inspections } = useInspections();
  const { addWorkOrder } = useMaintenance();
  const outletContext = useOutletContext() || {};

  const [selectedRoadDetail, setSelectedRoadDetail] = useState(null);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [initialWorkOrderData, setInitialWorkOrderData] = useState(null);

  const handleOpenWorkOrderForDefect = (defect) => {
    setInitialWorkOrderData({
      title: `Emergency Repair for ${defect.defectType} (${defect.chainage || 'Corridor'})`,
      roadId: defect.roadId,
      chainageRange: defect.chainage || 'Km 62+400',
      priority: defect.severity === 'critical' ? 'CRITICAL' : 'HIGH',
      sanctionedBudget: 680000,
      materialSpec: 'Bituminous Concrete (VG-40 Polymer Modified Bitumen)',
      linkedDefectIds: [defect.id],
    });
    setIsWorkOrderModalOpen(true);
  };

  const handleTriggerReportModal = () => {
    if (outletContext.onOpenReportModal) {
      outletContext.onOpenReportModal();
    } else {
      navigate('/inspections');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* 1. HERO CARD & QUICK ACTIONS */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#155635] via-[#104329] to-[#0e3823] text-white p-6 sm:p-8 shadow-elevated border border-[#1b6e43]/40">
        {/* Subtle decorative background road vectors */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none overflow-hidden hidden md:block">
          <svg viewBox="0 0 400 300" className="w-full h-full object-cover">
            <polygon points="150,0 250,0 380,300 20,300" fill="white" />
            <line x1="200" y1="0" x2="200" y2="300" stroke="white" strokeWidth="6" strokeDasharray="20, 20" />
          </svg>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header Tag & Live Pulse */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-semibold flex items-center gap-1.5 border border-white/20">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Sadak Setu &bull; Government of Bharat</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5 border border-emerald-400/30">
                <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
                Live Telemetry
              </span>
            </div>

            <div className="text-[11px] font-mono text-emerald-200/80 hidden sm:block">
              Tagline: Monitor &bull; Maintain &bull; Move Ahead
            </div>
          </div>

          {/* Hero Headlines */}
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              India's Roads In Better Hands
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 font-medium">
              Real-time insights. Real change.
            </p>
          </div>

          {/* Key Statistics Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-2 border-t border-white/15 max-w-3xl">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider block">
                KM Monitored
              </span>
              <div className="text-xl sm:text-3xl font-black font-mono text-white flex items-baseline gap-1">
                <span>1,840</span>
                <span className="text-xs font-normal text-emerald-300">KM</span>
              </div>
              <span className="text-[10px] text-emerald-200/70 hidden sm:block">State &amp; National Corridors</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider block">
                Issues Detected
              </span>
              <div className="text-xl sm:text-3xl font-black font-mono text-amber-300 flex items-baseline gap-1">
                <span>48</span>
                <span className="text-xs font-normal text-amber-200">Active</span>
              </div>
              <span className="text-[10px] text-emerald-200/70 hidden sm:block">18 Critical SLA Triage</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider block">
                Avg Health Score
              </span>
              <div className="text-xl sm:text-3xl font-black font-mono text-emerald-300 flex items-baseline gap-1">
                <span>74</span>
                <span className="text-xs font-normal text-emerald-200">/ 100</span>
              </div>
              <span className="text-[10px] text-emerald-200/70 hidden sm:block">Grade B+ (Fair to Good)</span>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-200/90 mb-2.5">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {/* 1. Map View */}
              <button
                type="button"
                onClick={() => navigate('/roads')}
                className="py-3 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-left flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/15 group-hover:scale-105 transition-transform flex-shrink-0">
                    <MapIcon className="w-4 h-4 text-emerald-200" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white">Map View</div>
                    <div className="text-[10px] text-emerald-200/80 truncate">GIS Corridors</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-1" />
              </button>

              {/* 2. Report Issue */}
              <button
                type="button"
                onClick={handleTriggerReportModal}
                className="py-3 px-3.5 rounded-2xl bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400/30 transition-all text-left flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-emerald-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
                    <PlusCircle className="w-4 h-4 text-emerald-100" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white">Report Issue</div>
                    <div className="text-[10px] text-emerald-200/80 truncate">Upload photo</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-1" />
              </button>

              {/* 3. AI Analysis */}
              <button
                type="button"
                onClick={() => navigate('/damage-intelligence')}
                className="py-3 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-left flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/15 group-hover:scale-105 transition-transform flex-shrink-0">
                    <BrainCircuit className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white">AI Analysis</div>
                    <div className="text-[10px] text-emerald-200/80 truncate">Distress Triage</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-1" />
              </button>

              {/* 4. Track Repairs */}
              <button
                type="button"
                onClick={() => navigate('/maintenance')}
                className="py-3 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-left flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/15 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Wrench className="w-4 h-4 text-emerald-200" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white">Track Repairs</div>
                    <div className="text-[10px] text-emerald-200/80 truncate">Work Orders</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP 5 METRICS CARDS */}
      <TopKPICards />

      {/* 3. ROAD HEALTH OVERVIEW, PRIORITY DISTRIBUTION & RECENT DETECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Road Health Overview (Circular Score + Good/Fair/Poor/Critical Distribution) */}
        <RoadHealthOverview />

        {/* Priority Distribution Donut */}
        <PriorityDistributionChart />

        {/* Recent Detections Stream with Thumbnails & Damage Detail Link */}
        <RecentDefectStream
          onSelectDefect={(defect) => setSelectedDefect(defect)}
        />
      </div>

      {/* 4. REPAIR TRACKING VERTICAL TIMELINE */}
      <RepairTrackingTimeline
        onOpenWorkOrder={() => navigate('/maintenance')}
      />

      {/* 5. INTERACTIVE ROAD MAP (Leaflet GIS with Indian Road Locations) */}
      <CommandCenterMap onSelectRoad={(road) => setSelectedRoadDetail(road)} />

      {/* 6. RECENT INSPECTIONS TABLE + RECENT ALERTS */}
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
      {/* 1. Damage Details Modal */}
      <DamageDetailModal
        defect={selectedDefect}
        isOpen={Boolean(selectedDefect)}
        onClose={() => setSelectedDefect(null)}
        onAddToRepairQueue={handleOpenWorkOrderForDefect}
      />

      {/* 2. Road Detail Drawer */}
      <RoadDetailDrawer
        road={selectedRoadDetail}
        isOpen={Boolean(selectedRoadDetail)}
        onClose={() => setSelectedRoadDetail(null)}
      />

      {/* 3. Sanction Work Order Modal */}
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
