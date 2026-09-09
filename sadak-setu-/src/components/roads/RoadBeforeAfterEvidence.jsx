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
    <Card className="bg-slate-900/90 border-slate-800">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={ShieldCheck}>
            Post-Repair Before &amp; After Quality Evidence
          </CardTitle>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-400" /> IRC:111 Standard Verified
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Interactive Before vs After Visual Comparison Slider */}
        <div className="relative aspect-[16/8] sm:aspect-[16/7] rounded-xl overflow-hidden bg-slate-950 border border-slate-750 shadow-2xl select-none">
          {/* Left: Before Defect */}
          <div
            className="absolute inset-y-0 left-0 bg-slate-900 border-r-2 border-brand-400 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-rose-950/40" />
            <div className="absolute top-3 left-3 bg-rose-950/90 border border-rose-700 px-2 py-0.5 rounded text-[10px] font-bold text-rose-300 shadow">
              BEFORE: Severe Pothole Cratering (8.4cm Depth)
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-20 rounded-full bg-slate-950 border-2 border-rose-500 shadow-2xl flex flex-col items-center justify-center text-center p-2">
                <span className="text-[9px] font-mono text-rose-400 font-bold">Sub-base Loss</span>
                <span className="text-xs font-mono text-white font-bold">8.4 cm Crater</span>
              </div>
            </div>
          </div>

          {/* Right: After Repair */}
          <div className="absolute inset-0 -z-10 flex items-center justify-end bg-slate-850">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950/40" />
            <div className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-300 shadow">
              AFTER: Hot-Mix DBM + BC Asphalt Patch
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-44 h-28 rounded-xl bg-slate-950 border-2 border-emerald-500 shadow-2xl flex flex-col items-center justify-center text-center p-2">
                <span className="text-[9px] font-mono text-emerald-400 font-bold">98.6% Compaction</span>
                <span className="text-xs font-mono text-white font-bold">Certified Smooth</span>
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
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Compaction Density</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">98.6% (Passed)</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Roughness Reduction</span>
            <span className="text-sm font-bold text-slate-100 font-mono">-2.2 m/km IRI</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Edge Sealing</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">Zero Raveling</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Quality Verdict</span>
            <span className="text-sm font-bold text-brand-400 font-mono">Signoff Approved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
