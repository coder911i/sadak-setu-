import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatRelativeTime } from '../../utils/formatters';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
} from 'lucide-react';

const alerts = [
  {
    id: 'alt-1',
    level: 'critical',
    title: 'Severe Cratering Post-Rainfall on PMGSY VR-14',
    location: 'Alwar – Thanagazi Road (Km 14+200)',
    description: '11cm deep crater cluster in wheel path. High two-wheeler skid hazard. Emergency patch order sanctioned.',
    timestamp: '2026-09-08T18:42:00Z',
    action: 'Sanction WO',
  },
  {
    id: 'alt-2',
    level: 'warning',
    title: 'Bridge Expansion Joint Settlement on MDR-42',
    location: 'Nashik – Trimbakeshwar Link (Km 18+600)',
    description: 'Hydro-demolition crew deployed by Dilip Buildcon for rubberized seal infill. Speed limit reduced to 30 km/h.',
    timestamp: '2026-09-08T16:15:00Z',
    action: 'Track Progress',
  },
  {
    id: 'alt-3',
    level: 'info',
    title: 'Post-Repair Quality Audit Certified on ODR-08',
    location: 'Barabanki – Fatehpur Agri Corridor',
    description: 'Hot-mix bituminous patch achieved 98.4% compaction density (IRC-111 standard passed). Full traffic released.',
    timestamp: '2026-09-08T12:30:00Z',
    action: 'View Audit',
  },
];

const levelConfig = {
  critical: {
    iconBg: 'bg-red-100 text-red-600 border border-red-200',
    leftBorder: 'border-l-red-500',
    icon: AlertOctagon,
    actionColor: 'text-red-600',
  },
  warning: {
    iconBg: 'bg-amber-100 text-amber-600 border border-amber-200',
    leftBorder: 'border-l-amber-500',
    icon: AlertTriangle,
    actionColor: 'text-amber-600',
  },
  info: {
    iconBg: 'bg-brand-100 text-brand-600 border border-brand-200',
    leftBorder: 'border-l-brand-500',
    icon: CheckCircle2,
    actionColor: 'text-brand-600',
  },
};

export function RecentAlertsFeed() {
  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="py-3 px-5">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Bell}>
            Road & Maintenance Alerts
          </CardTitle>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-line flex-1 overflow-y-auto">
        {alerts.map((alert) => {
          const config = levelConfig[alert.level];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={`p-3.5 hover:bg-surface-50 transition-colors space-y-1.5 cursor-pointer group border-l-4 ${config.leftBorder}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${config.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <h5 className="font-bold text-xs text-ink-900 group-hover:text-brand-700 transition-colors leading-tight">
                      {alert.title}
                    </h5>
                    <div className="text-[11px] font-mono text-brand-600 font-semibold">{alert.location}</div>
                    <p className="text-[11px] text-ink-600 leading-snug">{alert.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-ink-400 font-mono pt-1">
                <span>{formatRelativeTime(alert.timestamp)}</span>
                <span className={`${config.actionColor} group-hover:underline flex items-center gap-0.5 font-semibold`}>
                  {alert.action} →
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
