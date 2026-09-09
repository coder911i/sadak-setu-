import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../ui/DataTable';
import { Button } from '../ui/Button';
import { HealthScoreBadge } from './HealthScoreBadge';
import { PriorityBadge } from './PriorityBadge';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { MapPin, Eye, ArrowRight } from 'lucide-react';

export function RoadTable({ roads = [], loading = false }) {
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

  const columns = [
    {
      key: 'code',
      label: 'Road ID',
      width: '130px',
      render: (val, row) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-brand-400 text-xs">{val}</div>
          <div className="text-[10px] text-slate-500 font-mono truncate">{row.category}</div>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Road Name & Span',
      render: (val, row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-100">{val}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            {row.totalLengthKm} KM &bull; {row.lanes} Lanes ({row.surfaceType})
          </div>
        </div>
      ),
    },
    {
      key: 'district',
      label: 'District',
      width: '150px',
      render: (val, row) => (
        <div className="text-xs text-slate-300">
          <div className="font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-500" /> {val}
          </div>
          <div className="text-[10px] text-slate-500">{row.state}</div>
        </div>
      ),
    },
    {
      key: 'healthScore',
      label: 'Health Score',
      width: '150px',
      render: (val, row) => (
        <HealthScoreBadge score={val || row.pciScore} size="sm" showBar={true} />
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '120px',
      render: (val) => <PriorityBadge priority={val} />,
    },
    {
      key: 'damageCount',
      label: 'Damage Count',
      width: '130px',
      render: (val, row) => (
        <div className="space-y-0.5">
          <span className={`font-mono font-bold text-xs ${val > 10 ? 'text-rose-400' : 'text-slate-200'}`}>
            {val || 0} Defects
          </span>
          <div className="text-[10px] text-slate-500 font-mono">
            {row.potholesCount || 0} Pot &bull; {row.cracksCount || 0} Crk
          </div>
        </div>
      ),
    },
    {
      key: 'latestInspection',
      label: 'Last Inspection',
      width: '130px',
      render: (val, row) => {
        const timeVal = val || row.lastInspected;
        return (
          <div className="text-xs text-slate-300">
            <div>{formatRelativeTime(timeVal)}</div>
            <div className="text-[10px] text-slate-500 font-mono">{formatDate(timeVal)}</div>
          </div>
        );
      },
    },
    {
      key: 'currentStatus',
      label: 'Current Status',
      width: '140px',
      render: (_, row) => {
        const statusMeta = getStatusBadge(row.priority);
        return (
          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusMeta.color}`}>
            {statusMeta.label}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'View Details',
      width: '110px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="xs"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/roads/${row.id}`);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={roads}
      loading={loading}
      onRowClick={(row) => navigate(`/roads/${row.id}`)}
    />
  );
}
