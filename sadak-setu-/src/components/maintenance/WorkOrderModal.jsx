import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRoads } from '../../hooks/useRoads';
import { CONTRACTORS } from '../../utils/constants';
import { Wrench, Clock, Coins, Check } from 'lucide-react';

export function WorkOrderModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const { roads } = useRoads();

  const [formData, setFormData] = useState({
    title: initialData?.title || 'Urgent Milling & Overlay Repair',
    roadId: initialData?.roadId || 'road-nh48',
    chainageRange: initialData?.chainageRange || 'Km 62+000 – Km 65+000',
    priority: initialData?.priority || 'CRITICAL',
    contractorId: initialData?.contractorId || 'c-1',
    sanctionedBudget: initialData?.sanctionedBudget || 650000,
    materialSpec: initialData?.materialSpec || 'Bituminous Concrete (VG-40 DBM 50mm + BC 40mm)',
    equipmentDeployed: initialData?.equipmentDeployed || 'Asphalt Milling Machine + 10T Vibratory Compactor',
    targetSlaDate: initialData?.targetSlaDate || new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
    officerInCharge: initialData?.officerInCharge || 'Er. Rajeshwar Rao (Executive Engineer, MoRTH)',
    notes: initialData?.notes || 'Fast lane night-closure approved between 23:00 and 05:00 hrs.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoad = roads.find((r) => r.id === formData.roadId) || roads[0];
  const selectedContractor = CONTRACTORS.find((c) => c.id === formData.contractorId) || CONTRACTORS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderPayload = {
      title: formData.title,
      roadId: selectedRoad.id,
      roadCode: selectedRoad.code,
      roadName: selectedRoad.name,
      chainageRange: formData.chainageRange,
      priority: formData.priority,
      contractorId: selectedContractor.id,
      contractorName: selectedContractor.name,
      assignedDivision: `${selectedRoad.state} Highway Implementation Unit`,
      sanctionedBudget: Number(formData.sanctionedBudget),
      estimatedCost: Math.round(Number(formData.sanctionedBudget) * 0.94),
      materialSpec: formData.materialSpec,
      equipmentDeployed: formData.equipmentDeployed,
      targetSlaDate: new Date(formData.targetSlaDate).toISOString(),
      slaRemainingHours: 48,
      officerInCharge: formData.officerInCharge,
      notes: formData.notes,
      linkedDefectIds: initialData?.linkedDefectIds || [],
    };

    await onSubmit(orderPayload);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sanction Highway Maintenance Work Order"
      description="Issue official repair work order and allocate contractor resources"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Check}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Sanction &amp; Assign Work Order
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Title */}
        <div>
          <label className="block text-ink-700 font-semibold mb-1">Work Order Scope / Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            required
          />
        </div>

        {/* Corridor and Chainage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-ink-700 font-semibold mb-1">Highway Corridor</label>
            <select
              value={formData.roadId}
              onChange={(e) => setFormData({ ...formData, roadId: e.target.value })}
              className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {roads.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} – {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-ink-700 font-semibold mb-1">Chainage Section Span</label>
            <input
              type="text"
              value={formData.chainageRange}
              onChange={(e) => setFormData({ ...formData, chainageRange: e.target.value })}
              placeholder="e.g. Km 62+000 – Km 66+500"
              className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
              required
            />
          </div>
        </div>

        {/* Contractor & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-ink-700 font-semibold mb-1">Assigned Maintenance Contractor</label>
            <select
              value={formData.contractorId}
              onChange={(e) => setFormData({ ...formData, contractorId: e.target.value })}
              className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {CONTRACTORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Rating: {c.rating}★)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-ink-700 font-semibold mb-1">Priority / Emergency Level</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
            >
              <option value="CRITICAL">CRITICAL (Emergency 24-48h SLA)</option>
              <option value="HIGH">HIGH (72h SLA)</option>
              <option value="MEDIUM">MEDIUM (7 Days SLA)</option>
              <option value="ROUTINE">ROUTINE (Scheduled Overhaul)</option>
            </select>
          </div>
        </div>

        {/* Budget & Material */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-ink-700 font-semibold mb-1">Sanctioned Budget (₹ INR)</label>
            <input
              type="number"
              value={formData.sanctionedBudget}
              onChange={(e) => setFormData({ ...formData, sanctionedBudget: e.target.value })}
              className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-ink-700 font-semibold mb-1">Material Specification</label>
            <input
              type="text"
              value={formData.materialSpec}
              onChange={(e) => setFormData({ ...formData, materialSpec: e.target.value })}
              className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-ink-700 font-semibold mb-1">Execution Directives &amp; Traffic Plan</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-surface-50 border border-line rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </form>
    </Modal>
  );
}
