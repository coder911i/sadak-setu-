import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { MapPin, Navigation, ShieldAlert, AlertTriangle } from 'lucide-react';

const createDefectMarkerIcon = (severity) => {
  const isCritical = severity === 'critical';
  const color = isCritical ? '#ef4444' : '#f59e0b';
  const pulseClass = isCritical ? 'pulse-marker-critical' : 'pulse-marker-warning';

  return L.divIcon({
    className: `relative ${pulseClass}`,
    html: `
      <div class="relative flex items-center justify-center w-5 h-5">
        <div class="w-3.5 h-3.5 rounded-full border-2 border-line shadow-md" style="background-color: ${color}"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

export function RoadGPSMap({ road, defects = [] }) {
  if (!road || !road.coordinates || road.coordinates.length === 0) return null;

  const center = road.coordinates[Math.floor(road.coordinates.length / 2)] || road.coordinates[0];

  const polyColor = road.priority === 'Immediate' ? '#ef4444' : road.priority === 'High' ? '#f97316' : '#10b981';

  return (
    <Card className="bg-white border-line overflow-hidden">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Navigation}>
            GPS Corridor Map &amp; Geo-Tagged Damage Locations
          </CardTitle>
          <span className="text-[10px] font-mono text-ink-500">
            {defects.length} Geo-Tagged Pins
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-[340px] relative">
        <MapContainer
          center={center}
          zoom={10}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Road Polyline */}
          <Polyline
            positions={road.coordinates}
            pathOptions={{
              color: polyColor,
              weight: 6,
              opacity: 0.9,
            }}
          >
            <Popup>
              <div className="p-2 space-y-1 text-xs">
                <span className="font-mono font-bold text-ink-900">{road.code}</span>
                <p className="text-ink-700">{road.name}</p>
                <div className="text-[11px] text-ink-500 font-mono">
                  Health: <strong className="text-emerald-600">{road.healthScore}/100</strong>
                </div>
              </div>
            </Popup>
          </Polyline>

          {/* Damage Defect Markers */}
          {defects.map((defect) => (
            <Marker
              key={defect.id}
              position={[defect.lat, defect.lng]}
              icon={createDefectMarkerIcon(defect.severity)}
            >
              <Popup>
                <div className="p-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-rose-600 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> {defect.defectType}
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-rose-50 text-rose-700 px-1 rounded">
                      {defect.severity}
                    </span>
                  </div>
                  <div className="text-ink-700 font-mono">{defect.chainage}</div>
                  <div className="text-[11px] text-ink-500">
                    Depth: {defect.dimensions.depthCm} cm | Conf: {defect.confidenceScore}%
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
