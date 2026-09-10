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
        color: 'bg-red-50 text-red-700 border-red-200',
      };
    }
    if (priority === 'High') {
      return {
        label: 'Under Maintenance',
        color: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return {
      label: 'Normal / Stable',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  };

  const statusMeta = getStatusBadge(road.priority);

  const handleCardClick = () => {
    navigate(`/roads/${road.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="p-5 rounded-3xl bg-white border border-[#e2ebe4] hover:border-brand-400 hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4 shadow-card"
    >
      {/* Top Header: Road ID, Category, Priority */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-brand-50 border border-brand-200 text-brand-800 font-mono font-bold text-xs">
              {road.code}
            </span>
            <span className="text-[10px] text-[#728a79] font-mono truncate">
              {road.category || 'Rural Corridor'}
            </span>
          </div>
          <h3 className="font-bold text-sm text-[#123320] group-hover:text-brand-700 transition-colors truncate">
            {road.name}
          </h3>
        </div>

        <PriorityBadge priority={road.priority} />
      </div>

      {/* District & Location */}
      <div className="flex items-center gap-1.5 text-xs text-[#3b5e47]">
        <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
        <span className="truncate">{road.district}, {road.state}</span>
        <span className="text-[#8a9c8f]">&bull;</span>
        <span className="font-mono text-[#728a79]">{road.totalLengthKm} KM ({road.lanes}L)</span>
      </div>

      {/* Metric Grid: Health Score & Damage Count */}
      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#f8faf8] border border-[#e2ebe4]">
        <div>
          <span className="text-[10px] text-[#728a79] block font-mono font-bold">Health Score</span>
          <HealthScoreBadge score={road.healthScore || road.pciScore} size="sm" showBar={true} />
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#728a79] block font-mono font-bold">Damage Count</span>
          <div className="text-sm font-black font-mono mt-0.5">
            <span className={road.damageCount > 10 ? 'text-red-600' : 'text-[#123320]'}>
              {road.damageCount || 0}
            </span>
            <span className="text-[10px] text-[#728a79] font-normal ml-1">Defects</span>
          </div>
          <span className="text-[10px] text-[#728a79]">
            {road.potholesCount || 0} Potholes &bull; {road.cracksCount || 0} Cracks
          </span>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pt-2 border-t border-[#edf3ee] flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] text-[#728a79] block">Last Inspected:</span>
          <span className="text-[11px] font-mono text-[#123320] font-semibold">
            {formatRelativeTime(road.latestInspection || road.lastInspected)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
            {statusMeta.label}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="p-1.5 rounded-xl bg-surface-100 hover:bg-brand-50 text-[#728a79] hover:text-brand-700 transition-colors flex items-center gap-1 text-[11px] font-semibold border border-[#e2ebe4]"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
