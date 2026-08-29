export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type VulnerabilityStatus = 
  | 'UNASSIGNED' 
  | 'IN_TRIAGE' 
  | 'REMEDIATION_PENDING' 
  | 'SUPPRESSED' 
  | 'REMEDIATED';

export interface Vulnerability {
  id: string; // CVE ID
  title: string;
  psssScore: number;
  cvssScore: number;
  epssScore: number; // 0.0 to 1.0 (e.g. 0.95 = 95%)
  severity: SeverityLevel;
  vector: string;
  component: string;
  affectedNodes: number;
  status: VulnerabilityStatus;
  cwe: string;
  mitreTactics: string[];
  discoveredAt: string;
  activeExploits: boolean;
  description: string;
  remediationAction?: string;
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  threatLevel: SeverityLevel;
  targetSectors: string[];
  associatedCves: string[];
  mitreTechniques: { code: string; name: string; saturation: number }[];
  iocs: { type: 'IP' | 'HASH' | 'DOMAIN'; value: string }[];
  lastActive: string;
  description: string;
}

export type AuditCategory = 
  | 'WEIGHT_OVERRIDE' 
  | 'IAM_CHANGE' 
  | 'RULE_SUPPRESSION' 
  | 'DATA_SYNC' 
  | 'PIPELINE_ALERT';

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARN' | 'INFO';
  category: AuditCategory;
  user: string;
  userRole: string;
  action: string;
  target: string;
  ipAddress: string;
  details: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    reason?: string;
    [key: string]: any;
  };
}

export type UserRole = 
  | 'CISO_ADMIN' 
  | 'TIER_3_LEAD' 
  | 'SOC_ANALYST' 
  | 'SECURITY_ENGINEER';

export interface IAMUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'ACTIVE' | 'AWAY' | 'OFFLINE';
  mfaEnabled: boolean;
  lastLogin: string;
  location: string;
  permissions: {
    overrideWeights: boolean;
    triggerScan: boolean;
    suppressRules: boolean;
    manageUsers: boolean;
    accessAuditLogs: boolean;
  };
}

export interface PipelineHealth {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  lastSync: string;
  recordsSynced: number;
}

export interface FormulaWeights {
  cvssWeight: number;
  epssWeight: number;
  assetCriticalityWeight: number;
  threatActorMultiplier: number;
}

export interface IntelReportConfig {
  title: string;
  scanScope: string;
  dateRange: string;
  audience: 'EXECUTIVE' | 'SOC_OPERATIONAL' | 'CISO_GOVERNANCE';
  format: 'PDF' | 'JSON' | 'CSV';
  modules: {
    psssBreakdown: boolean;
    topThreatVectors: boolean;
    mitreSaturation: boolean;
    remediationSla: boolean;
    activeCampaigns: boolean;
  };
}
