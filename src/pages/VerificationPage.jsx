import React, { useState, useEffect } from 'react';
import { QualityAuditList } from '../components/verification/QualityAuditList';
import { BeforeAfterComparisonModal } from '../components/verification/BeforeAfterComparisonModal';
import { reportService } from '../services/reportService';
import { useToast } from '../hooks/useToast';
import { ShieldCheck, CheckCircle2, FileCheck, Award } from 'lucide-react';

export function VerificationPage() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const { success, error } = useToast();

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const data = await reportService.getAudits();
      setAudits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleApprove = async (auditId) => {
    await reportService.updateAuditStatus(auditId, 'passed', 'Certified by Superintending Engineer');
    success('Audit Certified', `Repair audit #${auditId} passed IRC-111 standard. Contractor payment released.`);
    fetchAudits();
  };

  const handleReject = async (auditId) => {
    await reportService.updateAuditStatus(auditId, 'rework_required', 'Rework mandated for inadequate compaction density');
    error('Rework Mandated', `Audit #${auditId} rejected. Notice issued to contractor for rectification within 48 hours.`);
    fetchAudits();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2ebe4]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#123320] tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-700" />
            <span>Post-Repair Quality Verification &amp; AI Audits</span>
          </h1>
          <p className="text-xs text-[#3b5e47] mt-1">
            Before &amp; After optical patch validation, IRC-111 compaction density certification, and contractor compliance audits.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-mono font-bold text-brand-800">
          <Award className="w-4 h-4 text-brand-600" />
          <span>IRC:111 Quality Standard Certified</span>
        </div>
      </div>

      {/* Main List */}
      <QualityAuditList
        audits={audits}
        loading={loading}
        onSelectAudit={(audit) => setSelectedAudit(audit)}
      />

      {/* Comparison Modal */}
      <BeforeAfterComparisonModal
        audit={selectedAudit}
        isOpen={Boolean(selectedAudit)}
        onClose={() => setSelectedAudit(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
