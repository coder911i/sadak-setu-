import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRoads } from '../../hooks/useRoads';
import { DEFECT_TYPES, INSPECTION_SOURCES } from '../../utils/constants';
import { Camera, MapPin, Cpu, UploadCloud, Check } from 'lucide-react';

export function NewInspectionModal({ isOpen, onClose, onSubmit }) {
  const { roads } = useRoads();

  const [formData, setFormData] = useState({
    defectType: DEFECT_TYPES.POTHOLE,
    severity: 'critical',
    roadId: 'road-nh48',
    chainage: 'Km 105+350',
    lane: 'Lane 1 (Fast Lane)',
    lengthCm: 60,
    widthCm: 45,
    depthCm: 8.5,
    source: INSPECTION_SOURCES.AI_VAN,
    notes: 'Severe wheel-track depression with edge breakup detected by mobile high-speed camera.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoad = roads.find((r) => r.id === formData.roadId) || roads[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const originCoord = Array.isArray(selectedRoad.coordinates) ? selectedRoad.coordinates[0] : null;
    const originLat = originCoord ? originCoord[0] : selectedRoad.latitude ?? 0;
    const originLng = originCoord ? originCoord[1] : selectedRoad.longitude ?? 0;

    const newDefect = {
      defectType: formData.defectType,
      severity: formData.severity,
      roadId: selectedRoad.id,
      roadCode: selectedRoad.code,
      roadName: selectedRoad.name,
      chainage: formData.chainage,
      lane: formData.lane,
      lat: originLat + (Math.random() - 0.5) * 0.1,
      lng: originLng + (Math.random() - 0.5) * 0.1,
      dimensions: {
        lengthCm: Number(formData.lengthCm),
        widthCm: Number(formData.widthCm),
        depthCm: Number(formData.depthCm),
        areaSqM: Number(((formData.lengthCm * formData.widthCm) / 10000).toFixed(2)),
      },
      riskScore: formData.severity === 'critical' ? 92 : formData.severity === 'high' ? 78 : 55,
      estimatedPatchVolumeKg: Math.round(Number(formData.depthCm) * 8.5),
      source: formData.source,
      vehicleSpeedKmph: 68,
      sensorVibrationG: formData.severity === 'critical' ? 3.2 : 1.8,
      weatherCondition: 'Clear Daylight',
      notes: formData.notes,
      confidenceScore: (94 + Math.random() * 5).toFixed(1),
    };

    await onSubmit(newDefect);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deploy / Log AI Road Inspection Scan"
      description="Register automated vision sensor detection or field officer inspection log"
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
            Submit Defect Telemetry
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Inspection Method */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Inspection Platform Source</label>
          <select
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {Object.entries(INSPECTION_SOURCES).map(([k, v]) => (
              <option key={k} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Road and Chainage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Highway Corridor</label>
            <select
              value={formData.roadId}
              onChange={(e) => setFormData({ ...formData, roadId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {roads.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} – {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Chainage Marker (Km + Meter)</label>
            <input
              type="text"
              value={formData.chainage}
              onChange={(e) => setFormData({ ...formData, chainage: e.target.value })}
              placeholder="e.g. Km 104+250"
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
              required
            />
          </div>
        </div>

        {/* Distress Type & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pavement Distress Category</label>
            <select
              value={formData.defectType}
              onChange={(e) => setFormData({ ...formData, defectType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {Object.values(DEFECT_TYPES).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Severity Rating</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="critical">Critical (Immediate Road Safety Threat)</option>
              <option value="high">High (Accelerated Fatigue)</option>
              <option value="moderate">Moderate (Scheduled Maintenance)</option>
              <option value="low">Low (Routine Monitoring)</option>
            </select>
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Length (cm)</label>
            <input
              type="number"
              value={formData.lengthCm}
              onChange={(e) => setFormData({ ...formData, lengthCm: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Width (cm)</label>
            <input
              type="number"
              value={formData.widthCm}
              onChange={(e) => setFormData({ ...formData, widthCm: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Depth (cm)</label>
            <input
              type="number"
              value={formData.depthCm}
              onChange={(e) => setFormData({ ...formData, depthCm: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Field Notes */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Diagnostic Analysis &amp; Remarks</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </form>
    </Modal>
  );
}
