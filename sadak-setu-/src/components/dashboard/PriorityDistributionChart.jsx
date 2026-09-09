import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

const priorityData = [
  {
    name: 'Immediate Priority',
    count: 18,
    percentage: 13,
    color: '#dc2626',
    description: 'Critical Safety Hazard (24-48h SLA)',
    icon: AlertOctagon,
  },
  {
    name: 'High Priority',
    count: 34,
    percentage: 24,
    color: '#d97706',
    description: 'Accelerated Pavement Distress (7d SLA)',
    icon: AlertTriangle,
  },
  {
    name: 'Monitor Priority',
    count: 90,
    percentage: 63,
    color: '#2d8a5a',
    description: 'Stable & Routine Maintenance',
    icon: ShieldCheck,
  },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-[#ddeae0] p-3 rounded-xl shadow-elevated text-xs space-y-1">
        <p className="font-bold text-[#1a3825] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-[#4a6b55] font-mono">
          Corridors: <span className="font-bold text-[#1a3825]">{data.count}</span> ({data.percentage}%)
        </p>
        <p className="text-[#7a9a83] text-[11px]">{data.description}</p>
      </div>
    );
  }
  return null;
};

export function PriorityDistributionChart() {
  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="py-3 px-5">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={PieIcon}>
            Maintenance Priority Distribution
          </CardTitle>
          <span className="text-[10px] font-mono text-[#7a9a83]">
            142 Total Corridors
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between min-h-[260px]">
        {/* Donut Chart */}
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Legend Cards */}
        <div className="space-y-2 pt-3 border-t border-[#ddeae0] text-xs">
          {priorityData.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-50 border border-[#ddeae0]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-[#1a3825] truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#1a3825] font-bold">{item.count} Roads</span>
                  <span className="text-[10px] text-[#7a9a83]">({item.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
