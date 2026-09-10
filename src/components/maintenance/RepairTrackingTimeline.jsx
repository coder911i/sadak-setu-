import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  CheckCircle2,
  Clock,
  Wrench,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export function RepairTrackingTimeline({ workOrder, onOpenWorkOrder }) {
  const [showUpdates, setShowUpdates] = useState(false);

  // Default active sample work order if none provided
  const order = workOrder || {
    id: 'WO-2026-0891',
    title: 'Emergency Pothole Milling & Inlay Repair',
    roadCode: 'NH-48 (Delhi – Jaipur)',
    chainageRange: 'Km 58+000 – Km 66+500',
    contractorName: 'Larsen & Toubro Infra Solutions',
    progressPercentage: 65,
    status: 'in_progress',
    createdAt: '2026-09-08T09:00:00Z',
    slaRemainingHours: 32,
  };

  // 6 specific states defined in user prompt
  const steps = [
    {
      id: 'detected',
      title: 'Detected',
      desc: 'Mobile dashcam camera identified crater distress spot.',
      state: 'completed', // 'completed' | 'active' | 'pending'
      time: '08 Sep, 08:30 AM',
      author: 'AI Mobile Dashcam Survey Unit-03',
    },
    {
      id: 'analyzed',
      title: 'Analyzed by AI',
      desc: 'YOLO-v10 classified 8.5cm depth, risk index 94/100.',
      state: 'completed',
      time: '08 Sep, 08:45 AM',
      author: 'Neural Edge Vision Model v4.8',
    },
    {
      id: 'approved',
      title: 'Approved',
      desc: 'Budget ₹6.8L sanctioned by PIU Executive Engineer.',
      state: 'completed',
      time: '08 Sep, 11:15 AM',
      author: 'Er. Rajeshwar Rao (EE MoRTH)',
    },
    {
      id: 'in_progress',
      title: 'Repair In Progress',
      desc: 'Wirtgen cold milling machine active on Lane 1.',
      state: 'active', // orange
      time: '09 Sep, 02:00 PM',
      author: 'Larsen & Toubro Work Crew (12 personnel)',
    },
    {
      id: 'completed',
      title: 'Repair Completed',
      desc: 'VG-40 asphalt compaction & roller finishing.',
      state: 'pending', // grey
      time: 'Estimated in 8 hrs',
      author: 'Awaiting Contractor Handover',
    },
    {
      id: 'verification',
      title: 'AI Verification',
      desc: 'Post-repair LiDAR scan & IRC-111 density certification.',
      state: 'pending', // grey
      time: 'Scheduled post-compaction',
      author: 'MoRTH Quality Assurance Directorate',
    },
  ];

  return (
    <Card className="border-[#e2ebe4] bg-white shadow-card">
      <CardHeader className="py-3 px-5">
        <div className="flex items-center justify-between w-full">
          <CardTitle icon={Wrench}>
            Live Repair Tracking &amp; Lifecycle Timeline
          </CardTitle>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Stage 4 Active
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Work Order Summary Bar */}
        <div className="p-3.5 rounded-2xl bg-surface-50 border border-[#e2ebe4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-brand-700">{order.id}</span>
              <span className="font-semibold text-[#123320]">{order.roadCode}</span>
            </div>
            <p className="text-[#728a79]">{order.title} &bull; {order.chainageRange}</p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div>
              <div className="text-[10px] text-[#728a79] uppercase font-bold">Progress</div>
              <div className="font-mono font-bold text-[#123320] text-sm">{order.progressPercentage}%</div>
            </div>
            <div className="h-8 w-px bg-[#e2ebe4]" />
            <div>
              <div className="text-[10px] text-[#728a79] uppercase font-bold">Contractor</div>
              <div className="font-semibold text-[#123320] truncate max-w-[140px]">{order.contractorName}</div>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#3b5e47]">Overall Repair Execution</span>
            <span className="font-mono text-brand-700">{order.progressPercentage}% Completed</span>
          </div>
          <div className="h-2.5 w-full bg-surface-200 rounded-full overflow-hidden p-0.5 border border-[#e2ebe4]">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${order.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Visual Vertical Timeline */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2ebe4]">
          {steps.map((step, idx) => {
            const isCompleted = step.state === 'completed';
            const isActive = step.state === 'active';
            const isPending = step.state === 'pending';

            return (
              <div key={step.id} className="relative text-xs space-y-1 group">
                {/* Node icon / indicator */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : isActive
                      ? 'bg-amber-500 border-white text-white shadow-md ring-4 ring-amber-200 animate-pulse'
                      : 'bg-white border-[#c7d8cc] text-[#8a9c8f]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c7d8cc]" />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-xs ${
                        isCompleted
                          ? 'text-[#123320]'
                          : isActive
                          ? 'text-amber-800 font-extrabold'
                          : 'text-[#728a79]'
                      }`}
                    >
                      {step.title}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-bold border border-amber-300">
                        In Execution
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#8a9c8f]">{step.time}</span>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    isPending ? 'text-[#8a9c8f]' : 'text-[#3b5e47]'
                  }`}
                >
                  {step.desc}
                </p>

                <div className="text-[10px] font-mono text-[#8a9c8f]">
                  By: {step.author}
                </div>
              </div>
            );
          })}
        </div>

        {/* "View Updates" Expandable Drawer */}
        <div className="pt-2 border-t border-[#e2ebe4]">
          <button
            type="button"
            onClick={() => setShowUpdates(!showUpdates)}
            className="w-full py-2.5 px-4 rounded-xl bg-surface-50 hover:bg-[#eef7f1] border border-[#e2ebe4] text-xs font-bold text-[#155635] flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>View Work Order Sensor &amp; Crew Updates (4 Entries)</span>
            {showUpdates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showUpdates && (
            <div className="mt-2.5 p-3 rounded-xl bg-white border border-[#e2ebe4] space-y-2.5 text-xs animate-fade-in divide-y divide-[#edf3ee]">
              <div className="pt-1 first:pt-0">
                <div className="flex justify-between font-mono text-[10px] text-[#728a79]">
                  <span>09 Sep, 02:15 PM &bull; Automated Telemetry</span>
                  <span className="text-amber-600 font-bold">Asphalt Temp 152°C</span>
                </div>
                <p className="text-[#3b5e47] mt-0.5 leading-snug">
                  Bitumen delivery truck (Reg HR-55-AN-4421) arrived on site. Density sensor testing initiated.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex justify-between font-mono text-[10px] text-[#728a79]">
                  <span>09 Sep, 11:30 AM &bull; Field Engineer Update</span>
                  <span className="text-emerald-700 font-bold">Milling Finished</span>
                </div>
                <p className="text-[#3b5e47] mt-0.5 leading-snug">
                  65mm surface layer removed across 420m length. Sub-base verified free of moisture.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex justify-between font-mono text-[10px] text-[#728a79]">
                  <span>08 Sep, 09:00 PM &bull; Traffic Police Control</span>
                  <span className="text-brand-700 font-bold">Diversion Active</span>
                </div>
                <p className="text-[#3b5e47] mt-0.5 leading-snug">
                  Cones and illuminated arrow signs placed on Km 58. Single lane throughput maintained.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
