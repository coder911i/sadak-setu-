import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { useRoads } from '../../hooks/useRoads';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Calendar,
  CheckCircle2,
  Route,
  Activity,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export function ReportGenerator() {
  const { roads } = useRoads();
  const { success } = useToast();

  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedRoad, setSelectedRoad] = useState('all');
  const [dateRange, setDateRange] = useState('q3_2026');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReportKey, setActiveReportKey] = useState('health');

  const reportCards = [
    {
      id: 'health',
      title: 'Road Health Report',
      desc: 'Corridor-by-corridor PCI score analysis, International Roughness Index (IRI), and structural pavement degradation curves.',
      badge: 'PCI & IRI Telemetry',
      icon: Activity,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'damage',
      title: 'Damage & Distress Report',
      desc: 'Hotspot classification of potholes, alligator fatigue cracking, rutting depths, and collision hazard vulnerability logs.',
      badge: 'AI Defect Matrix',
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      id: 'maintenance',
      title: 'Maintenance & Work Orders Report',
      desc: 'Sanctioned budgets, contractor milestone SLAs, compaction density certification, and material specification audits.',
      badge: 'Work Orders & SLAs',
      icon: Wrench,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'before_after',
      title: 'Before / After Comparison Report',
      desc: 'Optical patch alignment, post-compaction LiDAR elevation verification, and IRC-111 quality certification evidence.',
      badge: 'IRC:111 Audit Evidence',
      icon: ShieldCheck,
      color: 'bg-brand-50 text-brand-800 border-brand-200',
    },
  ];

  const handleExport = (format) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const activeCard = reportCards.find((r) => r.id === activeReportKey);
      success(
        'Report Exported Successfully',
        `${activeCard?.title || 'Report'} generated as official .${format.toUpperCase()} document.`
      );
    }, 700);
  };

  return (
    <div className="space-y-5">
      {/* 4 Clean Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportCards.map((rc) => {
          const Icon = rc.icon;
          const isSelected = activeReportKey === rc.id;

          return (
            <div
              key={rc.id}
              onClick={() => setActiveReportKey(rc.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between shadow-card group ${
                isSelected
                  ? 'bg-brand-50/60 border-brand-500 ring-2 ring-brand-500/30'
                  : 'bg-white border-[#e2ebe4] hover:border-brand-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-2xl border ${rc.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#123320] group-hover:text-brand-700 transition-colors">
                      {rc.title}
                    </h3>
                    <span className="text-[10px] font-mono text-[#728a79]">{rc.badge}</span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isSelected ? 'bg-brand-700 text-white border-brand-700' : 'bg-surface-100 text-[#728a79] border-[#e2ebe4]'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </span>
              </div>

              <p className="text-xs text-[#3b5e47] leading-relaxed">
                {rc.desc}
              </p>

              <div className="pt-2 border-t border-[#edf3ee] flex items-center justify-between text-[11px] font-mono text-[#728a79]">
                <span>Format: PDF / CSV / Dossier</span>
                <span className="text-brand-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Export Dossier <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export & Parameters Control Box */}
      <Card className="border-[#e2ebe4] bg-white shadow-card">
        <CardHeader className="py-3.5 px-5">
          <CardTitle icon={FileText}>
            Export &amp; Dossier Generator Controls
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#123320] font-bold mb-1">Target Highway Corridor</label>
              <select
                value={selectedRoad}
                onChange={(e) => setSelectedRoad(e.target.value)}
                className="input-base"
              >
                <option value="all">Entire Monitored Grid (All 142 Corridors)</option>
                {roads.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} – {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#123320] font-bold mb-1">Audit Timeframe</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input-base"
              >
                <option value="q3_2026">Quarter 3 (Jul – Sep 2026)</option>
                <option value="last_30_days">Last 30 Days (Rolling Telemetry)</option>
                <option value="annual_2026">Annual Financial Year 2025-26</option>
              </select>
            </div>

            <div>
              <label className="block text-[#123320] font-bold mb-1">Dossier Standard</label>
              <select
                className="input-base"
                defaultValue="irc111"
              >
                <option value="irc111">MoRTH Indian Road Congress (IRC:111 Standard)</option>
                <option value="pmgsy">PMGSY Rural Connect Framework</option>
                <option value="nhai">NHAI Expressways High-Density Spec</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#edf3ee] flex-wrap gap-3">
            <div className="flex items-center gap-2 text-[#728a79] font-mono text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Includes Digital MoRTH Signature &amp; Geo-referenced Coordinates</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={FileSpreadsheet}
                isLoading={isGenerating}
                onClick={() => handleExport('csv')}
              >
                Export CSV Telemetry
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                isLoading={isGenerating}
                onClick={() => handleExport('pdf')}
              >
                Generate Official PDF Dossier
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
