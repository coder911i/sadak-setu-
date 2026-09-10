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
    <Card className="bg-white border-[#e2ebe4] shadow-card">
      <CardHeader className="py-3.5 px-5">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={ShieldCheck}>
            Post-Repair Before &amp; After Quality Evidence
          </CardTitle>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 flex items-center gap-1 font-bold">
            <Award className="w-3.5 h-3.5 text-brand-600" /> IRC:111 Standard Verified
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Interactive Before vs After Visual Comparison Slider */}
        <div className="relative aspect-[16/8] sm:aspect-[16/7] rounded-2xl overflow-hidden bg-[#16271c] border border-[#e2ebe4] shadow-md select-none">
          {/* Left: Before Defect */}
          <div
            className="absolute inset-y-0 left-0 bg-[#1e2f23] border-r-2 border-white overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-[#271d1d]/60 to-red-950/40" />
            <div className="absolute top-3 left-3 bg-red-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white shadow">
              BEFORE: Severe Pothole Cratering (8.4cm Depth)
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-20 rounded-2xl bg-black/60 border-2 border-red-500 shadow-xl flex flex-col items-center justify-center text-center p-2 backdrop-blur-xs">
                <span className="text-[9px] font-mono text-red-400 font-bold">Sub-base Loss</span>
                <span className="text-xs font-mono text-white font-black">8.4 cm Crater</span>
              </div>
            </div>
          </div>

          {/* Right: After Repair */}
          <div className="absolute inset-0 -z-10 flex items-center justify-end bg-[#16271c]">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-[#182a1d] to-emerald-950/40" />
            <div className="absolute top-3 right-3 bg-emerald-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white shadow">
              AFTER: Hot-Mix DBM + BC Asphalt Patch
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-44 h-28 rounded-2xl bg-black/60 border-2 border-emerald-500 shadow-xl flex flex-col items-center justify-center text-center p-2 backdrop-blur-xs">
                <span className="text-[9px] font-mono text-emerald-400 font-bold">98.6% Compaction</span>
                <span className="text-xs font-mono text-white font-black">Certified Smooth</span>
              </div>
            </div>
          </div>

          {/* Slider drag control */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-7 h-7 rounded-full bg-brand-700 border-2 border-white shadow-xl flex items-center justify-center text-[10px] text-white font-bold">
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
            className="absolute bottom-3 left-6 right-6 z-20 cursor-pointer opacity-70 accent-brand-700"
          />
        </div>

        {/* Verification metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-2xl bg-surface-50 border border-[#e2ebe4]">
            <span className="text-[10px] text-[#728a79] block font-mono font-bold">Compaction Density</span>
            <span className="text-sm font-black text-emerald-700 font-mono">98.6% (Passed)</span>
          </div>

          <div className="p-3 rounded-2xl bg-surface-50 border border-[#e2ebe4]">
            <span className="text-[10px] text-[#728a79] block font-mono font-bold">Roughness Reduction</span>
            <span className="text-sm font-black text-[#123320] font-mono">-2.2 m/km IRI</span>
          </div>

          <div className="p-3 rounded-2xl bg-surface-50 border border-[#e2ebe4]">
            <span className="text-[10px] text-[#728a79] block font-mono font-bold">Edge Sealing</span>
            <span className="text-sm font-black text-emerald-700 font-mono">Zero Raveling</span>
          </div>

          <div className="p-3 rounded-2xl bg-brand-50 border border-brand-200">
            <span className="text-[10px] text-brand-700 block font-mono font-bold">Quality Verdict</span>
            <span className="text-sm font-black text-brand-800 font-mono">Signoff Approved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
