'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart,
  ShieldCheck,
  Sprout,
  LogOut,
  Radio,
  Cpu,
  Settings,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { SyncButton } from './SyncButton';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  userRole?: string;
  userEmail?: string;
  userName?: string;
}

export function Sidebar({ userRole = 'client', userEmail, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      document.cookie = 'demo_session=; path=/; max-age=0; SameSite=Lax';
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    router.push('/login');
  };

  const navItems = [
    {
      label: 'Live Telemetry',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      label: 'Historical Analytics',
      href: '/dashboard/analytics',
      icon: LineChart,
      active: pathname === '/dashboard/analytics',
    },
    {
      label: 'Admin Console',
      href: '/admin',
      icon: ShieldCheck,
      active: pathname === '/admin',
      badge: 'Master',
      hidden: userRole !== 'admin' && false, // keep visible for easy toggling in demo/admin modes
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen z-30">
      {/* Top Header / Brand */}
      <div>
        <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-wide">
                AGRI<span className="text-emerald-400">BOT</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-mono">TELEMETRY OS</span>
            </div>
          </Link>
        </div>

        {/* Rover Connection Beacon Card */}
        <div className="p-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/25 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                LIVE LINK
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                915 MHz
              </span>
            </div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              ESP32-ROVER-V2
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Autonomous Field Bot &bull; Node #01</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1.5">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  item.active
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${item.active ? 'text-emerald-400' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Sync Action */}
        <div className="px-6 mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            ThingSpeak Pipe
          </p>
          <SyncButton className="w-full justify-center" />
        </div>
      </div>

      {/* Bottom User Profile & Sign Out */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {userName ? userName.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {userName || 'Agri Specialist'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {userEmail || 'operator@farm.iot'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
