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
import { DEFECT_TYPES, SEVERITY_LEVELS } from '../../src/utils/constants';
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
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';

export function DamageIntelligencePage() {
  const { inspections } = useInspections();
  const { roads, activeRoad } = useRoads();

  const [selectedCorridor, setSelectedCorridor] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [search, setSearch] = useState('');

  const filteredDistress = inspections.filter((i) => {
    if (selectedCorridor !== 'all' && i.roadId !== selectedCorridor) return false;
    if (selectedSeverity !== 'all' && i.severity !== selectedSeverity) return false;
    if (search && !i.defectType.toLowerCase().includes(search.toLowerCase()) && !i.chainage.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const criticalCount = inspections.filter((i) => i.severity === 'critical').length;
  const highCount = inspections.filter((i) => i.severity === 'high').length;
  const avgConfidence = (inspections.reduce((acc, i) => acc + Number(i.confidenceScore), 0) / inspections.length).toFixed(1);

  // Scatter chart data representing depth vs area severity clusters
  const scatterData = inspections.map((item, idx) => ({
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
    if (sev === 'critical') return '#ef4444';
    if (sev === 'high') return '#f97316';
    if (sev === 'moderate') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-title3 sm:text-title2 font-semibold text-ink-900 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-brand-600" />
            <span>AI Damage Intelligence &amp; Hotspot Analytics</span>
          </h1>
          <p className="text-footnote sm:text-subhead text-ink-500 mt-1 max-w-2xl">
            Machine-learned pavement distress categorization, depth-area failure clusters, and structural risk severity scoring.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-mono text-brand-700">
          <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
          <span>Neural Model: PavementNet-v4.8</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total AI Distresses"
          value={inspections.length}
          unit="Records"
          icon={Activity}
          iconBg="bg-blue-500/10 text-blue-600 border-blue-500/20"
          subtext="Processed by Edge Nodes"
        />

        <StatCard
          title="High Risk Structural Cratering"
          value={criticalCount}
          unit="Spots"
          icon={Flame}
          iconBg="bg-rose-500/10 text-rose-600 border-rose-500/20"
          trend="Immediate Hazard"
          trendDirection="down"
        />

        <StatCard
          title="Avg Neural Confidence"
          value={`${avgConfidence}%`}
          icon={Zap}
          iconBg="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          subtext="Optical + LiDAR Ensemble"
        />

        <StatCard
          title="Predicted Failure Risk"
          value="Grade D"
          unit="High Vulnerability"
          icon={ShieldAlert}
          iconBg="bg-amber-500/10 text-amber-600 border-amber-500/20"
          subtext="NH-48 & NH-66 Corridor"
        />
      </div>

      {/* Filter and Search Bar */}
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

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scatter Chart: Length vs Depth vs Risk Severity */}
        <Card className="lg:col-span-2 border-line bg-white">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between w-full">
              <CardTitle icon={Gauge}>
                Distress Dimensionality &amp; Depth Severity Matrix
              </CardTitle>
              <span className="text-[10px] text-ink-500 font-mono">
                X: Length (cm) | Y: Depth (cm)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 min-h-[320px]">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" name="Length" unit="cm" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="Depth" unit="cm" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Risk Index" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-line p-3 rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-bold text-ink-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSeverityColor(data.severity) }} />
                            {data.name} ({data.road})
                          </p>
                          <p className="text-ink-700 font-mono">Chainage: {data.chainage}</p>
                          <p className="text-ink-500">Dimensions: {data.x}cm length &times; {data.y}cm depth</p>
                          <p className="text-rose-600 font-bold font-mono">Collision Risk: {data.z}/100</p>
                          <p className="text-emerald-600 font-mono">AI Confidence: {data.confidence}%</p>
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
        <Card className="border-line bg-white flex flex-col">
          <CardHeader className="py-3 px-4">
            <CardTitle icon={Flame}>
              Corridor Hotspot Priority Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-line flex-1 overflow-y-auto max-h-[340px]">
            {filteredDistress.map((item) => (
              <div key={item.id} className="p-3.5 hover:bg-surface-100 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-ink-900">{item.defectType}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                      item.severity === 'critical'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : item.severity === 'high'
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-surface-100 text-ink-700 border-line'
                    }`}
                  >
                    {item.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-ink-500">
                  <span className="text-brand-600 font-semibold">{item.roadCode} ({item.chainage})</span>
                  <span className="text-rose-600 font-bold">{item.riskScore}/100 Risk</span>
                </div>
                <p className="text-[10px] text-ink-500 line-clamp-1">{item.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
