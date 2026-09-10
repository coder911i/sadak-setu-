import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Activity, TrendingUp, ShieldCheck, AlertTriangle } from 'lucide-react';

export function RoadHealthOverview() {
  const avgHealthScore = 74;
  const previousInspectionScore = 70.6;
  const improvement = +(avgHealthScore - previousInspectionScore).toFixed(1);

  // Circular gauge SVG calculations
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (avgHealthScore / 100) * circumference;

  // Good / Fair / Poor / Critical distribution breakdown
  const distribution = [
    { label: 'Good (PCI 80-100)', count: 86, percentage: 60.5, color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50 border-emerald-200' },
    { label: 'Fair (PCI 60-79)', count: 32, percentage: 22.5, color: 'bg-lime-500', textColor: 'text-lime-800', bgLight: 'bg-lime-50 border-lime-200' },
    { label: 'Poor (PCI 40-59)', count: 16, percentage: 11.3, color: 'bg-amber-500', textColor: 'text-amber-800', bgLight: 'bg-amber-50 border-amber-200' },
    { label: 'Critical (PCI <40)', count: 8, percentage: 5.7, color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50 border-red-200' },
  ];

  return (
    <Card className="flex flex-col justify-between h-full bg-white border-[#e2ebe4] shadow-card">
      <CardHeader className="py-3.5 px-5">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Activity}>
            Road Health Overview
          </CardTitle>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3" /> +{improvement}% vs Q2
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5 flex-1 flex flex-col justify-between">
        {/* Circular Health Score Display */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#f8faf8] border border-[#e2ebe4]">
          {/* Circular SVG Gauge */}
          <div className="relative flex items-center justify-center flex-shrink-0">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="#e2ebe4"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#1b6e43"
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
              <span className="text-2xl sm:text-3xl font-black font-mono leading-none text-brand-800">
                {avgHealthScore}
              </span>
              <span className="text-[9px] font-bold text-[#728a79] mt-0.5 uppercase tracking-wider">
                / 100
              </span>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-bold text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Overall Rating: Fair to Good</span>
            </div>
            <p className="text-xs text-[#3b5e47] leading-relaxed">
              142 national corridors monitored. Surface IRI index averages 2.4 m/km across Bharat road network.
            </p>
          </div>
        </div>

        {/* Good / Fair / Poor / Critical distribution */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#123320]">
            <span>Condition Distribution</span>
            <span className="text-[11px] font-mono text-[#728a79]">142 Total Sections</span>
          </div>

          {/* Multi-segment stacked bar */}
          <div className="h-2.5 w-full bg-surface-200 rounded-full overflow-hidden flex">
            {distribution.map((d) => (
              <div
                key={d.label}
                className={`h-full ${d.color}`}
                style={{ width: `${d.percentage}%` }}
                title={`${d.label}: ${d.count} (${d.percentage}%)`}
              />
            ))}
          </div>

          {/* Distribution list */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {distribution.map((d) => (
              <div
                key={d.label}
                className={`p-2 rounded-xl border flex items-center justify-between text-xs ${d.bgLight}`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full ${d.color} flex-shrink-0`} />
                  <span className={`font-semibold text-[11px] truncate ${d.textColor}`}>
                    {d.label.split(' ')[0]}
                  </span>
                </div>
                <span className="font-mono font-bold text-[11px] text-[#123320] ml-1">
                  {d.count} <span className="text-[10px] text-[#728a79] font-normal">({d.percentage}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
