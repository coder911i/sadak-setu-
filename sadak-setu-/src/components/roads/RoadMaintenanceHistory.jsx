import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Wrench, Clock, CheckCircle2, AlertOctagon, UserCheck, Play, FileCheck2, ShieldCheck } from 'lucide-react';

export function RoadMaintenanceHistory({ road, workOrders = [], onOpenNewOrder }) {
  const pipelineSteps = [
    { key: 'open', label: 'Open' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'verification_pending', label: 'Verification Pending' },
    { key: 'verified', label: 'Verified / Requires Repair' },
  ];

  return (
    <Card className="bg-white border-line">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Wrench}>
            Maintenance Pipeline &amp; Work Order History
          </CardTitle>
          <Button variant="outline" size="xs" onClick={onOpenNewOrder}>
            + Issue Work Order
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-5">
        {/* Visual 6-Stage Stepper */}
        <div className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-2">
          <div className="text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider">
            Lifecycle Workflow Stages
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
            {pipelineSteps.map((step, idx) => (
              <div
                key={step.key}
                className="p-2 rounded-lg bg-white border border-line font-mono text-[11px] font-semibold text-ink-700 flex items-center justify-center gap-1.5"
              >
                <span className="w-4 h-4 rounded-full bg-surface-100 text-[10px] flex items-center justify-center font-bold text-brand-600">
                  {idx + 1}
                </span>
                <span className="truncate">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Work Order Cards */}
        <div className="space-y-3">
          {workOrders.map((wo) => (
            <div
              key={wo.id}
              className="p-3.5 rounded-xl bg-surface-50 border border-line space-y-2.5 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-600">{wo.id}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      {wo.priority}
                    </span>
                  </div>
                  <h5 className="font-bold text-ink-900 text-xs mt-0.5">{wo.title}</h5>
                  <div className="text-[11px] text-ink-500 font-mono">{wo.chainageRange}</div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-ink-900">{formatCurrency(wo.sanctionedBudget)}</span>
                  <div className="text-[10px] text-amber-600">{wo.slaRemainingHours}h SLA remaining</div>
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-line">
                <div className="flex justify-between text-[11px] text-ink-500 font-mono">
                  <span>Contractor: <strong className="text-ink-900">{wo.contractorName}</strong></span>
                  <span>{wo.progressPercentage}% Complete</span>
                </div>
                <ProgressBar value={wo.progressPercentage} size="xs" color="brand" />
              </div>
            </div>
          ))}

          {workOrders.length === 0 && (
            <div className="p-8 text-center text-ink-500 text-xs">
              No active work orders currently scheduled for this road.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
