import React, { useState } from 'react';
import type { ThreatActor, Vulnerability } from '../types';
import { PsssBadge } from '../components/PsssBadge';
import { formatDateTime } from '../utils/dateTime';
import { 
  Skull, 
  Globe, 
  Copy, 
  Check, 
  ShieldAlert, 
  Palette, 
  Sliders, 
  TrendingUp, 
  Maximize2,
  BarChart3,
  PieChart,
  Lock,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface ThreatEngineProps {
  actors: ThreatActor[];
  vulnerabilities?: Vulnerability[];
  searchQuery: string;
}

type ColormapScheme = 'YlOrRd' | 'Viridis' | 'Magma' | 'Rocket' | 'Coolwarm';
type MetricMode = 'psss' | 'epss' | 'cvss' | 'exposure';
type BarTheme = 'amber' | 'flame' | 'cyan';

const MITRE_TACTICS = [
  { id: 'Initial Access', shortCode: 'TA0001', description: 'Techniques used to gain an initial foothold' },
  { id: 'Execution', shortCode: 'TA0002', description: 'Techniques resulting in user/adversary code execution' },
  { id: 'Persistence', shortCode: 'TA0003', description: 'Techniques used to maintain access across restarts' },
  { id: 'Privilege Escalation', shortCode: 'TA0004', description: 'Techniques used to gain higher-level permissions' },
  { id: 'Defense Evasion', shortCode: 'TA0005', description: 'Techniques used to avoid detection or bypass controls' },
  { id: 'Credential Access', shortCode: 'TA0006', description: 'Techniques for stealing credentials & session tokens' },
  { id: 'Lateral Movement', shortCode: 'TA0008', description: 'Techniques used to enter and control remote systems' },
  { id: 'Exfiltration', shortCode: 'TA0010', description: 'Techniques used to steal data from network' },
  { id: 'Impact', shortCode: 'TA0040', description: 'Techniques used to disrupt availability or integrity' },
];

// Seaborn Interpolation Engine
function interpolateColor(color1: number[], color2: number[], factor: number): number[] {
  return [
    Math.round(color1[0] + factor * (color2[0] - color1[0])),
    Math.round(color1[1] + factor * (color2[1] - color1[1])),
    Math.round(color1[2] + factor * (color2[2] - color1[2])),
  ];
}

function getSeabornCellColor(normVal: number, cmap: ColormapScheme): { bg: string; text: string; rawRgb: number[] } {
  const clamp = Math.max(0, Math.min(1, normVal));

  let rgb = [0, 0, 0];

  if (cmap === 'YlOrRd') {
    const stops = [
      { t: 0.0, rgb: [255, 255, 204] },
      { t: 0.35, rgb: [254, 178, 76] },
      { t: 0.7, rgb: [240, 59, 32] },
      { t: 1.0, rgb: [128, 0, 38] },
    ];
    rgb = getStopColor(clamp, stops);
  } else if (cmap === 'Viridis') {
    const stops = [
      { t: 0.0, rgb: [68, 1, 84] },
      { t: 0.25, rgb: [59, 82, 139] },
      { t: 0.5, rgb: [33, 145, 140] },
      { t: 0.75, rgb: [94, 201, 98] },
      { t: 1.0, rgb: [253, 231, 37] },
    ];
    rgb = getStopColor(clamp, stops);
  } else if (cmap === 'Magma') {
    const stops = [
      { t: 0.0, rgb: [0, 0, 4] },
      { t: 0.3, rgb: [81, 18, 124] },
      { t: 0.6, rgb: [183, 55, 121] },
      { t: 0.85, rgb: [251, 136, 97] },
      { t: 1.0, rgb: [252, 253, 191] },
    ];
    rgb = getStopColor(clamp, stops);
  } else if (cmap === 'Rocket') {
    const stops = [
      { t: 0.0, rgb: [24, 15, 36] },
      { t: 0.3, rgb: [99, 24, 56] },
      { t: 0.6, rgb: [184, 50, 79] },
      { t: 0.85, rgb: [230, 119, 97] },
      { t: 1.0, rgb: [246, 210, 169] },
    ];
    rgb = getStopColor(clamp, stops);
  } else if (cmap === 'Coolwarm') {
    const stops = [
      { t: 0.0, rgb: [59, 76, 192] },
      { t: 0.35, rgb: [140, 189, 255] },
      { t: 0.5, rgb: [242, 242, 242] },
      { t: 0.75, rgb: [247, 138, 112] },
      { t: 1.0, rgb: [180, 4, 38] },
    ];
    rgb = getStopColor(clamp, stops);
  }

  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  const textColor = luminance > 0.55 ? '#000000' : '#ffffff';

  return {
    bg: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
    text: textColor,
    rawRgb: rgb,
  };
}

function getStopColor(val: number, stops: { t: number; rgb: number[] }[]): number[] {
  for (let i = 0; i < stops.length - 1; i++) {
    if (val >= stops[i].t && val <= stops[i + 1].t) {
      const factor = (val - stops[i].t) / (stops[i + 1].t - stops[i].t);
      return interpolateColor(stops[i].rgb, stops[i + 1].rgb, factor);
    }
  }
  return stops[stops.length - 1].rgb;
}

export const ThreatEngine: React.FC<ThreatEngineProps> = ({ 
  actors, 
  vulnerabilities = [], 
  searchQuery 
}) => {
  const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(actors[0] || null);
  const [activeTab, setActiveTab] = useState<'actors' | 'mitre' | 'top_cves' | 'cia_triad'>('actors');
  const [copiedIoc, setCopiedIoc] = useState<string | null>(null);

  // Seaborn Matrix State
  const [activeColormap, setActiveColormap] = useState<ColormapScheme>('YlOrRd');
  const [activeMetric, setActiveMetric] = useState<MetricMode>('psss');
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{
    vuln: Vulnerability;
    tactic: typeof MITRE_TACTICS[0];
  } | null>(null);

  // Top CVEs Bar Graph State
  const [barCount, setBarCount] = useState<number>(10);
  const [barMetric, setBarMetric] = useState<'psss_norm' | 'psss_raw' | 'epss' | 'cvss'>('psss_norm');
  const [barTheme, setBarTheme] = useState<BarTheme>('amber');
  const [selectedBarVuln, setSelectedBarVuln] = useState<Vulnerability | null>(vulnerabilities[0] || null);

  // CIA Triad State
  const [selectedCiaCategory, setSelectedCiaCategory] = useState<string>('ALL');
  const [selectedCiaVuln, setSelectedCiaVuln] = useState<Vulnerability | null>(vulnerabilities[0] || null);

  const filteredActors = actors.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.targetSectors.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedIoc(val);
    setTimeout(() => setCopiedIoc(null), 2000);
  };

  // Filter vulnerabilities matching search
  const filteredVulnerabilities = vulnerabilities.filter(
    (v) =>
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.cwe.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort vulnerabilities by selected metric descending
  const sortedVulnerabilities = [...filteredVulnerabilities].sort((a, b) => {
    if (activeMetric === 'psss') return b.psssScore - a.psssScore;
    if (activeMetric === 'epss') return b.epssScore - a.epssScore;
    if (activeMetric === 'cvss') return b.cvssScore - a.cvssScore;
    if (activeMetric === 'exposure') return (b.psssScore * b.affectedNodes) - (a.psssScore * a.affectedNodes);
    return 0;
  });

  // Calculate Metric Boundaries for Matrix
  const getMetricValue = (v: Vulnerability): number => {
    if (activeMetric === 'psss') return v.psssScore;
    if (activeMetric === 'epss') return v.epssScore * 100;
    if (activeMetric === 'cvss') return v.cvssScore;
    if (activeMetric === 'exposure') return v.psssScore * v.affectedNodes;
    return 0;
  };

  const getMetricLabel = (): string => {
    if (activeMetric === 'psss') return 'Calculated PSSS Score (0-10)';
    if (activeMetric === 'epss') return 'EPSS Exploit Probability (%)';
    if (activeMetric === 'cvss') return 'CVSS v3.1 Base Score (0-10)';
    if (activeMetric === 'exposure') return 'Fleet Risk Exposure (PSSS × Hosts)';
    return '';
  };

  const formatCellValue = (val: number): string => {
    if (activeMetric === 'psss' || activeMetric === 'cvss') return val.toFixed(1);
    if (activeMetric === 'epss') return `${val.toFixed(1)}%`;
    if (activeMetric === 'exposure') return `${Math.round(val)}`;
    return val.toString();
  };

  const minMetricVal = activeMetric === 'exposure' ? 0 : 0;
  const maxMetricVal = activeMetric === 'epss' ? 100 : activeMetric === 'exposure' ? Math.max(...vulnerabilities.map(v => v.psssScore * v.affectedNodes), 1000) : 10;

  // Seaborn Marginal Totals per Tactic Column
  const tacticMarginals = MITRE_TACTICS.map((tactic) => {
    const mapped = sortedVulnerabilities.filter((v) =>
      v.mitreTactics?.some((t) => t.toLowerCase() === tactic.id.toLowerCase())
    );
    const maxVal = mapped.length > 0 ? Math.max(...mapped.map(getMetricValue)) : 0;
    const avgVal = mapped.length > 0 ? mapped.reduce((acc, v) => acc + getMetricValue(v), 0) / mapped.length : 0;
    return {
      tactic,
      count: mapped.length,
      maxVal,
      avgVal,
    };
  });

  // Top CVEs Bar Chart Data Processing
  const topCveList = [...filteredVulnerabilities]
    .sort((a, b) => {
      if (barMetric === 'psss_norm' || barMetric === 'psss_raw') return b.psssScore - a.psssScore;
      if (barMetric === 'epss') return b.epssScore - a.epssScore;
      if (barMetric === 'cvss') return b.cvssScore - a.cvssScore;
      return 0;
    })
    .slice(0, barCount);

  const getBarValue = (v: Vulnerability): number => {
    if (barMetric === 'psss_norm') return v.psssScore / 10.0;
    if (barMetric === 'psss_raw') return v.psssScore;
    if (barMetric === 'epss') return v.epssScore;
    if (barMetric === 'cvss') return v.cvssScore;
    return 0;
  };

  const maxBarScale = barMetric === 'psss_norm' || barMetric === 'epss' ? 1.0 : 10.0;
  const barAxisTicks = barMetric === 'psss_norm' || barMetric === 'epss'
    ? [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getBarColorClass = () => {
    if (barTheme === 'amber') return 'bg-[#f5a623] hover:bg-[#ffb732] border-[#e69138]';
    if (barTheme === 'flame') return 'bg-gradient-to-r from-amber-500 to-red-600 border-red-500';
    return 'bg-gradient-to-r from-cyan-500 to-primary-bright border-primary-bright shadow-glow-cyan';
  };

  // CIA Triad Calculations
  const checkCiaImpact = (v: Vulnerability) => {
    const vec = v.vector || '';
    const hasC = vec.includes('/C:H') || vec.includes('/C:L') || v.cwe.toLowerCase().includes('information') || v.cwe.toLowerCase().includes('exposure') || v.cwe.toLowerCase().includes('leak') || v.cwe.toLowerCase().includes('disclosure');
    const hasI = vec.includes('/I:H') || vec.includes('/I:L') || v.cwe.toLowerCase().includes('code execution') || v.cwe.toLowerCase().includes('bypass') || v.cwe.toLowerCase().includes('overflow') || v.cwe.toLowerCase().includes('injection') || v.cwe.toLowerCase().includes('write');
    const hasA = vec.includes('/A:H') || vec.includes('/A:L') || v.cwe.toLowerCase().includes('resource consumption') || v.cwe.toLowerCase().includes('dos') || v.cwe.toLowerCase().includes('exhaustion') || v.cwe.toLowerCase().includes('overflow');

    return { hasC, hasI, hasA, isFullBreach: hasC && hasI && hasA };
  };

  const ciaStats = filteredVulnerabilities.map(v => ({ vuln: v, ...checkCiaImpact(v) }));
  const totalVulnsCount = ciaStats.length || 1;

  const countC = ciaStats.filter(s => s.hasC).length;
  const countI = ciaStats.filter(s => s.hasI).length;
  const countA = ciaStats.filter(s => s.hasA).length;
  const countFullBreach = ciaStats.filter(s => s.isFullBreach).length;

  const percentC = ((countC / totalVulnsCount) * 100).toFixed(1);
  const percentI = ((countI / totalVulnsCount) * 100).toFixed(1);
  const percentA = ((countA / totalVulnsCount) * 100).toFixed(1);
  const percentFullBreach = ((countFullBreach / totalVulnsCount) * 100).toFixed(1);

  // Categories for Pie Chart
  const pieCategories = [
    { id: 'FULL_BREACH', label: 'Full CIA Triad Breach (C+I+A)', count: countFullBreach, color: '#ef4444', percent: percentFullBreach },
    { id: 'CONFIDENTIALITY', label: 'Confidentiality Impact Only/Primary', count: countC, color: '#38bdf8', percent: percentC },
    { id: 'INTEGRITY', label: 'Integrity Impact Only/Primary', count: countI, color: '#a855f7', percent: percentI },
    { id: 'AVAILABILITY', label: 'Availability Impact Only/Primary', count: countA, color: '#f97316', percent: percentA },
  ];

  // SVG Pie Chart Slice Angles
  const totalCategorySum = pieCategories.reduce((acc, cat) => acc + cat.count, 0) || 1;
  let accumulatedAngle = 0;
  const pieSlices = pieCategories.map((cat) => {
    const angle = (cat.count / totalCategorySum) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return { ...cat, angle, startAngle, endAngle: accumulatedAngle };
  });

  const getCoordinatesForAngle = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: 100 + 80 * Math.cos(rad),
      y: 100 + 80 * Math.sin(rad),
    };
  };

  const filteredCiaVulns = selectedCiaCategory === 'ALL'
    ? ciaStats
    : selectedCiaCategory === 'CONFIDENTIALITY'
    ? ciaStats.filter(s => s.hasC)
    : selectedCiaCategory === 'INTEGRITY'
    ? ciaStats.filter(s => s.hasI)
    : selectedCiaCategory === 'AVAILABILITY'
    ? ciaStats.filter(s => s.hasA)
    : ciaStats.filter(s => s.isFullBreach);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-lg border border-primary/40 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded bg-primary/20 text-primary-bright border border-primary/30 shadow-glow-cyan">
            <Skull className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-on-surface">
              Attack Surface Intelligence // Threat Plane
            </h1>
            <p className="text-xs text-on-surface-variant">
              Global threat actor dossiers, MITRE ATT&CK heatmaps, PSSS ranks, & CIA triad impact breakdowns.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded bg-surface-container p-1 border border-outline-variant/30 flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('actors')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'actors'
                ? 'bg-primary text-on-primary shadow-glow-cyan'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Threat Dossiers
          </button>
          <button
            onClick={() => setActiveTab('mitre')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'mitre'
                ? 'bg-primary text-on-primary shadow-glow-cyan'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            MITRE ATT&CK Heatmap
          </button>
          <button
            onClick={() => setActiveTab('top_cves')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'top_cves'
                ? 'bg-primary text-on-primary shadow-glow-cyan'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Top CVE Rank</span>
          </button>
          <button
            onClick={() => setActiveTab('cia_triad')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'cia_triad'
                ? 'bg-primary text-on-primary shadow-glow-cyan'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>CIA Triad Impact</span>
          </button>
        </div>
      </div>

      {activeTab === 'actors' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Actor Cards Grid (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-3">
              {filteredActors.map((actor) => {
                const isSelected = selectedActor?.id === actor.id;
                return (
                  <div
                    key={actor.id}
                    onClick={() => setSelectedActor(actor)}
                    className={`glass-panel p-4.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-glow-cyan'
                        : 'border-outline-variant/30 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="space-y-2.5 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-on-surface">{actor.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-error-container/40 text-error border border-error/40 font-bold uppercase">
                            {actor.threatLevel} THREAT
                          </span>
                        </div>

                        <div className="text-xs text-on-surface-variant flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-primary-bright" />
                            {actor.origin}
                          </span>
                          <span>
                            Last Active: <strong className="text-on-surface">{formatDateTime(actor.lastActive)}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap pt-1.5 pb-0.5 leading-normal">
                          <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Target Sectors:</span>
                          {actor.targetSectors.map((sector) => (
                            <span
                              key={sector}
                              className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant text-[10px] whitespace-nowrap inline-block"
                            >
                              {sector}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actor Dossier Inspector (5 cols) */}
          <div className="lg:col-span-5">
            {selectedActor ? (
              <div className="glass-panel p-5 rounded-lg border border-primary/40 sticky top-20 space-y-5">
                <div className="border-b border-outline-variant/30 pb-3 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-primary-bright">
                    THREAT ACTOR DOSSIER // {selectedActor.id}
                  </div>
                  <h2 className="text-base font-bold text-on-surface">{selectedActor.name}</h2>
                  <p className="text-xs text-on-surface-variant">{selectedActor.description}</p>
                </div>

                {/* Aliases */}
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block mb-1">
                    Known Aliases:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedActor.aliases.map((alias) => (
                      <span key={alias} className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[10px]">
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Exploited CVEs */}
                <div className="space-y-1">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                    Associated CVE Exploitation Vectors:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedActor.associatedCves.map((cve) => (
                      <span
                        key={cve}
                        className="px-2.5 py-1 rounded bg-error-container/20 text-error border border-error/30 font-bold"
                      >
                        {cve}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Indicators of Compromise (IOCs) */}
                <div className="space-y-2">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold flex items-center justify-between">
                    <span>High-Confidence IOC Feed ({selectedActor.iocs.length})</span>
                  </span>

                  <div className="space-y-1.5">
                    {selectedActor.iocs.map((ioc) => (
                      <div
                        key={ioc.value}
                        className="p-2 rounded bg-surface-container border border-outline-variant/30 flex items-center justify-between font-mono text-[11px]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary-bright text-[9px] font-bold">
                            {ioc.type}
                          </span>
                          <span className="text-on-surface truncate">{ioc.value}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(ioc.value)}
                          className="p-1 hover:text-primary transition-colors text-on-surface-variant"
                          title="Copy IOC"
                        >
                          {copiedIoc === ioc.value ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {activeTab === 'mitre' && (
        <div className="space-y-6">
          {/* Seaborn Control & Palette Bar */}
          <div className="glass-panel p-4 rounded-lg border border-primary/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Metric Selector */}
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary-bright" />
                <span className="font-bold text-on-surface">Heatmap Metric:</span>
                <select
                  value={activeMetric}
                  onChange={(e) => setActiveMetric(e.target.value as MetricMode)}
                  className="bg-surface-container border border-outline-variant/40 rounded px-3 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none font-bold"
                >
                  <option value="psss">PSSS Calculated Score</option>
                  <option value="epss">EPSS Exploit Probability (%)</option>
                  <option value="cvss">CVSS v3.1 Base Score</option>
                  <option value="exposure">Fleet Exposure (PSSS × Hosts)</option>
                </select>
              </div>

              {/* Seaborn Colormap Selector */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-tertiary" />
                <span className="font-bold text-on-surface">Seaborn Colormap (`cmap`):</span>
                <div className="flex items-center gap-1.5 rounded bg-surface-container p-1 border border-outline-variant/30">
                  {(['YlOrRd', 'Viridis', 'Magma', 'Rocket', 'Coolwarm'] as ColormapScheme[]).map((cmap) => (
                    <button
                      key={cmap}
                      onClick={() => setActiveColormap(cmap)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                        activeColormap === cmap
                          ? 'bg-primary text-on-primary shadow-glow-cyan'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {cmap}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Annotations Toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface">
                <input
                  type="checkbox"
                  checked={showAnnotations}
                  onChange={(e) => setShowAnnotations(e.target.checked)}
                  className="rounded bg-surface-container border-outline-variant text-primary focus:ring-0"
                />
                <span>Annotate Values (`annot=True`)</span>
              </label>
            </div>
          </div>

          {/* Main Seaborn Heatmap Matrix Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Seaborn Plot Canvas (9 cols) */}
            <div className="lg:col-span-9 space-y-4">
              <div className="glass-panel p-5 rounded-lg border border-outline-variant/30 overflow-x-auto space-y-4">
                {/* Plot Title Block */}
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary-bright" />
                      MITRE ATT&CK Vulnerability Matrix (cmap="{activeColormap}", annot={showAnnotations ? 'True' : 'False'})
                    </h2>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">
                      Metric Mode: <strong className="text-primary-bright">{getMetricLabel()}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-tertiary bg-tertiary-container/20 px-2.5 py-1 rounded border border-tertiary/30">
                    Matrix Shape: ({sortedVulnerabilities.length}, {MITRE_TACTICS.length})
                  </span>
                </div>

                {/* Heatmap Grid & Colorbar Layout */}
                <div className="flex items-start gap-4 min-w-[720px]">
                  {/* The Matrix */}
                  <div className="flex-1 space-y-1">
                    {/* Header Row: MITRE ATT&CK Tactics (X-Axis) */}
                    <div className="grid grid-cols-9 gap-1 mb-2">
                      {MITRE_TACTICS.map((tactic) => (
                        <div
                          key={tactic.id}
                          className="p-2 rounded bg-surface-container border border-outline-variant/30 text-center space-y-0.5"
                          title={tactic.description}
                        >
                          <div className="text-[9px] font-bold text-primary-bright uppercase truncate">
                            {tactic.shortCode}
                          </div>
                          <div className="text-[10px] font-bold text-on-surface truncate" title={tactic.id}>
                            {tactic.id}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Matrix Rows: Vulnerabilities (Y-Axis) */}
                    {sortedVulnerabilities.map((vuln) => {
                      return (
                        <div key={vuln.id} className="grid grid-cols-9 gap-1 items-stretch">
                          {MITRE_TACTICS.map((tactic) => {
                            const isMapped = vuln.mitreTactics?.some(
                              (t) => t.toLowerCase() === tactic.id.toLowerCase()
                            );
                            const val = isMapped ? getMetricValue(vuln) : null;
                            const norm = val !== null ? (val - minMetricVal) / (maxMetricVal - minMetricVal || 1) : 0;
                            const cellStyling = val !== null ? getSeabornCellColor(norm, activeColormap) : null;

                            const isSelected = selectedMatrixCell?.vuln.id === vuln.id && selectedMatrixCell?.tactic.id === tactic.id;

                            return (
                              <div
                                key={tactic.id}
                                onClick={() => isMapped && setSelectedMatrixCell({ vuln, tactic })}
                                className={`h-14 rounded p-1.5 flex flex-col justify-between transition-all font-mono border relative group ${
                                  isMapped ? 'cursor-pointer hover:scale-[1.03] hover:z-10 hover:shadow-lg' : 'bg-surface-container/20 border-outline-variant/10 opacity-40'
                                } ${isSelected ? 'ring-2 ring-primary-bright shadow-glow-cyan z-20' : ''}`}
                                style={
                                  cellStyling
                                    ? {
                                        backgroundColor: cellStyling.bg,
                                        borderColor: 'rgba(255, 255, 255, 0.15)',
                                        color: cellStyling.text,
                                      }
                                    : {}
                                }
                              >
                                {isMapped ? (
                                  <>
                                    <div className="flex items-center justify-between text-[8px] font-bold opacity-80">
                                      <span className="truncate">{vuln.id}</span>
                                      {vuln.activeExploits && <span>⚡</span>}
                                    </div>

                                    {showAnnotations && (
                                      <div className="text-center font-bold text-xs tracking-wider">
                                        {formatCellValue(val!)}
                                      </div>
                                    )}

                                    <div className="text-[7px] opacity-70 truncate font-sans">
                                      {vuln.severity}
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-on-surface-variant/40 font-mono">
                                    —
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                    {/* Seaborn Marginal Totals Row (Max / Avg per Tactic Column) */}
                    <div className="pt-3 border-t border-outline-variant/30 space-y-1">
                      <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Tactic Marginal Statistics (Max & Avg):
                      </div>
                      <div className="grid grid-cols-9 gap-1">
                        {tacticMarginals.map(({ tactic, count, maxVal, avgVal }) => (
                          <div
                            key={tactic.id}
                            className="p-1.5 rounded bg-surface-container border border-outline-variant/30 text-center space-y-0.5"
                          >
                            <div className="text-[9px] font-bold text-on-surface">
                              Max: <span className="text-tertiary">{maxVal > 0 ? formatCellValue(maxVal) : 'N/A'}</span>
                            </div>
                            <div className="text-[8px] text-on-surface-variant">
                              Avg: {avgVal > 0 ? formatCellValue(avgVal) : 'N/A'}
                            </div>
                            <div className="text-[8px] text-primary-bright font-bold">
                              ({count} CVEs)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Continuous Seaborn Colorbar (`cbar`) */}
                  <div className="w-14 shrink-0 flex flex-col items-center justify-between h-[420px] p-2 rounded bg-surface-container border border-outline-variant/30 font-mono text-[9px] text-on-surface">
                    <span className="font-bold text-tertiary">{formatCellValue(maxMetricVal)}</span>

                    {/* Gradient Bar Container */}
                    <div
                      className="w-4 flex-1 my-2 rounded border border-outline-variant/40 shadow-inner"
                      style={{
                        background: `linear-gradient(to top, 
                          ${getSeabornCellColor(0.0, activeColormap).bg}, 
                          ${getSeabornCellColor(0.25, activeColormap).bg}, 
                          ${getSeabornCellColor(0.5, activeColormap).bg}, 
                          ${getSeabornCellColor(0.75, activeColormap).bg}, 
                          ${getSeabornCellColor(1.0, activeColormap).bg})`,
                      }}
                    />

                    <span className="font-bold text-on-surface-variant">{formatCellValue(minMetricVal)}</span>
                    <span className="text-[8px] text-on-surface-variant text-center mt-1 font-sans leading-tight">
                      cbar scale ({activeColormap})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Cell Inspector Panel (3 cols) */}
            <div className="lg:col-span-3">
              {selectedMatrixCell ? (
                <div className="glass-panel p-5 rounded-lg border border-primary/40 sticky top-20 space-y-5">
                  {/* Header */}
                  <div className="border-b border-outline-variant/30 pb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-primary-bright">
                        MATRIX CELL INSPECTOR
                      </span>
                      <PsssBadge score={selectedMatrixCell.vuln.psssScore} severity={selectedMatrixCell.vuln.severity} size="sm" />
                    </div>
                    <h2 className="text-sm font-bold text-on-surface">{selectedMatrixCell.vuln.id}</h2>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{selectedMatrixCell.vuln.title}</p>
                  </div>

                  {/* Matrix Coordinates */}
                  <div className="p-3 rounded bg-primary/10 border border-primary/30 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-primary-bright block">Cell Coordinates:</span>
                    <div className="text-xs font-bold text-on-surface flex items-center justify-between">
                      <span>Tactic: {selectedMatrixCell.tactic.id}</span>
                      <span className="px-1.5 py-0.5 rounded bg-primary/30 text-primary-bright text-[9px]">
                        {selectedMatrixCell.tactic.shortCode}
                      </span>
                    </div>
                  </div>

                  {/* Calculated Metrics */}
                  <div className="space-y-2">
                    <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30 flex justify-between items-center">
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold">PSSS Score:</span>
                      <span className="font-bold text-xs text-error">{selectedMatrixCell.vuln.psssScore.toFixed(1)}</span>
                    </div>

                    <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30 flex justify-between items-center">
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold">EPSS Exploit Prob:</span>
                      <span className="font-bold text-xs text-tertiary">{(selectedMatrixCell.vuln.epssScore * 100).toFixed(1)}%</span>
                    </div>

                    <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30 flex justify-between items-center">
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold">CVSS v3.1 Base:</span>
                      <span className="font-bold text-xs text-on-surface">{selectedMatrixCell.vuln.cvssScore.toFixed(1)}</span>
                    </div>

                    <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30 flex justify-between items-center">
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold">Affected Hosts:</span>
                      <span className="font-bold text-xs text-primary-bright">{selectedMatrixCell.vuln.affectedNodes} hosts</span>
                    </div>
                  </div>

                  {/* Remediation SLA */}
                  {selectedMatrixCell.vuln.remediationAction && (
                    <div className="p-3 rounded bg-error-container/15 border border-error/30 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-error flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Mandated Remediation:
                      </span>
                      <p className="text-xs text-on-surface font-sans leading-relaxed">
                        {selectedMatrixCell.vuln.remediationAction}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-panel p-6 text-center text-on-surface-variant rounded-lg border border-outline-variant/30 space-y-2">
                  <Maximize2 className="w-6 h-6 mx-auto text-primary-bright opacity-60" />
                  <div className="font-bold text-xs text-on-surface">Interactive Matrix Cell Inspection</div>
                  <p className="text-[10px] text-on-surface-variant">
                    Click any non-empty cell in the heatmap matrix to inspect coordinates, values, and calculations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: Top CVE Rank */}
      {activeTab === 'top_cves' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Controls Toolbar */}
          <div className="glass-panel p-4 rounded-lg border border-primary/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Display Count */}
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-bright" />
                <span className="font-bold text-on-surface">Top CVE Limit:</span>
                <select
                  value={barCount}
                  onChange={(e) => setBarCount(Number(e.target.value))}
                  className="bg-surface-container border border-outline-variant/40 rounded px-3 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none font-bold"
                >
                  <option value={10}>Top 10 CVEs</option>
                  <option value={15}>Top 15 CVEs</option>
                  <option value={20}>Top 20 CVEs</option>
                  <option value={100}>All CVEs ({vulnerabilities.length})</option>
                </select>
              </div>

              {/* Metric Selector */}
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-tertiary" />
                <span className="font-bold text-on-surface">Rank Metric:</span>
                <select
                  value={barMetric}
                  onChange={(e) => setBarMetric(e.target.value as any)}
                  className="bg-surface-container border border-outline-variant/40 rounded px-3 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none font-bold"
                >
                  <option value="psss_norm">PSSS_final (0.0 - 1.0)</option>
                  <option value="psss_raw">Raw PSSS Score (0 - 10)</option>
                  <option value="epss">EPSS Exploit Prob (0.0 - 1.0)</option>
                  <option value="cvss">CVSS Base Score (0 - 10)</option>
                </select>
              </div>

              {/* Bar Palette Theme */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-secondary" />
                <span className="font-bold text-on-surface">Bar Palette:</span>
                <div className="flex items-center gap-1 rounded bg-surface-container p-1 border border-outline-variant/30">
                  <button
                    onClick={() => setBarTheme('amber')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      barTheme === 'amber'
                        ? 'bg-amber-500 text-black font-bold shadow-glow-amber'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Matplotlib Amber
                  </button>
                  <button
                    onClick={() => setBarTheme('flame')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      barTheme === 'flame'
                        ? 'bg-red-500 text-white font-bold shadow-glow-red'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Flame Gradient
                  </button>
                  <button
                    onClick={() => setBarTheme('cyan')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      barTheme === 'cyan'
                        ? 'bg-primary text-on-primary font-bold shadow-glow-cyan'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Cyber Cyan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Matplotlib Figure Canvas & Detail Inspector Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Horizontal Bar Plot Canvas (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="glass-panel p-6 rounded-lg border border-outline-variant/40 space-y-4 bg-surface-container/20">
                {/* Figure Title Banner */}
                <div className="border-b border-outline-variant/30 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-on-surface">
                      Overall Vulnerability Prioritization Rank (`Top {topCveList.length} CVEs`)
                    </h2>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      System performance & score distribution demonstrating PSSS prioritization effectiveness.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 text-[10px]">
                    Matplotlib plt.barh()
                  </span>
                </div>

                {/* Plot Area: Y-Axis (CVEs), Horizontal Bars, X-Axis Ticks & Grid */}
                <div className="space-y-3 pt-2">
                  {topCveList.map((vuln) => {
                    const val = getBarValue(vuln);
                    const percentage = (val / maxBarScale) * 100;
                    const isSelected = selectedBarVuln?.id === vuln.id;

                    return (
                      <div
                        key={vuln.id}
                        onClick={() => setSelectedBarVuln(vuln)}
                        className={`flex items-center gap-3 group cursor-pointer transition-all ${
                          isSelected ? 'scale-[1.01]' : ''
                        }`}
                      >
                        {/* Y-Axis Label: CVE ID */}
                        <div className="w-28 text-right font-mono font-bold text-xs text-on-surface shrink-0 group-hover:text-primary-bright transition-colors">
                          {vuln.id}
                        </div>

                        {/* Bar Container with Grid Background */}
                        <div className="flex-1 bg-surface-container/60 rounded h-6 border border-outline-variant/20 relative overflow-hidden flex items-center pr-2">
                          {/* Grid Lines Overlay */}
                          <div className="absolute inset-0 grid grid-cols-10 pointer-events-none opacity-15 divide-x divide-outline-variant">
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                          </div>

                          {/* Horizontal Bar */}
                          <div
                            className={`h-full rounded-r transition-all duration-500 flex items-center justify-end px-2 ${getBarColorClass()} ${
                              isSelected ? 'ring-2 ring-white z-10 shadow-lg' : ''
                            }`}
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="text-[10px] font-extrabold text-black drop-shadow-sm font-mono">
                              {val.toFixed(3)}
                            </span>
                          </div>

                          {/* End Value Indicator if bar is short */}
                          {percentage < 15 && (
                            <span className="ml-2 text-[10px] font-bold text-on-surface font-mono">
                              {val.toFixed(3)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Ticks & Label (`PSSS_final`) */}
                <div className="pt-4 border-t border-outline-variant/30 space-y-1">
                  <div className="flex justify-between pl-31 pr-2 text-[10px] font-mono text-on-surface-variant">
                    {barAxisTicks.map((tick) => (
                      <span key={tick}>{tick.toFixed(1)}</span>
                    ))}
                  </div>
                  <div className="text-center font-bold text-xs text-on-surface uppercase tracking-wider pt-1">
                    {barMetric === 'psss_norm' ? 'PSSS_final' : barMetric === 'psss_raw' ? 'PSSS_score' : barMetric === 'epss' ? 'EPSS_probability' : 'CVSS_base'}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected CVE Detail Inspector (4 cols) */}
            <div className="lg:col-span-4">
              {selectedBarVuln ? (
                <div className="glass-panel p-5 rounded-lg border border-primary/40 sticky top-20 space-y-5">
                  {/* Header */}
                  <div className="border-b border-outline-variant/30 pb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> PSSS_FINAL RANK #
                        {topCveList.findIndex(v => v.id === selectedBarVuln.id) + 1}
                      </span>
                      <PsssBadge score={selectedBarVuln.psssScore} severity={selectedBarVuln.severity} size="md" />
                    </div>
                    <h2 className="text-base font-bold text-on-surface">{selectedBarVuln.id}</h2>
                    <p className="text-xs text-on-surface-variant font-sans leading-relaxed">{selectedBarVuln.title}</p>
                  </div>

                  {/* Calculations Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30">
                      <span className="text-[9px] uppercase font-bold text-on-surface-variant block">PSSS_final Norm</span>
                      <span className="text-sm font-bold text-amber-400">{(selectedBarVuln.psssScore / 10).toFixed(3)}</span>
                    </div>

                    <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30">
                      <span className="text-[9px] uppercase font-bold text-on-surface-variant block">CVSS v3.1 Base</span>
                      <span className="text-sm font-bold text-on-surface">{selectedBarVuln.cvssScore.toFixed(1)}</span>
                    </div>

                    <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30">
                      <span className="text-[9px] uppercase font-bold text-on-surface-variant block">EPSS Exploit Prob.</span>
                      <span className="text-sm font-bold text-tertiary">{(selectedBarVuln.epssScore * 100).toFixed(1)}%</span>
                    </div>

                    <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30">
                      <span className="text-[9px] uppercase font-bold text-on-surface-variant block">Affected Hosts</span>
                      <span className="text-sm font-bold text-primary-bright">{selectedBarVuln.affectedNodes} Nodes</span>
                    </div>
                  </div>

                  {/* Weakness & Component */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold block mb-1">
                        Weakness Classification (CWE):
                      </span>
                      <span 
                        className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-mono block truncate"
                        title={selectedBarVuln.cwe}
                      >
                        {selectedBarVuln.cwe}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold block mb-1">
                        Affected Component:
                      </span>
                      <div className="p-2 rounded bg-surface-container border border-outline-variant/30 text-xs font-mono text-on-surface">
                        {selectedBarVuln.component}
                      </div>
                    </div>
                  </div>

                  {/* Mandated Remediation Action */}
                  {selectedBarVuln.remediationAction && (
                    <div className="p-3 rounded bg-error-container/15 border border-error/30 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-error flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> SLA Remediation Guidance:
                      </span>
                      <p className="text-xs text-on-surface font-sans leading-relaxed">
                        {selectedBarVuln.remediationAction}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* NEW SUB-TAB: CIA Triad Impact Pie Chart */}
      {activeTab === 'cia_triad' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Top Pillar Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setSelectedCiaCategory('CONFIDENTIALITY')}
              className={`glass-panel p-4 rounded-lg border transition-all cursor-pointer ${
                selectedCiaCategory === 'CONFIDENTIALITY'
                  ? 'border-sky-400 bg-sky-500/10 shadow-glow-cyan'
                  : 'border-outline-variant/30 hover:border-sky-400/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Confidentiality (C)</span>
                  <span className="text-xl font-bold text-sky-400">{percentC}%</span>
                  <span className="text-[10px] text-sky-400/80 block mt-0.5">{countC} / {vulnerabilities.length} Vulnerabilities</span>
                </div>
                <div className="p-3 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setSelectedCiaCategory('INTEGRITY')}
              className={`glass-panel p-4 rounded-lg border transition-all cursor-pointer ${
                selectedCiaCategory === 'INTEGRITY'
                  ? 'border-purple-400 bg-purple-500/10 shadow-glow-purple'
                  : 'border-outline-variant/30 hover:border-purple-400/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Integrity (I)</span>
                  <span className="text-xl font-bold text-purple-400">{percentI}%</span>
                  <span className="text-[10px] text-purple-400/80 block mt-0.5">{countI} / {vulnerabilities.length} Vulnerabilities</span>
                </div>
                <div className="p-3 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setSelectedCiaCategory('AVAILABILITY')}
              className={`glass-panel p-4 rounded-lg border transition-all cursor-pointer ${
                selectedCiaCategory === 'AVAILABILITY'
                  ? 'border-orange-400 bg-orange-500/10 shadow-glow-amber'
                  : 'border-outline-variant/30 hover:border-orange-400/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Availability (A)</span>
                  <span className="text-xl font-bold text-orange-400">{percentA}%</span>
                  <span className="text-[10px] text-orange-400/80 block mt-0.5">{countA} / {vulnerabilities.length} Vulnerabilities</span>
                </div>
                <div className="p-3 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setSelectedCiaCategory('FULL_BREACH')}
              className={`glass-panel p-4 rounded-lg border transition-all cursor-pointer ${
                selectedCiaCategory === 'FULL_BREACH'
                  ? 'border-error bg-error-container/20 shadow-glow-red'
                  : 'border-outline-variant/30 hover:border-error/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Full Triad Breach</span>
                  <span className="text-xl font-bold text-error">{percentFullBreach}%</span>
                  <span className="text-[10px] text-error/80 block mt-0.5">{countFullBreach} C+I+A Total Compromises</span>
                </div>
                <div className="p-3 rounded bg-error-container/30 text-error border border-error/40">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Pie Chart & Category Filter Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SVG Pie Chart & Legend Canvas (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="glass-panel p-6 rounded-lg border border-outline-variant/30 space-y-5">
                <div className="border-b border-outline-variant/30 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-primary-bright" />
                      Cybersecurity CIA Triad Violation Breakdown
                    </h2>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      Proportional impact analysis across Confidentiality, Integrity, & Availability pillars.
                    </p>
                  </div>
                  {selectedCiaCategory !== 'ALL' && (
                    <button
                      onClick={() => setSelectedCiaCategory('ALL')}
                      className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant text-[10px]"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                {/* Donut / Pie Chart Render */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                  {/* SVG Pie Chart Canvas */}
                  <div className="relative w-52 h-52 shrink-0">
                    <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform drop-shadow-md">
                      {pieSlices.map((slice) => {
                        const start = getCoordinatesForAngle(slice.startAngle);
                        const end = getCoordinatesForAngle(slice.endAngle);
                        const largeArcFlag = slice.angle > 180 ? 1 : 0;

                        const pathData = [
                          `M 100 100`,
                          `L ${start.x} ${start.y}`,
                          `A 80 80 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
                          `Z`,
                        ].join(' ');

                        const isSelected = selectedCiaCategory === slice.id;

                        return (
                          <path
                            key={slice.id}
                            d={pathData}
                            fill={slice.color}
                            opacity={selectedCiaCategory === 'ALL' || isSelected ? 0.9 : 0.3}
                            stroke="#121824"
                            strokeWidth="2"
                            onClick={() => setSelectedCiaCategory(isSelected ? 'ALL' : slice.id)}
                            className="cursor-pointer transition-all duration-300 hover:opacity-100 hover:scale-[1.03] transform origin-center"
                          />
                        );
                      })}
                      {/* Donut Center Hole */}
                      <circle cx="100" cy="100" r="45" fill="#121824" />
                    </svg>

                    {/* Donut Center Info Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-base font-bold text-on-surface">{vulnerabilities.length}</span>
                      <span className="text-[9px] text-on-surface-variant font-mono uppercase">Total CVEs</span>
                    </div>
                  </div>

                  {/* Pie Legend Breakdown Cards */}
                  <div className="space-y-2.5 flex-1 w-full">
                    {pieCategories.map((cat) => {
                      const isSelected = selectedCiaCategory === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setSelectedCiaCategory(isSelected ? 'ALL' : cat.id)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-glow-cyan'
                              : 'bg-surface-container border-outline-variant/30 hover:border-primary/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: cat.color }}
                            />
                            <div>
                              <span className="font-bold text-xs text-on-surface block">{cat.label}</span>
                              <span className="text-[10px] text-on-surface-variant">
                                {cat.count} Vulnerabilities Mapped
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-extrabold text-on-surface ml-3 font-mono">
                            {cat.percent}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Filtered Vulnerabilities List Inspector (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-panel p-5 rounded-lg border border-outline-variant/30 space-y-4">
                <div className="border-b border-outline-variant/30 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-on-surface uppercase">
                      CIA Triad Vulnerability Queue ({filteredCiaVulns.length})
                    </h3>
                    <span className="text-[10px] text-primary-bright">
                      Filter: {selectedCiaCategory}
                    </span>
                  </div>
                </div>

                {/* Queue Tiles */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredCiaVulns.map(({ vuln, hasC, hasI, hasA, isFullBreach }) => {
                    const isSelected = selectedCiaVuln?.id === vuln.id;
                    return (
                      <div
                        key={vuln.id}
                        onClick={() => setSelectedCiaVuln(vuln)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'border-primary bg-primary/20 shadow-glow-cyan'
                            : 'bg-surface-container border-outline-variant/30 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-on-surface">{vuln.id}</span>
                          <PsssBadge score={vuln.psssScore} severity={vuln.severity} size="sm" />
                        </div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          {vuln.title}
                        </div>

                        {/* Triad Badges */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${hasC ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-surface-container-high text-on-surface-variant/40'}`}>
                            Confidentiality
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${hasI ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-surface-container-high text-on-surface-variant/40'}`}>
                            Integrity
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${hasA ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-surface-container-high text-on-surface-variant/40'}`}>
                            Availability
                          </span>
                          {isFullBreach && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-error-container/40 text-error border border-error/40 ml-auto">
                              TRIPLE BREACH
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
