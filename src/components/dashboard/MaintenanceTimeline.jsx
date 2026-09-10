import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { useMaintenance } from '../../hooks/useMaintenance';
import { WORK_ORDER_STATUSES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { Wrench, Clock, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MaintenanceTimeline() {
  const { workOrders } = useMaintenance();
  const navigate = useNavigate();

  const activeOrders = workOrders.slice(0, 4);

  return (
    <Card className="flex flex-col h-full border-slate-800">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Wrench}>
            Maintenance SLA &amp; Execution Queue
          </CardTitle>
          <span className="text-[11px] text-slate-400 font-mono">
            {workOrders.length} Total Orders
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-800/60 flex-1 overflow-y-auto">
        {activeOrders.map((wo) => {
          const statusMeta = WORK_ORDER_STATUSES[wo.status.toUpperCase()] || {
            label: wo.status,
            color: 'bg-slate-800 text-slate-300',
          };

          const isCritical = wo.priority === 'CRITICAL';

          return (
            <div
              key={wo.id}
              onClick={() => navigate('/maintenance')}
              className="p-3.5 hover:bg-slate-800/40 transition-colors space-y-2 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-400">{wo.id}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${
                        isCritical
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {wo.priority}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">({wo.roadCode})</span>
                  </div>
                  <h5 className="text-xs font-semibold text-slate-200 truncate group-hover:text-brand-300 transition-colors">
                    {wo.title}
                  </h5>
                </div>

                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${statusMeta.color}`}
                >
                  {statusMeta.label}
                </span>
              </div>

              {/* Progress and Contractor */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{wo.contractorName}</span>
                  <span className="font-mono text-slate-300">{wo.progressPercentage}%</span>
                </div>
                <ProgressBar
                  value={wo.progressPercentage}
                  size="xs"
                  color={wo.progressPercentage >= 100 ? 'emerald' : isCritical ? 'rose' : 'brand'}
                />
              </div>

              {/* SLA & Budget info */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                <span className="flex items-center gap-1 text-amber-400">
                  <Clock className="w-3 h-3" /> SLA: {wo.slaRemainingHours}h remaining
                </span>
                <span>Budget: {formatCurrency(wo.sanctionedBudget)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="py-2.5 px-4 bg-slate-950/60">
        <Button
          variant="ghost"
          size="xs"
          className="w-full text-slate-400 hover:text-white"
          onClick={() => navigate('/maintenance')}
        >
          Manage Work Order Kanban &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
}
