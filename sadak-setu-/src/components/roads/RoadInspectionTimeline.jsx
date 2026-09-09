import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatDate } from '../../utils/formatters';
import { Calendar, Cpu, Radio, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function RoadInspectionTimeline({ road }) {
  const history = [
    {
      id: 'insp-h1',
      date: road.latestInspection || '2026-09-08T16:45:00Z',
      agency: road.inspectionAgency || 'AI Mobile Survey Unit-03',
      method: 'High-Speed YOLOv10 Dashcam Vision',
      healthRecorded: road.healthScore || road.pciScore,
      speed: '68 km/h',
      findings: `${road.damageCount || 14} total defects logged with 98.4% AI inference confidence. Accelerometer spike: 3.2G.`,
      status: 'Verified & Registered',
    },
    {
      id: 'insp-h2',
      date: '2026-08-22T11:30:00Z',
      agency: 'Autonomous Drone LiDAR Survey Fleet',
      method: 'LiDAR 3D Pavement Topography',
      healthRecorded: Math.min(100, (road.healthScore || road.pciScore) + 4),
      speed: '45 km/h',
      findings: 'Full point cloud surface reconstruction. Edge raveling identified near agricultural culvert drains.',
      status: 'Completed',
    },
    {
      id: 'insp-h3',
      date: '2026-07-14T09:15:00Z',
      agency: 'State PWD Monsoon Assessment Wing',
      method: 'Post-Monsoon Manual & Telemetry Field Audit',
      healthRecorded: Math.max(20, (road.healthScore || road.pciScore) - 6),
      speed: '30 km/h',
      findings: 'Water ponding and subgrade saturation noted following heavy convective monsoon downpour.',
      status: 'Archived',
    },
  ];

  return (
    <Card className="bg-slate-900/90 border-slate-800">
      <CardHeader className="py-3 px-4">
        <CardTitle icon={Calendar}>
          Telemetry Inspection History &amp; Survey Timeline
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {history.map((item, idx) => (
            <div key={item.id} className="relative space-y-1 text-xs">
              {/* Dot */}
              <span
                className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                  idx === 0 ? 'bg-brand-500 ring-4 ring-brand-500/20' : 'bg-slate-700'
                }`}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{item.agency}</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-brand-950 text-brand-300 border border-brand-800">
                    {item.method}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {formatDate(item.date, true)}
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">{item.findings}</p>

              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 pt-1">
                <span>Recorded Health: <strong className="text-emerald-400">{item.healthRecorded} / 100</strong></span>
                <span>&bull;</span>
                <span>Survey Speed: <strong className="text-slate-200">{item.speed}</strong></span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-semibold">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
