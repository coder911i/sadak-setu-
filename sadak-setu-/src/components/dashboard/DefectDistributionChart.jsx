import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { MOCK_ANALYTICS } from '../../data/mockAnalytics';
import { PieChart as PieChartIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-750 p-3 rounded-lg shadow-xl text-xs space-y-1">
        <p className="font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-slate-300 font-mono">
          Count: <span className="font-bold text-white">{data.count}</span> ({data.percentage}%)
        </p>
        <p className="text-slate-400">
          Avg Severity Depth: <span className="text-slate-200">{data.avgDepthCm} cm</span>
        </p>
      </div>
    );
  }
  return null;
};

export function DefectDistributionChart() {
  const data = MOCK_ANALYTICS.defectBreakdown;

  return (
    <Card className="flex flex-col h-full border-slate-800">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={PieChartIcon}>
            AI Defect Classification Breakdown
          </CardTitle>
          <span className="text-[10px] text-slate-400 font-mono">
            375 Total Distresses
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between min-h-[260px]">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
              <span className="font-mono text-[10px] text-slate-500 font-semibold">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
