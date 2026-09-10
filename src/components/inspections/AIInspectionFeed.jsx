import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { DataTable } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { FilterBar, FilterSelect } from '../ui/FilterBar';
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
        const isCritical = row.severity === 'critical';
        const isHigh = row.severity === 'high';
        return (
          <div className="space-y-1">
            <div className="font-bold text-[#123320] flex items-center gap-2">
              <span>{val}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                  isCritical
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : isHigh
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {row.severity.toUpperCase()}
              </span>
            </div>
            <div className="text-[11px] text-[#728a79]">
              {row.dimensions.lengthCm} &times; {row.dimensions.widthCm} &times; {row.dimensions.depthCm} cm
            </div>
          </div>
        );
      },
    },
    {
      key: 'roadCode',
      label: 'Corridor & Chainage',
      render: (val, row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-brand-800">{val}</span>
          <div className="text-[#123320] font-mono text-[11px]">{row.chainage}</div>
          <div className="text-[10px] text-[#728a79]">{row.lane}</div>
        </div>
      ),
    },
    {
      key: 'confidenceScore',
      label: 'AI Inference',
      width: '140px',
      render: (val, row) => (
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-brand-700 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-brand-600" /> {val}%
          </span>
          <div className="text-[10px] text-[#728a79] truncate">{row.source}</div>
        </div>
      ),
    },
    {
      key: 'riskScore',
      label: 'Risk Index',
      width: '110px',
      render: (val) => (
        <div className="font-mono font-bold text-xs text-red-600">
          {val}/100 Risk
        </div>
      ),
    },
    {
      key: 'detectedAt',
      label: 'Detected',
      width: '120px',
      render: (val) => (
        <div className="text-[#3b5e47] text-xs">
          <div>{formatRelativeTime(val)}</div>
          <div className="text-[10px] text-[#728a79] font-mono">{formatDate(val)}</div>
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

          <div className="flex items-center p-1 bg-white rounded-xl border border-[#e2ebe4] shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-brand-700 text-white' : 'text-[#728a79] hover:text-[#123320]'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-brand-700 text-white' : 'text-[#728a79] hover:text-[#123320]'
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
            const isCritical = defect.severity === 'critical';
            const isHigh = defect.severity === 'high';

            return (
              <div
                key={defect.id}
                onClick={() => onSelectDefect(defect)}
                className="rounded-2xl bg-white border border-[#e2ebe4] hover:border-brand-400 hover:shadow-card-hover transition-all cursor-pointer overflow-hidden flex flex-col group shadow-card"
              >
                {/* Simulated Thumbnail */}
                <div className="relative aspect-[16/9] bg-[#16271c] border-b border-[#e2ebe4] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-[#1c2e22]/90 to-[#253f2f]/80" />
                  
                  {/* Bounding box marker */}
                  <div
                    className="absolute border-2 border-red-500 bg-red-500/25 rounded flex items-center justify-center"
                    style={{
                      left: `${defect.boundingBox?.x || 35}%`,
                      top: `${defect.boundingBox?.y || 45}%`,
                      width: `${defect.boundingBox?.width || 30}%`,
                      height: `${defect.boundingBox?.height || 30}%`,
                    }}
                  >
                    <span className="text-[9px] font-mono font-bold text-white bg-red-600 px-1 rounded -mt-6">
                      {defect.confidenceScore}%
                    </span>
                  </div>

                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 font-mono text-[10px] text-white">
                    {defect.roadCode} ({defect.chainage})
                  </div>

                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isCritical
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : isHigh
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {defect.severity.toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#123320] group-hover:text-brand-700 transition-colors">
                      {defect.defectType}
                    </h4>
                    <p className="text-xs text-[#3b5e47] mt-1 line-clamp-2">{defect.notes}</p>
                  </div>

                  <div className="pt-2 border-t border-[#e2ebe4] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#123320]">
                      <span>Depth: <strong>{defect.dimensions.depthCm} cm</strong></span>
                      <span className="text-red-600 font-bold">{defect.riskScore}/100 Risk</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#728a79] font-mono">
                      <span>{formatRelativeTime(defect.detectedAt)}</span>
                      <span className="text-brand-700 font-bold group-hover:underline flex items-center gap-0.5">
                        Inspect Telemetry &rarr;
                      </span>
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
