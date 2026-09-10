import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
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
  const color = isImmediate ? '#ef4444' : isHigh ? '#f97316' : '#10b981';
  const pulseClass = isImmediate ? 'pulse-marker-critical' : isHigh ? 'pulse-marker-warning' : '';

  return L.divIcon({
    className: `relative ${pulseClass}`,
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="w-4 h-4 rounded-full border-2 border-slate-900 shadow-xl flex items-center justify-center text-[9px] font-bold text-white" style="background-color: ${color}">
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
    if (priority === 'Immediate') return '#ef4444'; // Red
    if (priority === 'High') return '#f97316'; // Orange
    return '#10b981'; // Green
  };

  const filteredRoads = roads.filter((r) => {
    if (filterPriority === 'immediate') return r.priority === 'Immediate';
    if (filterPriority === 'high') return r.priority === 'High' || r.priority === 'Immediate';
    return true;
  });

  return (
    <Card className="flex flex-col h-full border-slate-800 bg-slate-900/90 overflow-hidden">
      <CardHeader className="py-3 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <CardTitle icon={Navigation}>
            Live GIS Road Network Map &amp; Health Registry
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <div className="flex items-center p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setFilterPriority('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterPriority === 'all'
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Roads ({roads.length})
              </button>
              <button
                onClick={() => setFilterPriority('immediate')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterPriority === 'immediate'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Immediate Action
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

      <CardContent className="p-0 flex-1 relative min-h-[420px]">
        <MapContainer
          center={defaultCenter}
          zoom={5}
          scrollWheelZoom={false}
          className="w-full h-full min-h-[420px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredRoads.map((road) => {
            const isSelected = activeRoad?.id === road.id;
            const polyColor = getPriorityPolylineColor(road.priority);
            const coordinates = Array.isArray(road.coordinates) ? road.coordinates : [];
            const fallbackPoint =
              Number.isFinite(road.latitude) && Number.isFinite(road.longitude)
                ? [road.latitude, road.longitude]
                : null;
            const midCoord = coordinates[Math.floor(coordinates.length / 2)] || fallbackPoint;

            if (!midCoord) return null;

            return (
              <React.Fragment key={road.id}>
                {/* Corridor Polyline */}
                {coordinates.length > 1 && (
                  <Polyline
                    positions={coordinates}
                    pathOptions={{
                      color: polyColor,
                      weight: isSelected ? 8 : 4.5,
                      opacity: isSelected ? 1 : 0.8,
                      dashArray: isSelected ? undefined : '3, 2',
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedRoadId(road.id);
                        if (onSelectRoad) onSelectRoad(road);
                      },
                    }}
                  />
                )}

                {/* Marker with Rich Popup */}
                <Marker
                  position={midCoord}
                  icon={createPriorityMarkerIcon(road.priority)}
                >
                  <Popup>
                    <div className="p-2 space-y-2 text-xs min-w-[220px]">
                      {/* Title & Priority Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                        <div>
                          <span className="font-mono font-bold text-brand-400 text-sm">{road.code}</span>
                          <div className="text-[10px] text-slate-400">{road.category}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            road.priority === 'Immediate'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : road.priority === 'High'
                              ? 'bg-orange-950 text-orange-300 border border-orange-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {road.priority}
                        </span>
                      </div>

                      {/* Road Name & Location */}
                      <p className="text-slate-200 font-semibold">{road.name}</p>
                      <div className="text-[11px] text-slate-400">
                        <span>District: <strong className="text-slate-200">{road.district}, {road.state}</strong></span>
                      </div>

                      {/* Metric Grid */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Health Score</span>
                          <strong className="text-emerald-400 font-bold">{road.healthScore} / 100</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Damage Count</span>
                          <strong className={road.damageCount > 10 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                            {road.damageCount} Defects
                          </strong>
                        </div>
                      </div>

                      {/* Latest Inspection */}
                      <div className="text-[10px] text-slate-400">
                        Latest Inspection: <span className="text-slate-300">{formatDate(road.latestInspection, true)}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-1 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedRoadId(road.id);
                            if (onSelectRoad) onSelectRoad(road);
                          }}
                          className="flex-1 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-[11px] font-semibold text-center"
                        >
                          Inspect Corridor
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
        <div className="absolute bottom-3 left-3 z-[400] p-3 rounded-xl bg-slate-900/90 border border-slate-750 backdrop-blur-md text-[11px] shadow-2xl space-y-1.5 hidden sm:block pointer-events-auto">
          <div className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider mb-1">
            Road Priority &amp; Health Classification
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Immediate (0–45 Score)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>High (46–65 Score)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Monitor (66–100 Score)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
