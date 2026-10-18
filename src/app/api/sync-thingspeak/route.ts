import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ThingSpeakResponse } from '@/lib/types/database.types';

function parseNumber(val: string | null | undefined): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : Number(num.toFixed(2));
}

function parseBoolean(val: string | null | undefined): boolean {
  if (!val) return false;
  const cleaned = val.trim().toLowerCase();
  return (
    cleaned === '1' ||
    cleaned === 'true' ||
    cleaned === 'on' ||
    cleaned === 'active' ||
    cleaned === 'yes'
  );
}

function parseBotStatus(val: string | null | undefined): string {
  if (!val || val.trim() === '') return 'ACTIVE';
  return val.trim().toUpperCase();
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // Optional query param or body to force mock sync for testing
    let channelId: string | null = null;
    let readKey: string | null = null;

    try {
      const body = await request.json();
      channelId = body.channel_id;
      readKey = body.read_key;
    } catch {
      // Body not provided or empty
    }

    // If not provided in body, load from user profile
    if (!channelId || !readKey) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('thingspeak_channel_id, thingspeak_read_key, is_onboarded')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
      }

      channelId = profile.thingspeak_channel_id;
      readKey = profile.thingspeak_read_key;
    }

    if (!channelId) {
      return NextResponse.json(
        { error: 'ThingSpeak Channel ID is not configured. Please complete onboarding.' },
        { status: 400 }
      );
    }

    // ThingSpeak REST API Endpoint
    const url = new URL(`https://api.thingspeak.com/channels/${channelId}/feeds.json`);
    url.searchParams.set('results', '50');
    if (readKey) {
      url.searchParams.set('api_key', readKey);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `ThingSpeak API returned status ${response.status}: ${errorText || 'Failed to fetch feeds'}`,
        },
        { status: response.status }
      );
    }

    const data: ThingSpeakResponse = await response.json();

    if (!data.feeds || !Array.isArray(data.feeds)) {
      return NextResponse.json(
        { error: 'Invalid response structure from ThingSpeak API.' },
        { status: 502 }
      );
    }

    if (data.feeds.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'Channel connected, but no feeds found yet.',
      });
    }

    // Map feeds to telemetry records
    const records = data.feeds.map((feed) => ({
      user_id: user.id,
      entry_id: Number(feed.entry_id),
      soil_moisture: parseNumber(feed.field1),
      ambient_temp: parseNumber(feed.field2),
      humidity: parseNumber(feed.field3),
      water_level: parseNumber(feed.field4),
      battery_level: parseNumber(feed.field5),
      solar_voltage: parseNumber(feed.field6),
      pump_status: parseBoolean(feed.field7),
      bot_status: parseBotStatus(feed.field8),
      recorded_at: feed.created_at || new Date().toISOString(),
    }));

    // Upsert telemetry logs, handling conflict on (user_id, entry_id)
    const { data: insertedData, error: upsertError } = await supabase
      .from('telemetry_logs')
      .upsert(records, {
        onConflict: 'user_id,entry_id',
        ignoreDuplicates: false,
      })
      .select();

    if (upsertError) {
      console.error('Upsert telemetry error:', upsertError);
      return NextResponse.json(
        { error: `Database upsert failed: ${upsertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      channel: data.channel?.name || `Channel #${channelId}`,
      count: records.length,
      latest: records[records.length - 1],
      message: `Successfully synchronized ${records.length} telemetry feeds.`,
    });
  } catch (err: any) {
    console.error('ThingSpeak Sync exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error while syncing ThingSpeak.' },
      { status: 500 }
    );
  }
}
