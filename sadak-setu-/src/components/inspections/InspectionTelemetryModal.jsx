import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';
import { SEVERITY_LEVELS } from '../../utils/constants';
import {
  Camera,
  Activity,
  MapPin,
  Cpu,
  Wrench,
  AlertTriangle,
  Scale,
  Gauge,
  Sun,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function InspectionTelemetryModal({ defect, isOpen, onClose, onAssignWorkOrder }) {
  const navigate = useNavigate();
  if (!defect) return null;

  const sevMeta = SEVERITY_LEVELS[defect.severity.toUpperCase()] || SEVERITY_LEVELS.MODERATE;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI Telemetry Audit: ${defect.defectType}`}
      description={`${defect.roadCode} – ${defect.roadName} | Chainage: ${defect.chainage}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-ink-500 font-mono">
            GPS: {defect.lat.toFixed(5)}° N, {defect.lng.toFixed(5)}° E
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Wrench}
              onClick={() => {
                onClose();
                if (onAssignWorkOrder) onAssignWorkOrder(defect);
                else navigate('/maintenance');
              }}
            >
              Convert to Work Order
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Visual Dashcam Simulated Frame with Bounding Box Overlay */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-50 border border-line shadow-elevated flex items-center justify-center">
          {/* Simulated Dashcam Asphalt Road Texture */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 opacity-90" />
          
          {/* Perspective road road-striping simulation */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <polygon points="120,400 350,150 450,150 680,400" fill="#1e293b" />
            <line x1="400" y1="150" x2="400" y2="400" stroke="#f8fafc" strokeWidth="3" strokeDasharray="16, 16" />
          </svg>

          {/* AI Bounding Box Overlay */}
          <div
            className="absolute border-2 border-rose-500 bg-rose-500/20 rounded-md flex flex-col justify-between p-2 shadow-lg"
            style={{
              left: `${defect.boundingBox?.x || 35}%`,
              top: `${defect.boundingBox?.y || 45}%`,
              width: `${defect.boundingBox?.width || 30}%`,
              height: `${defect.boundingBox?.height || 30}%`,
            }}
          >
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-rose-600 px-1.5 py-0.5 rounded -mt-5 -ml-2 self-start shadow">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> {defect.defectType} ({defect.confidenceScore}%)
              </span>
            </div>
            <div className="text-[10px] font-mono text-rose-700 bg-surface-50 px-1 rounded self-end">
              Depth: {defect.dimensions?.depthCm}cm
            </div>
          </div>

          {/* Telemetry HUD overlay in top corners */}
          <div className="absolute top-3 left-3 bg-surface-50 border border-line px-2.5 py-1 rounded text-[10px] font-mono text-ink-700 backdrop-blur-sm">
            <span>SURVEY UNIT: <strong>{defect.source}</strong></span>
          </div>
          <div className="absolute top-3 right-3 bg-surface-50 border border-line px-2.5 py-1 rounded text-[10px] font-mono text-emerald-600 backdrop-blur-sm flex items-center gap-1">
            <Cpu className="w-3 h-3" /> YOLO-v10 Edge Inference
          </div>
          <div className="absolute bottom-3 left-3 bg-surface-50 border border-line px-2.5 py-1 rounded text-[10px] font-mono text-ink-700 backdrop-blur-sm">
            <span>TIME: {formatDate(defect.detectedAt, true)}</span>
          </div>
        </div>

        {/* 4-Column Sensor Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-500 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-amber-600" /> Defect Dimensions
            </span>
            <div className="text-sm font-bold font-mono text-ink-900">
              {defect.dimensions.lengthCm} &times; {defect.dimensions.widthCm} &times; {defect.dimensions.depthCm} cm
            </div>
            <p className="text-[10px] text-ink-500 font-mono">Area: {defect.dimensions.areaSqM} m²</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-500 flex items-center gap-1">
              <Activity className="w-3 h-3 text-rose-600" /> Sensor G-Force Spike
            </span>
            <div className="text-2xl font-bold font-mono text-rose-600">
              {defect.sensorVibrationG} <span className="text-xs text-ink-500 font-normal">G</span>
            </div>
            <p className="text-[10px] text-ink-500">Normal Baseline: &lt; 0.8G</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-500 flex items-center gap-1">
              <Scale className="w-3 h-3 text-brand-600" /> AI Asphalt Volume
            </span>
            <div className="text-2xl font-bold font-mono text-brand-600">
              {defect.estimatedPatchVolumeKg} <span className="text-xs text-ink-500 font-normal">KG</span>
            </div>
            <p className="text-[10px] text-ink-500">Ready Polymer Mix</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Collision Risk Index
            </span>
            <div className="text-2xl font-bold font-mono text-ink-900">
              {defect.riskScore}<span className="text-xs text-ink-500">/100</span>
            </div>
            <p className="text-[10px] text-rose-600 font-semibold">{defect.severity.toUpperCase()} Priority</p>
          </div>
        </div>

        {/* Geological & Environmental Context */}
        <div className="p-4 rounded-xl bg-surface-50 border border-line space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink-900">AI Diagnostic Summary:</span>
            <span className="text-ink-500 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-600" /> {defect.weatherCondition}
            </span>
          </div>
          <p className="text-ink-700 leading-relaxed bg-white p-3 rounded-lg border border-line">
            {defect.notes}
          </p>
        </div>
      </div>
    </Modal>
  );
}
