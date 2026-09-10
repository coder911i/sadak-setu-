import React from 'react';
import { AnalyticsTrends } from '../components/reports/AnalyticsTrends';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { BarChart3, TrendingUp, Download, Sparkles } from 'lucide-react';

export function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2ebe4]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#123320] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-700" />
            <span>Infrastructure Reports &amp; Predictive Forecasting</span>
          </h1>
          <p className="text-xs text-[#3b5e47] mt-1">
            Pavement life-cycle degradation modeling, budget deployment efficiency, and executive compliance report generation.
          </p>
        </div>
      </div>

      {/* Report Cards & Generator */}
      <ReportGenerator />

      {/* Analytical Trends & Charts */}
      <AnalyticsTrends />
    </div>
  );
}
