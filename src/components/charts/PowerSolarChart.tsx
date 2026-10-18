'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { TelemetryLog } from '@/lib/types/database.types';

interface ChartProps {
  data: TelemetryLog[];
}

export function PowerSolarChart({ data }: ChartProps) {
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
      battery: item.battery_level,
      solarVoltage: item.solar_voltage,
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
          />

          {/* Left Axis for Battery % */}
          <YAxis
            yAxisId="left"
            stroke="#10b981"
            tick={{ fontSize: 11, fill: '#10b981' }}
            domain={[0, 100]}
            tickLine={false}
            unit="%"
          />

          {/* Right Axis for Solar Voltage V */}
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#38bdf8"
            tick={{ fontSize: 11, fill: '#38bdf8' }}
            domain={[0, 30]}
            tickLine={false}
            unit="V"
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

          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="battery"
            name="LiFePO4 Battery (%)"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
          />

          <Bar
            yAxisId="right"
            dataKey="solarVoltage"
            name="Solar Voltage (V)"
            fill="#38bdf8"
            opacity={0.6}
            radius={[4, 4, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
