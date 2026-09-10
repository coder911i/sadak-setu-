import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import {
  Settings,
  Cpu,
  Radio,
  Sliders,
  Bell,
  Shield,
  Save,
  Check,
  Zap,
} from 'lucide-react';

export function SettingsPage() {
  const { success } = useToast();

  const [aiSettings, setAiSettings] = useState({
    confidenceThreshold: 85,
    criticalDepthCutoffCm: 7.0,
    vibrationSpikeThresholdG: 2.5,
    autoSanctionEmergencyOrders: true,
    notificationSmsAlerts: true,
    droneSyncFrequencyHours: 6,
  });

  const handleSave = () => {
    success('Settings Saved', 'AI telemetry thresholds and notification rules updated successfully.');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-title3 sm:text-title2 font-semibold text-ink-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-600" />
            <span>System Configuration &amp; AI Calibration</span>
          </h1>
          <p className="text-footnote sm:text-subhead text-ink-500 mt-1 max-w-2xl">
            Fine-tune edge inference parameters, automated dispatch rules, and infrastructure node diagnostics.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edge AI Vision Calibration */}
        <Card className="border-line bg-white">
          <CardHeader className="py-3 px-4">
            <CardTitle icon={Cpu}>
              Edge Vision &amp; Detection Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-ink-700 font-semibold">Minimum AI Confidence Cutoff</label>
                <span className="font-mono text-brand-600 font-bold">{aiSettings.confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={aiSettings.confidenceThreshold}
                onChange={(e) => setAiSettings({ ...aiSettings, confidenceThreshold: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
              <p className="text-[10px] text-ink-500 mt-1">
                Detections below this score are flagged for manual secondary review.
              </p>
            </div>

            <div className="pt-2 border-t border-line">
              <div className="flex justify-between mb-1">
                <label className="text-ink-700 font-semibold">Critical Pothole Depth Threshold (cm)</label>
                <span className="font-mono text-rose-600 font-bold">{aiSettings.criticalDepthCutoffCm} cm</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                step="0.5"
                value={aiSettings.criticalDepthCutoffCm}
                onChange={(e) => setAiSettings({ ...aiSettings, criticalDepthCutoffCm: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
              <p className="text-[10px] text-ink-500 mt-1">
                Depths exceeding this value immediately trigger Level-1 Red Alerts.
              </p>
            </div>

            <div className="pt-2 border-t border-line">
              <div className="flex justify-between mb-1">
                <label className="text-ink-700 font-semibold">Accelerometer G-Force Spike Sensitivity</label>
                <span className="font-mono text-amber-600 font-bold">{aiSettings.vibrationSpikeThresholdG} G</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={aiSettings.vibrationSpikeThresholdG}
                onChange={(e) => setAiSettings({ ...aiSettings, vibrationSpikeThresholdG: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Automation & Notification Dispatch */}
        <Card className="border-line bg-white">
          <CardHeader className="py-3 px-4">
            <CardTitle icon={Bell}>
              Automated Dispatch &amp; Work Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 border border-line">
              <div className="space-y-0.5">
                <h5 className="font-semibold text-ink-900">Auto-Sanction Critical Work Orders</h5>
                <p className="text-[11px] text-ink-500">Instantly generate work order for high-risk craters</p>
              </div>
              <input
                type="checkbox"
                checked={aiSettings.autoSanctionEmergencyOrders}
                onChange={(e) => setAiSettings({ ...aiSettings, autoSanctionEmergencyOrders: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded bg-surface-100 border-line cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 border border-line">
              <div className="space-y-0.5">
                <h5 className="font-semibold text-ink-900">Emergency Contractor SMS/Email Dispatch</h5>
                <p className="text-[11px] text-ink-500">Push real-time GPS coordinates to on-duty road gangs</p>
              </div>
              <input
                type="checkbox"
                checked={aiSettings.notificationSmsAlerts}
                onChange={(e) => setAiSettings({ ...aiSettings, notificationSmsAlerts: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded bg-surface-100 border-line cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-surface-50 border border-line space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-900">Autonomous Drone Fleet Sync Cycle</span>
                <span className="font-mono text-brand-600 font-bold">{aiSettings.droneSyncFrequencyHours} Hours</span>
              </div>
              <p className="text-[10px] text-ink-500">Periodic surface point cloud refresh frequency</p>
            </div>
          </CardContent>
        </Card>

        {/* Live System Diagnostics & Edge Node Health */}
        <Card className="border-line bg-white md:col-span-2">
          <CardHeader className="py-3 px-4">
            <CardTitle icon={Radio}>
              Infrastructure Telemetry &amp; Node Health Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-surface-50 border border-line space-y-1">
                <span className="text-[10px] text-ink-500 font-mono uppercase">Edge Vision Nodes</span>
                <div className="text-xl font-bold font-mono text-emerald-600">24 / 24 Online</div>
                <p className="text-[10px] text-ink-400">Mobile Survey Vans</p>
              </div>

              <div className="p-3 rounded-lg bg-surface-50 border border-line space-y-1">
                <span className="text-[10px] text-ink-500 font-mono uppercase">LiDAR Drone Fleet</span>
                <div className="text-xl font-bold font-mono text-emerald-600">6 / 6 Active</div>
                <p className="text-[10px] text-ink-400">Autonomous Patrol</p>
              </div>

              <div className="p-3 rounded-lg bg-surface-50 border border-line space-y-1">
                <span className="text-[10px] text-ink-500 font-mono uppercase">Inference Latency</span>
                <div className="text-xl font-bold font-mono text-brand-600">14.2 ms</div>
                <p className="text-[10px] text-ink-400">Edge TensorRT</p>
              </div>

              <div className="p-3 rounded-lg bg-surface-50 border border-line space-y-1">
                <span className="text-[10px] text-ink-500 font-mono uppercase">Uptime &amp; SLA</span>
                <div className="text-xl font-bold font-mono text-emerald-600">99.98%</div>
                <p className="text-[10px] text-ink-400">Past 90 Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
