import React, { useState } from 'react';
import type { IAMUser, UserRole } from '../types';
import { X, UserPlus, Lock } from 'lucide-react';

interface UserModalProps {
  user?: IAMUser | null;
  onClose: () => void;
  onSave: (user: Omit<IAMUser, 'id'>) => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'SOC_ANALYST');
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled ?? true);
  const [permissions, setPermissions] = useState(
    user?.permissions || {
      overrideWeights: false,
      triggerScan: true,
      suppressRules: false,
      manageUsers: false,
      accessAuditLogs: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      email,
      role,
      status: 'ACTIVE',
      mfaEnabled,
      lastLogin: 'Just now',
      location: 'Local Session (IP: 192.168.10.45)',
      permissions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-mono text-xs">
      <div className="glass-panel-elevated w-full max-w-lg rounded-lg border border-primary/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-primary/20 text-primary-bright border border-primary/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                {user ? 'Edit Analyst Identity' : 'Register New SOC Analyst'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Granular IAM & Role-Based Access Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Full Name *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Corporate Email *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="j.miller@vigil.io"
                className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-surface-container border border-outline-variant/40 rounded p-2 text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="CISO_ADMIN">CISO Admin (Full Access)</option>
                <option value="TIER_3_LEAD">Tier 3 Lead Analyst</option>
                <option value="SOC_ANALYST">SOC Analyst</option>
                <option value="SECURITY_ENGINEER">Security Engineer</option>
              </select>
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-on-surface">
                <input
                  type="checkbox"
                  checked={mfaEnabled}
                  onChange={(e) => setMfaEnabled(e.target.checked)}
                  className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary"
                />
                <Lock className="w-4 h-4 text-emerald-400" />
                Require Hardware MFA
              </label>
            </div>
          </div>

          {/* Granular Permission Matrix */}
          <div className="space-y-2 pt-2 border-t border-outline-variant/30">
            <label className="block text-on-surface-variant font-semibold uppercase tracking-wider text-[10px]">
              Granular Privilege Flags
            </label>
            <div className="space-y-2 p-3 rounded bg-surface-container border border-outline-variant/30">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Override Engine Model Weights</span>
                <input
                  type="checkbox"
                  checked={permissions.overrideWeights}
                  onChange={(e) =>
                    setPermissions({ ...permissions, overrideWeights: e.target.checked })
                  }
                  className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Trigger Manual Intel Scans</span>
                <input
                  type="checkbox"
                  checked={permissions.triggerScan}
                  onChange={(e) =>
                    setPermissions({ ...permissions, triggerScan: e.target.checked })
                  }
                  className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Suppress Risk Rules</span>
                <input
                  type="checkbox"
                  checked={permissions.suppressRules}
                  onChange={(e) =>
                    setPermissions({ ...permissions, suppressRules: e.target.checked })
                  }
                  className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Manage IAM Directory & Users</span>
                <input
                  type="checkbox"
                  checked={permissions.manageUsers}
                  onChange={(e) =>
                    setPermissions({ ...permissions, manageUsers: e.target.checked })
                  }
                  className="rounded bg-surface-container border-outline-variant text-primary focus:ring-primary"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-outline-variant/40 text-on-surface-variant hover:text-on-surface font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-primary text-on-primary font-bold hover:brightness-110 shadow-glow-cyan"
            >
              Save Analyst Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
