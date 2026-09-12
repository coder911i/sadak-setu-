import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MOCK_ANALYTICS } from '../../data/mockAnalytics';
import { TrendingUp, Activity, Coins, Sparkles } from 'lucide-react';

export function AnalyticsTrends() {
  const { monthlyTrend, deteriorationForecast, budgetDeployment } = MOCK_ANALYTICS;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Monthly Defect Discovery vs Repair Velocity */}
      <Card className="border-line bg-white">
        <CardHeader className="py-3 px-4">
          <CardTitle icon={Activity}>
            Monthly Defect Discovery vs Repair Velocity (2026)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 min-h-[280px]">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="detectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="repairedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="detected" name="AI Detected Defects" stroke="#ef4444" fillOpacity={1} fill="url(#detectedGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="repaired" name="Repaired & Verified" stroke="#10b981" fillOpacity={1} fill="url(#repairedGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 5-Year Pavement Degradation Forecasting */}
      <Card className="border-line bg-white">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between w-full">
            <CardTitle icon={TrendingUp}>
              5-Year Pavement Health Forecast (AI vs Traditional)
            </CardTitle>
            <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +46% Lifecycle Boost
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 min-h-[280px]">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={deteriorationForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[30, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="sadakSetuAI" name="Sadak Setu AI Predictive" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="traditionalApproach" name="Traditional Reactive Maintenance" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regional Maintenance Budget Allocation */}
      <Card className="border-line bg-white lg:col-span-2">
        <CardHeader className="py-3 px-4">
          <CardTitle icon={Coins}>
            Regional Zone Maintenance Budget Deployment (₹ Crores)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 min-h-[260px]">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={budgetDeployment} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="division" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="sanctioned" name="Sanctioned Allocation (₹ Cr)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="utilized" name="Deployed & Certified (₹ Cr)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
