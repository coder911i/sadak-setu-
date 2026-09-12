import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { MOCK_ANALYTICS } from '../../data/mockAnalytics';
import { BarChart3 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-line p-3 rounded-lg shadow-xl text-xs space-y-1">
        <p className="font-bold text-ink-900 font-mono">{label} Corridor</p>
        <p className="text-brand-600 font-mono">
          PCI Health Score: <span className="font-bold text-ink-900">{data.pci}/100</span>
        </p>
        <p className="text-ink-500">
          Roughness (IRI): <span className="text-ink-900">{data.iri} m/km</span>
        </p>
        <p className="text-ink-500">
          Defect Density: <span className="text-ink-900">{data.defectsPer100Km} / 100km</span>
        </p>
        <p className="text-emerald-600">
          SLA Compliance: <span className="font-bold">{data.complianceRate}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export function PavementIndexChart() {
  const data = MOCK_ANALYTICS.corridorComparison;

  const getBarColor = (pci) => {
    if (pci >= 85) return '#10b981';
    if (pci >= 70) return '#84cc16';
    if (pci >= 55) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Card className="flex flex-col h-full border-line">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={BarChart3}>
            Corridor Pavement Index (PCI) Comparison
          </CardTitle>
          <span className="text-[10px] text-ink-500 font-mono">
            Target Threshold: &ge; 70 PCI
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="corridor" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Target 70', fill: '#eab308', fontSize: 10 }} />
            <Bar dataKey="pci" radius={[6, 6, 0, 0]} maxBarSize={45}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.pci)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
