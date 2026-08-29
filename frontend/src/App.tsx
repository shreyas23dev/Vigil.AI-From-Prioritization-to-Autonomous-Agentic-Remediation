import { useState, useEffect } from 'react';
import { api } from './api/client';
import type { 
  Vulnerability, 
  ThreatActor, 
  AuditLogEvent, 
  IAMUser, 
  PipelineHealth, 
  FormulaWeights, 
  VulnerabilityStatus 
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import type { ActivePlane } from './components/Sidebar';
import { CommandCenter } from './planes/CommandCenter';
import { ThreatEngine } from './planes/ThreatEngine';
import { IntelReportGenerator } from './planes/IntelReportGenerator';
import { SystemAudit } from './planes/SystemAudit';
import { UserManagement } from './planes/UserManagement';
import { AIChatSidebar } from './components/AIChatSidebar';
import { RemediationModal } from './components/RemediationModal';
import { AuditDetailModal } from './components/AuditDetailModal';
import { UserModal } from './components/UserModal';

export function App() {
  const [activePlane, setActivePlane] = useState<ActivePlane>('command_center');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data Stores
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>([]);
  const [users, setUsers] = useState<IAMUser[]>([]);
  const [pipelineHealth, setPipelineHealth] = useState<PipelineHealth[]>([]);
  const [weights, setWeights] = useState<FormulaWeights>({
    cvssWeight: 0.35,
    epssWeight: 0.45,
    assetCriticalityWeight: 0.20,
    threatActorMultiplier: 1.25,
  });

  // Active Modals
  const [remediationTarget, setRemediationTarget] = useState<Vulnerability | null>(null);
  const [auditTarget, setAuditTarget] = useState<AuditLogEvent | null>(null);
  const [userModalTarget, setUserModalTarget] = useState<{ open: boolean; user?: IAMUser | null }>({
    open: false,
    user: null,
  });

  // Load Data on Mount
  const loadData = async () => {
    setIsRefreshing(true);
    const [vData, tData, aData, uData, pData, wData] = await Promise.all([
      api.getVulnerabilities(),
      api.getThreatActors(),
      api.getAuditLogs(),
      api.getUsers(),
      api.getPipelineHealth(),
      api.getFormulaWeights(),
    ]);
    setVulnerabilities(vData);
    setThreatActors(tData);
    setAuditLogs(aData);
    setUsers(uData);
    setPipelineHealth(pData);
    setWeights(wData);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Vulnerability Status Handler
  const handleUpdateVulnerabilityStatus = async (id: string, status: VulnerabilityStatus) => {
    await api.updateVulnerabilityStatus(id, status);
    const updatedV = await api.getVulnerabilities();
    const updatedLogs = await api.getAuditLogs();
    setVulnerabilities(updatedV);
    setAuditLogs(updatedLogs);
  };

  // Weight Calibration Handler
  const handleUpdateWeights = async (newWeights: FormulaWeights) => {
    await api.updateFormulaWeights(newWeights);
    const updatedW = await api.getFormulaWeights();
    const updatedLogs = await api.getAuditLogs();
    setWeights(updatedW);
    setAuditLogs(updatedLogs);
  };

  // IAM User Create / Edit Handlers
  const handleSaveUser = async (userData: Omit<IAMUser, 'id'>) => {
    await api.addUser(userData);
    const updatedUsers = await api.getUsers();
    const updatedLogs = await api.getAuditLogs();
    setUsers(updatedUsers);
    setAuditLogs(updatedLogs);
  };

  const handleUpdateUserPermissions = async (userId: string, perms: IAMUser['permissions']) => {
    await api.updateUserPermissions(userId, perms);
    const updatedUsers = await api.getUsers();
    const updatedLogs = await api.getAuditLogs();
    setUsers(updatedUsers);
    setAuditLogs(updatedLogs);
  };

  const unassignedCount = vulnerabilities.filter((v) => v.status === 'UNASSIGNED').length;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary/30 selection:text-primary-bright">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activePlane={activePlane}
          onSelectPlane={setActivePlane}
          unassignedCount={unassignedCount}
        />

        {/* Content View */}
        <main className="flex-1 p-6 overflow-y-auto bg-surface-dim">
          {activePlane === 'command_center' && (
            <CommandCenter
              vulnerabilities={vulnerabilities}
              searchQuery={searchQuery}
              onOpenRemediationModal={(v) => setRemediationTarget(v)}
            />
          )}

          {activePlane === 'threat_engine' && (
            <ThreatEngine actors={threatActors} vulnerabilities={vulnerabilities} searchQuery={searchQuery} />
          )}

          {activePlane === 'intel_report' && (
            <IntelReportGenerator vulnerabilities={vulnerabilities} />
          )}

          {activePlane === 'system_audit' && (
            <SystemAudit
              auditLogs={auditLogs}
              pipelineHealth={pipelineHealth}
              weights={weights}
              onUpdateWeights={handleUpdateWeights}
              onSelectEvent={(evt) => setAuditTarget(evt)}
            />
          )}

          {activePlane === 'ai_assistant' && (
            <div className="h-[calc(100vh-6.5rem)]">
              <AIChatSidebar />
            </div>
          )}

          {activePlane === 'user_management' && (
            <UserManagement
              users={users}
              onOpenUserModal={(usr) => setUserModalTarget({ open: true, user: usr })}
              onUpdatePermissions={handleUpdateUserPermissions}
            />
          )}
        </main>
      </div>

      {/* Active Modals */}
      <RemediationModal
        vulnerability={remediationTarget}
        onClose={() => setRemediationTarget(null)}
        onUpdateStatus={handleUpdateVulnerabilityStatus}
      />

      <AuditDetailModal
        event={auditTarget}
        onClose={() => setAuditTarget(null)}
      />

      {userModalTarget.open && (
        <UserModal
          user={userModalTarget.user}
          onClose={() => setUserModalTarget({ open: false, user: null })}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}

export default App;
