import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, ArrowRight, X, CheckCircle2, Award, Zap } from 'lucide-react';

export function WelcomeSplashScreen({ forceOpen = false, onClose }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    const hasSeen = localStorage.getItem('sadak_setu_welcome_seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleDismiss = () => {
    localStorage.setItem('sadak_setu_welcome_seen', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e2ebe4] overflow-hidden animate-scale-in">
        {/* Decorative Top Institutional Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-[#eef7f1] to-white border-b border-[#e2ebe4] text-center relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full text-[#728a79] hover:text-[#123320] hover:bg-[#e2ebe4]/50 transition-colors"
            aria-label="Close welcome modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-700 shadow-md mb-3 ring-4 ring-brand-100">
            <img src="/logo.svg" alt="Sadak Setu Logo" className="w-9 h-9 object-contain brightness-0 invert" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-700 uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Ministry of Road Transport &amp; Highways</span>
          </div>

          <h2 className="text-2xl font-black text-[#123320] tracking-tight">
            SADAK SETU
          </h2>
          <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold tracking-wide">
            Monitor &bull; Maintain &bull; Move Ahead
          </div>
        </div>

        {/* Modal Body with Illustration & Tagline */}
        <div className="p-6 space-y-5 text-center">
          <div>
            <h3 className="text-xl font-bold text-[#155635]">
              Safer Roads. Stronger Bharat.
            </h3>
            <p className="text-sm text-[#3b5e47] mt-1.5 max-w-sm mx-auto leading-relaxed">
              AI-powered road monitoring for a smoother, safer tomorrow.
            </p>
          </div>

          {/* Road / Infrastructure Clean SVG Illustration */}
          <div className="relative h-44 rounded-2xl bg-[#f0f7f2] border border-[#e2ebe4] overflow-hidden flex items-center justify-center">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#2d8a5a_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Sun / Sky */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-amber-200/50 blur-sm pointer-events-none" />

            {/* Road Perspective Illustration */}
            <svg viewBox="0 0 400 180" className="w-full h-full object-cover">
              {/* Greenery / Horizon */}
              <rect x="0" y="0" width="400" height="90" fill="#e3f0e6" />
              {/* Hills */}
              <path d="M0,90 Q90,60 180,90 T360,90 L400,90 L400,180 L0,180 Z" fill="#d2e7d7" opacity="0.6" />
              {/* Asphalt Road */}
              <polygon points="170,90 230,90 340,180 60,180" fill="#2c4033" />
              {/* Road Shoulders */}
              <polygon points="160,90 170,90 60,180 35,180" fill="#9dbba7" />
              <polygon points="230,90 240,90 365,180 340,180" fill="#9dbba7" />
              {/* Dashed Center Road Line */}
              <line x1="200" y1="90" x2="200" y2="180" stroke="#fcd34d" strokeWidth="4" strokeDasharray="14, 12" />
              {/* AI Detection Bounding Box on Road */}
              <rect x="180" y="130" width="45" height="28" rx="4" fill="rgba(220, 38, 38, 0.2)" stroke="#dc2626" strokeWidth="2" strokeDasharray="3, 3" />
              <circle cx="202" cy="144" r="3" fill="#dc2626" />
            </svg>

            {/* AI HUD Badge */}
            <div className="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-lg bg-white/95 border border-[#e2ebe4] shadow-sm text-[11px] font-mono text-[#155635] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PavementNet AI Vision Active</span>
            </div>

            <div className="absolute top-2.5 right-3 px-2 py-0.5 rounded-md bg-white/90 border border-[#e2ebe4] text-[10px] font-mono text-[#3b5e47]">
              IRC:111 Certified
            </div>
          </div>

          {/* Key Value Points */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-left">
            <div className="p-2.5 rounded-xl bg-surface-50 border border-[#e2ebe4]">
              <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>100% GIS</span>
              </div>
              <p className="text-[10px] text-[#728a79] mt-0.5 leading-snug">Precision highway chainage telemetry</p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-50 border border-[#e2ebe4]">
              <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>YOLO-v10</span>
              </div>
              <p className="text-[10px] text-[#728a79] mt-0.5 leading-snug">Sub-cm depth &amp; crack detection</p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-50 border border-[#e2ebe4]">
              <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs">
                <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Zero SLA</span>
              </div>
              <p className="text-[10px] text-[#728a79] mt-0.5 leading-snug">Instant work order dispatch pipeline</p>
            </div>
          </div>

          {/* "Get Started" CTA */}
          <button
            onClick={handleDismiss}
            className="w-full py-3.5 px-6 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
