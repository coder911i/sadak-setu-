import React from 'react';
import { AnalyticsTrends } from '../components/reports/AnalyticsTrends';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { BarChart3, TrendingUp, Download, Sparkles } from 'lucide-react';

export function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-title3 sm:text-title2 font-semibold text-ink-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            <span>Infrastructure Analytics &amp; Predictive Forecasting</span>
          </h1>
          <p className="text-footnote sm:text-subhead text-ink-500 mt-1 max-w-2xl">
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
