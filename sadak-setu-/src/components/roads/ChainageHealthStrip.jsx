import React from 'react';
import { getPCIRating, formatChainage } from '../../utils/formatters';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function ChainageHealthStrip({ road, onSelectSegment }) {
  if (!road || !road.segments) return null;

  return (
    <div className="p-4 rounded-xl bg-white border border-line space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-ink-900 flex items-center gap-2">
            <span className="font-mono text-brand-600">{road.code}</span>
            <span>Chainage-by-Chainage Health Strip ({road.totalLengthKm} KM)</span>
          </h4>
          <p className="text-[11px] text-ink-500">
            Pavement Distress &amp; Roughness Heatmap from Km 0+000 to Km {road.totalLengthKm}
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono text-ink-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Optimal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-500" /> Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-rose-500" /> Critical Hotspot
          </span>
        </div>
      </div>

      {/* Visual Chainage Segment Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {road.segments.map((seg) => {
          const pciMeta = getPCIRating(seg.pci);
          const isCritical = seg.pci < 55;

          return (
            <div
              key={seg.id}
              onClick={() => onSelectSegment && onSelectSegment(seg)}
              className="p-3 rounded-lg bg-surface-50 border border-line hover:border-line transition-all cursor-pointer group space-y-2 relative overflow-hidden"
            >
              {/* Colored top indicator */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  seg.pci >= 80 ? 'bg-emerald-500' : seg.pci >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
              />

              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-ink-900">
                  {formatChainage(seg.startKm)} – {formatChainage(seg.endKm)}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${pciMeta.badgeClass}`}
                >
                  PCI {seg.pci}
                </span>
              </div>

              <p className="text-[11px] text-ink-700 font-medium truncate group-hover:text-brand-700">
                {seg.name}
              </p>

              <div className="flex items-center justify-between text-[10px] text-ink-500 font-mono pt-1 border-t border-line">
                <span>IRI: {seg.iri} m/km</span>
                <span className={seg.defects > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                  {seg.defects} Active Defects
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
