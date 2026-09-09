import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { Route, MapPin, Check, PlusCircle } from 'lucide-react';

export function AddRoadModal({ isOpen, onClose, onAddRoad }) {
  const { success } = useToast();

  const [formData, setFormData] = useState({
    code: 'PMGSY VR-32',
    name: 'Dausa – Lalsot Rural Agri Corridor',
    category: 'Rural PMGSY (Pradhan Mantri Gram Sadak Yojana)',
    district: 'Dausa',
    state: 'Rajasthan',
    zone: 'north',
    totalLengthKm: 24.5,
    lanes: 2,
    surfaceType: 'Bituminous Macadam with Surface Dressing',
    priority: 'High',
    healthScore: 58,
    trafficDensity: 'Moderate (Rural Freight & Tractors)',
    contractor: 'Rajasthan PWD Rural Maintenance Unit',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newRoad = {
      ...formData,
      id: `road-${Date.now().toString().slice(-5)}`,
      pciScore: Number(formData.healthScore),
      healthScore: Number(formData.healthScore),
      totalLengthKm: Number(formData.totalLengthKm),
      lanes: Number(formData.lanes),
      iriScore: formData.healthScore >= 80 ? 1.6 : formData.healthScore >= 60 ? 2.8 : 4.2,
      latestInspection: new Date().toISOString(),
      lastInspected: new Date().toISOString(),
      inspectionAgency: 'AI Mobile Survey Unit',
      concessionaire: 'State Rural Road Development Authority',
      damageCount: formData.priority === 'Immediate' ? 18 : formData.priority === 'High' ? 8 : 2,
      potholesCount: formData.priority === 'Immediate' ? 10 : formData.priority === 'High' ? 4 : 1,
      cracksCount: formData.priority === 'Immediate' ? 6 : formData.priority === 'High' ? 3 : 1,
      otherDamageCount: formData.priority === 'Immediate' ? 2 : 1,
      criticalDefectsCount: formData.priority === 'Immediate' ? 4 : formData.priority === 'High' ? 1 : 0,
      coordinates: [
        [26.8900, 76.3300], // Dausa
        [26.7500, 76.3100],
        [26.5600, 76.3200], // Lalsot
      ],
      segments: [
        { id: `seg-new-1`, startKm: 0, endKm: 12, name: 'Dausa Outskirts – Paparda Junction', pci: Number(formData.healthScore), iri: 2.4, defects: 3, status: 'moderate' },
        { id: `seg-new-2`, startKm: 12, endKm: Number(formData.totalLengthKm), name: 'Paparda – Lalsot Mandi Stretch', pci: Number(formData.healthScore) - 4, iri: 3.1, defects: 5, status: 'poor' },
      ],
    };

    if (onAddRoad) {
      await onAddRoad(newRoad);
    }
    success('Road Added Successfully', `${newRoad.code} (${newRoad.name}) registered into Road Health Registry.`);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Road in Health Registry"
      description="Add a rural PMGSY corridor, district road, or highway link to Sadak Setu"
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
            Register Road
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Road ID & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Road ID / Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. PMGSY VR-28"
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">Road / Corridor Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alwar – Thanagazi Link"
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>
        </div>

        {/* Category & Zone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Road Hierarchy Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="Rural PMGSY (Pradhan Mantri Gram Sadak Yojana)">Rural PMGSY</option>
              <option value="Major District Road (MDR)">Major District Road (MDR)</option>
              <option value="Other District Road (ODR)">Other District Road (ODR)</option>
              <option value="State Highway (SH)">State Highway (SH)</option>
              <option value="National Highway (NHAI)">National Highway (NHAI)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Regional Zone</label>
            <select
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="north">Northern Zone</option>
              <option value="west">Western Zone</option>
              <option value="south">Southern Zone</option>
              <option value="east">Eastern Zone</option>
              <option value="central">Central Zone</option>
            </select>
          </div>
        </div>

        {/* District & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">District</label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>
        </div>

        {/* Length, Lanes & Surface */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Total Length (KM)</label>
            <input
              type="number"
              step="0.1"
              value={formData.totalLengthKm}
              onChange={(e) => setFormData({ ...formData, totalLengthKm: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Lane Count</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.lanes}
              onChange={(e) => setFormData({ ...formData, lanes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pavement Surface</label>
            <select
              value={formData.surfaceType}
              onChange={(e) => setFormData({ ...formData, surfaceType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="Bituminous Macadam with Surface Dressing">Bituminous Surface Dressing</option>
              <option value="Bituminous Concrete (BC)">Bituminous Concrete</option>
              <option value="Pavement Quality Concrete (PQC)">Rigid Concrete (PQC)</option>
              <option value="Stone Matrix Asphalt (SMA)">Stone Matrix Asphalt</option>
            </select>
          </div>
        </div>

        {/* Priority & Health Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Maintenance Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
            >
              <option value="Immediate">Immediate Priority (Critical Action)</option>
              <option value="High">High Priority (Scheduled Repair)</option>
              <option value="Monitor">Monitor (Stable / Routine Care)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Initial Health Score (0–100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.healthScore}
              onChange={(e) => setFormData({ ...formData, healthScore: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-100 font-mono font-bold text-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
