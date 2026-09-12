import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ChainageHealthStrip } from './ChainageHealthStrip';
import { getPCIRating, formatDate } from '../../utils/formatters';
import {
  MapPin,
  Route,
  Activity,
  Layers,
  Calendar,
  Building2,
  Wrench,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RoadDetailDrawer({ road, isOpen, onClose }) {
  const navigate = useNavigate();
  if (!road) return null;

  const pciMeta = getPCIRating(road.pciScore);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${road.code} – ${road.name}`}
      description={`Corridor State: ${road.state} | Total Span: ${road.totalLengthKm} KM`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-ink-500">
            Last Inspected: <strong className="text-ink-900">{formatDate(road.lastInspected, true)}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                navigate('/inspections');
              }}
            >
              View Telemetry Feeds
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Wrench}
              onClick={() => {
                onClose();
                navigate('/maintenance');
              }}
            >
              Sanction Work Order
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top High-Density Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-500">Pavement Index (PCI)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-ink-900">{road.pciScore}/100</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${pciMeta.badgeClass}`}>
                {pciMeta.grade}
              </span>
            </div>
            <p className="text-[10px] text-ink-500">{pciMeta.label}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-500">International Roughness</span>
            <div className="text-2xl font-bold font-mono text-ink-900">{road.iriScore} <span className="text-xs font-normal text-ink-500">m/km</span></div>
            <p className="text-[10px] text-ink-500">Target IRC: &le; 2.5 m/km</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-500">Active Distress Spots</span>
            <div className="text-2xl font-bold font-mono text-rose-600">{road.activeDefectsCount}</div>
            <p className="text-[10px] text-rose-600 font-semibold">{road.criticalDefectsCount} Critical Emergencies</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-500">Traffic Intensity</span>
            <div className="text-xs font-bold text-ink-900 truncate mt-1">{road.trafficDensity}</div>
            <p className="text-[10px] text-ink-500">{road.lanes} Dedicated Lanes</p>
          </div>
        </div>

        {/* Chainage Health Strip Visualizer */}
        <ChainageHealthStrip road={road} />

        {/* Technical Infrastructure Spec Sheet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-50 border border-line space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-600" /> Pavement Engineering Profile
            </h5>
            <div className="divide-y divide-line text-xs space-y-2">
              <div className="flex justify-between pt-1 text-ink-700">
                <span className="text-ink-500">Surface Layer:</span>
                <span className="font-semibold text-right">{road.surfaceType}</span>
              </div>
              <div className="flex justify-between pt-2 text-ink-700">
                <span className="text-ink-500">Lane Configuration:</span>
                <span className="font-mono">{road.lanes} Dual-Carriageway Lanes</span>
              </div>
              <div className="flex justify-between pt-2 text-ink-700">
                <span className="text-ink-500">Survey Agency:</span>
                <span>{road.inspectionAgency}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-50 border border-line space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Concessionaire &amp; Maintenance Unit
            </h5>
            <div className="divide-y divide-line text-xs space-y-2">
              <div className="flex justify-between pt-1 text-ink-700">
                <span className="text-ink-500">EPC Contractor:</span>
                <span className="font-semibold">{road.contractor}</span>
              </div>
              <div className="flex justify-between pt-2 text-ink-700">
                <span className="text-ink-500">Toll Concessionaire:</span>
                <span>{road.concessionaire}</span>
              </div>
              <div className="flex justify-between pt-2 text-ink-700">
                <span className="text-ink-500">Audit Status:</span>
                <span className="text-emerald-600 font-semibold">MoRTH Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
