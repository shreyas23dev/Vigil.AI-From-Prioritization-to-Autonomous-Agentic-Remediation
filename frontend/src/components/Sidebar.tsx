import React from 'react';
import { LayoutDashboard, Skull, FileSpreadsheet, ShieldCheck, Users, Bot } from 'lucide-react';

export type ActivePlane = 
  | 'command_center' 
  | 'threat_engine' 
  | 'intel_report' 
  | 'system_audit' 
  | 'user_management'
  | 'ai_assistant';

interface SidebarProps {
  activePlane: ActivePlane;
  onSelectPlane: (plane: ActivePlane) => void;
  unassignedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePlane,
  onSelectPlane,
  unassignedCount
}) => {
  const planes = [
    {
      id: 'command_center' as ActivePlane,
      label: 'Command Center',
      sublabel: 'The Triage Plane',
      icon: LayoutDashboard,
      badge: unassignedCount > 0 ? unassignedCount : undefined,
      badgeColor: 'bg-error text-surface font-bold'
    },
    {
      id: 'ai_assistant' as ActivePlane,
      label: 'AI Assistant',
      sublabel: 'Multi-LLM Agent',
      icon: Bot,
      badge: 'AGENT',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
    },
    {
      id: 'threat_engine' as ActivePlane,
      label: 'Attack Surface Intelligence',
      sublabel: 'The Actor Plane',
      icon: Skull,
      badge: 'LIVE',
      badgeColor: 'bg-primary/20 text-primary-bright border border-primary/40'
    },
    {
      id: 'intel_report' as ActivePlane,
      label: 'Intel Generator',
      sublabel: 'The Synthesis Plane',
      icon: FileSpreadsheet,
    },
    {
      id: 'system_audit' as ActivePlane,
      label: 'System Audit',
      sublabel: 'The Trust Plane',
      icon: ShieldCheck,
    },
    {
      id: 'user_management' as ActivePlane,
      label: 'User IAM',
      sublabel: 'The Governance Plane',
      icon: Users,
    },
  ];


  return (
    <aside className="w-64 border-r border-outline-variant/30 bg-surface-container-lowest flex flex-col justify-between p-4 shrink-0 select-none">
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <span className="text-[10px] font-mono font-semibold text-on-surface-variant/60 uppercase tracking-widest">
            Platform Navigation
          </span>
        </div>

        <nav className="space-y-1.5">
          {planes.map((p) => {
            const Icon = p.icon;
            const isActive = activePlane === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlane(p.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-md transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-primary-container/20 text-primary-bright border border-primary/50 shadow-glow-cyan'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-primary-bright' : 'text-on-surface-variant group-hover:text-on-surface'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-mono font-bold leading-none">{p.label}</div>
                    <div className="text-[10px] font-mono text-on-surface-variant/60 mt-1">
                      {p.sublabel}
                    </div>
                  </div>
                </div>

                {p.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${p.badgeColor}`}
                  >
                    {p.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Footer Info */}
      <div className="p-3.5 rounded bg-surface-container border border-outline-variant/30 font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-on-surface-variant">
          <span>Engine Version:</span>
          <span className="text-primary-bright font-semibold">v2.4-stable</span>
        </div>
        <div className="flex items-center justify-between text-on-surface-variant">
          <span>Model Sync:</span>
          <span className="text-emerald-400">99.8% Calibrated</span>
        </div>
      </div>
    </aside>
  );
};
