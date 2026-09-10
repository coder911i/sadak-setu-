import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Layers,
  Cpu,
  Wrench,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const customPinIcon = L.divIcon({
  className: 'relative pulse-marker-critical',
  html: `
    <div class="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center">
      <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function DamageDetailModal({ defect, isOpen, onClose, onAddToRepairQueue }) {
  if (!defect) return null;

  const lat = defect.lat || 27.4800;
  const lng = defect.lng || 76.4500;
  const depth = defect.dimensions?.depthCm || 8.5;
  const length = defect.dimensions?.lengthCm || 65;
  const width = defect.dimensions?.widthCm || 45;
  const isCritical = defect.severity === 'critical';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col h-full max-h-[85vh] overflow-y-auto">
        {/* Top Bar with Back Button */}
        <div className="px-5 py-3.5 bg-[#f8faf8] border-b border-[#e2ebe4] flex items-center justify-between gap-3 sticky top-0 z-20">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#e2ebe4] text-xs font-bold text-[#155635] hover:bg-brand-50 hover:border-brand-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isCritical
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {defect.severity ? defect.severity.toUpperCase() : 'CRITICAL'} SEVERITY
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Header Title & Location */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#728a79]">
              <span className="font-bold text-brand-700">{defect.roadCode || 'NH-48'}</span>
              <span>&bull;</span>
              <span>{defect.chainage || 'Km 62+400'}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8a9c8f]" />
                {formatDate(defect.detectedAt || new Date().toISOString(), true)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#123320] tracking-tight flex items-center gap-2">
              <span>{defect.defectType || 'Pothole'} Detected</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 border border-brand-200 font-mono font-semibold">
                AI Verified
              </span>
            </h2>

            <p className="text-xs text-[#3b5e47] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span>{defect.roadName || 'Delhi – Jaipur Expressway Corridor'}</span>
              <span className="text-[#8a9c8f]">({defect.district || 'Gurugram Division'})</span>
            </p>
          </div>

          {/* Damage Simulated Image Frame */}
          <div className="relative aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden bg-[#1a2e21] border border-[#e2ebe4] shadow-md flex items-center justify-center group">
            {/* Road Asphalt Simulation */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-[#1c2e22] to-[#253f2f] opacity-95" />

            {/* Simulated Road Markings */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <polygon points="120,400 350,120 450,120 680,400" fill="#15261b" />
              <line x1="400" y1="120" x2="400" y2="400" stroke="#fcd34d" strokeWidth="4" strokeDasharray="16, 16" />
            </svg>

            {/* AI Bounding Box Overlay */}
            <div
              className="absolute border-2 border-red-500 bg-red-500/20 rounded-lg flex flex-col justify-between p-2 shadow-xl"
              style={{
                left: `${defect.boundingBox?.x || 36}%`,
                top: `${defect.boundingBox?.y || 42}%`,
                width: `${defect.boundingBox?.width || 32}%`,
                height: `${defect.boundingBox?.height || 34}%`,
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white bg-red-600 px-2 py-0.5 rounded -mt-5 -ml-2 shadow">
                <span>{defect.defectType || 'Pothole'} ({defect.confidenceScore || 98.4}%)</span>
              </div>
              <div className="text-[10px] font-mono text-red-100 bg-black/80 px-1.5 py-0.5 rounded self-end backdrop-blur-sm">
                Depth: {depth}cm
              </div>
            </div>

            {/* Telemetry Overlays */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-mono backdrop-blur-sm">
              <span>SOURCE: {defect.inspectorType || 'AI Survey Mobile Van'}</span>
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 text-[10px] font-mono backdrop-blur-sm flex items-center gap-1.5">
              <Cpu className="w-3 h-3" />
              <span>YOLO-v10 High-Precision</span>
            </div>
          </div>

          {/* Metric Badges: Size, Depth, Severity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-surface-50 border border-[#e2ebe4]">
              <span className="text-[10px] font-bold uppercase text-[#728a79] block">Surface Size</span>
              <span className="text-lg font-black font-mono text-[#123320] mt-0.5 block">
                {length} × {width} <span className="text-xs font-normal text-[#728a79]">cm</span>
              </span>
              <span className="text-[10px] text-[#3b5e47] font-mono">Area: {(length * width / 10000).toFixed(2)} m²</span>
            </div>

            <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200">
              <span className="text-[10px] font-bold uppercase text-red-700 block">Crater Depth</span>
              <span className="text-lg font-black font-mono text-red-700 mt-0.5 block">
                {depth} <span className="text-xs font-normal text-red-600">cm</span>
              </span>
              <span className="text-[10px] text-red-600 font-mono">High skid hazard</span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-50 border border-[#e2ebe4]">
              <span className="text-[10px] font-bold uppercase text-[#728a79] block">Severity Grade</span>
              <span className="text-base font-bold text-[#123320] mt-0.5 block">
                {isCritical ? 'Critical (Level 1)' : 'High Priority'}
              </span>
              <span className="text-[10px] text-[#3b5e47]">IRC-111 Standard</span>
            </div>

            <div className="p-3 rounded-2xl bg-brand-50 border border-brand-200">
              <span className="text-[10px] font-bold uppercase text-brand-700 block">AI Confidence</span>
              <span className="text-lg font-black font-mono text-brand-800 mt-0.5 block">
                {defect.confidenceScore || 98.4}%
              </span>
              <span className="text-[10px] text-brand-600 font-mono">Neural Model v4.8</span>
            </div>
          </div>

          {/* AI Assessment Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-[#eaf3ed] border border-brand-200 space-y-2.5">
            <div className="flex items-center gap-2 text-brand-800 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>MoRTH Engineering AI Assessment</span>
            </div>
            <p className="text-xs text-[#2b4c37] leading-relaxed">
              {defect.notes ||
                'Severe sharp-edged crater in vehicle wheel path. High two-wheeler skid hazard. Emergency cold/hot mix patch with VG-40 Bituminous Concrete mandated within 48-hour SLA.'}
            </p>
            <div className="pt-2 border-t border-brand-200/80 flex flex-wrap items-center gap-4 text-[11px] font-mono text-brand-900">
              <span>Risk Index: <strong>94/100</strong></span>
              <span>&bull;</span>
              <span>Estimated Patch Material: <strong>~65 Kg VG-40</strong></span>
              <span>&bull;</span>
              <span>Impact: <strong>Fast Lane Closure Mandated</strong></span>
            </div>
          </div>

          {/* Location Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#123320] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand-600" />
                GIS Location &amp; Corridors
              </span>
              <span className="font-mono text-[#728a79] text-[11px]">
                {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </span>
            </div>

            <div className="h-44 rounded-2xl overflow-hidden border border-[#e2ebe4] shadow-sm">
              <MapContainer
                center={[lat, lng]}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={customPinIcon}>
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong>{defect.roadCode} ({defect.chainage})</strong>
                      <p className="text-[11px] text-red-600">{defect.defectType} ({depth}cm depth)</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* CTA Button: Add to Repair Queue */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                if (onAddToRepairQueue) {
                  onAddToRepairQueue(defect);
                }
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Add to Repair Queue (Generate Work Order)</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
