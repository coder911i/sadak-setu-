import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Wrench, Clock, CheckCircle2, AlertOctagon, UserCheck, Play, FileCheck2, ShieldCheck, Building2 } from 'lucide-react';

export function RoadMaintenanceHistory({ road, workOrders = [], onOpenNewOrder }) {
  const pipelineSteps = [
    { key: 'open', label: 'Open' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'verification_pending', label: 'Audit Pending' },
    { key: 'verified', label: 'IRC Certified' },
  ];

  return (
    <Card className="bg-white border-[#e2ebe4] shadow-card">
      <CardHeader className="py-3.5 px-5">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Wrench}>
            Maintenance Pipeline &amp; Work Order History
          </CardTitle>
          <Button variant="outline" size="xs" onClick={onOpenNewOrder}>
            + Issue Work Order
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Visual 6-Stage Stepper */}
        <div className="p-3.5 rounded-2xl bg-surface-50 border border-[#e2ebe4] space-y-2">
          <div className="text-[10px] font-mono text-[#728a79] font-bold uppercase tracking-wider">
            Lifecycle Workflow Stages
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
            {pipelineSteps.map((step, idx) => (
              <div
                key={step.key}
                className="p-2 rounded-xl bg-white border border-[#e2ebe4] font-mono text-[11px] font-semibold text-[#123320] flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span className="w-4 h-4 rounded-full bg-brand-50 text-[10px] flex items-center justify-center font-bold text-brand-700">
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
              className="p-4 rounded-2xl bg-white border border-[#e2ebe4] space-y-2.5 text-xs shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-800">{wo.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-red-50 text-red-700 border border-red-200">
                      {wo.priority}
                    </span>
                  </div>
                  <h5 className="font-bold text-[#123320] text-xs mt-0.5">{wo.title}</h5>
                  <div className="text-[11px] text-[#728a79] font-mono">{wo.chainageRange}</div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-[#123320]">{formatCurrency(wo.sanctionedBudget)}</span>
                  <div className="text-[10px] text-amber-800 font-semibold">{wo.slaRemainingHours}h SLA remaining</div>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#edf3ee]">
                <div className="flex justify-between text-[11px] text-[#3b5e47] font-mono">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-brand-600" />
                    <strong>{wo.contractorName}</strong>
                  </span>
                  <span className="font-bold text-[#123320]">{wo.progressPercentage}% Complete</span>
                </div>
                <ProgressBar value={wo.progressPercentage} size="xs" color="brand" />
              </div>
            </div>
          ))}

          {workOrders.length === 0 && (
            <div className="p-8 text-center text-[#728a79] text-xs font-medium">
              No active work orders currently scheduled for this corridor.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
