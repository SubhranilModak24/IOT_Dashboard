import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { channel_id, read_key } = await request.json();

    if (!channel_id) {
      return NextResponse.json({ valid: false, error: 'Channel ID is required.' }, { status: 400 });
    }

    const trimmedChannel = String(channel_id).trim();
    const trimmedKey = read_key ? String(read_key).trim() : '';

    const url = new URL(`https://api.thingspeak.com/channels/${trimmedChannel}/feeds.json`);
    url.searchParams.set('results', '1');
    if (trimmedKey) {
      url.searchParams.set('api_key', trimmedKey);
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { valid: false, error: 'Channel not found. Check your Channel ID.' },
          { status: 404 }
        );
      }
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        return NextResponse.json(
          { valid: false, error: 'Invalid or missing ThingSpeak Read API Key.' },
          { status: res.status }
        );
      }
      return NextResponse.json(
        { valid: false, error: `ThingSpeak API returned error ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (!data.channel) {
      return NextResponse.json(
        { valid: false, error: 'Channel metadata not returned from ThingSpeak.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      channel: {
        id: data.channel.id,
        name: data.channel.name,
        description: data.channel.description || 'Smart Farm Bot Feeds',
        lastEntryId: data.channel.last_entry_id,
        fields: {
          field1: data.channel.field1 || 'Soil Moisture',
          field2: data.channel.field2 || 'Ambient Temperature',
          field3: data.channel.field3 || 'Humidity',
          field4: data.channel.field4 || 'Water Level',
          field5: data.channel.field5 || 'Battery Level',
          field6: data.channel.field6 || 'Solar Voltage',
          field7: data.channel.field7 || 'Pump Status',
          field8: data.channel.field8 || 'Bot Status',
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: err?.message || 'Network error connecting to ThingSpeak' },
      { status: 500 }
    );
  }
}
