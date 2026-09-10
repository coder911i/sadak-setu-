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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-title3 sm:text-title2 font-semibold text-ink-900 tracking-tight flex items-center gap-2">
            <ScanEye className="w-6 h-6 text-brand-600" />
            <span>AI Defect Detections &amp; Sensor Telemetry</span>
          </h1>
          <p className="text-footnote sm:text-subhead text-ink-500 mt-1 max-w-2xl">
            Real-time YOLOv10 edge vision inference, drone LiDAR surface mapping, and tri-axial accelerometer vibration telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-line text-xs font-mono text-emerald-600">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Vision Engine: YOLOv10 High-Speed</span>
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
