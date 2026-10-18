'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface SyncButtonProps {
  onSyncComplete?: (data: any) => void;
  className?: string;
  variant?: 'primary' | 'compact';
}

export function SyncButton({
  onSyncComplete,
  className = '',
  variant = 'primary',
}: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSync = async () => {
    try {
      setSyncing(true);
      setStatus('idle');
      setStatusMsg('');

      const res = await fetch('/api/sync-thingspeak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setStatusMsg(`Synced ${data.count} feeds`);
        if (onSyncComplete) onSyncComplete(data);
      } else {
        setStatus('error');
        setStatusMsg(data.error || 'Sync failed');
      }
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err?.message || 'Sync error');
    } finally {
      setSyncing(false);
      setTimeout(() => {
        setStatus('idle');
        setStatusMsg('');
      }, 4000);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleSync}
        disabled={syncing}
        title="Synchronize ThingSpeak Feeds"
        className={`p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700/80 hover:border-emerald-500/40 transition-all ${className}`}
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        id="sync-thingspeak-btn"
        onClick={handleSync}
        disabled={syncing}
        className={`px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-glow disabled:opacity-50 ${className}`}
      >
        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
        <span>{syncing ? 'Syncing...' : 'Sync ThingSpeak'}</span>
      </button>

      {status === 'success' && (
        <span className="absolute -bottom-6 left-0 text-[10px] text-emerald-400 flex items-center gap-1 font-medium whitespace-nowrap bg-slate-950/90 px-1.5 py-0.5 rounded border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          {statusMsg}
        </span>
      )}

      {status === 'error' && (
        <span className="absolute -bottom-6 left-0 text-[10px] text-rose-400 flex items-center gap-1 font-medium whitespace-nowrap bg-slate-950/90 px-1.5 py-0.5 rounded border border-rose-500/30">
          <AlertCircle className="w-3 h-3" />
          {statusMsg}
        </span>
      )}
    </div>
  );
}
