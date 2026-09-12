import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { DataTable } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { FilterBar, FilterSelect } from '../ui/FilterBar';
import { formatDate, formatRelativeTime, getPCIRating } from '../../utils/formatters';
import { ScanEye, AlertOctagon, AlertTriangle, ShieldCheck, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RecentInspectionsTable({ roads = [], onSelectRoad }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Realistic inspection records derived from mock roads
  const inspectionRows = roads.map((r, idx) => ({
    id: `insp-row-${r.id}`,
    roadId: r.id,
    roadCode: r.code,
    roadName: r.name,
    category: r.category,
    district: `${r.district}, ${r.state}`,
    date: r.latestInspection,
    damageDetected: `${r.potholesCount} Potholes, ${r.cracksCount} Cracks${r.otherDamageCount > 0 ? `, ${r.otherDamageCount} Other` : ''}`,
    healthScore: r.healthScore,
    priority: r.priority,
    status: r.priority === 'Immediate' ? 'Work Order Assigned' : r.priority === 'High' ? 'Under Review' : 'Monitoring Active',
    statusClass: r.priority === 'Immediate' ? 'bg-blue-100 text-blue-700 border-blue-200' : r.priority === 'High' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200',
    rawRoad: r,
  }));

  const filteredData = inspectionRows.filter((row) => {
    if (priorityFilter !== 'all' && row.priority !== priorityFilter) return false;
    if (
      search &&
      !row.roadCode.toLowerCase().includes(search.toLowerCase()) &&
      !row.roadName.toLowerCase().includes(search.toLowerCase()) &&
      !row.district.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      key: 'roadCode',
      label: 'Road & Corridor',
      render: (val, row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-brand-600 text-xs">{val}</span>
            <span className="text-[10px] text-ink-400 font-mono">({row.category})</span>
          </div>
          <div className="font-semibold text-ink-900">{row.roadName}</div>
          <div className="text-[11px] text-ink-400">{row.district}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Inspection Date',
      width: '140px',
      render: (val) => (
        <div className="text-xs text-ink-600">
          <div>{formatRelativeTime(val)}</div>
          <div className="text-[10px] text-ink-400 font-mono">{formatDate(val)}</div>
        </div>
      ),
    },
    {
      key: 'damageDetected',
      label: 'Damage Detected',
      render: (val, row) => (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-ink-900 block">{val}</span>
          <span className="text-[10px] font-mono text-ink-400">Total: {row.rawRoad.damageCount} Distress Spots</span>
        </div>
      ),
    },
    {
      key: 'healthScore',
      label: 'Health Score',
      width: '150px',
      render: (val) => {
        const meta = getPCIRating(val);
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${meta.badgeClass}`}>
                {val} / 100
              </span>
              <span className="text-[10px] text-ink-500 font-medium">{meta.grade}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-100 rounded-full overflow-hidden">
              <div className={`h-full ${meta.barColor}`} style={{ width: `${val}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '120px',
      render: (val) => (
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase font-mono ${
            val === 'Immediate'
              ? 'bg-red-100 text-red-700 border-red-200'
              : val === 'High'
              ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-green-100 text-green-700 border-green-200'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Pipeline Status',
      width: '160px',
      render: (val, row) => (
        <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${row.statusClass}`}>
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      width: '90px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="xs"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectRoad) onSelectRoad(row.rawRoad);
            else navigate('/roads');
          }}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <CardTitle icon={ScanEye}>
            Recent AI Road Inspections &amp; Health Registry
          </CardTitle>

          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search road, code, district..."
              className="w-48 sm:w-60"
            />

            <FilterSelect
              label="Priority"
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'Immediate', label: 'Immediate Action' },
                { value: 'High', label: 'High Priority' },
                { value: 'Monitor', label: 'Monitor' },
              ]}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row) => onSelectRoad && onSelectRoad(row.rawRoad)}
        />
      </CardContent>
    </Card>
  );
}
