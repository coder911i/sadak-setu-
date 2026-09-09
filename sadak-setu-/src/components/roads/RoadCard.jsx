import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthScoreBadge } from './HealthScoreBadge';
import { PriorityBadge } from './PriorityBadge';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import {
  MapPin,
  Route,
  Activity,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export function RoadCard({ road }) {
  const navigate = useNavigate();

  const getStatusBadge = (priority) => {
    if (priority === 'Immediate') {
      return {
        label: 'Critical Alert',
        color: 'bg-rose-950/80 text-rose-300 border-rose-800',
      };
    }
    if (priority === 'High') {
      return {
        label: 'Under Maintenance',
        color: 'bg-amber-950/80 text-amber-300 border-amber-800',
      };
    }
    return {
      label: 'Normal / Stable',
      color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    };
  };

  const statusMeta = getStatusBadge(road.priority);

  const handleCardClick = () => {
    navigate(`/roads/${road.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-3.5"
    >
      {/* Top Header: Road ID, Category, Priority */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-400 font-mono font-bold text-xs">
              {road.code}
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate">
              {road.category || 'Rural Corridor'}
            </span>
          </div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-brand-300 transition-colors truncate">
            {road.name}
          </h3>
        </div>

        <PriorityBadge priority={road.priority} />
      </div>

      {/* District & Location */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <span className="truncate">{road.district}, {road.state}</span>
        <span className="text-slate-600">&bull;</span>
        <span className="font-mono text-slate-300">{road.totalLengthKm} KM ({road.lanes}L)</span>
      </div>

      {/* Metric Grid: Health Score & Damage Count */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-400 block font-mono">Health Score</span>
          <HealthScoreBadge score={road.healthScore || road.pciScore} size="sm" showBar={true} />
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-mono">Damage Count</span>
          <div className="text-sm font-extrabold font-mono mt-0.5">
            <span className={road.damageCount > 10 ? 'text-rose-400' : 'text-slate-200'}>
              {road.damageCount || 0}
            </span>
            <span className="text-[10px] text-slate-400 font-normal ml-1">Defects</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {road.potholesCount || 0} Potholes &bull; {road.cracksCount || 0} Cracks
          </span>
        </div>
      </div>

      {/* Bottom Footer: Last Inspection & Status & View Details */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 block">Last Inspected:</span>
          <span className="text-[11px] font-mono text-slate-300">
            {formatRelativeTime(road.latestInspection || road.lastInspected)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
            {statusMeta.label}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
