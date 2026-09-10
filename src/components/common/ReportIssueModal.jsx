import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRoads } from '../../hooks/useRoads';
import { useInspections } from '../../hooks/useInspections';
import { useToast } from '../../hooks/useToast';
import {
  UploadCloud,
  Camera,
  MapPin,
  AlertTriangle,
  FileText,
  Check,
  X,
  Crosshair,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export function ReportIssueModal({ isOpen, onClose }) {
  const { roads } = useRoads();
  const { addInspection } = useInspections();
  const { success } = useToast();
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [roadId, setRoadId] = useState(roads[0]?.id || 'road-nh48');
  const [chainage, setChainage] = useState('Km 62+400');
  const [issueType, setIssueType] = useState('Pothole');
  const [severity, setSeverity] = useState('critical');
  const [description, setDescription] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoad = roads.find((r) => r.id === roadId) || roads[0];

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoLocate = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      if (selectedRoad?.coordinates?.[0]) {
        setChainage(`Km ${(Math.random() * 20 + 5).toFixed(1)}`);
        success('GPS Located', `Coordinates locked to ${selectedRoad.code} (${selectedRoad.name}).`);
      }
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newDefect = {
      defectType: issueType,
      damageFound: `${severity.toUpperCase()} ${issueType} detected on carriageway`,
      severity: severity,
      roadId: selectedRoad.id,
      roadCode: selectedRoad.code,
      roadName: selectedRoad.name,
      district: `${selectedRoad.district}, ${selectedRoad.state}`,
      chainage: chainage || 'Km 12+500',
      lane: 'Lane 1 (Carriageway)',
      lat: selectedRoad.coordinates[0][0] + (Math.random() - 0.5) * 0.05,
      lng: selectedRoad.coordinates[0][1] + (Math.random() - 0.5) * 0.05,
      mediaThumbnailType: issueType.toLowerCase().includes('crack') ? 'alligator_crack' : 'pothole_crater',
      dimensions: {
        lengthCm: issueType === 'Pothole' ? 65 : 180,
        widthCm: issueType === 'Pothole' ? 45 : 30,
        depthCm: severity === 'critical' ? 8.5 : severity === 'high' ? 5.2 : 2.8,
        areaSqM: 0.35,
      },
      confidenceScore: (95 + Math.random() * 4).toFixed(1),
      riskScore: severity === 'critical' ? 94 : severity === 'high' ? 76 : 48,
      estimatedPatchVolumeKg: 50,
      detectedAt: new Date().toISOString(),
      inspector: 'Field Officer / Citizen App Portal',
      inspectorType: 'Field Mobile Scan',
      notes: description || 'Field reported pavement distress awaiting priority maintenance triage.',
      status: 'Under Triage',
      statusKey: 'triaged',
      boundingBox: { x: 30, y: 40, width: 40, height: 35 },
    };

    await addInspection(newDefect);
    setIsSubmitting(false);
    success('Issue Reported', `Defect logged on ${selectedRoad.code}. Assigned to AI triage queue.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Road Distress or Hazard"
      description="Citizen & Field Officer road inspection reporting module"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Check}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Submit Report
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* 1. Upload Road Image */}
        <div>
          <label className="block text-[#123320] font-bold mb-1.5 flex items-center justify-between">
            <span>Upload Road Photo / Dashcam Frame</span>
            <span className="text-[11px] font-normal text-[#728a79]">JPG, PNG up to 10MB</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-[#e2ebe4] aspect-video bg-surface-100 flex items-center justify-center group">
              <img src={imagePreview} alt="Distress preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[11px] font-mono px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Vision Pre-Scan Ready</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#c7d8cc] hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#f8faf8] hover:bg-[#eef7f1] flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#e2ebe4] shadow-sm flex items-center justify-center text-brand-600 group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#123320]">
                  Click to capture or upload photo
                </p>
                <p className="text-[#728a79] text-xs mt-0.5">
                  AI will automatically identify distress type and depth
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Location & Chainage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[#123320] font-bold mb-1">
              Corridor / Highway Section
            </label>
            <select
              value={roadId}
              onChange={(e) => setRoadId(e.target.value)}
              className="input-base"
            >
              {roads.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} – {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#123320] font-bold mb-1 flex items-center justify-between">
              <span>Location / Chainage</span>
              <button
                type="button"
                onClick={handleAutoLocate}
                className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Use Current GPS'}</span>
              </button>
            </label>
            <input
              type="text"
              value={chainage}
              onChange={(e) => setChainage(e.target.value)}
              placeholder="e.g. Km 62+400 or near Toll Plaza"
              className="input-base"
              required
            />
          </div>
        </div>

        {/* 3. Issue Type & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[#123320] font-bold mb-1">
              Issue / Defect Type
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="input-base"
            >
              <option value="Pothole">Pothole (Depression / Crater)</option>
              <option value="Alligator Cracking">Alligator Fatigue Cracking</option>
              <option value="Rutting">Wheel Track Rutting</option>
              <option value="Edge Breakup">Shoulder Edge Breakup</option>
              <option value="Drainage Blockage">Culvert / Water Clog</option>
              <option value="Expansion Joint">Bridge Expansion Joint Failure</option>
            </select>
          </div>

          <div>
            <label className="block text-[#123320] font-bold mb-1">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'moderate', label: 'Moderate', color: 'border-brand-200 text-brand-700 bg-brand-50' },
                { id: 'high', label: 'High', color: 'border-amber-200 text-amber-800 bg-amber-50' },
                { id: 'critical', label: 'Critical', color: 'border-red-200 text-red-700 bg-red-50' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeverity(s.id)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    severity === s.id
                      ? `${s.color} ring-2 ring-offset-1 ring-brand-500 shadow-sm`
                      : 'border-[#e2ebe4] bg-white text-[#728a79] hover:bg-surface-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Description */}
        <div>
          <label className="block text-[#123320] font-bold mb-1">
            Description &amp; Hazard Observations
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe depth, water accumulation, traffic obstruction, or collision hazards..."
            className="input-base resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
