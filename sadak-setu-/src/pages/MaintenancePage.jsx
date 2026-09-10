import React, { useState } from 'react';
import { WorkOrderBoard } from '../components/maintenance/WorkOrderBoard';
import { WorkOrderModal } from '../components/maintenance/WorkOrderModal';
import { CostEstimatorCalculator } from '../components/maintenance/CostEstimatorCalculator';
import { useMaintenance } from '../hooks/useMaintenance';
import { Wrench, HardHat, PlusCircle, Calculator } from 'lucide-react';

export function MaintenancePage() {
  const { workOrders, loading, addWorkOrder, updateStatus } = useMaintenance();
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-title3 sm:text-title2 font-semibold text-ink-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-brand-600" />
            <span>Highway Maintenance &amp; Work Order Operations</span>
          </h1>
          <p className="text-footnote sm:text-subhead text-ink-500 mt-1 max-w-2xl">
            End-to-end triage, budget sanctions, contractor assignment, SLA enforcement, and execution progress tracking.
          </p>
        </div>

        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-line hover:bg-surface-100 text-xs font-semibold text-ink-700 transition-colors"
        >
          <Calculator className="w-4 h-4 text-brand-600" />
          <span>{showCalculator ? 'Hide Cost Estimator' : 'Open AI Cost Estimator'}</span>
        </button>
      </div>

      {/* Optional AI Cost Estimator Tool */}
      {showCalculator && (
        <div className="animate-slide-in">
          <CostEstimatorCalculator />
        </div>
      )}

      {/* Kanban Board & Table */}
      <WorkOrderBoard
        workOrders={workOrders}
        loading={loading}
        onOpenNewOrder={() => setIsWorkOrderModalOpen(true)}
        onUpdateStatus={updateStatus}
      />

      {/* Sanction Work Order Modal */}
      <WorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        onSubmit={async (data) => {
          await addWorkOrder(data);
          setIsWorkOrderModalOpen(false);
        }}
      />
    </div>
  );
}
