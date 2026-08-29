import type { Vulnerability, ThreatActor, AuditLogEvent, IAMUser, PipelineHealth, FormulaWeights } from '../types';

export const INITIAL_VULNERABILITIES: Vulnerability[] = [
  {
    id: 'CVE-2024-3094',
    title: 'XZ Utils Backdoor Remote Code Execution',
    psssScore: 9.9,
    cvssScore: 10.0,
    epssScore: 0.978,
    severity: 'CRITICAL',
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    component: 'xz-utils / liblzma (v5.6.0-5.6.1)',
    affectedNodes: 142,
    status: 'IN_TRIAGE',
    cwe: 'CWE-506: Embedded Malicious Code',
    mitreTactics: ['Initial Access', 'Execution', 'Defense Evasion'],
    discoveredAt: '2024-03-29T14:22:00Z',
    activeExploits: true,
    description: 'Malicious code in XZ Utils versions 5.6.0 and 5.6.1 intercepts SSH authentication via systemd, allowing unauthenticated remote attackers to execute arbitrary code with root privileges.',
    remediationAction: 'Downgrade xz-utils package to 5.4.x or upgrade to sanitized 5.6.2 build immediately.'
  },
  {
    id: 'CVE-2024-21626',
    title: 'runc Container Breakout File Descriptor Leak',
    psssScore: 9.4,
    cvssScore: 8.6,
    epssScore: 0.912,
    severity: 'CRITICAL',
    vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    component: 'runc container runtime (< v1.1.12)',
    affectedNodes: 89,
    status: 'UNASSIGNED',
    cwe: 'CWE-403: Exposure of File Descriptor to Intended Access Control',
    mitreTactics: ['Privilege Escalation', 'Execution'],
    discoveredAt: '2024-01-31T09:15:00Z',
    activeExploits: true,
    description: 'In runc through version 1.1.11, internal file descriptors are leaked into containerized processes, enabling host filesystem access and host container breakout.',
    remediationAction: 'Patch Kubernetes cluster nodes to runc v1.1.12 or containerd 1.6.28/1.7.13.'
  },
  {
    id: 'CVE-2023-44487',
    title: 'HTTP/2 Rapid Reset DDoS Protocol Vulnerability',
    psssScore: 8.8,
    cvssScore: 7.5,
    epssScore: 0.945,
    severity: 'HIGH',
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
    component: 'nginx / envoy / haproxy / HTTP2 Stack',
    affectedNodes: 210,
    status: 'REMEDIATION_PENDING',
    cwe: 'CWE-400: Uncontrolled Resource Consumption',
    mitreTactics: ['Impact', 'Defense Evasion'],
    discoveredAt: '2023-10-10T11:00:00Z',
    activeExploits: true,
    description: 'The HTTP/2 protocol allows a client to request stream resets immediately after sending headers, creating massive resource exhaustion on web servers.',
    remediationAction: 'Apply rate limiting on RST_STREAM frames and update ingress controller configurations.'
  },
  {
    id: 'CVE-2024-1709',
    title: 'ConnectWise ScreenConnect Authentication Bypass',
    psssScore: 9.6,
    cvssScore: 10.0,
    epssScore: 0.962,
    severity: 'CRITICAL',
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    component: 'ScreenConnect Server (< 23.9.8)',
    affectedNodes: 14,
    status: 'IN_TRIAGE',
    cwe: 'CWE-288: Authentication Bypass Using an Alternate Path',
    mitreTactics: ['Initial Access', 'Credential Access'],
    discoveredAt: '2024-02-19T16:45:00Z',
    activeExploits: true,
    description: 'Authentication bypass vulnerability allows an unauthenticated remote attacker to create administrator accounts on vulnerable instances.',
    remediationAction: 'Upgrade ScreenConnect to version 23.9.8 or higher immediately.'
  },
  {
    id: 'CVE-2023-4966',
    title: 'Citrix Bleed Sensitive Information Disclosure',
    psssScore: 8.9,
    cvssScore: 9.4,
    epssScore: 0.887,
    severity: 'HIGH',
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
    component: 'NetScaler ADC / NetScaler Gateway',
    affectedNodes: 36,
    status: 'SUPPRESSED',
    cwe: 'CWE-119: Improper Restriction of Operations within Bounds',
    mitreTactics: ['Credential Access'],
    discoveredAt: '2023-10-10T18:00:00Z',
    activeExploits: false,
    description: 'Buffer overflow vulnerability in NetScaler ADC and Gateway allows unauthenticated memory leak of valid user session tokens.',
    remediationAction: 'Apply Citrix hotfix builds and terminate all active session cookies.'
  },
  {
    id: 'CVE-2024-27198',
    title: 'JetBrains TeamCity Authentication Bypass',
    psssScore: 9.2,
    cvssScore: 9.8,
    epssScore: 0.895,
    severity: 'CRITICAL',
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    component: 'TeamCity Web Controller (< 2023.11.4)',
    affectedNodes: 8,
    status: 'UNASSIGNED',
    cwe: 'CWE-288: Authentication Bypass',
    mitreTactics: ['Initial Access', 'Privilege Escalation'],
    discoveredAt: '2024-03-04T12:00:00Z',
    activeExploits: true,
    description: 'Authentication bypass vulnerability in the web module allows unauthenticated remote attackers to gain full administrative access to TeamCity servers.',
    remediationAction: 'Update TeamCity to 2023.11.4 or apply security plugin patch.'
  }
];

export const INITIAL_THREAT_ACTORS: ThreatActor[] = [
  {
    id: 'APT-28',
    name: 'APT28 (Fancy Bear / Strontium)',
    aliases: ['Pawn Storm', 'Sofacy', 'Sednit', 'TA422'],
    origin: 'Eastern Europe / State-Sponsored',
    threatLevel: 'CRITICAL',
    targetSectors: ['Defense', 'Government', 'Energy', 'Aerospace'],
    associatedCves: ['CVE-2024-3094', 'CVE-2023-4966'],
    mitreTechniques: [
      { code: 'T1190', name: 'Exploit Public-Facing Application', saturation: 94 },
      { code: 'T1068', name: 'Exploitation for Privilege Escalation', saturation: 88 },
      { code: 'T1078', name: 'Valid Accounts', saturation: 79 },
      { code: 'T1059', name: 'Command and Scripting Interpreter', saturation: 91 },
    ],
    iocs: [
      { type: 'IP', value: '185.220.101.5' },
      { type: 'HASH', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
      { type: 'DOMAIN', value: 'telemetry-update-auth.com' }
    ],
    lastActive: '2026-07-24T18:30:00Z',
    description: 'Highly sophisticated state-sponsored threat group operating since 2007. Known for zero-day exploitation, supply chain infiltration, and targeted cyber espionage.'
  },
  {
    id: 'LAZARUS-GROUP',
    name: 'Lazarus Group (HIDDEN COBRA)',
    aliases: ['Zinc', 'APT38', 'Whois Team'],
    origin: 'East Asia / State-Sponsored',
    threatLevel: 'CRITICAL',
    targetSectors: ['Financial Services', 'Cryptocurrency', 'Defense', 'Healthcare'],
    associatedCves: ['CVE-2024-21626', 'CVE-2024-1709'],
    mitreTechniques: [
      { code: 'T1566', name: 'Phishing', saturation: 96 },
      { code: 'T1055', name: 'Process Injection', saturation: 85 },
      { code: 'T1041', name: 'Exfiltration Over C2 Channel', saturation: 92 },
    ],
    iocs: [
      { type: 'IP', value: '198.51.100.42' },
      { type: 'HASH', value: '4a8a08f09d37b73795649038408b5f33' },
      { type: 'DOMAIN', value: 'crypto-vault-auth.net' }
    ],
    lastActive: '2026-07-24T14:15:00Z',
    description: 'Prolific cyber threat actor group known for large-scale financial theft, cryptocurrency heists, and destructive malware attacks.'
  },
  {
    id: 'VOLT-TYPHOON',
    name: 'Volt Typhoon (Bronze Silhouette)',
    aliases: ['Vanguard Panda', 'TA415'],
    origin: 'East Asia',
    threatLevel: 'HIGH',
    targetSectors: ['Critical Infrastructure', 'Telecommunications', 'Transportation', 'Water Services'],
    associatedCves: ['CVE-2023-44487', 'CVE-2024-27198'],
    mitreTechniques: [
      { code: 'T1078', name: 'Valid Accounts', saturation: 98 },
      { code: 'T1003', name: 'OS Credential Dumping', saturation: 84 },
      { code: 'T1021', name: 'Remote Services', saturation: 90 },
    ],
    iocs: [
      { type: 'IP', value: '203.0.113.88' },
      { type: 'DOMAIN', value: 'edge-router-sync.org' }
    ],
    lastActive: '2026-07-23T22:10:00Z',
    description: 'Living-off-the-land (LotL) threat group focusing on long-term stealthy persistence within Western critical infrastructure networks.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEvent[] = [
  {
    id: 'AUD-90812',
    timestamp: '2026-07-24T19:42:10Z',
    severity: 'WARN',
    category: 'WEIGHT_OVERRIDE',
    user: 'Alex Rivera',
    userRole: 'TIER_3_LEAD',
    action: 'Modified PSSS Prioritization Formula Weights',
    target: 'Engine Config / PSSS_v2.4',
    ipAddress: '192.168.10.45',
    details: {
      before: { cvssWeight: 0.40, epssWeight: 0.40, assetCriticalityWeight: 0.20 },
      after: { cvssWeight: 0.30, epssWeight: 0.50, assetCriticalityWeight: 0.20 },
      reason: 'Elevated EPSS weight to respond to active zero-day campaigns targeting xz-utils.'
    }
  },
  {
    id: 'AUD-90811',
    timestamp: '2026-07-24T18:15:30Z',
    severity: 'INFO',
    category: 'RULE_SUPPRESSION',
    user: 'Admin',
    userRole: 'CISO_ADMIN',
    action: 'Suppressed Vulnerability CVE-2023-4966',
    target: 'Vulnerability Queue',
    ipAddress: '192.168.10.12',
    details: {
      reason: 'Mitigating WAF controls and virtual patching deployed across edge NetScaler proxies.'
    }
  },
  {
    id: 'AUD-90810',
    timestamp: '2026-07-24T16:00:00Z',
    severity: 'INFO',
    category: 'DATA_SYNC',
    user: 'SYSTEM_BOT',
    userRole: 'AUTOMATION',
    action: 'Completed Sync with FIRST.org EPSS Database',
    target: 'EPSS Pipeline Feed',
    ipAddress: '127.0.0.1',
    details: {
      recordsSynced: 24510,
      latencyMs: 24,
      status: 'SUCCESS'
    }
  },
  {
    id: 'AUD-90809',
    timestamp: '2026-07-24T14:30:12Z',
    severity: 'CRITICAL',
    category: 'IAM_CHANGE',
    user: 'Marcus Vance',
    userRole: 'TIER_3_LEAD',
    action: 'Elevated User Permissions',
    target: 'User: David Miller',
    ipAddress: '192.168.10.88',
    details: {
      userEmail: 'd.miller@vigil.io',
      roleAssigned: 'SECURITY_ENGINEER',
      mfaRequired: true
    }
  }
];

export const INITIAL_IAM_USERS: IAMUser[] = [
  {
    id: 'USR-001',
    name: 'Admin',
    email: 'admin@vigil.io',
    role: 'CISO_ADMIN',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLogin: '2026-07-24T20:10:00Z',
    location: 'San Francisco, USA (IP: 192.168.10.12)',
    permissions: {
      overrideWeights: true,
      triggerScan: true,
      suppressRules: true,
      manageUsers: true,
      accessAuditLogs: true
    }
  },
  {
    id: 'USR-002',
    name: 'Alex Rivera',
    email: 'a.rivera@vigil.io',
    role: 'TIER_3_LEAD',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLogin: '2026-07-24T19:55:00Z',
    location: 'Austin, USA (IP: 192.168.10.45)',
    permissions: {
      overrideWeights: true,
      triggerScan: true,
      suppressRules: true,
      manageUsers: false,
      accessAuditLogs: true
    }
  },
  {
    id: 'USR-003',
    name: 'Marcus Vance',
    email: 'm.vance@vigil.io',
    role: 'SOC_ANALYST',
    status: 'AWAY',
    mfaEnabled: true,
    lastLogin: '2026-07-24T16:20:00Z',
    location: 'London, UK (IP: 192.168.10.88)',
    permissions: {
      overrideWeights: false,
      triggerScan: true,
      suppressRules: false,
      manageUsers: false,
      accessAuditLogs: true
    }
  },
  {
    id: 'USR-004',
    name: 'Elena Rostova',
    email: 'e.rostova@vigil.io',
    role: 'SECURITY_ENGINEER',
    status: 'ACTIVE',
    mfaEnabled: true,
    lastLogin: '2026-07-24T18:40:00Z',
    location: 'Frankfurt, DE (IP: 192.168.10.99)',
    permissions: {
      overrideWeights: false,
      triggerScan: true,
      suppressRules: true,
      manageUsers: false,
      accessAuditLogs: false
    }
  }
];

export const INITIAL_PIPELINE_HEALTH: PipelineHealth[] = [
  { name: 'NVD CVE Stream', status: 'HEALTHY', latencyMs: 14, lastSync: '2 mins ago', recordsSynced: 218400 },
  { name: 'FIRST.org EPSS Feed', status: 'HEALTHY', latencyMs: 22, lastSync: '5 mins ago', recordsSynced: 189200 },
  { name: 'CISA KEV Catalog', status: 'HEALTHY', latencyMs: 9, lastSync: '1 min ago', recordsSynced: 1120 },
  { name: 'MITRE STIX/TAXII v2.1', status: 'HEALTHY', latencyMs: 38, lastSync: '10 mins ago', recordsSynced: 14500 },
  { name: 'PSSS Prioritization Engine', status: 'HEALTHY', latencyMs: 4, lastSync: 'Live', recordsSynced: 504 }
];

export const DEFAULT_WEIGHTS: FormulaWeights = {
  cvssWeight: 0.35,
  epssWeight: 0.45,
  assetCriticalityWeight: 0.20,
  threatActorMultiplier: 1.25
};
