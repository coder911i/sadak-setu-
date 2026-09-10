import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Layers,
  RotateCcw,
  Check,
  XCircle,
  Activity,
  Gauge,
} from 'lucide-react';

export function BeforeAfterComparisonModal({ audit, isOpen, onClose, onApprove, onReject }) {
  const [sliderPos, setSliderPos] = useState(50);
  if (!audit) return null;

  const isPassed = audit.status === 'passed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={audit.title}
      description={`Corridor: ${audit.roadCode} (${audit.chainage}) | Contractor: ${audit.contractorName}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500">
            Auditor: <strong className="text-slate-800">{audit.auditorName}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              onClick={() => {
                if (onReject) onReject(audit.id);
                onClose();
              }}
            >
              Request Contractor Rework
            </Button>
            <Button
              variant="success"
              size="sm"
              icon={Check}
              onClick={() => {
                if (onApprove) onApprove(audit.id);
                onClose();
              }}
            >
              Signoff &amp; Release Milestone
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Interactive Before vs After Visual Comparison Container */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md select-none">
          {/* Split comparison simulation */}
          <div className="absolute inset-0 flex">
            {/* Left: Before Defect */}
            <div
              className="h-full bg-slate-850 relative overflow-hidden border-r-2 border-white shadow-xl"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-rose-950/40" />
              <div className="absolute top-3 left-3 bg-rose-700/90 border border-rose-500 px-2.5 py-1 rounded text-[11px] font-bold text-white shadow">
                BEFORE: Severe Pothole Damage
              </div>

              {/* Simulated Defect crater visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-24 rounded-full bg-slate-950 border-2 border-rose-500 shadow-xl flex flex-col items-center justify-center p-2 text-center animate-pulse">
                  <span className="text-[10px] font-mono text-rose-300 font-bold">Crater Depth</span>
                  <span className="text-xs font-mono text-white font-bold">8.0 cm</span>
                </div>
              </div>
            </div>

            {/* Right: After Repair Patch */}
            <div
              className="h-full bg-slate-800 relative overflow-hidden flex-1"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950/40" />
              <div className="absolute top-3 right-3 bg-emerald-700/90 border border-emerald-500 px-2.5 py-1 rounded text-[11px] font-bold text-white shadow">
                AFTER: High-Compaction Bituminous Patch
              </div>

              {/* Simulated Fresh Asphalt Patch */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-36 rounded-xl bg-slate-950 border-2 border-emerald-500 shadow-xl flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-[10px] font-mono text-emerald-300 font-bold">DBM + BC Overlay</span>
                  <span className="text-xs font-mono text-white font-bold">98.6% Compaction</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slider drag control */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center cursor-ew-resize pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-7 h-7 rounded-full bg-brand-600 border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-bold">
              ↔
            </div>
          </div>

          {/* Slider input control */}
          <input
            type="range"
            min="10"
            max="90"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute bottom-3 left-6 right-6 z-20 cursor-pointer opacity-80"
          />
        </div>

        {/* AI Quality Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-[#e2ebe4] shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">AI Quality Score</span>
            <div className="text-2xl font-bold font-mono text-brand-600">{audit.overallAiScore}/100</div>
            <p className="text-[10px] text-slate-500">IRC-111 Compliant</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#e2ebe4] shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Compaction Density</span>
            <div className="text-2xl font-bold font-mono text-slate-800">{audit.metrics.compactionDensity}%</div>
            <p className="text-[10px] text-slate-500">Threshold: &ge; 98.0%</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#e2ebe4] shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Post-Patch Roughness</span>
            <div className="text-2xl font-bold font-mono text-brand-600">{audit.metrics.surfaceRoughnessIRI} <span className="text-xs text-slate-500 font-normal">m/km</span></div>
            <p className="text-[10px] text-slate-500">Improved from 3.8</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#e2ebe4] shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Edge Seal &amp; Camber</span>
            <div className="text-xs font-bold font-mono text-brand-600 mt-1">{audit.metrics.edgeSealIntegrity}</div>
            <p className="text-[10px] text-slate-500">{audit.metrics.crossSlopeDrainage}</p>
          </div>
        </div>

        {/* Official Verdict Banner */}
        <div className={`p-4 rounded-xl border space-y-1 text-xs ${
          isPassed
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="font-bold flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`} />
            <span>Official Quality Verdict &amp; IRC Certification</span>
          </div>
          <p className="leading-relaxed opacity-90">{audit.complianceVerdict}</p>
        </div>
      </div>
    </Modal>
  );
}

