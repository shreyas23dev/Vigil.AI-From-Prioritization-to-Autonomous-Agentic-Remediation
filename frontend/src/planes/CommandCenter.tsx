import React, { useState, useEffect } from 'react';
import type { Vulnerability } from '../types';
import { PsssBadge } from '../components/PsssBadge';
import { MetricCard } from '../components/MetricCard';
import { 
  ShieldAlert, 
  Flame, 
  Server, 
  Activity, 
  Filter, 
  ChevronRight, 
  Ticket, 
  Copy, 
  Check,
  RefreshCw
} from 'lucide-react';

interface CommandCenterProps {
  vulnerabilities: Vulnerability[];
  searchQuery: string;
  onOpenRemediationModal: (v: Vulnerability) => void;
}

// Helper function to produce an initial jumbled sequence of vulnerabilities
const jumbleVulnerabilities = (items: Vulnerability[]): Vulnerability[] => {
  if (items.length <= 2) return items;
  const copy = [...items];
  const shuffled: Vulnerability[] = [];
  const mid = Math.floor(copy.length / 2);
  for (let i = 0; i < mid; i++) {
    shuffled.push(copy[copy.length - 1 - i]);
    shuffled.push(copy[i]);
  }
  if (copy.length % 2 !== 0) {
    shuffled.push(copy[mid]);
  }
  return shuffled;
};

export const CommandCenter: React.FC<CommandCenterProps> = ({
  vulnerabilities,
  searchQuery,
  onOpenRemediationModal
}) => {
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [queueData, setQueueData] = useState<Vulnerability[]>([]);
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize or Sync queue data
  useEffect(() => {
    if (vulnerabilities.length > 0) {
      if (!isSynced) {
        setQueueData(jumbleVulnerabilities(vulnerabilities));
      } else {
        setQueueData([...vulnerabilities].sort((a, b) => b.psssScore - a.psssScore));
      }
    }
  }, [vulnerabilities, isSynced]);

  // Set default selected vulnerability when queueData changes
  useEffect(() => {
    if (queueData.length > 0 && (!selectedVulnerability || !queueData.some(v => v.id === selectedVulnerability.id))) {
      setSelectedVulnerability(queueData[0]);
    }
  }, [queueData]);

  const handleSyncQueue = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSynced(true);
      setQueueData([...vulnerabilities].sort((a, b) => b.psssScore - a.psssScore));
      setIsSyncing(false);
    }, 700);
  };

  // Filter vulnerabilities based on search, status, and severity
  const filtered = queueData.filter(v => {
    const matchesSearch = 
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.component.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || v.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Calculate Metrics
  const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL' || v.psssScore >= 9.0).length;
  const avgEpss = (vulnerabilities.reduce((acc, v) => acc + v.epssScore, 0) / (vulnerabilities.length || 1) * 100).toFixed(1);
  const totalAffectedNodes = vulnerabilities.reduce((acc, v) => acc + v.affectedNodes, 0);
  const activeExploitsCount = vulnerabilities.filter(v => v.activeExploits).length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Triage Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Critical Queue (PSSS > 9.0)"
          value={criticalCount}
          subtext="Immediate triage mandated by SLA"
          change="+2 from last scan"
          changeType="negative"
          icon={ShieldAlert}
          accentColor="red"
        />

        <MetricCard
          title="Avg EPSS Exploit Prediction"
          value={`${avgEpss}%`}
          subtext="REAL-TIME Exploit likelihood"
          change="HIGH THREAT"
          changeType="negative"
          icon={Flame}
          accentColor="amber"
        />

        <MetricCard
          title="Affected Fleet Infrastructure"
          value={totalAffectedNodes}
          subtext="Impacted hosts & container nodes"
          icon={Server}
          accentColor="cyan"
        />

        <MetricCard
          title="Active Zero-Day Exploits"
          value={activeExploitsCount}
          subtext="Verified active in wild campaigns"
          change="ACTIVE CAMPAIGNS"
          changeType="negative"
          icon={Activity}
          accentColor="purple"
        />
      </div>

      {/* Main Queue & Inspection Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vulnerability Data Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls & Filter Toolbar */}
          <div className="glass-panel p-3 rounded-lg border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-bright" />
                <span className="font-bold text-on-surface">Queue Filters:</span>
              </div>

              {!isSynced ? (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold animate-pulse font-mono">
                  UNPRIORITIZED FEED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                  PSSS v2.4 SYNCHRONIZED
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container border border-outline-variant/40 rounded px-2.5 py-1 text-xs text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNASSIGNED">Unassigned</option>
                <option value="IN_TRIAGE">In Triage</option>
                <option value="REMEDIATION_PENDING">Remediation Pending</option>
                <option value="SUPPRESSED">Suppressed</option>
                <option value="REMEDIATED">Remediated</option>
              </select>

              {/* Severity Filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-surface-container border border-outline-variant/40 rounded px-2.5 py-1 text-xs text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
              </select>

              {/* Sync & Prioritize Queue Button */}
              <button
                onClick={handleSyncQueue}
                disabled={isSyncing}
                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isSynced
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-cyan'
                    : 'bg-primary/20 hover:bg-primary/30 text-primary-bright border-primary/50 shadow-glow-cyan animate-pulse'
                }`}
                title={isSynced ? "Telemetry & PSSS Priority Queue Synced" : "Sync & Prioritize PSSS Queue"}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing Queue...' : isSynced ? 'Queue Synced' : 'Sync Telemetry Queue'}
              </button>
            </div>
          </div>

          {/* High-Density Vulnerabilities Queue List */}
          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <div className="glass-panel p-8 text-center text-on-surface-variant rounded-lg border border-outline-variant/30">
                No vulnerabilities match the selected queue filters.
              </div>
            ) : (
              filtered.map((v) => {
                const isSelected = selectedVulnerability?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVulnerability(v)}
                    className={`glass-panel p-4 rounded-lg border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-glow-cyan'
                        : 'border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container/60'
                    }`}
                  >
                    {/* Active Exploits Indicator Strip */}
                    {v.activeExploits && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-error shadow-glow-red" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-on-surface text-xs tracking-tight">
                            {v.id}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(v.id);
                            }}
                            className="text-on-surface-variant hover:text-primary transition-colors"
                            title="Copy CVE ID"
                          >
                            {copiedId === v.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <PsssBadge score={v.psssScore} severity={v.severity} size="sm" />
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                              v.status === 'IN_TRIAGE'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : v.status === 'REMEDIATION_PENDING'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : v.status === 'SUPPRESSED'
                                ? 'bg-surface-container-highest text-on-surface-variant border border-outline-variant'
                                : v.status === 'REMEDIATED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-error/20 text-error border border-error/30'
                            }`}
                          >
                            {v.status.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="text-xs font-semibold text-on-surface/90 line-clamp-1">
                          {v.title}
                        </h3>

                        <div className="text-[11px] text-on-surface-variant flex items-center gap-4 flex-wrap">
                          <span>Component: <strong className="text-on-surface">{v.component}</strong></span>
                          <span>Affected Hosts: <strong className="text-primary-bright">{v.affectedNodes} nodes</strong></span>
                        </div>
                      </div>

                      {/* Quick Ticket Button & Chevron */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenRemediationModal(v);
                          }}
                          className="px-2.5 py-1 rounded bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary-bright text-[11px] font-bold transition-all flex items-center gap-1 shadow-glow-cyan"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          Remediate
                        </button>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-primary-bright' : 'text-on-surface-variant'}`} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Deep-Dive Inspection Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedVulnerability ? (
            <div className="glass-panel p-5 rounded-lg border border-primary/40 sticky top-20 space-y-5">
              {/* Header */}
              <div className="border-b border-outline-variant/30 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary-bright">
                    INSPECTION MATRIX // {selectedVulnerability.id}
                  </span>
                  <PsssBadge score={selectedVulnerability.psssScore} severity={selectedVulnerability.severity} size="md" />
                </div>
                <h2 className="text-sm font-bold text-on-surface">
                  {selectedVulnerability.title}
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedVulnerability.description}
                </p>
              </div>

              {/* Formula & Breakdown Score Card */}
              <div className="p-3.5 rounded bg-surface-container border border-outline-variant/40 space-y-3">
                <span className="text-[11px] uppercase font-bold text-on-surface-variant block border-b border-outline-variant/20 pb-1">
                  PSSS Priority Breakdown Matrix
                </span>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-on-surface-variant/70 text-[10px]">CVSS v3.1 Base:</span>
                    <div className="font-bold text-on-surface">{selectedVulnerability.cvssScore} / 10.0</div>
                  </div>

                  <div>
                    <span className="text-on-surface-variant/70 text-[10px]">EPSS Exploit Prob:</span>
                    <div className="font-bold text-tertiary">
                      {(selectedVulnerability.epssScore * 100).toFixed(1)}% (High)
                    </div>
                  </div>

                  <div className="min-w-0 overflow-hidden">
                    <span className="text-on-surface-variant/70 text-[10px]">CWE Taxonomy:</span>
                    <div 
                      className="font-bold text-on-surface truncate whitespace-nowrap overflow-hidden text-ellipsis cursor-help"
                      title={selectedVulnerability.cwe}
                    >
                      {selectedVulnerability.cwe}
                    </div>
                  </div>

                  <div>
                    <span className="text-on-surface-variant/70 text-[10px]">Active Exploitation:</span>
                    <div className={`font-bold ${selectedVulnerability.activeExploits ? 'text-error' : 'text-emerald-400'}`}>
                      {selectedVulnerability.activeExploits ? 'YES (Verified In-Wild)' : 'No In-Wild Signatures'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vector String */}
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                  CVSS Vector String:
                </span>
                <div className="p-2.5 rounded bg-surface-container-lowest border border-outline-variant/30 font-mono text-[10px] text-primary-bright break-all">
                  {selectedVulnerability.vector}
                </div>
              </div>

              {/* MITRE ATT&CK Mapping */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                  Associated MITRE ATT&CK Tactics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVulnerability.mitreTactics.map((tactic) => (
                    <span
                      key={tactic}
                      className="px-2 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-semibold"
                    >
                      {tactic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Remediation Rationale */}
              {selectedVulnerability.remediationAction && (
                <div className="p-3 rounded bg-primary/10 border border-primary/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary-bright">
                    Engine Remediation Advisory:
                  </span>
                  <p className="text-xs text-on-surface/90">
                    {selectedVulnerability.remediationAction}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => onOpenRemediationModal(selectedVulnerability)}
                  className="flex-1 py-2.5 rounded bg-primary text-on-primary font-bold text-xs hover:brightness-110 shadow-glow-cyan flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  Dispatch Ticket / Workflow
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 text-center text-on-surface-variant rounded-lg border border-outline-variant/30">
              Select a vulnerability from the queue to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
