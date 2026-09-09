import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { DataTable } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { FilterBar, FilterSelect } from '../ui/FilterBar';
import { Tabs } from '../ui/Tabs';
import { SEVERITY_LEVELS, DEFECT_TYPES } from '../../utils/constants';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import {
  ScanEye,
  AlertTriangle,
  Cpu,
  Eye,
  PlusCircle,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';

export function AIInspectionFeed({
  inspections = [],
  loading = false,
  onSelectDefect,
  onOpenNewInspection,
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredInspections = inspections.filter((i) => {
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && i.defectType !== typeFilter) return false;
    if (
      search &&
      !i.defectType.toLowerCase().includes(search.toLowerCase()) &&
      !i.roadCode.toLowerCase().includes(search.toLowerCase()) &&
      !i.chainage.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      key: 'defectType',
      label: 'Defect Type & Severity',
      render: (val, row) => {
        const sev = SEVERITY_LEVELS[row.severity.toUpperCase()] || SEVERITY_LEVELS.MODERATE;
        return (
          <div className="space-y-1">
            <div className="font-bold text-slate-100 flex items-center gap-2">
              <span>{val}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${sev.badgeClass}`}>
                {row.severity.toUpperCase()}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">{row.dimensions.lengthCm} &times; {row.dimensions.widthCm} &times; {row.dimensions.depthCm} cm</div>
          </div>
        );
      },
    },
    {
      key: 'roadCode',
      label: 'Corridor & Chainage',
      render: (val, row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-brand-400">{val}</span>
          <div className="text-slate-300 font-mono text-[11px]">{row.chainage}</div>
          <div className="text-[10px] text-slate-500">{row.lane}</div>
        </div>
      ),
    },
    {
      key: 'confidenceScore',
      label: 'AI Inference',
      width: '140px',
      render: (val, row) => (
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
            <Cpu className="w-3 h-3" /> {val}%
          </span>
          <div className="text-[10px] text-slate-400 truncate">{row.source}</div>
        </div>
      ),
    },
    {
      key: 'riskScore',
      label: 'Collision Risk',
      width: '110px',
      render: (val) => (
        <div className="font-mono font-bold text-xs text-rose-400">
          {val}/100 Risk
        </div>
      ),
    },
    {
      key: 'detectedAt',
      label: 'Detected',
      width: '120px',
      render: (val) => (
        <div className="text-slate-400 text-xs">
          <div>{formatRelativeTime(val)}</div>
          <div className="text-[10px] text-slate-500 font-mono">{formatDate(val)}</div>
        </div>
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
            onSelectDefect(row);
          }}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Filter defects, highway, chainage..."
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FilterBar>
            <FilterSelect
              label="Severity"
              value={severityFilter}
              onChange={setSeverityFilter}
              options={[
                { value: 'all', label: 'All Severities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'low', label: 'Low' },
              ]}
            />

            <FilterSelect
              label="Distress Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                ...Object.values(DEFECT_TYPES).map((t) => ({ value: t, label: t })),
              ]}
            />
          </FilterBar>

          <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-850">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={onOpenNewInspection}
          >
            Deploy Scan
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInspections.map((defect) => {
            const sev = SEVERITY_LEVELS[defect.severity.toUpperCase()] || SEVERITY_LEVELS.MODERATE;
            const isCritical = defect.severity === 'critical';

            return (
              <div
                key={defect.id}
                onClick={() => onSelectDefect(defect)}
                className="rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col group"
              >
                {/* Simulated Thumbnail */}
                <div className="relative aspect-[16/9] bg-slate-950 border-b border-slate-800 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30" />
                  
                  {/* Bounding box marker */}
                  <div
                    className="absolute border-2 border-rose-500 bg-rose-500/20 rounded flex items-center justify-center"
                    style={{
                      left: `${defect.boundingBox?.x || 35}%`,
                      top: `${defect.boundingBox?.y || 45}%`,
                      width: `${defect.boundingBox?.width || 30}%`,
                      height: `${defect.boundingBox?.height || 30}%`,
                    }}
                  >
                    <span className="text-[9px] font-mono font-bold text-white bg-rose-600 px-1 rounded -mt-6">
                      {defect.confidenceScore}%
                    </span>
                  </div>

                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-750 font-mono text-[10px] text-brand-300">
                    {defect.roadCode} ({defect.chainage})
                  </div>

                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold border ${sev.badgeClass}`}>
                    {defect.severity.toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-brand-300 transition-colors">
                      {defect.defectType}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{defect.notes}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span>Depth: <strong>{defect.dimensions.depthCm} cm</strong></span>
                      <span className="text-rose-400 font-bold">{defect.riskScore}/100 Risk</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{formatRelativeTime(defect.detectedAt)}</span>
                      <span className="text-brand-400 group-hover:underline">Inspect Telemetry &rarr;</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <DataTable
          columns={columns}
          data={filteredInspections}
          loading={loading}
          onRowClick={(row) => onSelectDefect(row)}
        />
      )}
    </div>
  );
}
