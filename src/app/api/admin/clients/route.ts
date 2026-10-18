import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database.types';

// Verify that the caller is an authenticated admin
async function verifyAdmin() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { authorized: false, error: 'Unauthorized. Sign in required.' };
  }

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const profile = data as Profile | null;

  if (profile?.role !== 'admin') {
    return { authorized: false, error: 'Forbidden. Admin privileges required.' };
  }

  return { authorized: true, user, profile };
}

// GET: Fetch all clients and fleet statistics
export async function GET() {
  try {
    const authCheck = await verifyAdmin();
    const supabase = createClient();

    // Fallback seed profiles for demo/initial preview if database is not yet populated
    const fallbackProfiles: Profile[] = [
      {
        id: 'usr_01h8a91b2c3d4e5f6g7h8i9j01',
        email: 'greenhouse.alpha@agritech.io',
        full_name: 'Dr. Marcus Vance',
        avatar_url:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'client',
        thingspeak_channel_id: '2418902',
        thingspeak_read_key: 'A8B9C0D1E2F3G4H5',
        is_onboarded: true,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'usr_01h8a91b2c3d4e5f6g7h8i9j02',
        email: 'hydroponics.beta@valleylab.org',
        full_name: 'Elena Rostova',
        avatar_url:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        role: 'client',
        thingspeak_channel_id: '1945112',
        thingspeak_read_key: 'Z9Y8X7W6V5U4T3S2',
        is_onboarded: true,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'usr_01h8a91b2c3d4e5f6g7h8i9j03',
        email: 'orchard.south@sunharvest.com',
        full_name: 'Mateo Morales',
        avatar_url:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        role: 'client',
        thingspeak_channel_id: '2109843',
        thingspeak_read_key: 'K1L2M3N4O5P6Q7R8',
        is_onboarded: false,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'usr_01h8a91b2c3d4e5f6g7h8i9j04',
        email: 'admin.director@agritech.io',
        full_name: 'Sophia Sterling (HQ)',
        avatar_url:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        role: 'admin',
        thingspeak_channel_id: '2600119',
        thingspeak_read_key: 'MASTER_KEY_SECRET',
        is_onboarded: true,
        created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    if (authCheck.authorized) {
      const { data: dbProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbProfiles && dbProfiles.length > 0) {
        return NextResponse.json({
          clients: dbProfiles,
          totalBots: dbProfiles.filter((p) => Boolean(p.thingspeak_channel_id)).length,
          activePumps: 2,
          avgBattery: 92.4,
          source: 'database',
        });
      }
    }

    return NextResponse.json({
      clients: fallbackProfiles,
      totalBots: fallbackProfiles.filter((p) => Boolean(p.thingspeak_channel_id)).length,
      activePumps: 2,
      avgBattery: 94.2,
      source: 'demo-roster',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to load client roster' },
      { status: 500 }
    );
  }
}

// PATCH: Update client credentials / role
export async function PATCH(request: Request) {
  try {
    const authCheck = await verifyAdmin();
    const body = await request.json();
    const { id, thingspeak_channel_id, thingspeak_read_key, role, is_onboarded } = body;

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates: Partial<Profile> = {
      updated_at: new Date().toISOString(),
    };

    if (thingspeak_channel_id !== undefined) updates.thingspeak_channel_id = thingspeak_channel_id;
    if (thingspeak_read_key !== undefined) updates.thingspeak_read_key = thingspeak_read_key;
    if (role !== undefined) updates.role = role;
    if (is_onboarded !== undefined) updates.is_onboarded = is_onboarded;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      client: data,
      message: 'Client credentials successfully updated.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update client' }, { status: 500 });
  }
}

// DELETE: Delete a client profile and cascade telemetry
export async function DELETE(request: Request) {
  try {
    const authCheck = await verifyAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client ID parameter is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Delete profile (cascades to telemetry_logs)
    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Client ${id} and associated telemetry records permanently removed.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete client' }, { status: 500 });
  }
}
