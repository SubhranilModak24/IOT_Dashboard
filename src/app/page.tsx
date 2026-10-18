import Link from 'next/link';
import {
  Sprout,
  Cpu,
  Activity,
  ShieldCheck,
  Wifi,
  ArrowRight,
  BarChart3,
  Droplets,
  SunMedium,
  BatteryCharging,
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      {/* Navigation Bar */}
      <header className="border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-glow">
              <Sprout className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-wider">
                AGRI<span className="text-emerald-400">BOT</span>
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v2.4 IoT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-glow hover:shadow-glow-lg flex items-center gap-2"
            >
              Console
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        {/* Glowing backdrop elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time Telemetry Ingestion via ThingSpeak REST API</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl">
          Autonomous Precision <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">
            Farm Bot IoT Dashboard
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Monitor soil moisture, atmospheric climate, LiFePO4 power telemetry, and trigger automated
          precision irrigation for robotic agricultural fleets.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2.5"
          >
            Launch Fleet Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl glass-panel-subtle hover:bg-slate-900 text-slate-200 font-semibold text-base border border-slate-700/60 hover:border-emerald-500/40 transition-all flex items-center gap-2"
          >
            Client Access / Login
          </Link>
        </div>

        {/* Live Metrics Showcase Banner */}
        <div className="mt-16 w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="glass-panel p-5 rounded-2xl border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Droplets className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Moisture
              </span>
            </div>
            <div className="text-2xl font-bold text-white">52.8%</div>
            <div className="text-xs text-emerald-400 mt-1">Optimal Zone</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-emerald-500/20">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <SunMedium className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Solar Array
              </span>
            </div>
            <div className="text-2xl font-bold text-white">20.4 V</div>
            <div className="text-xs text-amber-400 mt-1">MPPT Active</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-emerald-500/20">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <BatteryCharging className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                LiFePO4 Cell
              </span>
            </div>
            <div className="text-2xl font-bold text-white">96.5%</div>
            <div className="text-xs text-cyan-400 mt-1">Nominal Health</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-emerald-500/20">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Wifi className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Sync Latency
              </span>
            </div>
            <div className="text-2xl font-bold text-white">142 ms</div>
            <div className="text-xs text-emerald-400 mt-1">ESP32 Connected</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>
          Smart Farm Bot Enterprise IoT Platform &bull; Supabase SSR &bull; ThingSpeak Synchronized
        </p>
      </footer>
    </main>
  );
}
