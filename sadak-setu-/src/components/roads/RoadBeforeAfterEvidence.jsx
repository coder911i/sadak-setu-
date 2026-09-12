import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ShieldCheck, Sliders, CheckCircle2, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RoadBeforeAfterEvidence({ road }) {
  const [sliderPos, setSliderPos] = useState(50);
  const navigate = useNavigate();

  return (
    <Card className="bg-white border-line">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={ShieldCheck}>
            Post-Repair Before &amp; After Quality Evidence
          </CardTitle>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-600" /> IRC:111 Standard Verified
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Interactive Before vs After Visual Comparison Slider */}
        <div className="relative aspect-[16/8] sm:aspect-[16/7] rounded-xl overflow-hidden bg-surface-50 border border-line shadow-elevated select-none">
          {/* Left: Before Defect */}
          <div
            className="absolute inset-y-0 left-0 bg-white border-r-2 border-brand-400 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-rose-950/40" />
            <div className="absolute top-3 left-3 bg-white/95 border border-rose-200 px-2 py-0.5 rounded-lg text-[10px] font-bold text-rose-700 shadow-sm">
              BEFORE: Severe Pothole Cratering (8.4cm Depth)
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-20 rounded-full bg-surface-50 border-2 border-rose-500 shadow-elevated flex flex-col items-center justify-center text-center p-2">
                <span className="text-[9px] font-mono text-rose-600 font-bold">Sub-base Loss</span>
                <span className="text-xs font-mono text-rose-700 font-bold">8.4 cm Crater</span>
              </div>
            </div>
          </div>

          {/* Right: After Repair */}
          <div className="absolute inset-0 -z-10 flex items-center justify-end bg-surface-100">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950/40" />
            <div className="absolute top-3 right-3 bg-white/95 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-700 shadow-sm">
              AFTER: Hot-Mix DBM + BC Asphalt Patch
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-44 h-28 rounded-xl bg-surface-50 border-2 border-emerald-500 shadow-elevated flex flex-col items-center justify-center text-center p-2">
                <span className="text-[9px] font-mono text-emerald-600 font-bold">98.6% Compaction</span>
                <span className="text-xs font-mono text-emerald-700 font-bold">Certified Smooth</span>
              </div>
            </div>
          </div>

          {/* Slider drag control */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-6 h-6 rounded-full bg-brand-500 border-2 border-white shadow-xl flex items-center justify-center text-[10px] text-white font-bold">
              ↔
            </div>
          </div>

          {/* Range input */}
          <input
            type="range"
            min="10"
            max="90"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute bottom-3 left-6 right-6 z-20 cursor-pointer opacity-70"
          />
        </div>

        {/* Verification metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 rounded-lg bg-surface-50 border border-line">
            <span className="text-[10px] text-ink-500 block font-mono">Compaction Density</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">98.6% (Passed)</span>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-50 border border-line">
            <span className="text-[10px] text-ink-500 block font-mono">Roughness Reduction</span>
            <span className="text-sm font-bold text-ink-900 font-mono">-2.2 m/km IRI</span>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-50 border border-line">
            <span className="text-[10px] text-ink-500 block font-mono">Edge Sealing</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">Zero Raveling</span>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-50 border border-line">
            <span className="text-[10px] text-ink-500 block font-mono">Quality Verdict</span>
            <span className="text-sm font-bold text-brand-600 font-mono">Signoff Approved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
