'use client';

import {
  Wifi,
  BatteryCharging,
  Sun,
  Bell,
  RefreshCw,
  Bot,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SyncButton } from './SyncButton';

interface TopNavProps {
  title?: string;
  subtitle?: string;
  batteryLevel?: number | null;
  botStatus?: string;
  solarVoltage?: number | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function TopNav({
  title = 'Autonomous Farm Bot Telemetry',
  subtitle = 'ESP32 Rover #01 Telemetry Stream',
  batteryLevel = 94.5,
  botStatus = 'ACTIVE',
  solarVoltage = 20.2,
  onRefresh,
  isRefreshing = false,
}: TopNavProps) {
  const isCharging = (solarVoltage ?? 0) > 14.0;

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-[11px] text-slate-400">{subtitle}</p>
      </div>

      {/* Status Badges & Quick Controls */}
      <div className="flex items-center gap-3">
        {/* Rover Live Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold text-emerald-400">Connected</span>
          <span className="text-slate-500 font-mono text-[10px]">ESP32-ROVER-V2</span>
        </div>

        {/* Bot Operational Mode */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs">
          <Bot className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-400">State:</span>
          <span className="font-bold text-teal-300 font-mono">{botStatus}</span>
        </div>

        {/* Battery Telemetry */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs">
          <BatteryCharging
            className={`w-3.5 h-3.5 ${isCharging ? 'text-emerald-400 animate-pulse' : 'text-slate-300'}`}
          />
          <span className="font-semibold text-white font-mono">{batteryLevel ?? '--'}%</span>
          {isCharging && (
            <span className="text-[9px] text-emerald-400 uppercase font-mono px-1 rounded bg-emerald-500/10 border border-emerald-500/30">
              Solar MPPT
            </span>
          )}
        </div>

        {/* Sync / Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Telemetry Stream"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700/80 transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
            />
          </button>
        )}

        <SyncButton variant="primary" />
      </div>
    </header>
  );
}
