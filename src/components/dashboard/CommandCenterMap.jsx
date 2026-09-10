import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useRoads } from '../../hooks/useRoads';
import { formatDate, formatChainage, getPCIRating } from '../../utils/formatters';
import {
  MapPin,
  Navigation,
  Eye,
  Maximize2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Wrench,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom Marker for Indian Road Corridors
const createPriorityMarkerIcon = (priority) => {
  const isImmediate = priority === 'Immediate';
  const isHigh = priority === 'High';
  const color = isImmediate ? '#dc2626' : isHigh ? '#d97706' : '#16a34a';
  const pulseClass = isImmediate ? 'pulse-marker-critical' : isHigh ? 'pulse-marker-warning' : '';

  return L.divIcon({
    className: `relative ${pulseClass}`,
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[9px] font-bold text-white" style="background-color: ${color}">
          ●
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function CommandCenterMap({ onSelectRoad }) {
  const { roads, activeRoad, setSelectedRoadId } = useRoads();
  const navigate = useNavigate();
  const [filterPriority, setFilterPriority] = useState('all');

  const defaultCenter = [23.5, 78.5]; // Central India

  const getPriorityPolylineColor = (priority) => {
    if (priority === 'Immediate') return '#dc2626'; // Red
    if (priority === 'High') return '#d97706'; // Orange
    return '#16a34a'; // Green
  };

  const filteredRoads = roads.filter((r) => {
    if (filterPriority === 'immediate') return r.priority === 'Immediate';
    if (filterPriority === 'high') return r.priority === 'High' || r.priority === 'Immediate';
    return true;
  });

  return (
    <Card className="flex flex-col h-full border-[#e2ebe4] bg-white shadow-card overflow-hidden">
      <CardHeader className="py-3.5 px-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <CardTitle icon={Navigation}>
            GIS Road Network Map &amp; Condition Registry
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <div className="flex items-center p-1 bg-surface-50 rounded-xl border border-[#e2ebe4] text-xs">
              <button
                onClick={() => setFilterPriority('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterPriority === 'all'
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'text-[#728a79] hover:text-[#123320]'
                }`}
              >
                All Corridors ({roads.length})
              </button>
              <button
                onClick={() => setFilterPriority('immediate')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterPriority === 'immediate'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-[#728a79] hover:text-[#123320]'
                }`}
              >
                Critical Alert
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Maximize2}
              onClick={() => navigate('/roads')}
            >
              Full GIS View
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 relative min-h-[440px]">
        <MapContainer
          center={defaultCenter}
          zoom={5}
          scrollWheelZoom={false}
          className="w-full h-full min-h-[440px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredRoads.map((road) => {
            const isSelected = activeRoad?.id === road.id;
            const polyColor = getPriorityPolylineColor(road.priority);
            const midCoord = road.coordinates[Math.floor(road.coordinates.length / 2)] || road.coordinates[0];

            return (
              <React.Fragment key={road.id}>
                {/* Corridor Polyline */}
                <Polyline
                  positions={road.coordinates}
                  pathOptions={{
                    color: polyColor,
                    weight: isSelected ? 8 : 4.5,
                    opacity: isSelected ? 1 : 0.85,
                    dashArray: isSelected ? undefined : '4, 2',
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedRoadId(road.id);
                      if (onSelectRoad) onSelectRoad(road);
                    },
                  }}
                />

                {/* Marker with Rich Light Popup */}
                <Marker
                  position={midCoord}
                  icon={createPriorityMarkerIcon(road.priority)}
                >
                  <Popup>
                    <div className="p-2 space-y-2 text-xs min-w-[220px]">
                      {/* Title & Priority Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#e2ebe4] pb-1.5">
                        <div>
                          <span className="font-mono font-bold text-brand-700 text-sm">{road.code}</span>
                          <div className="text-[10px] text-[#728a79]">{road.category}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            road.priority === 'Immediate'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : road.priority === 'High'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {road.priority}
                        </span>
                      </div>

                      {/* Road Name & Location */}
                      <p className="text-[#123320] font-bold">{road.name}</p>
                      <div className="text-[11px] text-[#3b5e47]">
                        <span>District: <strong>{road.district}, {road.state}</strong></span>
                      </div>

                      {/* Metric Grid */}
                      <div className="grid grid-cols-2 gap-2 bg-surface-50 p-2 rounded-xl border border-[#e2ebe4] font-mono text-[11px]">
                        <div>
                          <span className="text-[#728a79] text-[10px] block">Health Score</span>
                          <strong className="text-brand-800 font-bold">{road.healthScore} / 100</strong>
                        </div>
                        <div>
                          <span className="text-[#728a79] text-[10px] block">Damage Count</span>
                          <strong className={road.damageCount > 10 ? 'text-red-600 font-bold' : 'text-[#123320]'}>
                            {road.damageCount} Defects
                          </strong>
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            setSelectedRoadId(road.id);
                            if (onSelectRoad) onSelectRoad(road);
                          }}
                          className="w-full py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-[11px] font-bold text-center cursor-pointer transition-colors"
                        >
                          Inspect Corridor Telemetry
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Floating Priority Legend */}
        <div className="absolute bottom-3 left-3 z-[400] p-3 rounded-2xl bg-white/95 border border-[#e2ebe4] backdrop-blur-md text-[11px] shadow-card space-y-1.5 hidden sm:block pointer-events-auto">
          <div className="font-bold text-[#123320] text-[10px] uppercase tracking-wider mb-1">
            Corridor Condition Index
          </div>
          <div className="flex items-center gap-4 text-[#3b5e47]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Immediate (PCI &lt;45)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>High (PCI 46–65)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Stable (PCI 66–100)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
