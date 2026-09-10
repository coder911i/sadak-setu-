import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import {
  Wrench,
  Clock,
  UserCheck,
  Play,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pipelineStages = [
  {
    id: 'open',
    title: 'Open',
    subtitle: 'Detected & Triage',
    count: 14,
    budget: 820000,
    color: 'border-line bg-surface-50 text-ink-700',
    icon: Clock,
  },
  {
    id: 'assigned',
    title: 'Assigned',
    subtitle: 'Contractor Selected',
    count: 8,
    budget: 1240000,
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: UserCheck,
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    subtitle: 'Milling & Paving',
    count: 6,
    budget: 1850000,
    color: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: Play,
  },
  {
    id: 'completed',
    title: 'Completed',
    subtitle: 'Pavement Finished',
    count: 5,
    budget: 920000,
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    icon: CheckCircle2,
  },
  {
    id: 'verification_pending',
    title: 'Verification Pending',
    subtitle: 'Post-Audit Scan Queue',
    count: 4,
    budget: 680000,
    color: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    icon: FileCheck2,
  },
  {
    id: 'verified',
    title: 'Verified',
    subtitle: 'IRC-111 Certified',
    count: 22,
    budget: 4100000,
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: ShieldCheck,
  },
];

export function MaintenancePipelineTracker() {
  const navigate = useNavigate();

  return (
    <Card className="border-line bg-white">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Wrench}>
            End-to-End Maintenance &amp; Repair Pipeline
          </CardTitle>
          <button
            onClick={() => navigate('/maintenance')}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            Manage Pipeline &rarr;
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* 6-Stage Stepper Flow */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                onClick={() => navigate('/maintenance')}
                className={`p-3.5 rounded-xl border ${stage.color} hover:border-slate-600 transition-all cursor-pointer space-y-2 flex flex-col justify-between group shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-ink-500 font-bold uppercase">
                    Stage 0{idx + 1}
                  </span>
                  <Icon className="w-4 h-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                </div>

                <div>
                  <h5 className="font-bold text-xs text-ink-900 group-hover:text-brand-700 transition-colors">
                    {stage.title}
                  </h5>
                  <p className="text-[10px] text-ink-500 truncate mt-0.5">{stage.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-line flex items-baseline justify-between font-mono">
                  <span className="text-base font-bold text-ink-900">{stage.count}</span>
                  <span className="text-[10px] text-ink-500">{formatCurrency(stage.budget)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
