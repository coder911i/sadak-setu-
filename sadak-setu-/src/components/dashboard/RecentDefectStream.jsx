import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useInspections } from '../../hooks/useInspections';
import { formatRelativeTime } from '../../utils/formatters';
import { SEVERITY_LEVELS } from '../../utils/constants';
import { ScanEye, AlertTriangle, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RecentDefectStream({ onSelectDefect }) {
  const { inspections } = useInspections();
  const navigate = useNavigate();

  const recentItems = inspections.slice(0, 5);

  return (
    <Card className="flex flex-col h-full border-slate-800">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={ScanEye}>
            Live AI Detection Stream
          </CardTitle>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Feed
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-800/60 flex-1 overflow-y-auto">
        {recentItems.map((item) => {
          const sev = SEVERITY_LEVELS[item.severity.toUpperCase()] || SEVERITY_LEVELS.MODERATE;

          return (
            <div
              key={item.id}
              onClick={() => (onSelectDefect ? onSelectDefect(item) : navigate('/inspections'))}
              className="p-3.5 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                    item.severity === 'critical'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-brand-300 transition-colors">
                      {item.defectType}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${sev.badgeClass}`}
                    >
                      {item.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="text-slate-300 font-semibold">{item.roadCode}</span>
                    <span>&bull;</span>
                    <span>{item.chainage}</span>
                    <span>&bull;</span>
                    <span className="text-slate-500">{item.lane}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Cpu className="w-3 h-3" /> {item.confidenceScore}% AI Confidence
                    </span>
                    <span>Depth: {item.dimensions.depthCm} cm</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 flex flex-col items-end justify-between h-full space-y-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatRelativeTime(item.detectedAt)}
                </span>
                <span className="text-[10px] text-brand-400 group-hover:underline flex items-center gap-0.5">
                  Inspect <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="py-2.5 px-4 bg-slate-950/60">
        <Button
          variant="ghost"
          size="xs"
          className="w-full text-slate-400 hover:text-white"
          onClick={() => navigate('/inspections')}
        >
          View All AI Telemetry Scans &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
}
