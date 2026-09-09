import React from 'react';
import { AnalyticsTrends } from '../components/reports/AnalyticsTrends';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { BarChart3, TrendingUp, Download, Sparkles } from 'lucide-react';

export function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            <span>Infrastructure Analytics &amp; Predictive Forecasting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pavement life-cycle degradation modeling, budget deployment efficiency, and executive compliance report generation.
          </p>
        </div>
      </div>

      {/* Report Builder */}
      <ReportGenerator />

      {/* Analytical Trends & Charts */}
      <AnalyticsTrends />
    </div>
  );
}
