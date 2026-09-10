import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { DataTable } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { SearchInput } from '../ui/SearchInput';
import { FilterBar, FilterSelect } from '../ui/FilterBar';
import { WORK_ORDER_STATUSES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Wrench,
  Clock,
  Coins,
  HardHat,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  LayoutGrid,
  List,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
} from 'lucide-react';

export function WorkOrderBoard({
  workOrders = [],
  loading = false,
  onOpenNewOrder,
  onUpdateStatus,
}) {
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'table'
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'completed'
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredOrders = workOrders.filter((wo) => {
    if (activeTab === 'active' && (wo.status === 'verified_closed' || wo.status === 'audit_ready')) return false;
    if (activeTab === 'completed' && wo.status !== 'verified_closed' && wo.status !== 'audit_ready') return false;
    if (priorityFilter !== 'all' && wo.priority !== priorityFilter) return false;
    if (
      search &&
      !wo.id.toLowerCase().includes(search.toLowerCase()) &&
      !wo.title.toLowerCase().includes(search.toLowerCase()) &&
      !wo.roadCode.toLowerCase().includes(search.toLowerCase()) &&
      !wo.contractorName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      width: '130px',
      render: (val, row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-brand-800 text-xs">{val}</span>
          <div className="font-mono text-[10px] text-[#728a79]">{row.roadCode}</div>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Scope & Chainage Section',
      render: (val, row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-[#123320]">{val}</div>
          <div className="text-[11px] text-[#728a79] font-mono">{row.chainageRange}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '110px',
      render: (val) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            val === 'CRITICAL'
              ? 'bg-red-50 text-red-700 border-red-200'
              : val === 'HIGH'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'contractorName',
      label: 'Contractor & Division',
      render: (val, row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-[#123320] flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-brand-600" />
            <span>{val}</span>
          </div>
          <div className="text-[10px] text-[#728a79] truncate">{row.assignedDivision}</div>
        </div>
      ),
    },
    {
      key: 'progressPercentage',
      label: 'Progress & SLA',
      width: '160px',
      render: (val, row) => (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-[#728a79]">{row.slaRemainingHours}h SLA</span>
            <span className="text-brand-800 font-bold">{val}%</span>
          </div>
          <div className="h-2 w-full bg-surface-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${val >= 100 ? 'bg-emerald-600' : 'bg-brand-600'}`}
              style={{ width: `${val}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'sanctionedBudget',
      label: 'Sanctioned Budget',
      width: '130px',
      render: (val) => (
        <div className="font-mono text-xs font-bold text-[#123320]">
          {formatCurrency(val)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Update Stage',
      width: '130px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === 'triage' && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => onUpdateStatus(row.id, 'budget_approved')}
            >
              Sanction
            </Button>
          )}
          {row.status === 'budget_approved' && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => onUpdateStatus(row.id, 'in_progress', 30)}
            >
              Start Work
            </Button>
          )}
          {row.status === 'in_progress' && (
            <Button
              variant="warning"
              size="xs"
              onClick={() => onUpdateStatus(row.id, 'audit_ready', 100)}
            >
              Submit Audit
            </Button>
          )}
          {row.status === 'audit_ready' && (
            <Button
              variant="success"
              size="xs"
              onClick={() => onUpdateStatus(row.id, 'verified_closed')}
            >
              Certify
            </Button>
          )}
          {row.status === 'verified_closed' && (
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> IRC Passed
            </span>
          )}
        </div>
      ),
    },
  ];

  const kanbanColumns = [
    { id: 'triage', label: 'Triage / Review', countBadge: 'bg-surface-100 text-[#728a79]' },
    { id: 'budget_approved', label: 'Sanctioned & Ready', countBadge: 'bg-brand-100 text-brand-800' },
    { id: 'in_progress', label: 'Under Execution (In Progress)', countBadge: 'bg-amber-100 text-amber-800' },
    { id: 'audit_ready', label: 'Quality Audit Queue', countBadge: 'bg-purple-100 text-purple-800' },
    { id: 'verified_closed', label: 'Completed & Certified', countBadge: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
        {/* Active Repairs / Completed Repairs Filter Tabs */}
        <div className="flex items-center p-1 bg-white rounded-2xl border border-[#e2ebe4] shadow-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-[#728a79] hover:text-[#123320]'
            }`}
          >
            All Repairs ({workOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-[#728a79] hover:text-[#123320]'
            }`}
          >
            Active Repairs
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-[#728a79] hover:text-[#123320]'
            }`}
          >
            Completed &amp; Certified
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search order ID, contractor..."
            className="w-48 sm:w-60"
          />

          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'CRITICAL', label: 'Critical Only' },
              { value: 'HIGH', label: 'High Priority' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'ROUTINE', label: 'Routine' },
            ]}
          />

          <div className="flex items-center p-1 bg-white rounded-xl border border-[#e2ebe4] shadow-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'board' ? 'bg-brand-700 text-white' : 'text-[#728a79] hover:text-[#123320]'
              }`}
              aria-label="Kanban view"
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
            onClick={onOpenNewOrder}
          >
            Sanction Work Order
          </Button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colOrders = filteredOrders.filter(
              (wo) => wo.status === col.id || (col.id === 'in_progress' && wo.status === 'assigned')
            );

            return (
              <div
                key={col.id}
                className="bg-[#f8faf8] border border-[#e2ebe4] rounded-2xl flex flex-col min-h-[480px] overflow-hidden shadow-xs"
              >
                {/* Column Header */}
                <div className="px-3.5 py-3 border-b border-[#e2ebe4] bg-white flex items-center justify-between">
                  <span className="text-xs font-bold text-[#123320] truncate">{col.label}</span>
                  <span className={`w-5 h-5 rounded-full font-mono text-[10px] font-bold flex items-center justify-center ${col.countBadge}`}>
                    {colOrders.length}
                  </span>
                </div>

                {/* Card list */}
                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[600px]">
                  {colOrders.map((wo) => {
                    const isCritical = wo.priority === 'CRITICAL';

                    return (
                      <div
                        key={wo.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#e2ebe4] hover:border-brand-400 hover:shadow-card-hover transition-all space-y-2.5 shadow-card group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-brand-800">{wo.id}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                              isCritical
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {wo.priority}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#123320] group-hover:text-brand-700 transition-colors leading-tight">
                            {wo.title}
                          </h4>
                          <div className="text-[11px] text-[#728a79] font-mono mt-0.5">
                            {wo.roadCode} ({wo.chainageRange})
                          </div>
                        </div>

                        {/* Contractor info */}
                        <div className="space-y-1.5 pt-1.5 border-t border-[#edf3ee] text-[11px]">
                          <div className="flex items-center gap-1 text-[#123320] font-semibold truncate">
                            <Building2 className="w-3 h-3 text-brand-600 flex-shrink-0" />
                            <span className="truncate">{wo.contractorName}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-[#728a79]">
                              <span>Progress:</span>
                              <strong className="text-[#123320]">{wo.progressPercentage}%</strong>
                            </div>
                            <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${wo.progressPercentage >= 100 ? 'bg-emerald-600' : 'bg-brand-600'}`}
                                style={{ width: `${wo.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-[#728a79] pt-1">
                          <span>{formatCurrency(wo.sanctionedBudget)}</span>
                          <span className="text-amber-800 font-semibold">{wo.slaRemainingHours}h SLA</span>
                        </div>

                        {/* Quick progression actions */}
                        <div className="pt-2 border-t border-[#edf3ee] flex items-center justify-end gap-1">
                          {wo.status === 'triage' && (
                            <Button
                              variant="secondary"
                              size="xs"
                              className="w-full"
                              onClick={() => onUpdateStatus(wo.id, 'budget_approved')}
                            >
                              Sanction Budget &rarr;
                            </Button>
                          )}
                          {wo.status === 'budget_approved' && (
                            <Button
                              variant="primary"
                              size="xs"
                              className="w-full"
                              onClick={() => onUpdateStatus(wo.id, 'in_progress', 30)}
                            >
                              Dispatch Crew &rarr;
                            </Button>
                          )}
                          {wo.status === 'in_progress' && (
                            <Button
                              variant="warning"
                              size="xs"
                              className="w-full"
                              onClick={() => onUpdateStatus(wo.id, 'audit_ready', 100)}
                            >
                              Submit for Audit &rarr;
                            </Button>
                          )}
                          {wo.status === 'audit_ready' && (
                            <Button
                              variant="success"
                              size="xs"
                              className="w-full"
                              onClick={() => onUpdateStatus(wo.id, 'verified_closed')}
                            >
                              Certify Quality &rarr;
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colOrders.length === 0 && (
                    <div className="py-12 text-center text-[#728a79] text-xs font-medium">
                      No orders in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <DataTable
          columns={columns}
          data={filteredOrders}
          loading={loading}
        />
      )}
    </div>
  );
}
