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
  User,
  SlidersHorizontal,
  HelpCircle,
  FileText,
  Phone,
  Building2,
  Mail,
  Award,
} from 'lucide-react';

export function SettingsPage() {
  const { success } = useToast();
  const [activeSection, setActiveSection] = useState('profile');

  const [aiSettings, setAiSettings] = useState({
    confidenceThreshold: 85,
    criticalDepthCutoffCm: 7.0,
    vibrationSpikeThresholdG: 2.5,
    autoSanctionEmergencyOrders: true,
    notificationSmsAlerts: true,
    notificationEmailDigest: true,
    droneSyncFrequencyHours: 6,
    distanceUnit: 'km',
    gpsHighAccuracy: true,
  });

  const handleSave = () => {
    success('Configuration Saved', 'Profile settings, telemetry thresholds, and preferences updated successfully.');
  };

  const navTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
    { id: 'thresholds', label: 'Alert Thresholds', icon: Sliders },
    { id: 'system', label: 'System Settings', icon: Cpu },
    { id: 'help', label: 'Help & Guidelines', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2ebe4]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#123320] tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-700" />
            <span>More &bull; System Settings &amp; Preferences</span>
          </h1>
          <p className="text-xs text-[#3b5e47] mt-1">
            Officer credentials, notification channels, AI vision thresholds, and MoRTH compliance guidelines.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
          Save Configuration
        </Button>
      </div>

      {/* Navigation Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#e2ebe4] p-1">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-white text-[#728a79] hover:text-[#123320] border border-[#e2ebe4] hover:bg-surface-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Profile */}
      {activeSection === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <Card className="border-[#e2ebe4] bg-white shadow-card md:col-span-1 text-center p-6 space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-800 to-brand-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md ring-4 ring-brand-100">
              AS
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#123320]">Er. Alok Sharma</h3>
              <p className="text-xs text-[#728a79] font-medium">Chief Engineer (Infrastructure)</p>
              <div className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full mt-2 font-bold border border-brand-200">
                <Shield className="w-3.5 h-3.5" /> Level-1 Clearance
              </div>
            </div>

            <div className="pt-4 border-t border-[#edf3ee] text-xs text-[#728a79] text-left space-y-2">
              <div className="flex justify-between">
                <span>Employee Code:</span>
                <strong className="font-mono text-[#123320]">MORTH-IND-0482</strong>
              </div>
              <div className="flex justify-between">
                <span>Project Unit:</span>
                <strong className="text-[#123320]">Central PIU Delhi</strong>
              </div>
              <div className="flex justify-between">
                <span>Digital DSC:</span>
                <strong className="text-emerald-700 font-bold">Active &bull; Signed</strong>
              </div>
            </div>
          </Card>

          <Card className="border-[#e2ebe4] bg-white shadow-card md:col-span-2">
            <CardHeader className="py-3.5 px-5">
              <CardTitle icon={User}>Officer Details &amp; Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#123320] font-bold mb-1">Full Name</label>
                  <input type="text" defaultValue="Er. Alok Sharma" className="input-base" />
                </div>
                <div>
                  <label className="block text-[#123320] font-bold mb-1">Designation</label>
                  <input type="text" defaultValue="Chief Engineer (Highways)" className="input-base" />
                </div>
                <div>
                  <label className="block text-[#123320] font-bold mb-1">Official Email</label>
                  <input type="email" defaultValue="alok.sharma@morth.gov.in" className="input-base" />
                </div>
                <div>
                  <label className="block text-[#123320] font-bold mb-1">Contact Phone</label>
                  <input type="tel" defaultValue="+91 98101 23456" className="input-base" />
                </div>
              </div>

              <div>
                <label className="block text-[#123320] font-bold mb-1">Supervisory Regional Authority</label>
                <input
                  type="text"
                  defaultValue="National Capital Region & Northern Highway Development Corridor"
                  className="input-base"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section 2: Notifications */}
      {activeSection === 'notifications' && (
        <Card className="border-[#e2ebe4] bg-white shadow-card max-w-3xl animate-fade-in">
          <CardHeader className="py-3.5 px-5">
            <CardTitle icon={Bell}>Dispatch &amp; Alert Notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-50 border border-[#e2ebe4]">
              <div>
                <h4 className="font-bold text-[#123320] text-sm">Critical Severity SMS Alerts</h4>
                <p className="text-[#728a79] text-xs">Direct urgent SMS dispatch when crater depth exceeds 7.0cm</p>
              </div>
              <input
                type="checkbox"
                checked={aiSettings.notificationSmsAlerts}
                onChange={(e) => setAiSettings({ ...aiSettings, notificationSmsAlerts: e.target.checked })}
                className="w-5 h-5 accent-brand-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-50 border border-[#e2ebe4]">
              <div>
                <h4 className="font-bold text-[#123320] text-sm">Daily Executive Briefing Digest</h4>
                <p className="text-[#728a79] text-xs">Receive 08:00 AM email summary of unresolved high-priority potholes</p>
              </div>
              <input
                type="checkbox"
                checked={aiSettings.notificationEmailDigest}
                onChange={(e) => setAiSettings({ ...aiSettings, notificationEmailDigest: e.target.checked })}
                className="w-5 h-5 accent-brand-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-50 border border-[#e2ebe4]">
              <div>
                <h4 className="font-bold text-[#123320] text-sm">Auto-Sanction Emergency Work Orders</h4>
                <p className="text-[#728a79] text-xs">Automatically assign Level-1 emergency repairs to designated on-call contractors</p>
              </div>
              <input
                type="checkbox"
                checked={aiSettings.autoSanctionEmergencyOrders}
                onChange={(e) => setAiSettings({ ...aiSettings, autoSanctionEmergencyOrders: e.target.checked })}
                className="w-5 h-5 accent-brand-700 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Preferences */}
      {activeSection === 'preferences' && (
        <Card className="border-[#e2ebe4] bg-white shadow-card max-w-3xl animate-fade-in">
          <CardHeader className="py-3.5 px-5">
            <CardTitle icon={SlidersHorizontal}>System Preferences &amp; Units</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#123320] font-bold mb-1">Measurement System</label>
                <select className="input-base" defaultValue="km">
                  <option value="km">Metric (Kilometers, cm, meters)</option>
                  <option value="miles">Imperial (Miles, inches)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#123320] font-bold mb-1">Chainage Display Format</label>
                <select className="input-base" defaultValue="irc">
                  <option value="irc">IRC Standard (Km 62+400)</option>
                  <option value="decimal">Decimal Kilometers (62.40 Km)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#123320] font-bold mb-1">Dashboard Refresh Rate</label>
                <select className="input-base" defaultValue="30s">
                  <option value="15s">Every 15 Seconds (Live Field Mode)</option>
                  <option value="30s">Every 30 Seconds (Recommended)</option>
                  <option value="60s">Every 1 Minute</option>
                </select>
              </div>

              <div>
                <label className="block text-[#123320] font-bold mb-1">Default GIS Map Center</label>
                <select className="input-base" defaultValue="central">
                  <option value="central">Central Bharat (All Corridors)</option>
                  <option value="north">Northern Highway Division (NH-48)</option>
                  <option value="west">Western Corridor (Maharashtra/Gujarat)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Alert Thresholds */}
      {activeSection === 'thresholds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <Card className="border-[#e2ebe4] bg-white shadow-card">
            <CardHeader className="py-3.5 px-5">
              <CardTitle icon={Sliders}>AI Vision &amp; Confidence Cutoffs</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5 text-xs">
              <div>
                <div className="flex justify-between mb-1.5 font-semibold">
                  <span className="text-[#123320]">Minimum AI Confidence Cutoff</span>
                  <span className="font-mono text-brand-700 font-bold">{aiSettings.confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={aiSettings.confidenceThreshold}
                  onChange={(e) => setAiSettings({ ...aiSettings, confidenceThreshold: Number(e.target.value) })}
                  className="w-full accent-brand-700 cursor-pointer"
                />
                <p className="text-[11px] text-[#728a79] mt-1">
                  Detections below this score are flagged for manual secondary review.
                </p>
              </div>

              <div className="pt-3 border-t border-[#edf3ee]">
                <div className="flex justify-between mb-1.5 font-semibold">
                  <span className="text-[#123320]">Critical Pothole Depth Threshold</span>
                  <span className="font-mono text-red-600 font-bold">{aiSettings.criticalDepthCutoffCm} cm</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="0.5"
                  value={aiSettings.criticalDepthCutoffCm}
                  onChange={(e) => setAiSettings({ ...aiSettings, criticalDepthCutoffCm: Number(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <p className="text-[11px] text-[#728a79] mt-1">
                  Depths exceeding this value immediately trigger Level-1 Red Hazard Alerts.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e2ebe4] bg-white shadow-card">
            <CardHeader className="py-3.5 px-5">
              <CardTitle icon={Zap}>Sensor &amp; Telemetry Triggers</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5 text-xs">
              <div>
                <div className="flex justify-between mb-1.5 font-semibold">
                  <span className="text-[#123320]">Accelerometer G-Force Spike Sensitivity</span>
                  <span className="font-mono text-amber-800 font-bold">{aiSettings.vibrationSpikeThresholdG} G</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={aiSettings.vibrationSpikeThresholdG}
                  onChange={(e) => setAiSettings({ ...aiSettings, vibrationSpikeThresholdG: Number(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <p className="text-[11px] text-[#728a79] mt-1">
                  Tri-axial vibration shocks above this threshold flag severe sunken manholes and deep ruts.
                </p>
              </div>

              <div className="pt-3 border-t border-[#edf3ee]">
                <div className="flex justify-between mb-1.5 font-semibold">
                  <span className="text-[#123320]">Drone LiDAR Sync Cycle</span>
                  <span className="font-mono text-brand-700 font-bold">Every {aiSettings.droneSyncFrequencyHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={aiSettings.droneSyncFrequencyHours}
                  onChange={(e) => setAiSettings({ ...aiSettings, droneSyncFrequencyHours: Number(e.target.value) })}
                  className="w-full accent-brand-700 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section 5: System Settings */}
      {activeSection === 'system' && (
        <Card className="border-[#e2ebe4] bg-white shadow-card max-w-3xl animate-fade-in">
          <CardHeader className="py-3.5 px-5">
            <CardTitle icon={Cpu}>Edge AI Nodes &amp; System Telemetry</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#123320] font-bold mb-1">Inference Engine Version</label>
                <input type="text" value="PavementNet v4.8 (YOLOv10 DeepStream)" disabled className="input-base bg-surface-100 font-mono text-[#728a79]" />
              </div>
              <div>
                <label className="block text-[#123320] font-bold mb-1">GIS Coordinate Datum</label>
                <input type="text" value="WGS 84 / UTM Zone 43N" disabled className="input-base bg-surface-100 font-mono text-[#728a79]" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-[#e2ebe4] space-y-2">
              <span className="font-bold text-[#123320] text-xs">Connected Mobile Edge Hubs</span>
              <div className="space-y-1 text-xs text-[#3b5e47] font-mono">
                <div className="flex justify-between"><span>Van-01 (Delhi – Jaipur)</span><span className="text-emerald-700 font-bold">ONLINE &bull; 68 FPS</span></div>
                <div className="flex justify-between"><span>Van-02 (Mumbai – Pune)</span><span className="text-emerald-700 font-bold">ONLINE &bull; 64 FPS</span></div>
                <div className="flex justify-between"><span>Drone-LiDAR Fleet 03</span><span className="text-emerald-700 font-bold">ONLINE &bull; Synced</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 6: Help & Guidelines */}
      {activeSection === 'help' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <Card className="border-[#e2ebe4] bg-white shadow-card">
            <CardHeader className="py-3.5 px-5">
              <CardTitle icon={Award}>IRC Specifications &amp; Standards</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs text-[#3b5e47] leading-relaxed">
              <div className="p-3 rounded-xl bg-brand-50 border border-brand-200">
                <strong className="text-brand-900 block text-sm">IRC:111-2009 Standard</strong>
                <span>Specifications for Dense Bituminous Macadam (DBM) and Bituminous Concrete (BC) overlay repair procedures.</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-[#e2ebe4]">
                <strong className="text-[#123320] block text-sm">IRC:SP:72-2015</strong>
                <span>Guidelines for the design of flexible pavements for low volume rural PMGSY roads.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e2ebe4] bg-white shadow-card">
            <CardHeader className="py-3.5 px-5">
              <CardTitle icon={Phone}>MoRTH Central Helpdesk &amp; Support</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs text-[#3b5e47]">
              <p>For escalation of severe highway emergencies, contact the 24x7 MoRTH Incident Management Center.</p>
              <div className="space-y-1 font-mono text-xs text-[#123320]">
                <div>Toll Free Helpline: <strong>1033 (National Highway Emergency)</strong></div>
                <div>PIU Control Email: <strong>support@sadaksetu.gov.in</strong></div>
                <div>Emergency Operations Wing: <strong>Room 402, Transport Bhawan, New Delhi</strong></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
