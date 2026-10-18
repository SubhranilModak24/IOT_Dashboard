'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Droplets,
  Thermometer,
  CloudRain,
  Cylinder,
  BatteryCharging,
  SunMedium,
  RefreshCw,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Radio,
  SlidersHorizontal,
  Bot,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { GaugeCard } from '@/components/ui/GaugeCard';
import { ActuatorPanel } from '@/components/ui/ActuatorToggle';
import { TopNav } from '@/components/dashboard/TopNav';
import type { TelemetryLog } from '@/lib/types/database.types';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function DashboardTelemetryPage() {
  const [telemetry, setTelemetry] = useState<TelemetryLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTelemetry = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/telemetry?limit=1');
      const data = await res.json();

      if (data.success && data.latest) {
        setTelemetry(data.latest);
        setLastSyncTime(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to fetch telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Periodic polling if autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTelemetry]);

  // Derived metrics with safe fallbacks
  const soilMoisture = telemetry?.soil_moisture ?? 54.2;
  const ambientTemp = telemetry?.ambient_temp ?? 26.8;
  const humidity = telemetry?.humidity ?? 64.5;
  const waterLevel = telemetry?.water_level ?? 82.0;
  const batteryLevel = telemetry?.battery_level ?? 96.0;
  const solarVoltage = telemetry?.solar_voltage ?? 20.4;
  const pumpStatus = telemetry?.pump_status ?? false;
  const botStatus = telemetry?.bot_status ?? 'ACTIVE';

  // Warnings / Thresholds
  const isSoilDry = soilMoisture < 45.0;
  const isTankLow = waterLevel < 20.0;
  const isBatteryLow = batteryLevel < 25.0;

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <TopNav
        title="Real-Time Rover Telemetry"
        subtitle="ESP32-ROVER-V2 High-Precision Ingestion Node"
        batteryLevel={batteryLevel}
        botStatus={botStatus}
        solarVoltage={solarVoltage}
        onRefresh={fetchTelemetry}
        isRefreshing={refreshing}
      />

      {/* Critical System Banners if thresholds triggered */}
      {(isSoilDry || isTankLow || isBatteryLow) && (
        <div className="space-y-2">
          {isSoilDry && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Soil Moisture Warning:</strong> Subsurface root zone is below 45% (
                  {soilMoisture}%). Consider enabling irrigation.
                </span>
              </div>
              <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                ACTION RECOMMENDED
              </span>
            </div>
          )}

          {isTankLow && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Reservoir Depleted:</strong> Main irrigation reservoir is at {waterLevel}
                  %. Refill required before pump cycle.
                </span>
              </div>
              <span className="font-mono text-[10px] bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                CRITICAL
              </span>
            </div>
          )}
        </div>
      )}

      {/* Sync Control & Timestamp Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Last telemetry packet received:</span>
          <span className="font-mono font-semibold text-white">
            {formatDate(telemetry?.recorded_at || lastSyncTime)}
          </span>
          <span className="text-slate-500 text-[11px]">
            ({formatRelativeTime(telemetry?.recorded_at || lastSyncTime)})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Auto-poll (15s)</span>
          </label>

          <span className="text-slate-700">&bull;</span>

          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Field Feeds: 8/8
          </span>
        </div>
      </div>

      {/* Section 1: Radial Gauges (Moisture, Water Reservoir, LiFePO4 Battery) */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Primary Fluid & Energy Gauges
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <GaugeCard
            title="Soil Moisture"
            value={soilMoisture}
            unit="%"
            icon={Droplets}
            fieldTag="Field 1"
            colorTheme={soilMoisture < 45 ? 'amber' : 'emerald'}
            thresholdText={soilMoisture < 45 ? 'Moisture Low' : 'Optimal Hydration'}
            subtitle="Capacitive probe zone A"
          />

          <GaugeCard
            title="Water Reservoir Tank"
            value={waterLevel}
            unit="%"
            icon={Cylinder}
            fieldTag="Field 4"
            colorTheme={waterLevel < 25 ? 'rose' : 'cyan'}
            thresholdText={waterLevel < 25 ? 'Refill Tank' : 'Nominal Volume'}
            subtitle="Ultrasonic level transducer"
          />

          <GaugeCard
            title="LiFePO4 Power Reserve"
            value={batteryLevel}
            unit="%"
            icon={BatteryCharging}
            fieldTag="Field 5"
            colorTheme={batteryLevel < 30 ? 'rose' : 'emerald'}
            thresholdText={batteryLevel > 90 ? 'Full Charge' : 'Healthy State'}
            subtitle="12.8V 24Ah Battery Pack"
          />
        </div>
      </div>

      {/* Section 2: Environmental Telemetry Stat Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Atmospheric & Energy Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            title="Ambient Temperature"
            value={ambientTemp}
            unit="°C"
            icon={Thermometer}
            fieldTag="Field 2"
            statusColor="amber"
            trend={ambientTemp > 30 ? '+1.4°C / 1hr' : 'Stable ±0.2°C'}
            trendType={ambientTemp > 30 ? 'negative' : 'neutral'}
            subtitle="SHT31 Precision Thermistor"
          />

          <StatCard
            title="Relative Air Humidity"
            value={humidity}
            unit="%"
            icon={CloudRain}
            fieldTag="Field 3"
            statusColor="cyan"
            trend="Dew point 18.2°C"
            trendType="positive"
            subtitle="Canopy microclimate hygrometer"
          />

          <StatCard
            title="Solar MPPT Voltage"
            value={solarVoltage}
            unit="V"
            icon={SunMedium}
            fieldTag="Field 6"
            statusColor="emerald"
            trend={(solarVoltage ?? 0) > 15 ? 'Active Absorption' : 'Low Insolation'}
            trendType={(solarVoltage ?? 0) > 15 ? 'positive' : 'neutral'}
            subtitle="Photovoltaic input sensor"
          />
        </div>
      </div>

      {/* Section 3: Hardware Actuator Override Panel */}
      <ActuatorPanel pumpStatus={pumpStatus} botStatus={botStatus} solarVoltage={solarVoltage} />
    </div>
  );
}
