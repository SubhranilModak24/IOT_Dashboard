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
  Legend,
} from 'recharts';
import type { TelemetryLog } from '@/lib/types/database.types';

interface ChartProps {
  data: TelemetryLog[];
}

export function SoilMoistureTempChart({ data }: ChartProps) {
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
      soilMoisture: item.soil_moisture,
      temperature: item.ambient_temp,
    };
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
          />

          {/* Left Y Axis for Soil Moisture */}
          <YAxis
            yAxisId="left"
            stroke="#10b981"
            tick={{ fontSize: 11, fill: '#10b981' }}
            domain={[0, 100]}
            tickLine={false}
            unit="%"
          />

          {/* Right Y Axis for Ambient Temp */}
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#f59e0b"
            tick={{ fontSize: 11, fill: '#f59e0b' }}
            domain={[10, 45]}
            tickLine={false}
            unit="°C"
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

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="soilMoisture"
            name="Soil Moisture (%)"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#moistureGrad)"
          />

          <Area
            yAxisId="right"
            type="monotone"
            dataKey="temperature"
            name="Ambient Temp (°C)"
            stroke="#f59e0b"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#tempGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
