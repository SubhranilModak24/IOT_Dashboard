'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { TelemetryLog } from '@/lib/types/database.types';

interface ChartProps {
  data: TelemetryLog[];
}

export function HumidityChart({ data }: ChartProps) {
  const chartData = data.map((item) => {
    let timeLabel = item.recorded_at;
    try {
      const d = new Date(item.recorded_at);
      timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      // fallback
    }

    return {
      time: timeLabel,
      humidity: item.humidity,
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
          />

          <YAxis
            stroke="#06b6d4"
            tick={{ fontSize: 11, fill: '#06b6d4' }}
            domain={[30, 100]}
            tickLine={false}
            unit="%"
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#090e1c',
              borderColor: '#1e293b',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}
          />

          <Area
            type="monotone"
            dataKey="humidity"
            name="Relative Humidity (%)"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#humidityGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
