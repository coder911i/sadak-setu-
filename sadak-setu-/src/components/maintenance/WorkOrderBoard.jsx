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
} from 'lucide-react';

export function WorkOrderBoard({
  workOrders = [],
  loading = false,
  onOpenNewOrder,
  onUpdateStatus,
}) {
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'table'
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = workOrders.filter((wo) => {
    if (priorityFilter !== 'all' && wo.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && wo.status !== statusFilter) return false;
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
          <span className="font-mono font-bold text-brand-600 text-xs">{val}</span>
          <div className="font-mono text-[10px] text-ink-500">{row.roadCode}</div>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Scope & Chainage Section',
      render: (val, row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-ink-900">{val}</div>
          <div className="text-[11px] text-ink-500 font-mono">{row.chainageRange}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '110px',
      render: (val) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            val === 'CRITICAL'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : val === 'HIGH'
              ? 'bg-orange-50 text-orange-700 border-orange-200'
              : 'bg-surface-100 text-ink-700 border-line'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '150px',
      render: (val) => {
        const meta = WORK_ORDER_STATUSES[val.toUpperCase()] || { label: val, color: 'bg-surface-100 text-ink-700' };
        return (
          <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${meta.color}`}>
            {meta.label}
          </span>
        );
      },
    },
    {
      key: 'progressPercentage',
      label: 'Execution Progress',
      width: '160px',
      render: (val, row) => (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-ink-500 truncate max-w-[100px]">{row.contractorName}</span>
            <span className="text-ink-900 font-bold">{val}%</span>
          </div>
          <ProgressBar value={val} size="xs" color={val >= 100 ? 'emerald' : 'brand'} />
        </div>
      ),
    },
    {
      key: 'sanctionedBudget',
      label: 'Sanctioned Budget',
      width: '130px',
      render: (val) => (
        <div className="font-mono text-xs font-bold text-ink-900">
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
              Verify Close
            </Button>
          )}
          {row.status === 'verified_closed' && (
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Certified
            </span>
          )}
        </div>
      ),
    },
  ];

  const kanbanColumns = [
    { id: 'triage', label: 'In Triage / Review', color: 'border-line' },
    { id: 'budget_approved', label: 'Sanctioned & Ready', color: 'border-blue-200' },
    { id: 'in_progress', label: 'Under Execution (In Progress)', color: 'border-amber-200' },
    { id: 'audit_ready', label: 'Quality Audit Queue', color: 'border-purple-200' },
    { id: 'verified_closed', label: 'Completed & Certified', color: 'border-emerald-200' },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search order ID, highway, contractor..."
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FilterBar>
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

            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Stages' },
                ...Object.entries(WORK_ORDER_STATUSES).map(([_, v]) => ({ value: v.value, label: v.label })),
              ]}
            />
          </FilterBar>

          <div className="flex items-center p-1 bg-surface-50 rounded-xl border border-line">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'board' ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-900'
              }`}
              aria-label="Kanban view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-900'
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
                className="bg-surface-50 border border-line rounded-xl flex flex-col min-h-[480px] overflow-hidden"
              >
                {/* Column Header */}
                <div className={`px-3.5 py-3 border-b border-line bg-white flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink-900">{col.label}</span>
                    <span className="w-5 h-5 rounded-full bg-surface-100 text-ink-700 font-mono text-[10px] font-bold flex items-center justify-center">
                      {colOrders.length}
                    </span>
                  </div>
                </div>

                {/* Card list */}
                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[600px]">
                  {colOrders.map((wo) => {
                    const isCritical = wo.priority === 'CRITICAL';

                    return (
                      <div
                        key={wo.id}
                        className="p-3 rounded-xl bg-white border border-line hover:border-line transition-all space-y-2.5 shadow-sm group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-brand-600">{wo.id}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              isCritical
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-surface-100 text-ink-700 border-line'
                            }`}
                          >
                            {wo.priority}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-ink-900 group-hover:text-brand-700 transition-colors">
                            {wo.title}
                          </div>
                          <div className="text-[11px] text-ink-500 font-mono mt-0.5">
                            {wo.roadCode} ({wo.chainageRange})
                          </div>
                        </div>

                        <div className="space-y-1 pt-1 border-t border-line">
                          <div className="flex justify-between text-[10px] text-ink-500">
                            <span className="truncate max-w-[120px]">{wo.contractorName}</span>
                            <span className="font-mono text-ink-900 font-bold">{wo.progressPercentage}%</span>
                          </div>
                          <ProgressBar
                            value={wo.progressPercentage}
                            size="xs"
                            color={wo.progressPercentage >= 100 ? 'emerald' : isCritical ? 'rose' : 'brand'}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-ink-500 pt-1">
                          <span>{formatCurrency(wo.sanctionedBudget)}</span>
                          <span className="text-amber-600">{wo.slaRemainingHours}h SLA</span>
                        </div>

                        {/* Quick progression buttons */}
                        <div className="pt-2 border-t border-line flex items-center justify-end gap-1">
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
                    <div className="py-12 text-center text-ink-400 text-xs">
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
