import React, { useState } from 'react';
import type { AuditLogEvent, PipelineHealth, FormulaWeights } from '../types';
import { ShieldCheck, Activity, Sliders, FileCode } from 'lucide-react';
import { formatDateTime } from '../utils/dateTime';

interface SystemAuditProps {
  auditLogs: AuditLogEvent[];
  pipelineHealth: PipelineHealth[];
  weights: FormulaWeights;
  onUpdateWeights: (w: FormulaWeights) => void;
  onSelectEvent: (event: AuditLogEvent) => void;
}

export const SystemAudit: React.FC<SystemAuditProps> = ({
  auditLogs,
  pipelineHealth,
  weights,
  onUpdateWeights,
  onSelectEvent,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const [cvssWeight, setCvssWeight] = useState(weights.cvssWeight);
  const [epssWeight, setEpssWeight] = useState(weights.epssWeight);
  const [assetWeight, setAssetWeight] = useState(weights.assetCriticalityWeight);
  const [isSaved, setIsSaved] = useState(false);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesCategory && matchesSeverity;
  });

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWeights({
      cvssWeight,
      epssWeight,
      assetCriticalityWeight: assetWeight,
      threatActorMultiplier: weights.threatActorMultiplier,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-lg border border-primary/40 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded bg-primary/20 text-primary-bright border border-primary/30 shadow-glow-cyan">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-on-surface">
              System Audit & Engine Integrity // The Trust Plane
            </h1>
            <p className="text-xs text-on-surface-variant">
              Engine integrity health checks, formula weight calibration, & immutable forensic logs.
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline Health Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-bright" />
          Data Pipeline Connectivity & Synchronization Health
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {pipelineHealth.map((pipe) => (
            <div
              key={pipe.name}
              className="glass-panel p-4 rounded-lg border border-outline-variant/30 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold">{pipe.status}</span>
              </div>
              <div className="font-bold text-on-surface truncate">{pipe.name}</div>
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                <span>Latency: <strong className="text-primary-bright">{pipe.latencyMs}ms</strong></span>
                <span>{pipe.lastSync}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Formula Weight Calibration (4 cols) & Forensic Audit Logs (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formula Weight Calibration Form (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <form
            onSubmit={handleSaveWeights}
            className="glass-panel p-5 rounded-lg border border-primary/40 space-y-5"
          >
            <div className="border-b border-outline-variant/30 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary-bright" />
                PSSS Model Formula Calibration
              </h2>
              {isSaved && <span className="text-emerald-400 font-bold text-[10px]">Saved & Logged</span>}
            </div>

            <p className="text-[11px] text-on-surface-variant">
              Adjust relative weights for CVSS base score, EPSS exploit prediction, and asset criticality.
            </p>

            {/* CVSS Weight Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-on-surface">CVSS Base Weight:</span>
                <span className="text-primary-bright">{(cvssWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={cvssWeight}
                onChange={(e) => setCvssWeight(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* EPSS Weight Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-on-surface">EPSS Exploit Prob Weight:</span>
                <span className="text-tertiary">{(epssWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={epssWeight}
                onChange={(e) => setEpssWeight(parseFloat(e.target.value))}
                className="w-full accent-tertiary cursor-pointer"
              />
            </div>

            {/* Asset Criticality Weight Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-on-surface">Asset Criticality Weight:</span>
                <span className="text-secondary font-bold">{(assetWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={assetWeight}
                onChange={(e) => setAssetWeight(parseFloat(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded bg-primary text-on-primary font-bold hover:brightness-110 shadow-glow-cyan transition-all"
            >
              Apply & Log Weight Calibration
            </button>
          </form>
        </div>

        {/* Forensic Audit Log Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="glass-panel p-3 rounded-lg border border-outline-variant/30 flex items-center justify-between flex-wrap gap-3">
            <span className="font-bold text-on-surface flex items-center gap-2">
              <FileCode className="w-4 h-4 text-primary-bright" />
              Forensic Activity Feed ({filteredLogs.length} Events)
            </span>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-surface-container border border-outline-variant/40 rounded px-2.5 py-1 text-xs text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="WEIGHT_OVERRIDE">Weight Override</option>
                <option value="IAM_CHANGE">IAM Change</option>
                <option value="RULE_SUPPRESSION">Rule Suppression</option>
                <option value="DATA_SYNC">Data Sync</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-surface-container border border-outline-variant/40 rounded px-2.5 py-1 text-xs text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="WARN">Warning</option>
                <option value="INFO">Info</option>
              </select>
            </div>
          </div>

          {/* Audit Log Items */}
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => onSelectEvent(log)}
                className="glass-panel p-4 rounded-lg border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary-bright text-xs">{log.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL'
                          ? 'bg-error-container/40 text-error'
                          : log.severity === 'WARN'
                          ? 'bg-tertiary-container/30 text-tertiary'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {log.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px]">
                      {log.category}
                    </span>
                  </div>

                  <div className="font-bold text-on-surface text-xs">{log.action}</div>
                  <div className="text-[11px] text-on-surface-variant">
                    Actor: <strong className="text-on-surface">{log.user}</strong> ({log.userRole}) | IP: {log.ipAddress}
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono text-[11px] text-on-surface-variant space-y-0.5">
                  <div className="text-on-surface font-semibold">{formatDateTime(log.timestamp)}</div>
                  <span className="text-primary-bright font-bold text-[10px] group-hover:underline block">
                    View Diff JSON →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
