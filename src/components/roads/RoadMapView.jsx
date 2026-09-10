import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '../ui/Card';
import { useRoads } from '../../hooks/useRoads';
import { MOCK_INSPECTIONS } from '../../data/mockInspections';
import { formatChainage, getPCIRating } from '../../utils/formatters';
import {
  MapPin,
  Layers,
  AlertTriangle,
  Eye,
  ShieldAlert,
  Search,
  Crosshair,
  Route,
  Activity,
  CheckCircle2,
} from 'lucide-react';

const createDefectMarkerIcon = (severity) => {
  const isCritical = severity === 'critical';
  const colorClass = isCritical ? 'bg-red-600' : 'bg-amber-500';
  const pulseClass = isCritical ? 'pulse-marker-critical' : 'pulse-marker-warning';

  return L.divIcon({
    className: `relative ${pulseClass}`,
    html: `
      <div class="relative flex items-center justify-center w-5 h-5">
        <div class="w-3.5 h-3.5 rounded-full ${colorClass} border-2 border-white shadow-md"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

export function RoadMapView({ onSelectRoad }) {
  const { roads, activeRoad, setSelectedRoadId } = useRoads();
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [mapSearch, setMapSearch] = useState('');

  const defaultCenter = [22.5, 78.5];

  const getCorridorColor = (pciScore) => {
    if (pciScore >= 80) return '#16a34a';
    if (pciScore >= 60) return '#65a30d';
    if (pciScore >= 40) return '#d97706';
    return '#dc2626';
  };

  const filteredRoads = roads.filter((r) => {
    if (!mapSearch) return true;
    const q = mapSearch.toLowerCase();
    return (
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.district?.toLowerCase().includes(q)
    );
  });

  const filteredDefects = MOCK_INSPECTIONS.filter((d) => {
    if (filterSeverity === 'critical') return d.severity === 'critical';
    if (filterSeverity === 'high') return d.severity === 'high' || d.severity === 'critical';
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[680px]">
      {/* Left Corridor Selector & Filter Panel */}
      <div className="lg:col-span-1 flex flex-col gap-2.5 overflow-y-auto max-h-[680px] pr-1">
        {/* Panel Header */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebe4] shadow-card space-y-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#123320] flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-700" />
              <span>Corridors &amp; Layers</span>
            </h4>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-100 text-[#728a79] border border-[#e2ebe4]">
              {filteredRoads.length} Routes
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#728a79] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder="Filter corridor name or district..."
              className="w-full bg-[#f8faf8] border border-[#e2ebe4] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#123320] placeholder:text-[#8a9c8f] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex-1 cursor-pointer ${
                filterSeverity === 'all'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-surface-50 text-[#728a79] hover:text-[#123320] border border-[#e2ebe4]'
              }`}
            >
              All Distress
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex-1 cursor-pointer ${
                filterSeverity === 'critical'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-surface-50 text-[#728a79] hover:text-[#123320] border border-[#e2ebe4]'
              }`}
            >
              Critical Only
            </button>
          </div>
        </div>

        {/* List of Corridors */}
        {filteredRoads.map((r) => {
          const isSelected = activeRoad?.id === r.id;
          const pciMeta = getPCIRating(r.pciScore);

          return (
            <div
              key={r.id}
              onClick={() => {
                setSelectedRoadId(r.id);
                if (onSelectRoad) onSelectRoad(r);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 shadow-card ${
                isSelected
                  ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/30'
                  : 'bg-white border-[#e2ebe4] hover:border-brand-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-brand-800">{r.code}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    r.priority === 'Immediate'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : r.priority === 'High'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  PCI {r.pciScore}
                </span>
              </div>

              <p className="text-xs font-bold text-[#123320] truncate">{r.name}</p>

              <div className="flex items-center justify-between text-[11px] text-[#728a79] font-mono">
                <span>{r.district}, {r.state}</span>
                <span className="text-red-600 font-bold">{r.damageCount} Defects</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Leaflet Map Canvas */}
      <div className="lg:col-span-3 h-[680px] rounded-3xl overflow-hidden border border-[#e2ebe4] shadow-card relative">
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

          {/* Road Network Corridors */}
          {roads.map((r) => {
            const isSelected = activeRoad?.id === r.id;
            const color = getCorridorColor(r.pciScore);

            return (
              <Polyline
                key={r.id}
                positions={r.coordinates}
                pathOptions={{
                  color: color,
                  weight: isSelected ? 8 : 4.5,
                  opacity: isSelected ? 1 : 0.85,
                  dashArray: isSelected ? undefined : '4, 2',
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedRoadId(r.id);
                    if (onSelectRoad) onSelectRoad(r);
                  },
                }}
              />
            );
          })}

          {/* Damage Defect Markers */}
          {filteredDefects.map((d) => (
            <Marker
              key={d.id}
              position={[d.lat, d.lng]}
              icon={createDefectMarkerIcon(d.severity)}
            >
              <Popup>
                <div className="p-1 space-y-1.5 text-xs min-w-[200px]">
                  <div className="flex items-center justify-between gap-2 border-b border-[#e2ebe4] pb-1">
                    <strong className="text-brand-800 font-mono">{d.roadCode}</strong>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase font-mono ${
                        d.severity === 'critical' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {d.severity}
                    </span>
                  </div>
                  <p className="font-bold text-[#123320]">{d.defectType}</p>
                  <p className="text-[11px] text-[#728a79]">{d.damageFound}</p>
                  <div className="text-[10px] font-mono text-brand-700 pt-1 flex items-center justify-between">
                    <span>Chainage: {d.chainage}</span>
                    <span>Depth: {d.dimensions.depthCm}cm</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Condition & GIS Status Widget */}
        <div className="absolute top-4 right-4 z-[400] p-3 rounded-2xl bg-white/95 border border-[#e2ebe4] backdrop-blur-md shadow-card text-xs space-y-1.5 max-w-xs hidden sm:block">
          <div className="flex items-center gap-2 font-bold text-[#123320]">
            <Route className="w-4 h-4 text-brand-700" />
            <span>GIS Highway Telemetry</span>
          </div>
          <p className="text-[11px] text-[#3b5e47] leading-snug">
            Real-time GPS mapping across national expressways, PMGSY links, and district highways.
          </p>
          <div className="pt-1 border-t border-[#e2ebe4] flex items-center gap-3 text-[10px] font-mono text-[#728a79]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> Good (PCI 80+)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Fair (PCI 60-79)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600" /> Critical (&lt;40)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
