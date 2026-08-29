import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Ticket, ShieldCheck, ExternalLink, Code2, Sparkles, Terminal } from 'lucide-react';

interface SkillResultCardProps {
  toolName: string;
  result: any;
  onApprove?: (data: any) => void;
}

export const SkillResultCard: React.FC<SkillResultCardProps> = ({ toolName, result, onApprove }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [activeRuleTab, setActiveRuleTab] = useState<'sigma' | 'yara'>('sigma');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApprove = () => {
    setApproved(true);
    if (onApprove) {
      onApprove(result);
    }
  };

  if (!result) return null;

  // 1. Action Verification Skill Result Card
  if (toolName === 'verify_action' || result.verification) {
    const v = result.verification || result;
    const isVerified = v.verified ?? result.success;

    return (
      <div className="my-3 rounded-lg border border-outline-variant/30 bg-surface-container-high/90 p-4 font-mono shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isVerified ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="text-xs font-bold text-on-surface">Skill Execution // Action Verification</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
            {isVerified ? 'VERIFIED' : 'DENIED'}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-on-surface-variant">
          <div className="flex justify-between">
            <span>Action:</span>
            <span className="text-primary-bright font-semibold">{v.action || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Role:</span>
            <span className="text-on-surface">{v.user_role || 'TIER_3_LEAD'}</span>
          </div>
          <div className="flex justify-between">
            <span>Security Flag:</span>
            <span className={v.security_verified ? 'text-emerald-400' : 'text-rose-400'}>
              {v.security_verified ? 'ACTIVE' : 'FAILED'}
            </span>
          </div>
          {v.reason && (
            <p className="text-[11px] mt-2 p-2 rounded bg-surface-dim border border-outline-variant/20 text-on-surface">
              {v.reason}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 2. Jira Ticket Dispatcher Skill Result Card
  if (toolName === 'create_jira_ticket' || toolName === 'update_jira_ticket' || result.ticket) {
    const ticket = result.ticket || result;
    if (!ticket) return null;

    return (
      <div className="my-3 rounded-lg border border-primary/40 bg-surface-container-high p-4 font-mono shadow-lg">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary-bright" />
            <span className="text-xs font-bold text-on-surface">Skill Output // Jira Dispatcher</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary-bright border border-primary/30">
            {ticket.ticket_id}
          </span>
        </div>

        <div className="mt-3 space-y-2 text-xs">
          <div>
            <span className="text-on-surface-variant text-[11px]">Summary:</span>
            <p className="font-semibold text-on-surface mt-0.5">{ticket.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant bg-surface-dim p-2 rounded border border-outline-variant/20">
            <div>
              <span>CVE ID:</span> <strong className="text-cyan-300">{ticket.cve_id}</strong>
            </div>
            <div>
              <span>Priority:</span> <strong className="text-amber-400">{ticket.priority}</strong>
            </div>
            <div>
              <span>Assignee:</span> <strong className="text-on-surface">{ticket.assignee}</strong>
            </div>
            <div>
              <span>Status:</span> <strong className="text-emerald-400">{ticket.status}</strong>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/20">
          <a
            href={ticket.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-primary-bright hover:underline font-semibold"
          >
            <ExternalLink className="w-3 h-3" /> View Ticket
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(JSON.stringify(ticket, null, 2), 'jira')}
              className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-xs flex items-center gap-1"
            >
              {copiedKey === 'jira' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{copiedKey === 'jira' ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={approved}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                approved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-primary text-on-primary hover:brightness-110 shadow-glow-cyan'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {approved ? 'Dispatched' : 'Approve & Dispatch'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Sigma/YARA Detection Rule Generator Skill Card
  if (toolName === 'generate_detection_rules' || result.rules) {
    const rules = result.rules || result;

    return (
      <div className="my-3 rounded-lg border border-cyan-500/40 bg-surface-container-high p-4 font-mono shadow-xl">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-on-surface">Skill Output // Detection Generator</span>
              <p className="text-[10px] text-on-surface-variant">{rules.cve_id} Detection Rules</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rules.is_zero_day && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                ZERO-DAY THREAT
              </span>
            )}
            <div className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 flex items-center gap-1">
              <span>Detection Value:</span>
              <span className="text-emerald-400">{rules.detection_value_score} / 10.0</span>
            </div>
          </div>
        </div>

        {/* Tab Buttons for Rule Viewer */}
        <div className="flex gap-2 my-2 border-b border-outline-variant/20 pb-2">
          <button
            onClick={() => setActiveRuleTab('sigma')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeRuleTab === 'sigma'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Sigma Rule (YAML)
          </button>

          <button
            onClick={() => setActiveRuleTab('yara')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeRuleTab === 'yara'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> YARA Signature
          </button>
        </div>

        {/* Rule Code Display */}
        <div className="relative rounded bg-slate-950 p-3 border border-outline-variant/20 max-h-56 overflow-y-auto font-mono text-[11px] text-cyan-200">
          <pre className="whitespace-pre-wrap">
            {activeRuleTab === 'sigma' ? rules.sigma_rule : rules.yara_rule}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-outline-variant/20 text-xs">
          <span className="text-[10px] text-on-surface-variant">
            Target Log Source: {rules.detection_breakdown?.log_source || 'SIEM / EDR'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                copyToClipboard(
                  activeRuleTab === 'sigma' ? rules.sigma_rule : rules.yara_rule,
                  activeRuleTab
                )
              }
              className="px-2.5 py-1 rounded bg-surface-dim hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30 text-xs flex items-center gap-1 font-semibold"
            >
              {copiedKey === activeRuleTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === activeRuleTab ? 'Copied' : `Copy ${activeRuleTab.toUpperCase()}`}</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={approved}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                approved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-emerald-500 text-slate-950 hover:brightness-110 shadow-glow'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {approved ? 'Rule Deployed' : 'Approve & Deploy'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generic Skill Output Renderer
  return (
    <div className="my-2 rounded bg-surface-container-high p-3 border border-outline-variant/30 font-mono text-xs">
      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20 text-primary-bright font-bold">
        <span>Skill Execution // {toolName}</span>
      </div>
      <pre className="mt-2 text-[11px] text-on-surface-variant whitespace-pre-wrap max-h-40 overflow-y-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
};
