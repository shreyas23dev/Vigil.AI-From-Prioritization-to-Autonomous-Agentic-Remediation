import React, { useState } from 'react';
import type { IAMUser, UserRole } from '../types';
import { Users, UserPlus, Lock, Globe, Key } from 'lucide-react';
import { formatDateTime } from '../utils/dateTime';

const parseLocationAndIp = (locStr: string) => {
  if (!locStr) return { location: 'Unknown Location', ip: null };
  const match = locStr.match(/^(.*?)\s*(?:\(IP:\s*([^)]+)\))?$/i);
  if (match && match[2]) {
    return { location: match[1].trim(), ip: match[2].trim() };
  }
  return { location: locStr, ip: null };
};

interface UserManagementProps {
  users: IAMUser[];
  onOpenUserModal: (user?: IAMUser) => void;
  onUpdatePermissions: (userId: string, perms: IAMUser['permissions']) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onOpenUserModal,
  onUpdatePermissions,
}) => {
  const [selectedUser, setSelectedUser] = useState<IAMUser>(users[0] || null);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'CISO_ADMIN':
        return 'bg-secondary/20 text-secondary border-secondary/40';
      case 'TIER_3_LEAD':
        return 'bg-primary/20 text-primary-bright border-primary/40';
      case 'SOC_ANALYST':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-surface-container-highest text-on-surface-variant border-outline-variant';
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-lg border border-primary/40 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded bg-primary/20 text-primary-bright border border-primary/30 shadow-glow-cyan">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-on-surface">
              User Management & IAM // The Governance Plane
            </h1>
            <p className="text-xs text-on-surface-variant">
              SOC analyst directory, granular RBAC permission matrix, & access forensics log.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenUserModal()}
          className="px-4 py-2 rounded bg-primary text-on-primary font-bold hover:brightness-110 shadow-glow-cyan flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Register New SOC Analyst
        </button>
      </div>

      {/* Grid: Analyst Directory (7 cols) & Granular RBAC Matrix (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Cards List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-3 rounded-lg border border-outline-variant/30 font-bold text-on-surface flex items-center justify-between">
            <span>SOC Analyst Directory ({users.length} Identities)</span>
            <span className="text-[11px] text-emerald-400 font-bold">100% MFA Enforced</span>
          </div>

          <div className="space-y-3">
            {users.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`glass-panel p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-glow-cyan'
                      : 'border-outline-variant/30 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="space-y-2.5 w-full pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-on-surface text-sm">{user.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getRoleBadge(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                        {user.mfaEnabled && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] flex items-center gap-1 font-bold">
                            <Lock className="w-3 h-3" /> MFA
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {user.status}
                        </span>
                      </div>

                      {/* Location, IP, and Email row with standardized spacing */}
                      {(() => {
                        const { location, ip } = parseLocationAndIp(user.location);
                        return (
                          <div className="text-xs text-on-surface-variant flex items-center gap-3 flex-wrap">
                            <span className="text-on-surface/90 font-medium">{user.email}</span>
                            <span className="text-outline-variant/60 select-none">•</span>
                            <span className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-primary-bright shrink-0" />
                              <span>{location}</span>
                            </span>
                            {ip && (
                              <>
                                <span className="text-outline-variant/60 select-none">•</span>
                                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface">
                                  IP: {ip}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })()}

                      {/* Standardized Timestamp Badge */}
                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant/80 pt-0.5">
                        <span>Last Active:</span>
                        <span className="font-mono font-semibold text-on-surface px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                          {formatDateTime(user.lastLogin)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenUserModal(user);
                      }}
                      className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface text-[11px] font-bold shrink-0 transition-colors"
                    >
                      Edit IAM
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected User RBAC & Privileges Matrix (5 cols) */}
        <div className="lg:col-span-5">
          {selectedUser ? (
            <div className="glass-panel p-5 rounded-lg border border-primary/40 sticky top-20 space-y-5">
              <div className="border-b border-outline-variant/30 pb-3">
                <div className="text-[10px] uppercase font-bold text-primary-bright">
                  GRANULAR RBAC PRIVILEGES // {selectedUser.id}
                </div>
                <h2 className="text-base font-bold text-on-surface mt-1">{selectedUser.name}</h2>
                <p className="text-xs text-on-surface-variant">{selectedUser.email}</p>
              </div>

              {/* Permission Matrix Toggles */}
              <div className="space-y-3">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-primary-bright" />
                  Active Permission Toggles
                </span>

                <div className="space-y-2 p-4 rounded bg-surface-container border border-outline-variant/30">
                  {Object.entries(selectedUser.permissions).map(([key, enabled]) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer py-1">
                      <span className="capitalize font-semibold text-on-surface">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => {
                          const updated = { ...selectedUser.permissions, [key]: e.target.checked };
                          onUpdatePermissions(selectedUser.id, updated);
                          setSelectedUser({ ...selectedUser, permissions: updated });
                        }}
                        className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Access Forensics Summary */}
              <div className="p-3.5 rounded bg-surface-container-lowest border border-outline-variant/30 space-y-2">
                <span className="text-[10px] uppercase font-bold text-primary-bright block">
                  Access Forensics & Anomalous Login Checks
                </span>
                <div className="text-[11px] text-on-surface-variant space-y-1">
                  <div>Known IP Range: <strong>192.168.10.0/24 (Corporate VPN)</strong></div>
                  <div>Geo-Velocity Mismatch Risk: <strong className="text-emerald-400">0.0% (Clean)</strong></div>
                  <div>Session Lifetime: <strong>Valid (8h remaining)</strong></div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
