import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { getPCIRating } from '../../utils/formatters';
import {
  Activity,
  Flame,
  Gauge,
  Zap,
  MapPin,
  TrendingUp,
  Info,
  ShieldCheck,
} from 'lucide-react';

export function RoadHealthScoreBreakdown({ road }) {
  const score = Number(road.healthScore || road.pciScore || 70);
  const pciMeta = getPCIRating(score);

  // Circular gauge SVG calculations
  const radius = 58;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreFactors = [
    {
      id: 'severity',
      title: 'Damage Severity',
      icon: Flame,
      status: score < 50 ? 'High Impact Defect' : score < 75 ? 'Moderate Surface Wear' : 'Minimal Severity',
      color: score < 50 ? 'text-rose-600 bg-rose-50 border-rose-200' : score < 75 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'Presence of deep craters (&gt;7cm depth), subgrade base exposure, and structural edge loss.',
      metric: `${road.criticalDefectsCount || 0} Critical Spots`,
    },
    {
      id: 'density',
      title: 'Damage Density',
      icon: Gauge,
      status: `${((road.damageCount || 0) / (road.totalLengthKm || 1)).toFixed(1)} Defects / KM`,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'Spatial frequency and concentration of distresses across chainage kilometers.',
      metric: `${road.damageCount || 0} Total Spots`,
    },
    {
      id: 'vibration',
      title: 'Vibration Intensity',
      icon: Zap,
      status: `IRI: ${road.iriScore} m/km`,
      color: road.iriScore > 3.5 ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'Tri-axial accelerometer G-force spikes measured during high-speed sensor passes.',
      metric: road.iriScore > 3.5 ? 'High Vibration (>2.8G)' : 'Smooth (<1.2G)',
    },
    {
      id: 'location',
      title: 'Location / Route Factor',
      icon: MapPin,
      status: road.trafficDensity?.split(' ')[0] || 'Moderate',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      description: 'Terrain exposure (monsoon water logging, heavy multi-axle freight loading & soil elasticity).',
      metric: `${road.lanes} Lanes (${road.district})`,
    },
  ];

  return (
    <Card className="bg-white border-line">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Activity}>
            Pavement Health Index &amp; Conceptual Score Breakdown
          </CardTitle>
          <span className="text-[10px] font-mono text-ink-500">
            0–100 Standard Condition Scale
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Top Score Gauge + Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-surface-50 border border-line">
          {/* Radial Gauge */}
          <div className="relative flex items-center justify-center flex-shrink-0">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="#1e293b"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold font-mono text-ink-900 leading-none">
                {score}
              </span>
              <span className="text-[10px] text-ink-500 font-semibold uppercase mt-0.5">
                / 100
              </span>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="space-y-1.5 flex-1 text-center sm:text-left text-xs">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className={`px-2.5 py-0.5 rounded font-bold font-mono border ${pciMeta.badgeClass}`}>
                {pciMeta.label}
              </span>
              <span className="text-ink-500 font-mono">Grade {pciMeta.grade}</span>
            </div>
            <p className="text-ink-700 leading-relaxed text-xs">
              {pciMeta.description}
            </p>
            <div className="text-[11px] text-ink-500 font-mono">
              Roughness Index: <strong className="text-ink-900">{road.iriScore} m/km</strong> &bull; Priority: <strong className="text-brand-600">{road.priority}</strong>
            </div>
          </div>
        </div>

        {/* 4 Conceptual Score Factors Grid (No artificial percentage claims) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-700">
            <Info className="w-3.5 h-3.5 text-brand-600" />
            <span>Contributing Health Index Factors:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {scoreFactors.map((factor) => {
              const Icon = factor.icon;
              return (
                <div
                  key={factor.id}
                  className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-ink-900">{factor.title}</span>
                    </div>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold border ${factor.color}`}>
                      {factor.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-500 leading-relaxed">{factor.description}</p>
                  <div className="text-[10px] font-mono text-ink-700 font-semibold pt-1 border-t border-line">
                    Telemetry: {factor.metric}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
