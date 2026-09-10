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
    <Card className="bg-white border-[#e2ebe4] shadow-card">
      <CardHeader className="py-3.5 px-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <CardTitle icon={ScanEye}>
            AI Damage Detections &amp; Sensor Vision Log
          </CardTitle>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-50 rounded-2xl border border-[#e2ebe4] text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-brand-700 text-white shadow-xs' : 'text-[#728a79] hover:text-[#123320]'
              }`}
            >
              All ({defects.length})
            </button>
            <button
              onClick={() => setFilterType('pothole')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                filterType === 'pothole' ? 'bg-red-600 text-white shadow-xs' : 'text-[#728a79] hover:text-[#123320]'
              }`}
            >
              Potholes ({potholesCount})
            </button>
            <button
              onClick={() => setFilterType('crack')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                filterType === 'crack' ? 'bg-amber-600 text-white shadow-xs' : 'text-[#728a79] hover:text-[#123320]'
              }`}
            >
              Cracks ({cracksCount})
            </button>
            <button
              onClick={() => setFilterType('other')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                filterType === 'other' ? 'bg-brand-800 text-white shadow-xs' : 'text-[#728a79] hover:text-[#123320]'
              }`}
            >
              Other ({otherCount})
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isCritical = item.severity === 'critical';
            const isHigh = item.severity === 'high';

            return (
              <div
                key={item.id}
                onClick={() => onSelectDefect && onSelectDefect(item)}
                className="p-4 rounded-2xl bg-white border border-[#e2ebe4] hover:border-brand-400 hover:shadow-card-hover transition-all cursor-pointer space-y-3 group shadow-card flex flex-col justify-between"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#123320] group-hover:text-brand-700 transition-colors">
                        {item.defectType}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.2 rounded-full border uppercase font-mono ${
                          isCritical
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isHigh
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-brand-800 font-semibold mt-0.5">
                      Location: {item.chainage} ({item.lane})
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-brand-600" /> {item.confidenceScore}% Conf
                  </span>
                </div>

                {/* Simulated Visual Detection Frame */}
                <div className="relative aspect-[16/8] rounded-xl bg-[#16271c] border border-[#e2ebe4] overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-[#1c2e22]/90 to-[#253f2f]/80" />
                  
                  {/* Bounding box */}
                  <div
                    className="absolute border-2 border-red-500 bg-red-500/25 rounded flex items-center justify-center"
                    style={{
                      left: `${item.boundingBox?.x || 30}%`,
                      top: `${item.boundingBox?.y || 35}%`,
                      width: `${item.boundingBox?.width || 38}%`,
                      height: `${item.boundingBox?.height || 35}%`,
                    }}
                  >
                    <span className="text-[8px] font-mono font-bold text-white bg-red-600 px-1 rounded -mt-6 self-start">
                      {item.defectType} ({item.confidenceScore}%)
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white">
                    GPS: {item.lat?.toFixed(4)}° N, {item.lng?.toFixed(4)}° E
                  </div>

                  <div className="absolute top-2 right-2 px-1.5 py-0.2 rounded bg-black/60 font-mono text-[9px] text-amber-300">
                    Depth: {item.dimensions.depthCm} cm
                  </div>
                </div>

                {/* Dimensions & Footer */}
                <div className="flex items-center justify-between text-[11px] text-[#728a79] pt-1 border-t border-[#edf3ee]">
                  <span>{item.dimensions.lengthCm}cm &times; {item.dimensions.widthCm}cm</span>
                  <span className="text-brand-700 font-bold group-hover:underline flex items-center gap-1">
                    Inspect Telemetry &rarr;
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#728a79] text-xs font-medium">
              No distresses recorded in this category.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
