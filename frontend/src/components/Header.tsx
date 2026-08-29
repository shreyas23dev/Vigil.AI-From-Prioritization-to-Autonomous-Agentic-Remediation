import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShieldAlert, 
  RefreshCw, 
  Bell, 
  CheckCheck, 
  Trash2, 
  Flame, 
  Activity, 
  Radio,
  X
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'INFO';
  unread: boolean;
  category: 'ZERO_DAY' | 'EPSS_SURGE' | 'FORMULA_CALIBRATION' | 'PIPELINE_SYNC';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-001',
    title: 'CRITICAL ZERO-DAY OUTBREAK',
    message: 'CVE-2024-3094 XZ Utils liblzma backdoor detected across 142 production nodes. Max PSSS 9.9 assigned.',
    timestamp: '2 mins ago',
    severity: 'CRITICAL',
    unread: true,
    category: 'ZERO_DAY'
  },
  {
    id: 'NOTIF-002',
    title: 'EPSS PROBABILITY SURGE',
    message: 'FIRST.org feed updated CVE-2024-21626 exploit probability to 91.2%. Host breakout vector active.',
    timestamp: '15 mins ago',
    severity: 'HIGH',
    unread: true,
    category: 'EPSS_SURGE'
  },
  {
    id: 'NOTIF-003',
    title: 'PSSS WEIGHTS CALIBRATED',
    message: 'Alex Rivera adjusted EPSS weight to 0.45 & CVSS weight to 0.35 in response to active zero-day campaigns.',
    timestamp: '1 hour ago',
    severity: 'INFO',
    unread: true,
    category: 'FORMULA_CALIBRATION'
  },
  {
    id: 'NOTIF-004',
    title: 'NVD & EPSS DATA STREAM SYNCED',
    message: 'Telemetry engine completed synchronization of 241,092 vulnerability records in 14ms.',
    timestamp: '3 hours ago',
    severity: 'INFO',
    unread: false,
    category: 'PIPELINE_SYNC'
  }
];

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const getSeverityBadge = (sev: NotificationItem['severity']) => {
    if (sev === 'CRITICAL') return 'bg-error-container/40 text-error border-error/50 shadow-glow-red';
    if (sev === 'HIGH') return 'bg-tertiary-container/30 text-tertiary border-tertiary/50 shadow-glow-amber';
    return 'bg-primary/20 text-primary-bright border-primary/30 shadow-glow-cyan';
  };

  const getSeverityIcon = (sev: NotificationItem['severity']) => {
    if (sev === 'CRITICAL') return <ShieldAlert className="w-4 h-4 text-error shrink-0" />;
    if (sev === 'HIGH') return <Flame className="w-4 h-4 text-tertiary shrink-0" />;
    return <Activity className="w-4 h-4 text-primary-bright shrink-0" />;
  };

  return (
    <header className="h-16 border-b border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Live Telemetry Badge */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-primary/10 border border-primary/40 flex items-center justify-center shadow-glow-cyan p-1">
            <img src="/gemini-svg.svg" alt="Vigil Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-mono tracking-tight text-on-surface">
                Vigil<span className="text-primary-bright">.AI</span>
              </h1>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/20 text-primary-bright border border-primary/30 uppercase">
                PSSS GUARD
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant/70 font-mono">
              Adaptive Vulnerability Prioritization Platform
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-surface-container-low border border-outline-variant/30 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-on-surface-variant font-medium">Engine Status:</span>
          <span className="text-emerald-400 font-semibold">PSSS v2.4 ONLINE</span>
          <span className="text-outline-variant">|</span>
          <span className="text-on-surface-variant">4ms Latency</span>
        </div>
      </div>

      {/* Search Bar & Actions */}
      <div className="flex items-center gap-4">
        <div className="relative w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search CVE-2024-*, threat actors, logs..."
            className="w-full bg-surface-container border border-outline-variant/40 rounded pl-9 pr-4 py-1.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-on-surface"
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Telemetry Feed"
          className="p-2 rounded bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
        </button>

        {/* System Notifications Bell Button & Dropdown */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="System Notifications"
            className={`p-2 rounded border transition-all relative ${
              isNotificationsOpen
                ? 'bg-primary/20 border-primary text-primary-bright shadow-glow-cyan'
                : 'bg-surface-container border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-error text-white font-mono text-[9px] font-extrabold animate-pulse shadow-glow-red">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-11 w-96 rounded-lg border border-primary/50 shadow-2xl z-50 p-4 font-mono text-xs space-y-3 bg-[#12181a] opacity-100">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">SYSTEM ALERTS</span>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-error-container/40 text-error border border-error/40 font-bold text-[9px]">
                      {unreadCount} UNREAD
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[9px]">
                      ALL READ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      title="Mark all as read"
                      className="p-1 hover:text-primary text-on-surface-variant transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      title="Clear notifications"
                      className="p-1 hover:text-error text-on-surface-variant transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 text-on-surface-variant hover:text-on-surface"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant/60 italic space-y-1">
                    <Radio className="w-6 h-6 mx-auto opacity-40 text-primary-bright" />
                    <div>No active system notifications.</div>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleRead(item.id)}
                      className={`p-3 rounded border transition-all cursor-pointer space-y-1.5 relative ${
                        item.unread
                          ? 'bg-[#1b2327] border-primary/50 shadow-sm'
                          : 'bg-[#151b1e] border-outline-variant/30 opacity-90 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          {getSeverityIcon(item.severity)}
                          <span className="font-bold text-on-surface truncate text-[11px]">{item.title}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>
                      </div>

                      <p className="text-[11px] text-on-surface-variant/90 leading-relaxed font-sans">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-on-surface-variant/60 pt-1 border-t border-outline-variant/20">
                        <span>{item.timestamp}</span>
                        <span className="text-primary-bright">
                          {item.unread ? '● Click to mark read' : '✓ Read'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Bar */}
              <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[10px] text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Telemetry Feed
                </span>
                <span className="font-mono text-primary-bright">PSSS v2.4</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-outline-variant/30" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary-bright font-mono font-bold text-xs">
            A
          </div>
          <div className="hidden sm:block text-left font-mono">
            <div className="text-xs font-semibold text-on-surface leading-tight">Admin</div>
            <div className="text-[10px] text-primary-bright">CISO Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
