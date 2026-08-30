import type { 
  Vulnerability, 
  ThreatActor, 
  AuditLogEvent, 
  IAMUser, 
  PipelineHealth, 
  FormulaWeights 
} from '../types';
import { 
  INITIAL_VULNERABILITIES, 
  INITIAL_THREAT_ACTORS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_IAM_USERS, 
  INITIAL_PIPELINE_HEALTH, 
  DEFAULT_WEIGHTS 
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let vulnerabilitiesStore = [...INITIAL_VULNERABILITIES];
let threatActorsStore = [...INITIAL_THREAT_ACTORS];
let auditLogsStore = [...INITIAL_AUDIT_LOGS];
let usersStore = [...INITIAL_IAM_USERS];
let weightsStore = { ...DEFAULT_WEIGHTS };

export const api = {
  // --- Vulnerabilities ---
  async getVulnerabilities(): Promise<Vulnerability[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/vulnerabilities`);
      if (res.ok) {
        const data = await res.json();
        vulnerabilitiesStore = data;
        return data;
      }
    } catch (e) {
      console.warn("Backend API unavailable, using local store");
    }
    return vulnerabilitiesStore;
  },

  async updateVulnerabilityStatus(id: string, status: Vulnerability['status']): Promise<Vulnerability> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/vulnerabilities/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        vulnerabilitiesStore = vulnerabilitiesStore.map(v => v.id === id ? updated : v);
        return updated;
      }
    } catch (e) {
      console.warn("Backend API unavailable, updating local store");
    }
    
    vulnerabilitiesStore = vulnerabilitiesStore.map(v => 
      v.id === id ? { ...v, status } : v
    );
    
    const updated = vulnerabilitiesStore.find(v => v.id === id)!;
    this.addAuditEvent({
      severity: 'INFO',
      category: 'RULE_SUPPRESSION',
      user: 'Current Analyst',
      userRole: 'TIER_3_LEAD',
      action: `Updated Vulnerability Status to ${status}`,
      target: id,
      ipAddress: '192.168.10.45',
      details: { status }
    });

    return updated;
  },

  // --- Threat Actors ---
  async getThreatActors(): Promise<ThreatActor[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/threat-actors`);
      if (res.ok) {
        const data = await res.json();
        threatActorsStore = data;
        return data;
      }
    } catch (e) {
      console.warn("Backend API unavailable, using local store");
    }
    return threatActorsStore;
  },

  // --- Audit Logs ---
  async getAuditLogs(): Promise<AuditLogEvent[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/audit-logs`);
      if (res.ok) {
        const data = await res.json();
        auditLogsStore = data;
        return data;
      }
    } catch (e) {
      console.warn("Backend API unavailable, using local store");
    }
    return auditLogsStore;
  },

  async addAuditEvent(event: Omit<AuditLogEvent, 'id' | 'timestamp'>): Promise<AuditLogEvent> {
    const newEvent: AuditLogEvent = {
      ...event,
      id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString()
    };
    auditLogsStore = [newEvent, ...auditLogsStore];
    return newEvent;
  },

  // --- IAM Users ---
  async getUsers(): Promise<IAMUser[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (res.ok) {
        const data = await res.json();
        usersStore = data;
        return data;
      }
    } catch (e) {
      console.warn("Backend API unavailable, using local store");
    }
    return usersStore;
  },

  async addUser(user: Omit<IAMUser, 'id'>): Promise<IAMUser> {
    const newUser: IAMUser = {
      ...user,
      id: `USR-${Math.floor(100 + Math.random() * 900)}`
    };
    usersStore = [newUser, ...usersStore];
    this.addAuditEvent({
      severity: 'INFO',
      category: 'IAM_CHANGE',
      user: 'Admin',
      userRole: 'CISO_ADMIN',
      action: `Created IAM User ${newUser.name}`,
      target: newUser.email,
      ipAddress: '192.168.10.12',
      details: { role: newUser.role }
    });
    return newUser;
  },

  async updateUserPermissions(userId: string, permissions: IAMUser['permissions']): Promise<IAMUser> {
    usersStore = usersStore.map(u => u.id === userId ? { ...u, permissions } : u);
    const updated = usersStore.find(u => u.id === userId)!;
    this.addAuditEvent({
      severity: 'WARN',
      category: 'IAM_CHANGE',
      user: 'Admin',
      userRole: 'CISO_ADMIN',
      action: `Updated Permissions for User ${updated.name}`,
      target: updated.email,
      ipAddress: '192.168.10.12',
      details: { permissions }
    });
    return updated;
  },

  // --- Pipeline & Weights ---
  async getPipelineHealth(): Promise<PipelineHealth[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pipeline/health`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API unavailable, using local pipeline health");
    }
    return INITIAL_PIPELINE_HEALTH;
  },

  async getFormulaWeights(): Promise<FormulaWeights> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/weights`);
      if (res.ok) {
        const data = await res.json();
        weightsStore = data;
        return data;
      }
    } catch (e) {
      console.warn("Backend API unavailable, using local weights store");
    }
    return weightsStore;
  },

  async updateFormulaWeights(weights: FormulaWeights): Promise<FormulaWeights> {
    const before = { ...weightsStore };
    weightsStore = { ...weights };
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/weights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weights)
      });
      if (res.ok) {
        weightsStore = await res.json();
      }
    } catch (e) {
      console.warn("Backend API unavailable, updating local weights store");
    }

    this.addAuditEvent({
      severity: 'WARN',
      category: 'WEIGHT_OVERRIDE',
      user: 'Alex Rivera',
      userRole: 'TIER_3_LEAD',
      action: 'Recalibrated PSSS Scoring Weights',
      target: 'Engine Formula v2.4',
      ipAddress: '192.168.10.45',
      details: { before, after: weightsStore }
    });
    return weightsStore;
  },

  async predictCveText(text: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) return await res.json();
    } catch {
      console.warn("ML Predict API unavailable");
    }
    return null;
  },

  // --- AI Agent & Skill API ---
  async getSkills() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/skills`);
      if (res.ok) return await res.json();
    } catch {
      console.warn("Skills API unavailable");
    }
    return { skills: [] };
  },

  async generateDetectionRules(params: {
    cveId: string;
    title?: string;
    description?: string;
    component?: string;
    mitreTactics?: string[];
    isZeroDay?: boolean;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/skills/generate-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Generate rules API failed", e);
    }
    return null;
  },

  async createJiraTicket(params: {
    cveId: string;
    summary: string;
    priority?: string;
    assignee?: string;
    description?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jira/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Create Jira ticket API failed", e);
    }
    return null;
  },

  async executeSkillPatch(params: {
    cveId: string;
    repoUrl?: string;
    component?: string;
    psssScore?: number;
    cvssVector?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/skills/patch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Execute SkillPatch API failed", e);
    }
    return null;
  },

  async getAgentTools() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/agent/tools`);
      if (res.ok) return await res.json();
    } catch {
      console.warn("Agent tools API unavailable");
    }
    return [];
  },

  async executeAgentTool(toolName: string, args: Record<string, any>) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/agent/execute-tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, args })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Execute agent tool API failed", e);
      return { error: `Failed to execute backend tool '${toolName}': ${String(e)}` };
    }
    return { error: `Failed to execute backend tool '${toolName}'` };
  }
};

