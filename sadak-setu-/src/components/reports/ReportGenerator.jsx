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
} from 'lucide-react';

export function ReportGenerator() {
  const { roads } = useRoads();
  const { success } = useToast();

  const [reportType, setReportType] = useState('executive_briefing');
  const [selectedRoad, setSelectedRoad] = useState('all');
  const [dateRange, setDateRange] = useState('q3_2026');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = (format) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      success(
        'Report Generated Successfully',
        `Official ${reportType.replace('_', ' ').toUpperCase()} exported as .${format.toUpperCase()}`
      );
    }, 800);
  };

  return (
    <Card className="border-line bg-white">
      <CardHeader className="py-3 px-4">
        <CardTitle icon={FileText}>
          Automated Infrastructure Intelligence Report Builder
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-ink-500 font-semibold mb-1">Report Dossier Format</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="executive_briefing">MoRTH Executive Highway Briefing</option>
              <option value="pci_corridor_audit">Comprehensive PCI Corridor Health Audit</option>
              <option value="contractor_scorecard">Contractor SLA &amp; Compaction Scorecard</option>
              <option value="monsoon_hazard_log">Critical Monsoon Distress &amp; Pothole Log</option>
            </select>
          </div>

          <div>
            <label className="block text-ink-500 font-semibold mb-1">Target Highway Corridor</label>
            <select
              value={selectedRoad}
              onChange={(e) => setSelectedRoad(e.target.value)}
              className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">Entire Monitored Network (All Corridors)</option>
              {roads.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} – {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-ink-500 font-semibold mb-1">Audit Timeframe</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="q3_2026">Quarter 3 (Jul – Sep 2026)</option>
              <option value="last_30_days">Last 30 Days (Rolling Telemetry)</option>
              <option value="annual_2026">Annual Financial Year 2025-26</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-line flex-wrap gap-3">
          <div className="flex items-center gap-2 text-ink-500 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Includes AI Geo-tagging &amp; IRC-111 Compliance Badges</span>
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
  );
}
