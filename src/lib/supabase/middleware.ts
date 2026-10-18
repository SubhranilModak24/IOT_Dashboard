import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database, Profile } from '@/lib/types/database.types';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-iot-farm.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as CookieOptions);
        });
      },
    },
  });

  // Check demo session cookie for local sandbox / evaluation
  const demoCookie = request.cookies.get('demo_session')?.value;
  const isDemo = Boolean(demoCookie);
  const demoRole = demoCookie === 'admin' ? 'admin' : 'client';

  // Refresh auth session
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // ignore
  }

  const pathname = request.nextUrl.pathname;

  // Protected paths
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/onboarding');

  const isAuthPath = pathname.startsWith('/login');

  // If user is not authenticated and no demo session, redirect to /login
  if (!user && !isDemo && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated or demo session
  if (user || isDemo) {
    let isOnboarded = true;
    let isAdmin = demoRole === 'admin';

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const typedProfile = profile as Profile | null;
      isOnboarded = typedProfile?.is_onboarded ?? false;
      isAdmin = typedProfile?.role === 'admin';
    }

    // If on /login, redirect
    if (isAuthPath) {
      const url = request.nextUrl.clone();
      url.pathname = isOnboarded ? '/dashboard' : '/onboarding';
      return NextResponse.redirect(url);
    }

    // Force onboarding if not onboarded
    if (!isOnboarded && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    // Restrict /admin strictly to users with role === 'admin'
    if (pathname.startsWith('/admin') && !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(url);
    }
  }

  return response;
}
