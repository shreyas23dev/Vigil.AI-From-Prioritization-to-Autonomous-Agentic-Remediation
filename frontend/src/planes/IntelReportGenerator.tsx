import React, { useState } from 'react';
import type { IntelReportConfig, Vulnerability } from '../types';
import { formatDateTime } from '../utils/dateTime';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Eye, 
  Settings, 
  Sliders, 
  Flame, 
  CheckCircle2, 
  Layers, 
  FileText
} from 'lucide-react';

interface IntelReportGeneratorProps {
  vulnerabilities: Vulnerability[];
}

export const IntelReportGenerator: React.FC<IntelReportGeneratorProps> = ({ vulnerabilities }) => {
  const [config, setConfig] = useState<IntelReportConfig>({
    title: 'Vigil AI Executive & Operational Intelligence Brief',
    scanScope: 'Full Production Cluster & DMZ Environment',
    dateRange: 'Last 30 Days (Jul 2026)',
    audience: 'EXECUTIVE',
    format: 'PDF',
    modules: {
      psssBreakdown: true,
      topThreatVectors: true,
      mitreSaturation: true,
      remediationSla: true,
      activeCampaigns: true,
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [reportTheme, setReportTheme] = useState<'dark_preview' | 'light_paper'>('dark_preview');

  const handleTriggerGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const criticalCount = vulnerabilities.filter((v) => v.severity === 'CRITICAL' || v.psssScore >= 9.0).length;
  const highCount = vulnerabilities.filter((v) => v.severity === 'HIGH' || (v.psssScore >= 7.5 && v.psssScore < 9.0)).length;
  const avgEpss = (vulnerabilities.reduce((acc, v) => acc + v.epssScore, 0) / (vulnerabilities.length || 1) * 100).toFixed(1);
  const totalImpactedNodes = vulnerabilities.reduce((acc, v) => acc + v.affectedNodes, 0);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner (Hidden on Print) */}
      <div className="glass-panel p-5 rounded-lg border border-primary/40 flex items-center justify-between flex-wrap gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded bg-primary/20 text-primary-bright border border-primary/30 shadow-glow-cyan">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-on-surface">
              Intel Report Generator // Executive Synthesis Plane
            </h1>
            <p className="text-xs text-on-surface-variant">
              Generate customizable, publication-grade security intelligence PDF reports for executive briefings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded bg-primary text-on-primary font-bold hover:brightness-110 shadow-glow-cyan flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            {isGenerating ? 'Compiling Intel...' : 'Generate Fresh Brief'}
          </button>
        </div>
      </div>

      {/* Grid Layout: Config Form (4 cols, no-print) & Live Document Preview (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Panel (4 cols, no-print) */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="glass-panel p-5 rounded-lg border border-outline-variant/30 space-y-4">
            <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2 border-b border-outline-variant/30 pb-2">
              <Settings className="w-4 h-4 text-primary-bright" />
              Report Parameters
            </h2>

            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Report Document Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Target Scanning Scope
              </label>
              <select
                value={config.scanScope}
                onChange={(e) => setConfig({ ...config, scanScope: e.target.value })}
                className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-primary focus:outline-none font-bold"
              >
                <option>Full Production Cluster & DMZ Environment</option>
                <option>Kubernetes Edge Clusters & Node Group</option>
                <option>AWS Cloud Infrastructure & IAM Scope</option>
                <option>Core Database & Storage Segment</option>
              </select>
            </div>

            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Target Audience Persona
              </label>
              <select
                value={config.audience}
                onChange={(e) => setConfig({ ...config, audience: e.target.value as any })}
                className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-primary focus:outline-none font-bold"
              >
                <option value="EXECUTIVE">Executive / CISO Briefing</option>
                <option value="SOC_OPERATIONAL">SOC Operational Triage</option>
                <option value="CISO_GOVERNANCE">Governance & Audit Compliance</option>
              </select>
            </div>

            {/* Included Modules Toggles */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/30">
              <label className="block text-on-surface-variant font-semibold uppercase tracking-wider text-[10px]">
                Included Report Modules
              </label>

              <div className="space-y-2.5 p-3 rounded bg-surface-container border border-outline-variant/30">
                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <span>PSSS Score Breakdown & KPI Summary</span>
                  <input
                    type="checkbox"
                    checked={config.modules.psssBreakdown}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        modules: { ...config.modules, psssBreakdown: e.target.checked },
                      })
                    }
                    className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <span>Priority Exploitation Vectors Table</span>
                  <input
                    type="checkbox"
                    checked={config.modules.topThreatVectors}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        modules: { ...config.modules, topThreatVectors: e.target.checked },
                      })
                    }
                    className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <span>MITRE ATT&CK Saturation Summary</span>
                  <input
                    type="checkbox"
                    checked={config.modules.mitreSaturation}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        modules: { ...config.modules, mitreSaturation: e.target.checked },
                      })
                    }
                    className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <span>Remediation SLA Compliance Matrix</span>
                  <input
                    type="checkbox"
                    checked={config.modules.remediationSla}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        modules: { ...config.modules, remediationSla: e.target.checked },
                      })
                    }
                    className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary"
                  />
                </label>
              </div>
            </div>

            {/* Screen Theme Mode Toggle */}
            <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
              <span className="text-on-surface-variant font-bold text-[10px]">Preview Screen Theme:</span>
              <div className="flex rounded bg-surface-container p-1 border border-outline-variant/30">
                <button
                  onClick={() => setReportTheme('dark_preview')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    reportTheme === 'dark_preview' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  Dark Cyber
                </button>
                <button
                  onClick={() => setReportTheme('light_paper')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    reportTheme === 'light_paper' ? 'bg-white text-black' : 'text-on-surface-variant'
                  }`}
                >
                  Formal Paper
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Executive Document Printable Sheet (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Action Toolbar (no-print) */}
          <div className="glass-panel p-3 rounded-lg border border-outline-variant/30 flex items-center justify-between no-print">
            <span className="font-bold text-on-surface flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary-bright" />
              Formal Executive Report Document
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintPdf}
                className="px-4 py-2 rounded bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 shadow-glow-amber flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print / Save Formal PDF
              </button>
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vulnerabilities, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute("href", dataStr);
                  dlAnchorElem.setAttribute("download", "vigil_intel_report.json");
                  dlAnchorElem.click();
                }}
                className="px-3 py-2 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-primary-bright" />
                Export JSON
              </button>
            </div>
          </div>

          {/* FORMAL PRINTABLE REPORT SHEET */}
          <div
            className={`printable-document p-8 rounded-lg border transition-all space-y-6 ${
              reportTheme === 'light_paper'
                ? 'bg-white text-gray-900 border-gray-300 shadow-xl'
                : 'bg-[#0b1013] text-on-surface border-outline-variant/40 shadow-2xl'
            }`}
          >
            {/* Formal Executive Cover Header */}
            <div className="border-b-2 border-primary/50 pb-5 space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 border-2 border-primary flex items-center justify-center font-bold text-primary-bright p-1">
                    <img src="/gemini-svg.svg" alt="Vigil Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-base font-bold tracking-tight uppercase font-mono">
                      Vigil<span className="text-primary-bright">.AI</span> // Security Briefing
                    </div>
                    <div className="text-[10px] text-on-surface-variant/80 font-mono tracking-widest uppercase">
                      Adaptive Vulnerability Prioritization Platform (PSSS v2.4)
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[10px] space-y-0.5">
                  <div className="inline-block px-2.5 py-0.5 rounded bg-error-container/30 text-error border border-error/40 font-bold uppercase">
                    CONFIDENTIAL // FOR EXECUTIVE EYES ONLY
                  </div>
                  <div className="text-on-surface-variant pt-1">
                    Doc Ref: <strong>TL-INTEL-2026-0729-A</strong>
                  </div>
                  <div className="text-on-surface-variant">
                    Generated: <strong className="text-on-surface">{formatDateTime(new Date())}</strong>
                  </div>
                </div>
              </div>

              {/* Title & Scope Metadata */}
              <div className="pt-2">
                <h1 className="text-xl font-extrabold text-on-surface font-sans leading-tight">
                  {config.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant pt-1.5 font-mono">
                  <span>Scope: <strong className="text-on-surface">{config.scanScope}</strong></span>
                  <span>|</span>
                  <span>Audience: <strong className="text-primary-bright">{config.audience}</strong></span>
                  <span>|</span>
                  <span>Scan Window: <strong className="text-on-surface">{config.dateRange}</strong></span>
                </div>
              </div>
            </div>

            {/* Section 1: Executive KPI & Risk Breakdown */}
            {config.modules.psssBreakdown && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary-bright flex items-center gap-2 border-b border-outline-variant/30 pb-1">
                  <FileText className="w-4 h-4" />
                  1. Executive Security Risk Summary & Key Metrics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded bg-surface-container border border-outline-variant/30 space-y-1 bg-dark-print">
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant block">Critical Queue (PSSS ≥ 9.0)</span>
                    <span className="text-xl font-bold text-error">{criticalCount} CVEs</span>
                    <span className="text-[9px] text-error/80 block">Mandated 24h SLA response</span>
                  </div>

                  <div className="p-3.5 rounded bg-surface-container border border-outline-variant/30 space-y-1 bg-dark-print">
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant block">High Risk Queue</span>
                    <span className="text-xl font-bold text-tertiary">{highCount} CVEs</span>
                    <span className="text-[9px] text-tertiary/80 block">72h SLA remediation window</span>
                  </div>

                  <div className="p-3.5 rounded bg-surface-container border border-outline-variant/30 space-y-1 bg-dark-print">
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant block">Avg EPSS Exploit Prob.</span>
                    <span className="text-xl font-bold text-primary-bright">{avgEpss}%</span>
                    <span className="text-[9px] text-primary-bright/80 block">Real-time threat prediction</span>
                  </div>

                  <div className="p-3.5 rounded bg-surface-container border border-outline-variant/30 space-y-1 bg-dark-print">
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant block">Impacted Hosts</span>
                    <span className="text-xl font-bold text-emerald-400">{totalImpactedNodes} Nodes</span>
                    <span className="text-[9px] text-emerald-400/80 block">Production infrastructure</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: PSSS Prioritization Methodology & Formula */}
            <div className="space-y-3 p-4 rounded bg-surface-container border border-outline-variant/30 bg-dark-print">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary-bright flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                2. Prioritization Scoring Methodology (PSSS Engine v2.4)
              </h2>
              <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
                The Dynamic Predictive Severity Scoring System (PSSS) calculates risk by integrating CVSS base metrics, real-time EPSS exploit probability predictions, and threat actor criticality:
              </p>
              <div className="p-3 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-xs text-center text-on-surface">
                <strong>PSSS Score = (0.35 × CVSS) + (0.45 × EPSS × 10) + (0.20 × Asset Criticality) × Threat Multiplier (1.25)</strong>
              </div>
            </div>

            {/* Section 3: Priority Vulnerability Vectors Table */}
            {config.modules.topThreatVectors && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary-bright flex items-center justify-between border-b border-outline-variant/30 pb-1">
                  <span className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-error" />
                    3. Top Priority Vulnerability Vectors
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-normal">Sorted by PSSS Score</span>
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b-2 border-outline-variant/40 bg-surface-container">
                        <th className="p-2 font-bold text-on-surface">CVE ID</th>
                        <th className="p-2 font-bold text-on-surface">Vulnerability & Component</th>
                        <th className="p-2 font-bold text-on-surface">Severity</th>
                        <th className="p-2 font-bold text-on-surface text-center">PSSS Score</th>
                        <th className="p-2 font-bold text-on-surface text-center">CVSS / EPSS</th>
                        <th className="p-2 font-bold text-on-surface text-center">Hosts</th>
                        <th className="p-2 font-bold text-on-surface text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {vulnerabilities.map((v) => (
                        <tr key={v.id} className="hover:bg-surface-container/50">
                          <td className="p-2 font-bold text-primary-bright whitespace-nowrap">{v.id}</td>
                          <td className="p-2 space-y-0.5">
                            <div className="font-bold text-on-surface font-sans">{v.title}</div>
                            <div className="text-[10px] text-on-surface-variant truncate max-w-xs">{v.component}</div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${v.severity === 'CRITICAL' ? 'bg-error-container/40 text-error border border-error/40' : 'bg-tertiary-container/30 text-tertiary border border-tertiary/40'}`}>
                              {v.severity}
                            </span>
                          </td>
                          <td className="p-2 text-center font-bold text-sm text-error whitespace-nowrap">
                            {v.psssScore.toFixed(1)}
                          </td>
                          <td className="p-2 text-center text-[10px] font-mono whitespace-nowrap">
                            <div>CVSS: {v.cvssScore.toFixed(1)}</div>
                            <div className="text-tertiary">EPSS: {(v.epssScore * 100).toFixed(1)}%</div>
                          </td>
                          <td className="p-2 text-center font-bold text-on-surface whitespace-nowrap">
                            {v.affectedNodes}
                          </td>
                          <td className="p-2 text-right whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-[10px] font-bold text-on-surface-variant">
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 4: MITRE ATT&CK Saturation Summary */}
            {config.modules.mitreSaturation && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary-bright flex items-center gap-2 border-b border-outline-variant/30 pb-1">
                  <Layers className="w-4 h-4" />
                  4. MITRE ATT&CK Tactical Coverage & Saturation Matrix
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30 space-y-0.5 bg-dark-print">
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant block">Initial Access (TA0001)</span>
                    <span className="text-sm font-bold text-error">94% Saturation</span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30 space-y-0.5 bg-dark-print">
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant block">Execution (TA0002)</span>
                    <span className="text-sm font-bold text-error">91% Saturation</span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30 space-y-0.5 bg-dark-print">
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant block">Privilege Escalation (TA0004)</span>
                    <span className="text-sm font-bold text-tertiary">88% Saturation</span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30 space-y-0.5 bg-dark-print">
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant block">Defense Evasion (TA0005)</span>
                    <span className="text-sm font-bold text-tertiary">82% Saturation</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Mandated Remediation SLA Action Plan */}
            {config.modules.remediationSla && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary-bright flex items-center gap-2 border-b border-outline-variant/30 pb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  5. Mandated SLA Remediation Action Plan
                </h2>
                <div className="space-y-2">
                  {vulnerabilities.slice(0, 3).map((v) => (
                    <div key={v.id} className="p-3 rounded bg-surface-container border border-outline-variant/30 space-y-1 bg-dark-print">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="font-bold text-on-surface">{v.id} — {v.title}</span>
                        <span className="text-error font-bold">{v.psssScore} PSSS</span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
                        <strong>Mandated Action:</strong> {v.remediationAction || 'Apply vendor security hotfix immediately and restart service.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Signature & Approval Block */}
            <div className="pt-8 border-t-2 border-outline-variant/40 space-y-4">
              <div className="grid grid-cols-2 gap-8 text-xs font-mono">
                <div className="space-y-8">
                  <div className="border-b border-outline-variant/50 pb-1 text-on-surface-variant">
                    Prepared By: <strong className="text-on-surface">Alex Rivera (Tier 3 Threat Lead)</strong>
                  </div>
                  <div>Signature: ___________________________</div>
                </div>

                <div className="space-y-8">
                  <div className="border-b border-outline-variant/50 pb-1 text-on-surface-variant">
                    Executive Approval: <strong className="text-on-surface">Admin (CISO Admin)</strong>
                  </div>
                  <div>Signature: ___________________________</div>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-[10px] text-on-surface-variant/70 font-mono">
              <span>Vigil.AI Adaptive Vulnerability Prioritization Engine</span>
              <span>CONFIDENTIAL // EXECUTIVE BRIEFING</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
