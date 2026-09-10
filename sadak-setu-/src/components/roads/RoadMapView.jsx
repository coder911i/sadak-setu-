import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useRoads } from '../../hooks/useRoads';
import { MOCK_INSPECTIONS } from '../../data/mockInspections';
import { formatChainage, getPCIRating } from '../../utils/formatters';
import { MapPin, Layers, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';

const createDefectMarkerIcon = (severity) => {
  const isCritical = severity === 'critical';
  const colorClass = isCritical ? 'bg-rose-500' : 'bg-amber-500';
  const pulseClass = isCritical ? 'pulse-marker-critical' : 'pulse-marker-warning';

  return L.divIcon({
    className: `relative ${pulseClass}`,
    html: `
      <div class="relative flex items-center justify-center w-5 h-5">
        <div class="w-3.5 h-3.5 rounded-full ${colorClass} border-2 border-line shadow-md"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

export function RoadMapView({ onSelectRoad }) {
  const { roads, activeRoad, setSelectedRoadId } = useRoads();
  const [filterSeverity, setFilterSeverity] = useState('all');

  const defaultCenter = [22.5, 78.5];

  const getCorridorColor = (pciScore) => {
    if (pciScore >= 85) return '#10b981';
    if (pciScore >= 70) return '#84cc16';
    if (pciScore >= 55) return '#f59e0b';
    if (pciScore >= 40) return '#f97316';
    return '#ef4444';
  };

  const filteredDefects = MOCK_INSPECTIONS.filter((d) => {
    if (filterSeverity === 'critical') return d.severity === 'critical';
    if (filterSeverity === 'high') return d.severity === 'high' || d.severity === 'critical';
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[650px]">
      {/* Left Corridor Selector Panel */}
      <div className="lg:col-span-1 flex flex-col gap-2 overflow-y-auto max-h-[650px] pr-1">
        <div className="p-3 rounded-xl bg-white border border-line space-y-2 sticky top-0 z-10 backdrop-blur-md">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-brand-600" /> GIS Corridor Layers
          </h4>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex-1 ${
                filterSeverity === 'all' ? 'bg-brand-600 text-white' : 'bg-surface-100 text-ink-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex-1 ${
                filterSeverity === 'critical' ? 'bg-rose-600 text-white' : 'bg-surface-100 text-ink-700'
              }`}
            >
              Critical Only
            </button>
          </div>
        </div>

        {roads.map((r) => {
          const isSelected = activeRoad?.id === r.id;
          const pciMeta = getPCIRating(r.pciScore);

          return (
            <div
              key={r.id}
              onClick={() => {
                setSelectedRoadId(r.id);
                if (onSelectRoad) onSelectRoad(r);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                isSelected
                  ? 'bg-brand-50 border-brand-500 shadow-md ring-1 ring-brand-500/50'
                  : 'bg-white border-line hover:border-line'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-brand-600">{r.code}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${pciMeta.badgeClass}`}>
                  PCI {r.pciScore}
                </span>
              </div>
              <p className="text-xs font-semibold text-ink-900 truncate">{r.name}</p>
              <div className="flex items-center justify-between text-[10px] text-ink-500 font-mono">
                <span>{r.totalLengthKm} KM ({r.lanes}L)</span>
                <span className={r.criticalDefectsCount > 0 ? 'text-rose-600 font-bold' : 'text-ink-500'}>
                  {r.activeDefectsCount} Defects
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Leaflet Map Viewer */}
      <div className="lg:col-span-3 rounded-xl overflow-hidden border border-line h-full relative">
        <MapContainer
          center={defaultCenter}
          zoom={5}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {roads.map((road) => {
            const isSelected = activeRoad?.id === road.id;

            return (
              <Polyline
                key={road.id}
                positions={road.coordinates}
                pathOptions={{
                  color: getCorridorColor(road.pciScore),
                  weight: isSelected ? 8 : 4,
                  opacity: isSelected ? 1 : 0.75,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedRoadId(road.id);
                    if (onSelectRoad) onSelectRoad(road);
                  },
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-xs">
                    <span className="font-mono font-bold text-ink-900 text-sm">{road.code}</span>
                    <p className="text-ink-700">{road.name}</p>
                    <div className="text-[11px] text-ink-500 font-mono">
                      PCI: <strong className="text-emerald-600">{road.pciScore}</strong> | Roughness: <strong>{road.iriScore} m/km</strong>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {filteredDefects.map((defect) => (
            <Marker
              key={defect.id}
              position={[defect.lat, defect.lng]}
              icon={createDefectMarkerIcon(defect.severity)}
            >
              <Popup>
                <div className="p-2 space-y-1 text-xs">
                  <div className="font-bold text-rose-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> {defect.defectType}
                  </div>
                  <div className="text-ink-700 font-mono">{defect.roadCode} ({defect.chainage})</div>
                  <div className="text-[11px] text-ink-500">
                    Depth: <strong>{defect.dimensions.depthCm} cm</strong> | AI Conf: <strong>{defect.confidenceScore}%</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
