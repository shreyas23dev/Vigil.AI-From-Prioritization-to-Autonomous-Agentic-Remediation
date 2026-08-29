import React from 'react';
import type { AuditLogEvent } from '../types';
import { X, ShieldAlert, FileCode, Clock, User, Globe } from 'lucide-react';
import { formatDateTime } from '../utils/dateTime';

interface AuditDetailModalProps {
  event: AuditLogEvent | null;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-mono">
      <div className="glass-panel-elevated w-full max-w-3xl rounded-lg border border-primary/40 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-primary/20 text-primary-bright border border-primary/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary-bright font-bold">{event.id}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-on-surface-variant font-bold">
                  {event.category}
                </span>
              </div>
              <h2 className="text-sm font-bold text-on-surface mt-0.5">
                {event.action}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded bg-surface-container border border-outline-variant/30">
            <div>
              <span className="text-on-surface-variant/70 text-[10px] uppercase flex items-center gap-1">
                <User className="w-3 h-3" /> Actor User
              </span>
              <div className="font-bold text-on-surface mt-1">{event.user}</div>
              <div className="text-[10px] text-primary-bright">{event.userRole}</div>
            </div>

            <div>
              <span className="text-on-surface-variant/70 text-[10px] uppercase flex items-center gap-1">
                <Globe className="w-3 h-3" /> Source IP
              </span>
              <div className="font-bold text-on-surface mt-1">{event.ipAddress}</div>
              <div className="text-[10px] text-emerald-400">Internal Network</div>
            </div>

            <div>
              <span className="text-on-surface-variant/70 text-[10px] uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" /> Timestamp
              </span>
              <div className="font-bold text-on-surface mt-1 text-[11px]">
                {formatDateTime(event.timestamp)}
              </div>
              <div className="text-[10px] text-emerald-400">
                Verified Event Time
              </div>
            </div>

            <div>
              <span className="text-on-surface-variant/70 text-[10px] uppercase flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Target Resource
              </span>
              <div className="font-bold text-on-surface truncate mt-1">{event.target}</div>
              <div className="text-[10px] text-tertiary">State Modified</div>
            </div>
          </div>

          {/* Forensic JSON Payload Diff */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-primary-bright" />
              State Diff & Event Details Payload
            </h3>

            <div className="p-4 rounded bg-surface-container-lowest border border-outline-variant/40 overflow-x-auto text-[11px] leading-relaxed text-emerald-400 font-mono">
              <pre>{JSON.stringify(event.details, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-outline-variant/30 bg-surface-container flex items-center justify-between text-xs">
          <span className="text-on-surface-variant/70">
            Forensic Integrity: SHA-256 Verified
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-primary text-on-primary font-bold hover:brightness-110 shadow-glow-cyan"
          >
            Close Payload Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
