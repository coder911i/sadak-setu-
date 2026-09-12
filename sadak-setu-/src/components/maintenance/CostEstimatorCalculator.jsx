import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { maintenanceService } from '../../services/maintenanceService';
import { formatCurrency } from '../../utils/formatters';
import { Calculator, Scale, Coins, HardHat, Layers } from 'lucide-react';

export function CostEstimatorCalculator({ onApplyEstimate }) {
  const [areaSqM, setAreaSqM] = useState(12);
  const [depthCm, setDepthCm] = useState(5);
  const [layerType, setLayerType] = useState('hot_mix');

  const estimates = maintenanceService.calculateEstimates({ areaSqM, depthCm, layerType });

  return (
    <Card className="border-line bg-white">
      <CardHeader className="py-3 px-4">
        <CardTitle icon={Calculator}>
          AI Asphalt &amp; Repair Cost Estimator
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-ink-500 font-medium mb-1">Patch Area (m²)</label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={areaSqM}
              onChange={(e) => setAreaSqM(e.target.value)}
              className="w-full bg-surface-50 border border-line rounded-lg p-2 text-ink-900 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-ink-500 font-medium mb-1">Overlay Depth (cm)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={depthCm}
              onChange={(e) => setDepthCm(e.target.value)}
              className="w-full bg-surface-50 border border-line rounded-lg p-2 text-ink-900 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-ink-500 font-medium mb-1">Asphalt Formulation</label>
            <select
              value={layerType}
              onChange={(e) => setLayerType(e.target.value)}
              className="w-full bg-surface-50 border border-line rounded-lg p-2 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="hot_mix">Bituminous Concrete (VG-40 Hot Mix)</option>
              <option value="cold_mix">Cold-Mix Polymer Emulsion</option>
              <option value="micro_surfacing">Polymer Micro-Surfacing</option>
              <option value="concrete_pqc">M-40 Rigid Concrete Pavement</option>
            </select>
          </div>
        </div>

        {/* Calculated Output Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-line">
          <div className="p-2.5 rounded-lg bg-surface-50 border border-line">
            <span className="text-[10px] text-ink-500 block font-mono">Volume</span>
            <span className="text-sm font-bold text-ink-900 font-mono">{estimates.volumeM3} m³</span>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-50 border border-line">
            <span className="text-[10px] text-ink-500 block font-mono">Asphalt Weight</span>
            <span className="text-sm font-bold text-brand-600 font-mono">{estimates.weightTonnes} T</span>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-50 border border-line">
            <span className="text-[10px] text-ink-500 block font-mono">Material Cost</span>
            <span className="text-sm font-bold text-ink-900 font-mono">{formatCurrency(estimates.materialCost)}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-50 border border-brand-500/40 bg-brand-50">
            <span className="text-[10px] text-brand-700 block font-mono font-semibold">Total Estimated Cost</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">{formatCurrency(estimates.estimatedTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
