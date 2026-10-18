import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { TelemetryLog } from '@/lib/types/database.types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 500);
    const range = searchParams.get('range') || '24h';
    const targetUserId = searchParams.get('user_id');

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Determine target user
    let userId = user?.id;

    if (targetUserId) {
      // Check if current user is admin
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          userId = targetUserId;
        }
      }
    }

    if (userId) {
      let query = supabase.from('telemetry_logs').select('*').eq('user_id', userId);

      // Filter by time range if requested
      if (range === '24h') {
        const d = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('recorded_at', d);
      } else if (range === '7d') {
        const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('recorded_at', d);
      } else if (range === '30d') {
        const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('recorded_at', d);
      }

      const { data: logs, error } = await query
        .order('recorded_at', { ascending: true })
        .limit(limit);

      if (!error && logs && logs.length > 0) {
        const latest = logs[logs.length - 1];
        return NextResponse.json({
          success: true,
          logs,
          latest,
          count: logs.length,
          source: 'database',
        });
      }
    }

    // Fallback simulated seed telemetry data for demo or initial preview
    const sampleLogs: TelemetryLog[] = generateSampleTelemetry(userId || 'demo-bot-1');
    const latest = sampleLogs[sampleLogs.length - 1];

    return NextResponse.json({
      success: true,
      logs: sampleLogs,
      latest,
      count: sampleLogs.length,
      source: 'live-simulated',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Error fetching telemetry data' },
      { status: 500 }
    );
  }
}

function generateSampleTelemetry(userId: string): TelemetryLog[] {
  const points: TelemetryLog[] = [];
  const now = Date.now();
  const count = 30;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * 15 * 60 * 1000).toISOString();
    const cycle = (count - i) / 5;

    // Soil moisture: 42% - 58%
    const soilMoisture = Number((48 + Math.sin(cycle) * 7 + (Math.random() * 2 - 1)).toFixed(1));
    // Temp: 24°C - 31°C
    const ambientTemp = Number(
      (27 + Math.cos(cycle * 0.8) * 3 + (Math.random() * 1.5 - 0.75)).toFixed(1)
    );
    // Humidity: 55% - 72%
    const humidity = Number((63 - Math.cos(cycle * 0.8) * 8 + (Math.random() * 2 - 1)).toFixed(1));
    // Water level: 70% - 85%
    const waterLevel = Number((78 - (count - i) * 0.2 + (Math.random() * 1 - 0.5)).toFixed(1));
    // Battery: 88% - 98%
    const batteryLevel = Number((94 + Math.sin(cycle * 0.5) * 4).toFixed(1));
    // Solar voltage: 18.2V - 21.6V (MPPT active)
    const solarVoltage = Number((19.5 + Math.sin(cycle * 0.8) * 1.8).toFixed(2));
    const pumpStatus = soilMoisture < 45;
    const botStatus = pumpStatus ? 'IRRIGATING' : 'ACTIVE';

    points.push({
      id: count - i,
      user_id: userId,
      entry_id: 1000 + (count - i),
      soil_moisture: soilMoisture,
      ambient_temp: ambientTemp,
      humidity: humidity,
      water_level: waterLevel,
      battery_level: batteryLevel,
      solar_voltage: solarVoltage,
      pump_status: pumpStatus,
      bot_status: botStatus,
      recorded_at: timestamp,
    });
  }

  return points;
}
