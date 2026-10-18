'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GaugeCardProps {
  title: string;
  value: number; // 0 to 100
  unit?: string;
  icon: LucideIcon;
  subtitle?: string;
  fieldTag?: string;
  min?: number;
  max?: number;
  colorTheme?: 'emerald' | 'cyan' | 'amber' | 'rose';
  thresholdText?: string;
}

export function GaugeCard({
  title,
  value,
  unit = '%',
  icon: Icon,
  subtitle,
  fieldTag,
  min = 0,
  max = 100,
  colorTheme = 'emerald',
  thresholdText,
}: GaugeCardProps) {
  // Normalize percentage for arc
  const clamped = Math.max(min, Math.min(max, value));
  const percentage = ((clamped - min) / (max - min)) * 100;

  // SVG circular calculation (radius 38, stroke 7)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle arc or 270 degree arc
  const strokeDashoffset = circumference - (percentage / 100) * (circumference * 0.75);

  const colors = {
    emerald: {
      stroke: '#10b981',
      glow: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
    cyan: {
      stroke: '#06b6d4',
      glow: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    },
    amber: {
      stroke: '#f59e0b',
      glow: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    rose: {
      stroke: '#f43f5e',
      glow: 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.4))',
      text: 'text-rose-400',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    },
  };

  const theme = colors[colorTheme];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80">
            <Icon className={`w-4 h-4 ${theme.text}`} />
          </div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {title}
          </span>
        </div>
        {fieldTag && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {fieldTag}
          </span>
        )}
      </div>

      {/* Radial Gauge SVG */}
      <div className="relative flex items-center justify-center my-3">
        <svg className="w-32 h-32 -rotate-135" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth="8"
            strokeDasharray={circumference * 0.75 + ' ' + circumference * 0.25}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={theme.stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-in-out',
              filter: theme.glow,
            }}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
            {value.toFixed(1)}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 -mt-1 font-mono">{unit}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">{subtitle || 'Live Sensor'}</span>
        {thresholdText && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${theme.badge}`}
          >
            {thresholdText}
          </span>
        )}
      </div>
    </div>
  );
}
