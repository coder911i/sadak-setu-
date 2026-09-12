import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SEVERITY_LEVELS } from '../../utils/constants';
import { formatRelativeTime, formatDate } from '../../utils/formatters';
import {
  ScanEye,
  AlertTriangle,
  Cpu,
  Eye,
  Layers,
  ShieldAlert,
  Flame,
  Radio,
} from 'lucide-react';

export function RoadDamageDetectionList({ defects = [], onSelectDefect }) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'pothole' | 'crack' | 'other'

  const filtered = defects.filter((d) => {
    if (filterType === 'pothole') return d.defectType.toLowerCase().includes('pothole');
    if (filterType === 'crack') return d.defectType.toLowerCase().includes('crack');
    if (filterType === 'other') return !d.defectType.toLowerCase().includes('pothole') && !d.defectType.toLowerCase().includes('crack');
    return true;
  });

  const potholesCount = defects.filter((d) => d.defectType.toLowerCase().includes('pothole')).length;
  const cracksCount = defects.filter((d) => d.defectType.toLowerCase().includes('crack')).length;
  const otherCount = defects.length - potholesCount - cracksCount;

  return (
    <Card className="bg-white border-line">
      <CardHeader className="py-3 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <CardTitle icon={ScanEye}>
            AI Damage Detections &amp; Sensor Vision Log
          </CardTitle>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-50 rounded-xl border border-line text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              All ({defects.length})
            </button>
            <button
              onClick={() => setFilterType('pothole')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'pothole' ? 'bg-rose-600 text-white' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Potholes ({potholesCount})
            </button>
            <button
              onClick={() => setFilterType('crack')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'crack' ? 'bg-orange-600 text-white' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Cracks ({cracksCount})
            </button>
            <button
              onClick={() => setFilterType('other')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'other' ? 'bg-amber-600 text-white' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Other ({otherCount})
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const sevMeta = SEVERITY_LEVELS[item.severity.toUpperCase()] || SEVERITY_LEVELS.MODERATE;

            return (
              <div
                key={item.id}
                onClick={() => onSelectDefect && onSelectDefect(item)}
                className="p-3.5 rounded-xl bg-surface-50 border border-line hover:border-line transition-all cursor-pointer space-y-3 group shadow-sm flex flex-col justify-between"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-ink-900 group-hover:text-brand-700 transition-colors">
                        {item.defectType}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase font-mono ${sevMeta.badgeClass}`}>
                        {item.severity}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-brand-600 mt-0.5">
                      Location: {item.chainage} ({item.lane})
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-emerald-600" /> {item.confidenceScore}% Conf
                  </span>
                </div>

                {/* Simulated Visual Detection Frame */}
                <div className="relative aspect-[16/8] rounded-lg bg-white border border-line overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30" />
                  
                  {/* Bounding box */}
                  <div
                    className="absolute border-2 border-rose-500 bg-rose-500/20 rounded flex items-center justify-center"
                    style={{
                      left: `${item.boundingBox?.x || 30}%`,
                      top: `${item.boundingBox?.y || 35}%`,
                      width: `${item.boundingBox?.width || 38}%`,
                      height: `${item.boundingBox?.height || 35}%`,
                    }}
                  >
                    <span className="text-[8px] font-mono font-bold text-white bg-rose-600 px-1 rounded -mt-6 self-start">
                      {item.defectType} ({item.confidenceScore}%)
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface-50 border border-line text-[9px] font-mono text-ink-700">
                    GPS: {item.lat?.toFixed(4)}° N, {item.lng?.toFixed(4)}° E
                  </div>

                  <div className="absolute top-2 right-2 px-1.5 py-0.2 rounded bg-surface-50 font-mono text-[9px] text-ink-500">
                    Depth: {item.dimensions.depthCm} cm
                  </div>
                </div>

                {/* Dimensions & Footer */}
                <div className="flex items-center justify-between text-[11px] text-ink-500 pt-1 border-t border-line">
                  <span>{item.dimensions.lengthCm}cm &times; {item.dimensions.widthCm}cm</span>
                  <span className="text-brand-600 group-hover:underline flex items-center gap-1 font-semibold">
                    Inspect Telemetry &rarr;
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-ink-500 text-xs">
              No distresses recorded in this category.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
