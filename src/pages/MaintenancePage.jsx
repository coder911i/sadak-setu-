import React, { useState } from 'react';
import { WorkOrderBoard } from '../components/maintenance/WorkOrderBoard';
import { WorkOrderModal } from '../components/maintenance/WorkOrderModal';
import { CostEstimatorCalculator } from '../components/maintenance/CostEstimatorCalculator';
import { RepairTrackingTimeline } from '../components/maintenance/RepairTrackingTimeline';
import { useMaintenance } from '../hooks/useMaintenance';
import { Wrench, HardHat, PlusCircle, Calculator } from 'lucide-react';

export function MaintenancePage() {
  const { workOrders, loading, addWorkOrder, updateStatus } = useMaintenance();
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2ebe4]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#123320] tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-brand-700" />
            <span>Track Repairs &amp; Highway Work Orders</span>
          </h1>
          <p className="text-xs text-[#3b5e47] mt-1">
            End-to-end triage, budget sanctions, contractor assignment, SLA enforcement, and execution progress tracking.
          </p>
        </div>

        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e2ebe4] hover:bg-brand-50 text-xs font-bold text-[#155635] transition-colors cursor-pointer shadow-xs"
        >
          <Calculator className="w-4 h-4 text-brand-600" />
          <span>{showCalculator ? 'Hide Cost Estimator' : 'Open AI Cost Estimator'}</span>
        </button>
      </div>

      {/* Repair Tracking Vertical Lifecycle Timeline */}
      <RepairTrackingTimeline />

      {/* Optional AI Cost Estimator Tool */}
      {showCalculator && (
        <div className="animate-slide-in">
          <CostEstimatorCalculator />
        </div>
      )}

      {/* Work Orders Board (Active Repairs vs Completed Repairs) */}
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
