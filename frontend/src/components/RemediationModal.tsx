import React, { useState, useEffect } from 'react';
import type { Vulnerability, VulnerabilityStatus } from '../types';
import { X, CheckCircle, Ticket, ShieldOff, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { SkillResultCard } from './SkillResultCard';

interface RemediationModalProps {
  vulnerability: Vulnerability | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: VulnerabilityStatus) => void;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  vulnerability,
  onClose,
  onUpdateStatus
}) => {
  const [activeTab, setActiveTab] = useState<'ticket' | 'detection' | 'suppress' | 'remediate'>('ticket');
  const [ticketPlatform, setTicketPlatform] = useState<'jira' | 'servicenow'>('jira');
  const [assignee, setAssignee] = useState('SecOps Escalation Team');
  const [priority, setPriority] = useState('P1 - Critical (24h SLA)');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Skill states
  const [jiraResult, setJiraResult] = useState<any>(null);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [isGeneratingRules, setIsGeneratingRules] = useState(false);

  useEffect(() => {
    if (vulnerability && activeTab === 'detection' && !detectionResult) {
      handleGenerateDetection();
    }
  }, [vulnerability, activeTab]);

  if (!vulnerability) return null;

  const handleGenerateDetection = async () => {
    setIsGeneratingRules(true);
    const res = await api.generateDetectionRules({
      cveId: vulnerability.id,
      title: vulnerability.title,
      description: vulnerability.description,
      component: vulnerability.component,
      mitreTactics: vulnerability.mitreTactics,
      isZeroDay: vulnerability.activeExploits || vulnerability.severity === 'CRITICAL'
    });
    setDetectionResult(res);
    setIsGeneratingRules(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (activeTab === 'ticket' && ticketPlatform === 'jira') {
      const ticket = await api.createJiraTicket({
        cveId: vulnerability.id,
        summary: `Remediate ${vulnerability.title}`,
        priority: vulnerability.severity,
        assignee: assignee,
        description: reason || vulnerability.description
      });
      if (ticket) {
        setJiraResult(ticket);
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      if (activeTab === 'ticket') {
        onUpdateStatus(vulnerability.id, 'REMEDIATION_PENDING');
      } else if (activeTab === 'suppress') {
        onUpdateStatus(vulnerability.id, 'SUPPRESSED');
      } else {
        onUpdateStatus(vulnerability.id, 'REMEDIATED');
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel-elevated w-full max-w-2xl rounded-lg border border-primary/40 shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-high/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-primary/20 text-primary-bright border border-primary/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                Remediation Workflow // {vulnerability.id}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {vulnerability.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-outline-variant/30 bg-surface-container">
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ticket'
                ? 'border-primary text-primary-bright bg-primary/10'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Dispatch Jira
          </button>

          <button
            onClick={() => setActiveTab('detection')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'detection'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Sigma/YARA Skill
          </button>

          <button
            onClick={() => setActiveTab('suppress')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'suppress'
                ? 'border-tertiary text-tertiary bg-tertiary/10'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <ShieldOff className="w-4 h-4" />
            Suppress Risk
          </button>

          <button
            onClick={() => setActiveTab('remediate')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'remediate'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Mark Remediated
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submittedSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-on-surface">Workflow Action Recorded</h3>
              <p className="text-xs text-on-surface-variant">
                Vulnerability status updated and logged in System Audit.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'ticket' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">
                      Integration Target
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTicketPlatform('jira')}
                        className={`p-3 rounded border text-left flex items-center gap-2 ${
                          ticketPlatform === 'jira'
                            ? 'border-primary bg-primary/20 text-primary-bright font-bold'
                            : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/40'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Jira Software (SecOps Project)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketPlatform('servicenow')}
                        className={`p-3 rounded border text-left flex items-center gap-2 ${
                          ticketPlatform === 'servicenow'
                            ? 'border-primary bg-primary/20 text-primary-bright font-bold'
                            : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/40'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        ServiceNow (SecITSM Ticket)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-on-surface-variant font-semibold mb-1">
                        Assignee Group
                      </label>
                      <select
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option>SecOps Escalation Team</option>
                        <option>DevOps Cluster Guild</option>
                        <option>Infrastructure Hardening Team</option>
                        <option>Application Security Guild</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-on-surface-variant font-semibold mb-1">
                        SLA Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option>P1 - Critical (24h SLA)</option>
                        <option>P2 - High (72h SLA)</option>
                        <option>P3 - Moderate (14d SLA)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">
                      Remediation Notes / Instruction Rationale
                    </label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Add specific patch guidance or container rebuild instructions..."
                      className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-primary focus:outline-none placeholder:text-on-surface-variant/40"
                    />
                  </div>

                  {jiraResult && (
                    <div className="mt-3">
                      <SkillResultCard toolName="create_jira_ticket" result={jiraResult} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'detection' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-on-surface-variant">
                      AI Detection Rule Generator Skill
                    </span>
                    <button
                      type="button"
                      onClick={handleGenerateDetection}
                      disabled={isGeneratingRules}
                      className="text-[11px] px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-1 font-bold"
                    >
                      <RefreshCw className={`w-3 h-3 ${isGeneratingRules ? 'animate-spin' : ''}`} />
                      Regenerate Rules
                    </button>
                  </div>

                  {isGeneratingRules ? (
                    <div className="py-8 text-center text-cyan-300 space-y-2">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
                      <p className="font-mono text-xs">Synthesizing Sigma YAML & YARA signatures...</p>
                    </div>
                  ) : detectionResult ? (
                    <SkillResultCard toolName="generate_detection_rules" result={detectionResult} />
                  ) : (
                    <p className="text-on-surface-variant text-xs">Click regenerate to load detection rules.</p>
                  )}
                </div>
              )}

              {activeTab === 'suppress' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded bg-tertiary-container/20 border border-tertiary/40 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-tertiary">Risk Suppression Warning</span>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">
                        Suppressing a PSSS Critical CVE removes it from active triage queues. An entry will be permanently written to the forensic audit log.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">
                      Suppression Rationale & Compensating Control *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Describe compensating WAF rules, network segmentation, or vendor patch delay..."
                      className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-tertiary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'remediate' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-400">Mark as Verified Remediated</span>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">
                        Confirm that patch verification or configuration hardening has passed automated validation scans.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">
                      Verification Method / Commit Hash
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Verified via Trivy scan build #4812 / Ansible playbook commit 8a4b2c"
                      className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded border border-outline-variant/40 text-on-surface-variant hover:text-on-surface text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded font-bold text-xs shadow-lg transition-all flex items-center gap-2 ${
                    activeTab === 'suppress'
                      ? 'bg-tertiary text-on-tertiary hover:brightness-110'
                      : activeTab === 'remediate'
                      ? 'bg-emerald-500 text-slate-950 hover:brightness-110'
                      : 'bg-primary text-on-primary hover:brightness-110 shadow-glow-cyan'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : activeTab === 'ticket' ? (
                    <span>Dispatch Ticket</span>
                  ) : activeTab === 'suppress' ? (
                    <span>Confirm Suppression</span>
                  ) : (
                    <span>Confirm Remediation</span>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
