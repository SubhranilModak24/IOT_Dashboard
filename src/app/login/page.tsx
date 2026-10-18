'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sprout, ShieldAlert, Cpu, Sparkles, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    searchParams.get('error') === 'auth_failed'
      ? 'Authentication failed or was cancelled. Please try again.'
      : searchParams.get('error') === 'unauthorized_admin'
        ? 'Admin privileges required to access that route.'
        : null
  );

  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const supabase = createClient();

      const redirectUri = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initiate Google OAuth');
      setLoading(false);
    }
  };

  const handleDemoAccess = async (role: 'client' | 'admin') => {
    setDemoLoading(true);
    try {
      document.cookie = `demo_session=${role}; path=/; max-age=86400; SameSite=Lax`;
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectTo);
      }
    } finally {
      setTimeout(() => setDemoLoading(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-emerald-500/20 shadow-2xl relative">
          {/* Logo & Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 items-center justify-center shadow-glow mb-4">
              <Sprout className="w-8 h-8 text-slate-950 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Farm Bot <span className="text-emerald-400">IoT Portal</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Sign in with your enterprise account to access telemetry logs, irrigation actuators,
              and fleet analytics.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading || demoLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{loading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
          </button>

          {/* Quick Demo Access Options for Sandbox / Evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Quick Sandbox Preview
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoAccess('client')}
                disabled={demoLoading}
                className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 text-slate-200 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/50 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Client Demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAccess('admin')}
                disabled={demoLoading}
                className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 text-slate-200 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/50 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            </div>
          </div>

          {/* Security details footnote */}
          <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>End-to-End Supabase SSR & PKCE 256-bit encryption</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            &larr; Back to Platform Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
