'use client';

import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  statusColor?: 'emerald' | 'amber' | 'cyan' | 'rose' | 'purple';
  fieldTag?: string;
}

export function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendType = 'neutral',
  subtitle,
  statusColor = 'emerald',
  fieldTag,
}: StatCardProps) {
  const colorMap = {
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      glow: 'shadow-glow',
      accent: 'text-emerald-400',
    },
    amber: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      glow: 'shadow-none',
      accent: 'text-amber-400',
    },
    cyan: {
      border: 'hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      glow: 'shadow-none',
      accent: 'text-cyan-400',
    },
    rose: {
      border: 'hover:border-rose-500/50',
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      glow: 'shadow-none',
      accent: 'text-rose-400',
    },
    purple: {
      border: 'hover:border-purple-500/50',
      iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      glow: 'shadow-none',
      accent: 'text-purple-400',
    },
  };

  const currentTheme = colorMap[statusColor];

  return (
    <div
      className={`glass-panel p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${currentTheme.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {title}
            </span>
            {fieldTag && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {fieldTag}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {value}
            </span>
            {unit && <span className="text-sm font-semibold text-slate-400 font-mono">{unit}</span>}
          </div>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${currentTheme.iconBg}`}
        >
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                trendType === 'positive'
                  ? 'text-emerald-400'
                  : trendType === 'negative'
                    ? 'text-rose-400'
                    : 'text-slate-400'
              }`}
            >
              {trendType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
              {trendType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
