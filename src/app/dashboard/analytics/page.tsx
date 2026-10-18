'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Calendar,
  Download,
  RefreshCw,
  Droplets,
  Thermometer,
  CloudRain,
  SunMedium,
  TrendingUp,
  Filter,
  BarChart3,
  Layers,
} from 'lucide-react';
import { SoilMoistureTempChart } from '@/components/charts/SoilMoistureTempChart';
import { HumidityChart } from '@/components/charts/HumidityChart';
import { PowerSolarChart } from '@/components/charts/PowerSolarChart';
import type { TelemetryLog } from '@/lib/types/database.types';

export default function AnalyticsPage() {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/telemetry?range=${range}&limit=100`);
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load telemetry analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Aggregate stats calculations
  const moistureValues = logs.map((l) => l.soil_moisture).filter((v): v is number => v !== null);
  const tempValues = logs.map((l) => l.ambient_temp).filter((v): v is number => v !== null);
  const humidityValues = logs.map((l) => l.humidity).filter((v): v is number => v !== null);

  const avgMoisture = moistureValues.length
    ? (moistureValues.reduce((a, b) => a + b, 0) / moistureValues.length).toFixed(1)
    : '--';
  const peakTemp = tempValues.length ? Math.max(...tempValues).toFixed(1) : '--';
  const minTemp = tempValues.length ? Math.min(...tempValues).toFixed(1) : '--';
  const avgHumidity = humidityValues.length
    ? (humidityValues.reduce((a, b) => a + b, 0) / humidityValues.length).toFixed(1)
    : '--';

  // Export CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = [
      'Entry ID',
      'Timestamp',
      'Soil Moisture (%)',
      'Ambient Temp (°C)',
      'Humidity (%)',
      'Water Tank (%)',
      'Battery (%)',
      'Solar Voltage (V)',
      'Pump Status',
      'Bot State',
    ];

    const rows = logs.map((l) => [
      l.entry_id,
      `"${l.recorded_at}"`,
      l.soil_moisture ?? '',
      l.ambient_temp ?? '',
      l.humidity ?? '',
      l.water_level ?? '',
      l.battery_level ?? '',
      l.solar_voltage ?? '',
      l.pump_status ? 'ON' : 'OFF',
      `"${l.bot_status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `farmbot-telemetry-${range}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <LineChart className="w-6 h-6 text-emerald-400" />
            Historical Microclimate & Power Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Time-series telemetry analysis ingested across ThingSpeak channels and Supabase
            PostgreSQL.
          </p>
        </div>

        {/* Range Controls & Export */}
        <div className="flex items-center gap-3">
          {/* Time Filter Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {(['24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  range === r
                    ? 'bg-emerald-500 text-slate-950 shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-2 transition-all hover:border-emerald-500/50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metric Mini-Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Droplets className="w-4 h-4" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Avg Soil Moisture
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{avgMoisture}%</div>
          <span className="text-[10px] text-slate-500">Root hydration balance</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Thermometer className="w-4 h-4" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Temp Range
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {minTemp}° - {peakTemp}°C
          </div>
          <span className="text-[10px] text-slate-500">Min / Max excursion</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <CloudRain className="w-4 h-4" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Mean Humidity
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{avgHumidity}%</div>
          <span className="text-[10px] text-slate-500">Vapor deficit nominal</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-slate-800">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Feed Samples
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{logs.length}</div>
          <span className="text-[10px] text-slate-500">Ingested data points</span>
        </div>
      </div>

      {/* Primary Chart 1: Soil Moisture vs Ambient Temperature */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Droplets className="w-4 h-4 text-emerald-400" />
              Soil Moisture vs. Ambient Temperature
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates transpiration stress and root water uptake dynamics.
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            Fields 1 & 2
          </span>
        </div>
        <SoilMoistureTempChart data={logs} />
      </div>

      {/* Charts Grid: Humidity & Power Harvesting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Relative Humidity Trend */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                Atmospheric Relative Humidity Trend
              </h2>
              <p className="text-xs text-slate-400">
                Canopy moisture boundary layer and evaporation index.
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              Field 3
            </span>
          </div>
          <HumidityChart data={logs} />
        </div>

        {/* Chart 3: Power System (Battery & Solar Voltage) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <SunMedium className="w-4 h-4 text-sky-400" />
                LiFePO4 Reserve vs. Solar MPPT Harvest
              </h2>
              <p className="text-xs text-slate-400">
                Charge state curve mapped against solar panel voltage.
              </p>
            </div>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
              Fields 5 & 6
            </span>
          </div>
          <PowerSolarChart data={logs} />
        </div>
      </div>
    </div>
  );
}
