import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { useInspections } from '../../hooks/useInspections';
import { formatRelativeTime } from '../../utils/formatters';
import { SEVERITY_LEVELS } from '../../utils/constants';
import { ScanEye, ArrowRight, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RecentDefectStream({ onSelectDefect }) {
  const { inspections } = useInspections();
  const navigate = useNavigate();

  const recentItems = inspections.slice(0, 5);

  return (
    <Card className="flex flex-col h-full bg-white border-[#e2ebe4] shadow-card">
      <CardHeader className="py-3.5 px-5">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={ScanEye}>
            Recent Detections
          </CardTitle>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Stream
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-[#edf3ee] flex-1 overflow-y-auto">
        {recentItems.map((item) => {
          const isCritical = item.severity === 'critical';
          const isHigh = item.severity === 'high';

          return (
            <div
              key={item.id}
              onClick={() => (onSelectDefect ? onSelectDefect(item) : navigate('/inspections'))}
              className="p-4 hover:bg-[#f8faf8] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
            >
              {/* Left Column: Image Thumbnail + Details */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Small Image Thumbnail */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#1c2e22] border border-[#e2ebe4] flex-shrink-0 flex items-center justify-center shadow-sm">
                  {/* Road Asphalt Texture */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#16271c] to-[#253d2d]" />
                  {/* Asphalt road line */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-amber-400/60 border-dashed" />
                  {/* Bounding Box Indicator */}
                  <div
                    className={`relative z-10 w-7 h-6 rounded border-2 flex items-center justify-center ${
                      isCritical
                        ? 'border-red-500 bg-red-500/30'
                        : isHigh
                        ? 'border-amber-500 bg-amber-500/30'
                        : 'border-emerald-500 bg-emerald-500/30'
                    }`}
                  >
                    <span className="text-[8px] font-mono font-black text-white">AI</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#123320] group-hover:text-brand-700 transition-colors truncate">
                      {item.defectType}
                    </h4>
                    {/* Severity Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full border flex-shrink-0 ${
                        isCritical
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isHigh
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {item.severity.toUpperCase()}
                    </span>
                  </div>

                  {/* Road / Location */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[#3b5e47] font-medium truncate">
                    <span className="font-mono font-bold text-brand-800">{item.roadCode}</span>
                    <span className="text-[#8a9c8f]">&bull;</span>
                    <span className="truncate">{item.roadName}</span>
                    <span className="text-[#8a9c8f]">&bull;</span>
                    <span className="font-mono text-[#728a79]">{item.chainage}</span>
                  </div>

                  {/* Metrics snippet */}
                  <div className="flex items-center gap-3 text-[10px] font-mono text-[#728a79]">
                    <span>Depth: <strong className="text-[#123320]">{item.dimensions.depthCm} cm</strong></span>
                    <span>&bull;</span>
                    <span>Confidence: <strong className="text-brand-700">{item.confidenceScore}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Time & Inspect Arrow */}
              <div className="text-right flex-shrink-0 flex flex-col items-end justify-between h-full space-y-1.5">
                <span className="text-[10px] text-[#728a79] font-mono whitespace-nowrap">
                  {formatRelativeTime(item.detectedAt)}
                </span>
                <span className="text-[11px] font-semibold text-brand-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Inspect <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="py-2.5 px-5 bg-surface-50">
        <button
          onClick={() => navigate('/inspections')}
          className="w-full text-center text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center justify-center gap-1 cursor-pointer py-1"
        >
          <span>View All Road Defect Detections</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </CardFooter>
    </Card>
  );
}
