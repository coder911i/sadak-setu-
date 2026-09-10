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
      <Card className="border-[#e2ebe4] bg-white shadow-card">
        <CardHeader className="py-3.5 px-5">
          <CardTitle icon={Activity}>
            Monthly Defect Discovery vs Repair Velocity (2026)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 min-h-[280px]">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="detectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="repairedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf3ee" />
              <XAxis dataKey="month" stroke="#728a79" tick={{ fill: '#728a79', fontSize: 11 }} />
              <YAxis stroke="#728a79" tick={{ fill: '#728a79', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2ebe4', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="detected" name="AI Detected Defects" stroke="#dc2626" fillOpacity={1} fill="url(#detectedGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="repaired" name="Repaired &amp; Certified" stroke="#16a34a" fillOpacity={1} fill="url(#repairedGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 5-Year Pavement Degradation Forecasting */}
      <Card className="border-[#e2ebe4] bg-white shadow-card">
        <CardHeader className="py-3.5 px-5">
          <div className="flex items-center justify-between w-full">
            <CardTitle icon={TrendingUp}>
              5-Year Pavement Health Forecast (AI vs Traditional)
            </CardTitle>
            <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +46% Lifecycle Boost
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 min-h-[280px]">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={deteriorationForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf3ee" />
              <XAxis dataKey="year" stroke="#728a79" tick={{ fill: '#728a79', fontSize: 11 }} />
              <YAxis domain={[30, 100]} stroke="#728a79" tick={{ fill: '#728a79', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2ebe4', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="sadakSetuAI" name="Sadak Setu AI Predictive" stroke="#1b6e43" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="traditionalApproach" name="Traditional Reactive Maintenance" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regional Maintenance Budget Allocation */}
      <Card className="border-[#e2ebe4] bg-white shadow-card lg:col-span-2">
        <CardHeader className="py-3.5 px-5">
          <CardTitle icon={Coins}>
            Regional Zone Maintenance Budget Deployment (₹ Crores)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 min-h-[260px]">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={budgetDeployment} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf3ee" />
              <XAxis dataKey="division" stroke="#728a79" tick={{ fill: '#728a79', fontSize: 11 }} />
              <YAxis stroke="#728a79" tick={{ fill: '#728a79', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2ebe4', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="sanctioned" name="Sanctioned Allocation (₹ Cr)" fill="#237a48" radius={[6, 6, 0, 0]} />
              <Bar dataKey="utilized" name="Deployed &amp; Certified (₹ Cr)" fill="#86c4a1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
