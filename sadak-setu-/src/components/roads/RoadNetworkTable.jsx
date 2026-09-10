import React, { useState } from 'react';
import { DataTable } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { FilterBar, FilterSelect } from '../ui/FilterBar';
import { getPCIRating, formatDate } from '../../utils/formatters';
import { ROAD_DIVISIONS } from '../../utils/constants';
import { Eye, MapPin, Activity, AlertTriangle, ArrowUpDown } from 'lucide-react';

export function RoadNetworkTable({ roads = [], loading = false, onSelectRoad }) {
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [sortKey, setSortKey] = useState('pciScore');
  const [sortOrder, setSortOrder] = useState('asc'); // lowest PCI first for triage

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredRoads = roads
    .filter((r) => {
      if (zoneFilter !== 'all' && r.zone !== zoneFilter) return false;
      if (
        search &&
        !r.code.toLowerCase().includes(search.toLowerCase()) &&
        !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !r.state.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const columns = [
    {
      key: 'code',
      label: 'Highway Code',
      width: '130px',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-600 font-mono font-bold text-xs">
            {val}
          </div>
          <div className="font-mono font-bold text-ink-900">{val}</div>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Corridor Section & State',
      render: (val, row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-ink-900">{val}</div>
          <div className="text-[11px] text-ink-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-ink-400 flex-shrink-0" />
            <span>{row.state}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'totalLengthKm',
      label: 'Length / Lanes',
      width: '130px',
      render: (val, row) => (
        <div className="font-mono text-xs">
          <span className="text-ink-900 font-bold">{val} KM</span>
          <span className="text-ink-500 ml-1 text-[11px]">({row.lanes}L)</span>
        </div>
      ),
    },
    {
      key: 'pciScore',
      label: 'Pavement Index (PCI)',
      width: '170px',
      render: (val) => {
        const meta = getPCIRating(val);
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${meta.badgeClass}`}>
                PCI: {val}/100
              </span>
              <span className="text-[10px] text-ink-500 font-medium">{meta.grade} Grade</span>
            </div>
            <div className="h-1.5 w-full bg-surface-100 rounded-full overflow-hidden">
              <div className={`h-full ${meta.barColor}`} style={{ width: `${val}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'iriScore',
      label: 'Roughness (IRI)',
      width: '110px',
      render: (val) => (
        <div className="font-mono text-xs text-ink-700">
          <span className="font-semibold">{val}</span> <span className="text-ink-400 text-[10px]">m/km</span>
        </div>
      ),
    },
    {
      key: 'activeDefectsCount',
      label: 'Active Hazards',
      width: '120px',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`font-mono font-bold text-xs ${
              row.criticalDefectsCount > 0 ? 'text-rose-600' : val > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {val} Spots
          </span>
          {row.criticalDefectsCount > 0 && (
            <span className="text-[10px] px-1 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
              {row.criticalDefectsCount} Crit
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'contractor',
      label: 'Assigned Contractor',
      render: (val) => (
        <span className="text-ink-700 text-xs truncate max-w-[180px] block">{val}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '90px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="xs"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            onSelectRoad(row);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search NH/SH code, highway name, state..."
          />
        </div>

        <FilterBar>
          <FilterSelect
            label="Zone"
            value={zoneFilter}
            onChange={setZoneFilter}
            options={ROAD_DIVISIONS.map((d) => ({ value: d.id, label: d.name }))}
          />

          <Button
            variant="outline"
            size="xs"
            icon={ArrowUpDown}
            onClick={() => handleSort('pciScore')}
          >
            Sort by PCI ({sortOrder === 'asc' ? 'Lowest First' : 'Highest First'})
          </Button>
        </FilterBar>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredRoads}
        loading={loading}
        onRowClick={(row) => onSelectRoad(row)}
      />
    </div>
  );
}
