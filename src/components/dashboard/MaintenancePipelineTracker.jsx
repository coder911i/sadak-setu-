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
    color: 'border-slate-700 bg-slate-950/80 text-slate-300',
    icon: Clock,
  },
  {
    id: 'assigned',
    title: 'Assigned',
    subtitle: 'Contractor Selected',
    count: 8,
    budget: 1240000,
    color: 'border-blue-700 bg-blue-950/30 text-blue-300',
    icon: UserCheck,
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    subtitle: 'Milling & Paving',
    count: 6,
    budget: 1850000,
    color: 'border-amber-700 bg-amber-950/30 text-amber-300',
    icon: Play,
  },
  {
    id: 'completed',
    title: 'Completed',
    subtitle: 'Pavement Finished',
    count: 5,
    budget: 920000,
    color: 'border-purple-700 bg-purple-950/30 text-purple-300',
    icon: CheckCircle2,
  },
  {
    id: 'verification_pending',
    title: 'Verification Pending',
    subtitle: 'Post-Audit Scan Queue',
    count: 4,
    budget: 680000,
    color: 'border-indigo-700 bg-indigo-950/30 text-indigo-300',
    icon: FileCheck2,
  },
  {
    id: 'verified',
    title: 'Verified',
    subtitle: 'IRC-111 Certified',
    count: 22,
    budget: 4100000,
    color: 'border-emerald-700 bg-emerald-950/30 text-emerald-300',
    icon: ShieldCheck,
  },
];

export function MaintenancePipelineTracker() {
  const navigate = useNavigate();

  return (
    <Card className="border-slate-800 bg-slate-900/90">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Wrench}>
            End-to-End Maintenance &amp; Repair Pipeline
          </CardTitle>
          <button
            onClick={() => navigate('/maintenance')}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 cursor-pointer"
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
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                    Stage 0{idx + 1}
                  </span>
                  <Icon className="w-4 h-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                </div>

                <div>
                  <h5 className="font-bold text-xs text-white group-hover:text-brand-300 transition-colors">
                    {stage.title}
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{stage.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between font-mono">
                  <span className="text-base font-extrabold text-white">{stage.count}</span>
                  <span className="text-[10px] text-slate-400">{formatCurrency(stage.budget)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
