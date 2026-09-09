import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRoads } from '../hooks/useRoads';
import { useInspections } from '../hooks/useInspections';
import { useMaintenance } from '../hooks/useMaintenance';
import { useToast } from '../hooks/useToast';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { HealthScoreBadge } from '../components/roads/HealthScoreBadge';
import { PriorityBadge } from '../components/roads/PriorityBadge';
import { RoadHealthScoreBreakdown } from '../components/roads/RoadHealthScoreBreakdown';
import { RoadDamageDetectionList } from '../components/roads/RoadDamageDetectionList';
import { RoadGPSMap } from '../components/roads/RoadGPSMap';
import { RoadInspectionTimeline } from '../components/roads/RoadInspectionTimeline';
import { RoadMaintenanceHistory } from '../components/roads/RoadMaintenanceHistory';
import { RoadBeforeAfterEvidence } from '../components/roads/RoadBeforeAfterEvidence';
import { WorkOrderModal } from '../components/maintenance/WorkOrderModal';
import { InspectionTelemetryModal } from '../components/inspections/InspectionTelemetryModal';
import { formatDate, formatRelativeTime, formatCurrency } from '../utils/formatters';
import {
  ArrowLeft,
  MapPin,
  Route,
  Activity,
  Gauge,
  Layers,
  Wrench,
  ScanEye,
  Building2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Download,
  FileText,
  FileCheck2,
  Share2,
  Eye,
  Check,
} from 'lucide-react';

export function RoadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allRoads } = useRoads();
  const { inspections, addInspection } = useInspections();
  const { workOrders, addWorkOrder } = useMaintenance();
  const { success } = useToast();

  const [road, setRoad] = useState(null);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [isWorkOrderOpen, setIsWorkOrderOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const found = allRoads.find((r) => r.id === id || r.code.toLowerCase() === id?.toLowerCase()) || allRoads[0];
    setRoad(found);
  }, [id, allRoads]);

  if (!road) return null;

  const roadInspections = inspections.filter(
    (i) => i.roadId === road.id || i.roadCode === road.code || i.roadCode.includes(road.code.split(' ')[0])
  );
  const roadWorkOrders = workOrders.filter(
    (wo) => wo.roadId === road.id || wo.roadCode === road.code || wo.roadCode.includes(road.code.split(' ')[0])
  );

  const getStatusBadge = (priority) => {
    if (priority === 'Immediate') {
      return {
        label: 'Critical Alert',
        color: 'bg-rose-950/80 text-rose-300 border-rose-800',
      };
    }
    if (priority === 'High') {
      return {
        label: 'Under Maintenance',
        color: 'bg-amber-950/80 text-amber-300 border-amber-800',
      };
    }
    return {
      label: 'Normal / Stable',
      color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    };
  };

  const statusMeta = getStatusBadge(road.priority);

  const handleDownloadReport = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      success('Report Downloaded', `Official Pavement Health Dossier for ${road.code} downloaded as PDF.`);
    }, 700);
  };

  const startLocation = `${road.name.split('–')[0]?.trim() || 'Origin Hub'} (Km 0+000)`;
  const endLocation = `${road.name.split('–')[1]?.trim() || 'Terminal Junction'} (Km ${road.totalLengthKm}+000)`;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header: Road Name, ID, District, Health Score, Priority, Status */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link to="/roads" className="flex items-center gap-1 hover:text-brand-400 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Road Monitoring
          </Link>

          <span className="font-mono text-[10px] text-slate-500">
            Road Registry ID: <strong className="text-slate-300">{road.id}</strong>
          </span>
        </div>

        {/* Main Title Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-brand-500/20 border border-brand-500/30 text-brand-300 font-mono font-bold text-sm">
                {road.code}
              </span>
              <PriorityBadge priority={road.priority} size="sm" />
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusMeta.color}`}>
                {statusMeta.label}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {road.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {road.district}, {road.state}
              </span>
              <span>&bull;</span>
              <span className="font-mono text-slate-300">{road.category}</span>
              <span>&bull;</span>
              <span className="font-mono text-slate-300">{road.totalLengthKm} KM ({road.lanes} Lanes)</span>
            </div>
          </div>

          {/* Current Health Score Pill */}
          <div className="flex items-center gap-3 self-start lg:self-center p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Health Score</span>
              <span className="text-2xl font-extrabold font-mono text-white leading-none">
                {road.healthScore || road.pciScore}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </span>
            </div>
            <HealthScoreBadge score={road.healthScore || road.pciScore} size="md" showBar={false} />
          </div>
        </div>

        {/* SECTION 8: ACTION BUTTONS TOOLBAR */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              icon={Wrench}
              onClick={() => setIsWorkOrderOpen(true)}
            >
              Create Maintenance Case
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={ScanEye}
              onClick={() => navigate('/inspections')}
            >
              View Inspection
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={ShieldCheck}
              onClick={() => navigate('/verification')}
            >
              View Verification
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            isLoading={isDownloading}
            onClick={handleDownloadReport}
          >
            Download Report
          </Button>
        </div>
      </div>

      {/* SECTION 1: ROAD OVERVIEW */}
      <Card className="bg-slate-900/90 border-slate-800">
        <CardHeader className="py-3 px-4">
          <CardTitle icon={Route}>
            1. Roadway Overview &amp; Alignment Data
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Start / End Location */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Corridor Alignment Span</span>
              <div className="text-slate-100 font-semibold text-xs leading-snug">
                {startLocation} &rarr; {endLocation}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Jurisdiction: {road.district} Highway Implementation Division ({road.state})
              </p>
            </div>

            {/* Total Length */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total Length &amp; Lanes</span>
              <div className="text-xl font-extrabold font-mono text-white">
                {road.totalLengthKm} <span className="text-xs font-normal text-slate-400">KM</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">{road.lanes} Dedicated Traffic Lanes</p>
            </div>

            {/* Last Inspection & Frequency */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Inspection Frequency</span>
              <div className="text-xs font-bold text-emerald-400">
                Bi-Weekly Autonomous Patrol
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Last: {formatRelativeTime(road.latestInspection || road.lastInspected)}
              </p>
            </div>
          </div>

          {/* Additional Road Tech Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Surface Formulation:</span>
              <strong className="text-slate-200">{road.surfaceType}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Traffic Intensity:</span>
              <strong className="text-slate-200">{road.trafficDensity}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Maintenance Agency:</span>
              <strong className="text-slate-200">{road.contractor}</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: HEALTH SCORE BREAKDOWN (0-100 Radial + 4 Conceptual Factors) */}
      <RoadHealthScoreBreakdown road={road} />

      {/* SECTION 3: DAMAGE DETECTIONS (Potholes, Cracks, Others + Image Placeholders) */}
      <RoadDamageDetectionList
        defects={roadInspections}
        onSelectDefect={(defect) => setSelectedDefect(defect)}
      />

      {/* SECTION 4: GPS / MAP (Interactive Leaflet Map with damage locations) */}
      <RoadGPSMap road={road} defects={roadInspections} />

      {/* SECTION 5: INSPECTION HISTORY TIMELINE */}
      <RoadInspectionTimeline road={road} />

      {/* SECTION 6: MAINTENANCE HISTORY (Open -> Assigned -> In Progress -> Completed -> Verification Pending -> Verified / Requires Repair) */}
      <RoadMaintenanceHistory
        road={road}
        workOrders={roadWorkOrders}
        onOpenNewOrder={() => setIsWorkOrderOpen(true)}
      />

      {/* SECTION 7: BEFORE / AFTER EVIDENCE (Visual comparison with compaction score) */}
      <RoadBeforeAfterEvidence road={road} />

      {/* MODALS */}
      <WorkOrderModal
        isOpen={isWorkOrderOpen}
        onClose={() => setIsWorkOrderOpen(false)}
        onSubmit={async (order) => {
          await addWorkOrder(order);
          setIsWorkOrderOpen(false);
        }}
        initialData={{
          title: `Repair Work Order on ${road.code} (${road.name})`,
          roadId: road.id,
          chainageRange: `Km 0+000 – Km ${road.totalLengthKm}`,
          priority: road.priority === 'Immediate' ? 'CRITICAL' : 'HIGH',
        }}
      />

      <InspectionTelemetryModal
        defect={selectedDefect}
        isOpen={Boolean(selectedDefect)}
        onClose={() => setSelectedDefect(null)}
      />
    </div>
  );
}
