'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  Bot,
  Key,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  BatteryCharging,
  Droplets,
  ExternalLink,
  Plus,
} from 'lucide-react';
import type { Profile } from '@/lib/types/database.types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminConsolePage() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fleet stats
  const [stats, setStats] = useState({
    totalBots: 0,
    activePumps: 2,
    avgBattery: 93.8,
  });

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editChannelId, setEditChannelId] = useState('');
  const [editReadKey, setEditReadKey] = useState('');
  const [editRole, setEditRole] = useState<'client' | 'admin'>('client');
  const [isSaving, setIsSaving] = useState(false);

  // Masking toggles for API keys
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  // Deletion modal confirmation
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchClients = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
        setStats({
          totalBots: data.totalBots ?? data.clients.length,
          activePumps: data.activePumps ?? 2,
          avgBattery: data.avgBattery ?? 93.8,
        });
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
      showToast('Error loading client fleet data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const toggleKeyReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startEditing = (client: Profile) => {
    setEditingId(client.id);
    setEditChannelId(client.thingspeak_channel_id || '');
    setEditReadKey(client.thingspeak_read_key || '');
    setEditRole(client.role);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditChannelId('');
    setEditReadKey('');
  };

  const saveEdit = async (id: string) => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          thingspeak_channel_id: editChannelId.trim() || null,
          thingspeak_read_key: editReadKey.trim() || null,
          role: editRole,
          is_onboarded: Boolean(editChannelId.trim()),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Client telemetry parameters successfully updated');
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data.client } : c)));
        cancelEditing();
      } else {
        showToast(data.error || 'Failed to update client', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error updating client', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/clients?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Client ${deleteTarget.full_name || deleteTarget.email} removed from fleet`);
        setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        showToast(data.error || 'Failed to delete client', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error deleting client', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      (c.full_name && c.full_name.toLowerCase().includes(q)) ||
      (c.thingspeak_channel_id && c.thingspeak_channel_id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: Master System Administrator
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Fleet Administration & Client Management
          </h1>
          <p className="text-xs text-slate-400">
            Provision ThingSpeak channel bindings, configure authorization roles, and audit
            telemetry accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            &larr; Back to Dashboard
          </Link>

          <button
            onClick={fetchClients}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Fleet Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Farm Bots Active
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{stats.totalBots}</div>
          <p className="text-[11px] text-slate-500 mt-1">Paired ESP32-ROVER units across farms</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Irrigation Relays
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{stats.activePumps}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pumps energized in field zones</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Fleet Battery Health
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BatteryCharging className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{stats.avgBattery}%</div>
          <p className="text-[11px] text-slate-500 mt-1">LiFePO4 average cell capacity</p>
        </div>
      </div>

      {/* Client Fleet Management Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Table Filter Bar */}
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Registered Clients & Provisioned Channels
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by client name, email, or channel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Client Operator</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">ThingSpeak Channel</th>
                <th className="py-3.5 px-6">Read API Key</th>
                <th className="py-3.5 px-6">Onboarded</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredClients.map((client) => {
                const isEditing = editingId === client.id;
                const isKeyRevealed = revealedKeys[client.id] || false;

                return (
                  <tr key={client.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Client Operator Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400 uppercase shrink-0">
                          {client.full_name ? client.full_name.charAt(0) : client.email.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-white truncate">
                            {client.full_name || 'Anonymous Operator'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{client.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-6">
                      {isEditing ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as 'client' | 'admin')}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                        >
                          <option value="client">Client</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            client.role === 'admin'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {client.role.toUpperCase()}
                        </span>
                      )}
                    </td>

                    {/* ThingSpeak Channel ID */}
                    <td className="py-4 px-6 font-mono">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editChannelId}
                          onChange={(e) => setEditChannelId(e.target.value)}
                          placeholder="Channel ID"
                          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs w-28"
                        />
                      ) : client.thingspeak_channel_id ? (
                        <a
                          href={`https://thingspeak.com/channels/${client.thingspeak_channel_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          #{client.thingspeak_channel_id}
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      ) : (
                        <span className="text-slate-500 italic">Not Assigned</span>
                      )}
                    </td>

                    {/* Read API Key (Masked/Revealed) */}
                    <td className="py-4 px-6 font-mono">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editReadKey}
                          onChange={(e) => setEditReadKey(e.target.value)}
                          placeholder="Read API Key"
                          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs w-36"
                        />
                      ) : client.thingspeak_read_key ? (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">
                            {isKeyRevealed
                              ? client.thingspeak_read_key
                              : '••••••••••••' + client.thingspeak_read_key.slice(-4)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleKeyReveal(client.id)}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {isKeyRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Public / None</span>
                      )}
                    </td>

                    {/* Onboarded Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          client.is_onboarded ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            client.is_onboarded ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                        />
                        {client.is_onboarded ? 'Active' : 'Pending'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEdit(client.id)}
                            disabled={isSaving}
                            className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold transition-all"
                            title="Save Changes"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEditing(client)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-all"
                            title="Edit Channel Bindings"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(client)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/40 transition-all"
                            title="Delete Client & Logs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No clients match search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Client Deletion */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-rose-500/30 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Client Purge</h3>
                <p className="text-xs text-slate-400">Irreversible database cascade</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to delete client{' '}
              <strong className="text-white">{deleteTarget.full_name || deleteTarget.email}</strong>
              ? This action will cascade through Supabase PostgreSQL, permanently purging their
              profile, ThingSpeak bindings, and all recorded telemetry logs.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-client-btn"
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-900/50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Purging...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Client & Records</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
