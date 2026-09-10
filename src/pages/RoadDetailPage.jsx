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
  const { inspections } = useInspections();
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
        color: 'bg-red-50 text-red-700 border-red-200',
      };
    }
    if (priority === 'High') {
      return {
        label: 'Under Maintenance',
        color: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return {
      label: 'Normal / Stable',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e2ebe4] shadow-card space-y-4">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between text-xs text-[#728a79]">
          <Link to="/roads" className="flex items-center gap-1 font-bold text-brand-700 hover:text-brand-800 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Corridors
          </Link>

          <span className="font-mono text-[11px] text-[#728a79]">
            Corridor Registry ID: <strong className="text-[#123320]">{road.id}</strong>
          </span>
        </div>

        {/* Main Title Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-800 font-mono font-bold text-sm">
                {road.code}
              </span>
              <PriorityBadge priority={road.priority} size="sm" />
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.color}`}>
                {statusMeta.label}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#123320] tracking-tight">
              {road.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-[#3b5e47] flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> {road.district}, {road.state}
              </span>
              <span>&bull;</span>
              <span className="font-mono">{road.category}</span>
              <span>&bull;</span>
              <span className="font-mono">{road.totalLengthKm} KM ({road.lanes} Lanes)</span>
            </div>
          </div>

          {/* Current Health Score Pill */}
          <div className="flex items-center gap-3.5 self-start lg:self-center p-3.5 rounded-2xl bg-surface-50 border border-[#e2ebe4]">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-[#728a79] block font-bold">Health Score</span>
              <span className="text-2xl font-black font-mono text-[#123320] leading-none">
                {road.healthScore || road.pciScore}
                <span className="text-xs font-normal text-[#728a79]">/100</span>
              </span>
            </div>
            <HealthScoreBadge score={road.healthScore || road.pciScore} size="md" showBar={false} />
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="pt-3 border-t border-[#edf3ee] flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              icon={Wrench}
              onClick={() => setIsWorkOrderOpen(true)}
            >
              Create Work Order
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
            Download Dossier
          </Button>
        </div>
      </div>

      {/* SECTION 1: ROAD OVERVIEW */}
      <Card className="bg-white border-[#e2ebe4] shadow-card">
        <CardHeader className="py-3.5 px-5">
          <CardTitle icon={Route}>
            1. Roadway Overview &amp; Alignment Data
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Start / End Location */}
            <div className="p-3.5 rounded-2xl bg-surface-50 border border-[#e2ebe4] space-y-1 sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-[#728a79] font-mono">Corridor Alignment Span</span>
              <div className="text-[#123320] font-bold text-xs leading-snug">
                {startLocation} &rarr; {endLocation}
              </div>
              <p className="text-[10px] text-[#728a79] font-mono">
                Jurisdiction: {road.district} Highway Division ({road.state})
              </p>
            </div>

            {/* Total Length */}
            <div className="p-3.5 rounded-2xl bg-surface-50 border border-[#e2ebe4] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#728a79] font-mono">Total Length &amp; Lanes</span>
              <div className="text-xl font-black font-mono text-[#123320]">
                {road.totalLengthKm} <span className="text-xs font-normal text-[#728a79]">KM</span>
              </div>
              <p className="text-[10px] text-[#728a79] font-mono">{road.lanes} Dedicated Traffic Lanes</p>
            </div>

            {/* Last Inspection & Frequency */}
            <div className="p-3.5 rounded-2xl bg-surface-50 border border-[#e2ebe4] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#728a79] font-mono">Inspection Frequency</span>
              <div className="text-xs font-bold text-brand-700">
                Bi-Weekly Autonomous Patrol
              </div>
              <p className="text-[10px] text-[#728a79] font-mono">
                Last: {formatRelativeTime(road.latestInspection || road.lastInspected)}
              </p>
            </div>
          </div>

          {/* Additional Road Tech Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-[#edf3ee] text-xs">
            <div>
              <span className="text-[#728a79] block text-[11px]">Surface Formulation:</span>
              <strong className="text-[#123320]">{road.surfaceType}</strong>
            </div>
            <div>
              <span className="text-[#728a79] block text-[11px]">Traffic Intensity:</span>
              <strong className="text-[#123320]">{road.trafficDensity}</strong>
            </div>
            <div>
              <span className="text-[#728a79] block text-[11px]">Maintenance Agency:</span>
              <strong className="text-[#123320]">{road.contractor}</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: HEALTH SCORE BREAKDOWN */}
      <RoadHealthScoreBreakdown road={road} />

      {/* SECTION 3: DAMAGE DETECTIONS */}
      <RoadDamageDetectionList
        defects={roadInspections}
        onSelectDefect={(defect) => setSelectedDefect(defect)}
      />

      {/* SECTION 4: GPS MAP */}
      <RoadGPSMap road={road} defects={roadInspections} />

      {/* SECTION 5: INSPECTION HISTORY TIMELINE */}
      <RoadInspectionTimeline road={road} />

      {/* SECTION 6: MAINTENANCE HISTORY */}
      <RoadMaintenanceHistory
        road={road}
        workOrders={roadWorkOrders}
        onOpenNewOrder={() => setIsWorkOrderOpen(true)}
      />

      {/* SECTION 7: BEFORE / AFTER EVIDENCE */}
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
