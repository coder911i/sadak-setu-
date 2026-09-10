import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { DataTable } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { FilterBar, FilterSelect } from '../ui/FilterBar';
import { formatDate } from '../../utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Eye,
  Sliders,
  Check,
  XCircle,
  Building2,
} from 'lucide-react';

export function QualityAuditList({
  audits = [],
  loading = false,
  onSelectAudit,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAudits = audits.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (
      search &&
      !a.title.toLowerCase().includes(search.toLowerCase()) &&
      !a.roadCode.toLowerCase().includes(search.toLowerCase()) &&
      !a.contractorName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      key: 'title',
      label: 'Audit Assessment & Corridor',
      render: (val, row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-[#123320]">{val}</div>
          <div className="text-[11px] text-[#728a79] font-mono">
            {row.roadCode} ({row.chainage}) &bull; {row.workOrderId}
          </div>
        </div>
      ),
    },
    {
      key: 'contractorName',
      label: 'Contractor Agency',
      render: (val) => (
        <span className="text-[#3b5e47] text-xs font-semibold flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-brand-600" />
          <span>{val}</span>
        </span>
      ),
    },
    {
      key: 'overallAiScore',
      label: 'AI Quality Score',
      width: '160px',
      render: (val, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold ${
                val >= 90 ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {val}/100 Grade
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                row.status === 'passed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {row.status === 'passed' ? 'PASSED' : 'REWORK'}
            </span>
          </div>
          <div className="text-[10px] text-[#728a79] font-mono">
            Compaction: {row.metrics.compactionDensity}%
          </div>
        </div>
      ),
    },
    {
      key: 'auditorName',
      label: 'Quality Inspector',
      render: (val) => <span className="text-[#3b5e47] text-xs truncate max-w-[200px] block">{val}</span>,
    },
    {
      key: 'auditDate',
      label: 'Audit Timestamp',
      width: '130px',
      render: (val) => (
        <span className="text-[#728a79] font-mono text-xs">{formatDate(val)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Comparison',
      width: '130px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="xs"
          icon={Sliders}
          onClick={(e) => {
            e.stopPropagation();
            onSelectAudit(row);
          }}
        >
          Before / After
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top search & filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search audit, contractor, corridor..."
          />
        </div>

        <FilterBar>
          <FilterSelect
            label="Audit Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Audits' },
              { value: 'passed', label: 'Passed & Certified' },
              { value: 'rework_required', label: 'Rework Required' },
            ]}
          />
        </FilterBar>
      </div>

      {/* Audits Table */}
      <Card className="bg-white border-[#e2ebe4] shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredAudits}
          loading={loading}
          onRowClick={(row) => onSelectAudit(row)}
        />
      </Card>
    </div>
  );
}
