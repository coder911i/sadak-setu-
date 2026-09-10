import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { getPCIRating } from '../../utils/formatters';
import { Activity, TrendingUp, Info } from 'lucide-react';

export function RoadHealthOverview() {
  const avgHealthScore = 73.4;
  const previousInspectionScore = 69.6;
  const improvement = +(avgHealthScore - previousInspectionScore).toFixed(1);

  // Circular gauge SVG calculations
  const radius = 64;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (avgHealthScore / 100) * circumference;

  // Color by score
  const gaugeColor = avgHealthScore >= 80 ? '#16a34a' : avgHealthScore >= 60 ? '#65a30d' : avgHealthScore >= 40 ? '#d97706' : '#dc2626';
  const scoreLabel = avgHealthScore >= 80 ? 'Excellent' : avgHealthScore >= 60 ? 'Satisfactory' : avgHealthScore >= 40 ? 'Fair' : 'Critical';

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="py-3 px-5">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Activity}>Road Health Index (0–100)</CardTitle>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +{improvement}% vs Q2
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5 flex-1 flex flex-col justify-between">
        {/* Score Visualization */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-surface-50 p-4 rounded-xl border border-line">
          {/* Circular SVG Gauge */}
          <div className="relative flex items-center justify-center flex-shrink-0">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              {/* Background track */}
              <circle
                stroke="#e8f0ec"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Progress arc */}
              <circle
                stroke={gaugeColor}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            {/* Center score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold font-mono leading-none" style={{ color: gaugeColor }}>
                {avgHealthScore}
              </span>
              <span className="text-[10px] font-semibold text-ink-400 mt-0.5 uppercase tracking-wider">
                / 100
              </span>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span
                className="px-2.5 py-1 rounded-lg font-bold text-xs font-mono border"
                style={{
                  background: gaugeColor + '15',
                  color: gaugeColor,
                  borderColor: gaugeColor + '40',
                }}
              >
                Grade B+ — {scoreLabel}
              </span>
            </div>

            <p className="text-xs text-ink-600 leading-relaxed">
              Network maintains acceptable riding quality with moderate surface distress. Routine micro-surfacing scheduled.
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3 text-[11px] font-mono text-ink-400 pt-1">
              <span>Avg Roughness: <strong className="text-ink-900">2.4 m/km</strong></span>
              <span>&bull;</span>
              <span>Confidence: <strong className="text-green-700">98.2%</strong></span>
            </div>
          </div>
        </div>

        {/* Scale Explanation */}
        <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-brand-700">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Health Scale (0–100): Higher = Better</span>
          </div>
          <p className="text-[11px] text-ink-600 leading-normal pl-5">
            <strong>85–100</strong> = Excellent (pristine surface) · <strong>55–84</strong> = Satisfactory ·
            <strong> &lt;40</strong> = Critical (immediate repair needed)
          </p>
        </div>

        {/* Health Tiers Breakdown */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
          <div className="p-2 rounded-lg bg-green-50 border border-green-200">
            <span className="text-green-700 font-bold block">85–100</span>
            <span className="text-ink-400">Optimal (42%)</span>
          </div>
          <div className="p-2 rounded-lg bg-lime-50 border border-lime-200">
            <span className="text-lime-700 font-bold block">70–84</span>
            <span className="text-ink-400">Good (28%)</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-amber-700 font-bold block">55–69</span>
            <span className="text-ink-400">Fair (18%)</span>
          </div>
          <div className="p-2 rounded-lg bg-red-50 border border-red-200">
            <span className="text-red-700 font-bold block">&lt;55</span>
            <span className="text-ink-400">Critical (12%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
