import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useRoads } from '../../hooks/useRoads';
import { MOCK_INSPECTIONS } from '../../data/mockInspections';
import { formatChainage, getPCIRating } from '../../utils/formatters';
import { MapPin, Navigation, Eye, Maximize2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom pulsing divIcon for critical road defects
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

export function RoadHealthMapPreview({ onSelectRoad }) {
  const { roads, activeRoad, setSelectedRoadId } = useRoads();
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState('all');

  const defaultCenter = [23.5937, 78.9629]; // Central India coordinate

  const getCorridorColor = (pciScore) => {
    if (pciScore >= 85) return '#10b981'; // Green
    if (pciScore >= 70) return '#84cc16'; // Lime
    if (pciScore >= 55) return '#f59e0b'; // Amber
    if (pciScore >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-line">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Navigation}>
            Live GIS Corridor Telemetry &amp; Defect Heatmap
          </CardTitle>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-surface-50 rounded-lg border border-line text-[11px]">
              <button
                onClick={() => setActiveLayer('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeLayer === 'all'
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                All Corridors
              </button>
              <button
                onClick={() => setActiveLayer('critical')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeLayer === 'critical'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                Critical Hazards Only
              </button>
            </div>

            <Button
              variant="outline"
              size="xs"
              icon={Maximize2}
              onClick={() => navigate('/roads')}
            >
              Full GIS View
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 relative min-h-[380px]">
        <MapContainer
          center={defaultCenter}
          zoom={5}
          scrollWheelZoom={false}
          className="w-full h-full min-h-[380px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Road Network Corridors Polyline */}
          {roads.map((road) => {
            const isSelected = activeRoad?.id === road.id;
            const pciMeta = getPCIRating(road.pciScore);

            return (
              <Polyline
                key={road.id}
                positions={road.coordinates}
                pathOptions={{
                  color: getCorridorColor(road.pciScore),
                  weight: isSelected ? 7 : 4,
                  opacity: isSelected ? 1 : 0.8,
                  dashArray: isSelected ? undefined : '2, 1',
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedRoadId(road.id);
                    if (onSelectRoad) onSelectRoad(road);
                  },
                }}
              >
                <Popup>
                  <div className="p-2 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-ink-900 font-mono">{road.code}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ backgroundColor: `${getCorridorColor(road.pciScore)}33`, color: getCorridorColor(road.pciScore) }}
                      >
                        PCI: {road.pciScore}/100
                      </span>
                    </div>
                    <p className="text-ink-700 font-medium">{road.name}</p>
                    <div className="text-[11px] text-ink-500">
                      <div>Length: <span className="text-ink-900">{road.totalLengthKm} KM</span> ({road.lanes} Lanes)</div>
                      <div>Roughness (IRI): <span className="text-ink-900">{road.iriScore} m/km</span></div>
                      <div>Active Defects: <span className="text-rose-600 font-bold">{road.activeDefectsCount}</span></div>
                    </div>
                    <button
                      onClick={() => navigate('/roads')}
                      className="w-full mt-2 py-1.5 px-3 bg-brand-600 hover:bg-brand-500 text-white rounded text-[11px] font-semibold text-center"
                    >
                      Inspect Chainage
                    </button>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* Critical AI Defect Markers */}
          {MOCK_INSPECTIONS.filter((insp) =>
            activeLayer === 'critical' ? insp.severity === 'critical' : true
          ).map((defect) => (
            <Marker
              key={defect.id}
              position={[defect.lat, defect.lng]}
              icon={createDefectMarkerIcon(defect.severity)}
            >
              <Popup>
                <div className="p-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-rose-600 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> {defect.defectType}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded">
                      {defect.severity}
                    </span>
                  </div>
                  <div className="text-ink-700 font-medium font-mono">
                    {defect.roadCode} ({defect.chainage})
                  </div>
                  <div className="text-[11px] text-ink-500">
                    Depth: <span className="text-ink-900">{defect.dimensions.depthCm} cm</span> |
                    Confidence: <span className="text-emerald-600 font-semibold">{defect.confidenceScore}%</span>
                  </div>
                  <p className="text-[10px] text-ink-500 italic">{defect.notes}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-3 left-3 z-[400] p-2.5 rounded-xl bg-white border border-line backdrop-blur-md text-[11px] shadow-lg space-y-1.5 hidden sm:block pointer-events-auto">
          <div className="font-semibold text-ink-700 text-[10px] uppercase tracking-wider mb-1">
            Corridor Condition Index (PCI)
          </div>
          <div className="flex items-center gap-3 text-ink-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Good (85+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
              <span>Satisfactory (70-84)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Fair (55-69)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Critical (&lt;55)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
