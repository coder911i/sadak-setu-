import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { BrainCircuit, Zap, Sparkles } from 'lucide-react';

export function DamageIntelligenceCard() {
  const damageMetrics = {
    potholes:    { count: 142, avgDepth: '7.4 cm', criticalCount: 38 },
    cracks:      { count: 98,  totalSpan: '4,280 m', types: 'Alligator & Transverse' },
    otherDamage: { count: 56,  types: 'Rutting, Ravelling & Edge Drops' },
    overallConfidence: 96.8,
    severityBreakdown: [
      { label: 'Critical / Failed', percentage: 38, count: 112, color: 'bg-red-500',   textColor: 'text-red-700',   bgColor: 'bg-red-100' },
      { label: 'High Priority',     percentage: 32, count: 95,  color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-100' },
      { label: 'Moderate',          percentage: 20, count: 59,  color: 'bg-yellow-400',textColor: 'text-yellow-700',bgColor: 'bg-yellow-100' },
      { label: 'Low / Minor',       percentage: 10, count: 30,  color: 'bg-brand-500', textColor: 'text-brand-700', bgColor: 'bg-brand-100' },
    ],
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="py-3 px-5">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={BrainCircuit}>
            AI Damage Intelligence
          </CardTitle>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-100 border border-brand-200 text-[10px] font-mono text-brand-700">
            <Sparkles className="w-3 h-3 text-brand-600 animate-pulse" />
            <span>{damageMetrics.overallConfidence}% AI Confidence</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs flex-1 flex flex-col justify-between">
        {/* 3 Defect Category Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Potholes */}
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-red-600">Potholes</span>
              <span className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <div className="text-xl font-extrabold font-mono text-red-700">
              {damageMetrics.potholes.count}
            </div>
            <div className="text-[10px] text-red-500 font-mono">
              Avg Depth: <strong className="text-red-700">{damageMetrics.potholes.avgDepth}</strong>
            </div>
          </div>

          {/* Cracks */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-700">Cracks</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-xl font-extrabold font-mono text-amber-700">
              {damageMetrics.cracks.count}
            </div>
            <div className="text-[10px] text-amber-600 font-mono">
              Span: <strong className="text-amber-800">{damageMetrics.cracks.totalSpan}</strong>
            </div>
          </div>

          {/* Other Damage */}
          <div className="p-3 rounded-xl bg-surface-100 border border-line space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-ink-600">Other</span>
              <span className="w-2 h-2 rounded-full bg-[#7a9a83]" />
            </div>
            <div className="text-xl font-extrabold font-mono text-ink-900">
              {damageMetrics.otherDamage.count}
            </div>
            <div className="text-[10px] text-ink-400 truncate">
              Rutting & Edge Drops
            </div>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="space-y-2 pt-2 border-t border-line">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-ink-900">Severity Distribution:</span>
            <span className="text-[10px] font-mono text-ink-400">296 Total Defects</span>
          </div>

          {/* Multi-segment bar */}
          <div className="h-2.5 w-full bg-surface-100 rounded-full overflow-hidden flex border border-line">
            {damageMetrics.severityBreakdown.map((item) => (
              <div
                key={item.label}
                className={`h-full ${item.color}`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${item.percentage}%`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            {damageMetrics.severityBreakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
                <span className="truncate text-ink-600">{item.label}</span>
                <span className={`font-mono text-[10px] font-bold ml-auto ${item.textColor}`}>{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Confidence Banner */}
        <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-between text-[11px] text-brand-700">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-brand-600" />
            <span>AI Precision: <strong>96.8% Avg Confidence</strong> (YOLOv10 + LiDAR)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
