import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { FilterBar, FilterSelect } from '../components/ui/FilterBar';
import { SearchInput } from '../components/ui/SearchInput';
import { useInspections } from '../hooks/useInspections';
import { useRoads } from '../hooks/useRoads';
import { MOCK_ANALYTICS } from '../data/mockAnalytics';
import { DEFECT_TYPES, SEVERITY_LEVELS } from '../utils/constants';
import { formatChainage } from '../utils/formatters';
import {
  BrainCircuit,
  AlertTriangle,
  Flame,
  Activity,
  Gauge,
  Layers,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  Wrench,
  Camera,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

export function DamageIntelligencePage() {
  const { inspections } = useInspections();
  const { roads } = useRoads();

  const [selectedCorridor, setSelectedCorridor] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [search, setSearch] = useState('');
  const [activeAnalysisIdx, setActiveAnalysisIdx] = useState(0);

  const filteredDistress = inspections.filter((i) => {
    if (selectedCorridor !== 'all' && i.roadId !== selectedCorridor) return false;
    if (selectedSeverity !== 'all' && i.severity !== selectedSeverity) return false;
    if (search && !i.defectType.toLowerCase().includes(search.toLowerCase()) && !i.chainage.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const criticalCount = inspections.filter((i) => i.severity === 'critical').length;
  const highCount = inspections.filter((i) => i.severity === 'high').length;
  const avgConfidence = (inspections.reduce((acc, i) => acc + Number(i.confidenceScore), 0) / inspections.length).toFixed(1);

  const spotlightItem = filteredDistress[activeAnalysisIdx] || inspections[0];

  // Scatter chart data representing depth vs area severity clusters
  const scatterData = inspections.map((item) => ({
    x: item.dimensions.lengthCm,
    y: item.dimensions.depthCm,
    z: item.riskScore,
    name: item.defectType,
    road: item.roadCode,
    chainage: item.chainage,
    severity: item.severity,
    confidence: item.confidenceScore,
  }));

  const getSeverityColor = (sev) => {
    if (sev === 'critical') return '#dc2626';
    if (sev === 'high') return '#d97706';
    if (sev === 'moderate') return '#f59e0b';
    return '#16a34a';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2ebe4]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#123320] tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-brand-700" />
            <span>AI Damage Intelligence &amp; Analysis</span>
          </h1>
          <p className="text-xs text-[#3b5e47] mt-1">
            Machine-learned pavement distress categorization, depth-area failure clusters, and structural risk severity scoring.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-mono font-bold text-brand-800">
          <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
          <span>Model: PavementNet-v4.8 (YOLOv10)</span>
        </div>
      </div>

      {/* 2. Spotlight: AI ANALYSIS CARD (User Prompt Screen 7 Requirement) */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white border border-[#e2ebe4] shadow-card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-brand-50 text-brand-700">
              <Camera className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-[#123320]">
              AI Defect Vision Breakdown &amp; Action Recommendation
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#728a79]">
            Inspection ID: {spotlightItem.id}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Uploaded Image Preview with Bounding Box */}
          <div className="lg:col-span-5 relative aspect-video rounded-2xl overflow-hidden bg-[#15261b] border border-[#e2ebe4] shadow-sm flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-[#1c2e22] to-[#253f2f] opacity-95" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <polygon points="120,400 350,120 450,120 680,400" fill="#15261b" />
              <line x1="400" y1="120" x2="400" y2="400" stroke="#fcd34d" strokeWidth="4" strokeDasharray="16, 16" />
            </svg>

            {/* Bounding box */}
            <div
              className="absolute border-2 border-red-500 bg-red-500/25 rounded-lg flex flex-col justify-between p-2 shadow-lg"
              style={{
                left: `${spotlightItem.boundingBox?.x || 35}%`,
                top: `${spotlightItem.boundingBox?.y || 42}%`,
                width: `${spotlightItem.boundingBox?.width || 34}%`,
                height: `${spotlightItem.boundingBox?.height || 36}%`,
              }}
            >
              <span className="text-[9px] font-mono font-bold text-white bg-red-600 px-1.5 py-0.2 rounded -mt-4 -ml-1 self-start shadow">
                {spotlightItem.defectType} ({spotlightItem.confidenceScore}%)
              </span>
            </div>

            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-mono backdrop-blur-sm">
              {spotlightItem.roadCode} &bull; {spotlightItem.chainage}
            </div>
          </div>

          {/* AI Metrics & Recommendation Grid */}
          <div className="lg:col-span-7 space-y-4">
            {/* Defect Title & Priority Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold text-brand-700 uppercase">AI Detected Issue:</span>
                <h4 className="text-lg font-black text-[#123320]">
                  {spotlightItem.defectType} ({spotlightItem.damageFound})
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                  {spotlightItem.severity.toUpperCase()}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-200 font-mono">
                  Priority: Immediate
                </span>
              </div>
            </div>

            {/* Metrics Row: Confidence, Estimated Dimensions, Repair Priority */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#f8faf8] border border-[#e2ebe4]">
                <span className="text-[10px] font-bold uppercase text-[#728a79] block">Confidence Score</span>
                <span className="text-base font-black font-mono text-brand-800 mt-0.5 block">
                  {spotlightItem.confidenceScore}%
                </span>
                <span className="text-[10px] text-brand-600">Model High Match</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f8faf8] border border-[#e2ebe4]">
                <span className="text-[10px] font-bold uppercase text-[#728a79] block">Est. Dimensions</span>
                <span className="text-base font-black font-mono text-[#123320] mt-0.5 block">
                  {spotlightItem.dimensions.lengthCm} &times; {spotlightItem.dimensions.widthCm} cm
                </span>
                <span className="text-[10px] text-[#728a79]">Depth: {spotlightItem.dimensions.depthCm} cm</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f8faf8] border border-[#e2ebe4]">
                <span className="text-[10px] font-bold uppercase text-[#728a79] block">Risk Index</span>
                <span className="text-base font-black font-mono text-red-600 mt-0.5 block">
                  {spotlightItem.riskScore} / 100
                </span>
                <span className="text-[10px] text-red-600">High skid hazard</span>
              </div>

              <div className="p-3 rounded-2xl bg-brand-50 border border-brand-200">
                <span className="text-[10px] font-bold uppercase text-brand-700 block">Patch Volume</span>
                <span className="text-base font-black font-mono text-brand-900 mt-0.5 block">
                  ~{spotlightItem.estimatedPatchVolumeKg} Kg
                </span>
                <span className="text-[10px] text-brand-700">VG-40 Spec</span>
              </div>
            </div>

            {/* Recommended Action Box */}
            <div className="p-3.5 rounded-2xl bg-surface-50 border border-[#e2ebe4] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
                <Wrench className="w-3.5 h-3.5 text-brand-600" />
                <span>Recommended Engineering Action:</span>
              </div>
              <p className="text-xs text-[#3b5e47] leading-relaxed">
                Full-depth milling (65mm) with mechanical tandem roller compaction. Inlay with VG-40 Bituminous Concrete and tack coat application under IRC:111 quality supervision.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total AI Distresses"
          value={inspections.length}
          unit="Corridor Records"
          icon={Activity}
          iconBg="bg-brand-50 text-brand-700 border-brand-200"
          subtext="Processed by Edge Nodes"
        />

        <StatCard
          title="High Risk Cratering"
          value={criticalCount}
          unit="Active Spots"
          icon={Flame}
          iconBg="bg-red-50 text-red-700 border-red-200"
          trend="Immediate Hazard"
          trendDirection="down"
        />

        <StatCard
          title="Avg Neural Confidence"
          value={`${avgConfidence}%`}
          icon={Zap}
          iconBg="bg-emerald-50 text-emerald-700 border-emerald-200"
          subtext="Optical + LiDAR Ensemble"
        />

        <StatCard
          title="Predicted Failure Risk"
          value="Grade B+"
          unit="Controlled Status"
          icon={ShieldAlert}
          iconBg="bg-amber-50 text-amber-800 border-amber-200"
          subtext="NH-48 & PMGSY Corridor"
        />
      </div>

      {/* 4. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search distress type, chainage..."
          />
        </div>

        <FilterBar>
          <FilterSelect
            label="Corridor"
            value={selectedCorridor}
            onChange={setSelectedCorridor}
            options={[
              { value: 'all', label: 'All Corridors' },
              ...roads.map((r) => ({ value: r.id, label: `${r.code} - ${r.name}` })),
            ]}
          />

          <FilterSelect
            label="Severity"
            value={selectedSeverity}
            onChange={setSelectedSeverity}
            options={[
              { value: 'all', label: 'All Severities' },
              { value: 'critical', label: 'Critical Severity' },
              { value: 'high', label: 'High' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'low', label: 'Low' },
            ]}
          />
        </FilterBar>
      </div>

      {/* 5. Scatter Chart & Hotspot Priority Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-[#e2ebe4] bg-white shadow-card">
          <CardHeader className="py-3.5 px-5">
            <div className="flex items-center justify-between w-full">
              <CardTitle icon={Gauge}>
                Distress Dimensionality &amp; Depth Severity Matrix
              </CardTitle>
              <span className="text-[10px] text-[#728a79] font-mono">
                X: Length (cm) | Y: Depth (cm)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 min-h-[320px]">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2ebe4" />
                <XAxis type="number" dataKey="x" name="Length" unit="cm" stroke="#728a79" tick={{ fill: '#728a79', fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="Depth" unit="cm" stroke="#728a79" tick={{ fill: '#728a79', fontSize: 11 }} />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Risk Index" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#e2ebe4] p-3 rounded-xl shadow-elevated text-xs space-y-1">
                          <p className="font-bold text-[#123320] flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSeverityColor(data.severity) }} />
                            {data.name} ({data.road})
                          </p>
                          <p className="text-[#3b5e47] font-mono">Chainage: {data.chainage}</p>
                          <p className="text-[#728a79]">Dimensions: {data.x}cm &times; {data.y}cm depth</p>
                          <p className="text-red-600 font-bold font-mono">Collision Risk: {data.z}/100</p>
                          <p className="text-brand-700 font-mono font-semibold">AI Confidence: {data.confidence}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Distresses" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} opacity={0.85} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hotspot Vulnerability Ranking */}
        <Card className="border-[#e2ebe4] bg-white shadow-card flex flex-col">
          <CardHeader className="py-3.5 px-5">
            <CardTitle icon={Flame}>
              Corridor Hotspot Priority Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-[#edf3ee] flex-1 overflow-y-auto max-h-[340px]">
            {filteredDistress.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActiveAnalysisIdx(idx)}
                className={`p-3.5 hover:bg-[#f8faf8] transition-colors space-y-1.5 cursor-pointer ${
                  activeAnalysisIdx === idx ? 'bg-brand-50/70 border-l-4 border-l-brand-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#123320]">{item.defectType}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                      item.severity === 'critical'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : item.severity === 'high'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {item.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#728a79]">
                  <span className="text-brand-800 font-bold">{item.roadCode} ({item.chainage})</span>
                  <span className="text-red-600 font-bold">{item.riskScore}/100 Risk</span>
                </div>
                <p className="text-[11px] text-[#3b5e47] line-clamp-1">{item.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
