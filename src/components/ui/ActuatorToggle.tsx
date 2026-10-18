'use client';

import { useState } from 'react';
import {
  Power,
  Droplets,
  Bot,
  SunMedium,
  Zap,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  BatteryCharging,
} from 'lucide-react';

interface ActuatorPanelProps {
  pumpStatus: boolean;
  botStatus: string;
  solarVoltage: number | null;
  onPumpToggle?: (newState: boolean) => void;
  onBotStatusChange?: (newStatus: string) => void;
}

export function ActuatorPanel({
  pumpStatus,
  botStatus,
  solarVoltage,
  onPumpToggle,
  onBotStatusChange,
}: ActuatorPanelProps) {
  const [localPump, setLocalPump] = useState(pumpStatus);
  const [localBotStatus, setLocalBotStatus] = useState(botStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleTogglePump = () => {
    const nextState = !localPump;
    setLocalPump(nextState);
    setIsUpdating(true);
    setToastMsg(`Pump command dispatched: ${nextState ? 'ENGAGED' : 'DISENGAGED'}`);

    if (onPumpToggle) onPumpToggle(nextState);

    setTimeout(() => {
      setIsUpdating(false);
      setTimeout(() => setToastMsg(null), 3000);
    }, 600);
  };

  const handleStatusSelect = (status: string) => {
    setLocalBotStatus(status);
    setIsUpdating(true);
    setToastMsg(`Bot state updated to: ${status}`);

    if (onBotStatusChange) onBotStatusChange(status);

    setTimeout(() => {
      setIsUpdating(false);
      setTimeout(() => setToastMsg(null), 3000);
    }, 600);
  };

  const statusOptions = ['ACTIVE', 'IRRIGATING', 'PATROLLING', 'STANDBY'];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Rover Hardware Actuators
            </h2>
            <p className="text-xs text-slate-400">
              Manual relay override & autonomous operational state machine
            </p>
          </div>
        </div>

        {toastMsg && (
          <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {toastMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Actuator 1: Irrigation Solenoid / Pump Relay */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets
                className={`w-5 h-5 ${localPump ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`}
              />
              <div>
                <span className="text-xs font-bold text-white block">Submersible Pump</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Relay 1 &bull; 12V 2.5A
                </span>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                localPump
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-glow'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {localPump ? 'FLOWING' : 'OFF'}
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-5">
            Drives pressurized drip irrigation valves across Zone 1-A bed.
          </p>

          <button
            id="pump-toggle-btn"
            onClick={handleTogglePump}
            disabled={isUpdating}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              localPump
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{localPump ? 'Stop Irrigation Pump' : 'Energize Pump Relay'}</span>
          </button>
        </div>

        {/* Actuator 2: Operational State Machine */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">Bot State Machine</span>
                <span className="text-[10px] text-slate-400 font-mono">Field 8 Protocol</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {localBotStatus}
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Sets autonomous pathfinder logic and duty cycle.
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            {statusOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleStatusSelect(opt)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                  localBotStatus === opt
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-glow'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Actuator 3: Solar MPPT Charger & Voltage */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SunMedium className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">Solar MPPT Charge</span>
                <span className="text-[10px] text-slate-400 font-mono">Monocrystalline 50W</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40">
              {(solarVoltage ?? 0) > 14 ? 'CHARGING' : 'IDLE'}
            </span>
          </div>

          <div className="my-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Bus Voltage</span>
            </div>
            <span className="text-base font-extrabold text-amber-400 font-mono">
              {solarVoltage !== null && solarVoltage !== undefined
                ? `${solarVoltage} V`
                : '20.40 V'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Buck-boost converter regulated to 14.6V LiFePO4 absorption curve.
          </p>
        </div>
      </div>
    </div>
  );
}
