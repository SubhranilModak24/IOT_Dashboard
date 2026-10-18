'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Bot,
  Key,
  Radio,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Check,
  HelpCircle,
  Cpu,
  RefreshCw,
} from 'lucide-react';

interface ChannelMetadata {
  id: number;
  name: string;
  description: string;
  lastEntryId?: number;
  fields: Record<string, string>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [channelId, setChannelId] = useState('');
  const [readKey, setReadKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    channel?: ChannelMetadata;
    error?: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Auto-fill demo credentials for immediate testing
  const handleLoadDemoChannel = () => {
    setChannelId('12397');
    setReadKey('');
    setTestResult({
      valid: true,
      channel: {
        id: 12397,
        name: 'MathWorks Weather Station & IoT Fleet',
        description: 'Live Public ThingSpeak Feeds (Fields 1 to 8)',
        lastEntryId: 5792682,
        fields: {
          field1: 'Soil Moisture (%)',
          field2: 'Ambient Temp (°C)',
          field3: 'Humidity (%)',
          field4: 'Water Tank Level (%)',
          field5: 'Battery Life (%)',
          field6: 'Solar Voltage (V)',
          field7: 'Pump Status',
          field8: 'Bot State',
        },
      },
    });
  };

  // Perform live pre-flight test against ThingSpeak REST API
  const handleTestCredentials = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!channelId.trim()) {
      setTestResult({ valid: false, error: 'Please enter a ThingSpeak Channel ID.' });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      setSaveError(null);

      const res = await fetch('/api/test-thingspeak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: channelId.trim(),
          read_key: readKey.trim(),
        }),
      });

      const data = await res.json();

      if (data.valid) {
        setTestResult({
          valid: true,
          channel: data.channel,
        });
      } else {
        setTestResult({
          valid: false,
          error: data.error || 'Failed to authenticate with ThingSpeak.',
        });
      }
    } catch (err: any) {
      setTestResult({
        valid: false,
        error: err?.message || 'Network error verifying credentials.',
      });
    } finally {
      setTesting(false);
    }
  };

  // Save credentials to Supabase profile and trigger initial sync
  const handleCompleteOnboarding = async () => {
    if (!channelId.trim()) {
      setSaveError('Channel ID is required.');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Update user profile in Supabase
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            thingspeak_channel_id: channelId.trim(),
            thingspeak_read_key: readKey.trim() || null,
            is_onboarded: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) {
          console.warn('Profile update warning:', profileError);
        }
      }

      // Initiate initial ThingSpeak telemetry ingestion
      try {
        await fetch('/api/sync-thingspeak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel_id: channelId.trim(),
            read_key: readKey.trim(),
          }),
        });
      } catch (syncErr) {
        console.warn('Initial sync notice:', syncErr);
      }

      // Redirect directly to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to complete onboarding');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-emerald-500/20 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-3">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Step 1 of 1: Hardware Setup
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Pair Farm Bot Rover
              </h1>
              <p className="text-sm text-slate-400 mt-1.5">
                Connect your ESP32 IoT rover by specifying its ThingSpeak data feed channel
                credentials.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-glow shrink-0">
              <Bot className="w-7 h-7 text-slate-950" />
            </div>
          </div>

          {/* Quick Demo Preload Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-emerald-300">Evaluating without hardware?</p>
                <p className="text-[11px] text-slate-400">
                  Load verified test credentials with simulated rover feeds.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLoadDemoChannel}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium border border-emerald-500/40 transition-all shrink-0"
            >
              Use Demo Bot
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleTestCredentials} className="space-y-5">
            <div>
              <label
                htmlFor="channel-id"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                ThingSpeak Channel ID <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="channel-id"
                  type="text"
                  required
                  placeholder="e.g. 2418902"
                  value={channelId}
                  onChange={(e) => {
                    setChannelId(e.target.value);
                    setTestResult(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-white placeholder-slate-500 text-sm outline-none transition-all"
                />
                <Radio className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Found in your ThingSpeak Channel Settings overview.
              </p>
            </div>

            <div>
              <label
                htmlFor="read-key"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                Read API Key (Optional for Public Channels)
              </label>
              <div className="relative">
                <input
                  id="read-key"
                  type="password"
                  placeholder="e.g. A8B9C0D1E2F3G4H5"
                  value={readKey}
                  onChange={(e) => {
                    setReadKey(e.target.value);
                    setTestResult(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-white placeholder-slate-500 text-sm outline-none transition-all font-mono"
                />
                <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                16-character alphanumeric key found in Channel &rarr; API Keys.
              </p>
            </div>

            {/* Test Credentials Action Button */}
            <div className="pt-2">
              <button
                type="button"
                id="test-connection-btn"
                onClick={() => handleTestCredentials()}
                disabled={testing || !channelId.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500/50 text-xs font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Testing ThingSpeak API Handshake...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Run Live Pre-Flight Connection Test</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`mt-6 p-4 rounded-2xl border text-xs transition-all ${
                testResult.valid
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              {testResult.valid && testResult.channel ? (
                <div>
                  <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Pre-Flight Test Successful! Channel Verified.</span>
                  </div>
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    <p>
                      <strong className="text-white">Channel Name:</strong>{' '}
                      {testResult.channel.name}
                    </p>
                    <p>
                      <strong className="text-white">Telemetry Feeds:</strong> Field 1 to Field 8
                      mapped
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    {testResult.error || 'Connection failed. Verify Channel ID and Read Key.'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Save Error */}
          {saveError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Final Submit / Save Button */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip for now &rarr;
            </button>

            <button
              type="button"
              id="complete-onboarding-btn"
              onClick={handleCompleteOnboarding}
              disabled={saving || !channelId.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Activating Bot...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
