import React, { useState } from 'react';
import { AIInspectionFeed } from '../components/inspections/AIInspectionFeed';
import { InspectionTelemetryModal } from '../components/inspections/InspectionTelemetryModal';
import { NewInspectionModal } from '../components/inspections/NewInspectionModal';
import { WorkOrderModal } from '../components/maintenance/WorkOrderModal';
import { useInspections } from '../hooks/useInspections';
import { useMaintenance } from '../hooks/useMaintenance';
import { ScanEye, Cpu, Radio, PlusCircle } from 'lucide-react';

export function InspectionsPage() {
  const { inspections, loading, addInspection, updateStatus } = useInspections();
  const { addWorkOrder } = useMaintenance();

  const [selectedDefect, setSelectedDefect] = useState(null);
  const [isNewInspectionOpen, setIsNewInspectionOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [initialWorkOrderData, setInitialWorkOrderData] = useState(null);

  const handleAssignWorkOrder = (defect) => {
    setInitialWorkOrderData({
      title: `Emergency Repair for ${defect.defectType} (${defect.chainage})`,
      roadId: defect.roadId,
      chainageRange: defect.chainage,
      priority: defect.severity === 'critical' ? 'CRITICAL' : 'HIGH',
      sanctionedBudget: 480000,
      materialSpec: 'Bituminous Concrete (VG-40)',
      linkedDefectIds: [defect.id],
    });
    setIsWorkOrderModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2ebe4]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#123320] tracking-tight flex items-center gap-2">
            <ScanEye className="w-6 h-6 text-brand-700" />
            <span>AI Road Defect Inspections &amp; Sensor Telemetry</span>
          </h1>
          <p className="text-xs text-[#3b5e47] mt-1">
            Real-time YOLOv10 edge vision inference, drone LiDAR surface mapping, and tri-axial accelerometer vibration telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-mono font-bold text-brand-800">
            <Cpu className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
            <span>Vision Engine: YOLOv10 High-Speed</span>
          </div>
        </div>
      </div>

      {/* Main Defect Feed */}
      <AIInspectionFeed
        inspections={inspections}
        loading={loading}
        onSelectDefect={(defect) => setSelectedDefect(defect)}
        onOpenNewInspection={() => setIsNewInspectionOpen(true)}
      />

      {/* Modals */}
      <InspectionTelemetryModal
        defect={selectedDefect}
        isOpen={Boolean(selectedDefect)}
        onClose={() => setSelectedDefect(null)}
        onAssignWorkOrder={handleAssignWorkOrder}
      />

      <NewInspectionModal
        isOpen={isNewInspectionOpen}
        onClose={() => setIsNewInspectionOpen(false)}
        onSubmit={async (defectData) => {
          await addInspection(defectData);
          setIsNewInspectionOpen(false);
        }}
      />

      <WorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        onSubmit={async (data) => {
          await addWorkOrder(data);
          setIsWorkOrderModalOpen(false);
        }}
        initialData={initialWorkOrderData}
      />
    </div>
  );
}
