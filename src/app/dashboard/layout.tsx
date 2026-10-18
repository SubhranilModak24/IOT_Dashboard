import { Sidebar } from '@/components/dashboard/Sidebar';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let userRole = 'client';
  let userEmail = 'operator@farmbot.iot';
  let userName = 'Field Rover Operator';

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userEmail = user.email || userEmail;
      userName = user.user_metadata?.full_name || user.email?.split('@')[0] || userName;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        userRole = profile.role;
        if (profile.full_name) userName = profile.full_name;
      }
    }
  } catch (e) {
    // Graceful fallback for mock or demo sessions
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar userRole={userRole} userEmail={userEmail} userName={userName} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">{children}</main>
      </div>
    </div>
  );
}
