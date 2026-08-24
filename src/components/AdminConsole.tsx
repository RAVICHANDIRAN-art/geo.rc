import React, { useState, useEffect } from 'react';
import type { UserProfile, ActivityLog, UserStatus } from '../types/auth';
import { getAllUsers, saveUsers } from '../services/authService';
import { getStoredActivityLogs, isUserActiveNow } from '../services/activityService';
import { 
  Users, Activity, ShieldCheck, Search, Filter, LogOut, 
  MapPin, Globe, X
} from 'lucide-react';

interface AdminConsoleProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onGoToMap: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  onLogout,
  onGoToMap
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  // Table search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');

  useEffect(() => {
    const loadedUsers = getAllUsers();
    setUsers(loadedUsers);
    const loadedLogs = getStoredActivityLogs();
    setLogs(loadedLogs);
  }, []);

  // Compute animated counters
  const totalUsers = users.length + 125; // Base 128 demo metric
  const activeNowCount = users.filter((u) => isUserActiveNow(u.lastActive)).length + 22; // 24 active
  const inactiveCount = totalUsers - activeNowCount;
  const todaysLogins = 17;
  const totalSurveys = 42;
  const totalParcels = 486;

  // Filtered users table list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const isActive = isUserActiveNow(u.lastActive);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isActive) ||
      (statusFilter === 'INACTIVE' && !isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleUserStatus = (uid: string) => {
    const updated = users.map((u) => {
      if (u.uid === uid) {
        const newStatus: UserStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...u, status: newStatus };
      }
      return u;
    });
    setUsers(updated);
    saveUsers(updated);
    if (selectedUser?.uid === uid) {
      setSelectedUser(updated.find((u) => u.uid === uid) || null);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0B1220] flex flex-col font-sans text-white select-none overflow-hidden">
      {/* Admin Top Header */}
      <header className="h-16 bg-[#111827] border-b border-[#1E293B] px-6 flex items-center justify-between text-white z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-emerald-400 p-[2px] shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              URBAN PARCEL MAPPER
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                ADMIN CONSOLE
              </span>
            </h1>
            <p className="text-[11px] text-[#94A3B8]">
              System Operations & User Access Management
            </p>
          </div>
        </div>

        {/* User Info Badge & Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onGoToMap}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Open Map</span>
          </button>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#172033] border border-[#334155] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-white">{currentUser.username}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-extrabold border border-rose-800">
              ● ADMIN
            </span>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition border border-[#334155]"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Dashboard Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Admin Navigation Sidebar */}
        <aside className="w-60 bg-[#111827] border-r border-[#1E293B] p-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#94A3B8] uppercase px-3 py-2">
              Console Navigation
            </div>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-[#94A3B8] hover:bg-[#172033] hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Management</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'activity' ? 'bg-indigo-600 text-white shadow-md' : 'text-[#94A3B8] hover:bg-[#172033] hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activity Logs</span>
            </button>
          </div>

          {/* Network Location Disclaimer */}
          <div className="p-3 bg-[#172033] border border-[#1E293B] rounded-xl space-y-1 text-[11px]">
            <div className="text-[10px] font-bold text-[#94A3B8] uppercase flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Network Location
            </div>
            <p className="text-[#E5E7EB] font-mono text-[10px]">Region: Chennai, India</p>
            <p className="text-[#94A3B8] text-[9px] leading-tight">IP identifiers are pseudonymous approx network locations.</p>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Animated Statistics Counter Cards Grid */}
          <div className="grid grid-cols-6 gap-3">
            <div className="p-3.5 bg-[#111827] border border-[#334155] rounded-2xl shadow-xl flex flex-col justify-between">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase">TOTAL USERS</span>
              <span className="text-2xl font-black text-white font-mono">{totalUsers}</span>
            </div>

            <div className="p-3.5 bg-[#111827] border border-emerald-500/40 rounded-2xl shadow-xl flex flex-col justify-between">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">ACTIVE NOW</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{activeNowCount}</span>
            </div>

            <div className="p-3.5 bg-[#111827] border border-[#334155] rounded-2xl shadow-xl flex flex-col justify-between">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase">INACTIVE</span>
              <span className="text-2xl font-black text-slate-400 font-mono">{inactiveCount}</span>
            </div>

            <div className="p-3.5 bg-[#111827] border border-[#334155] rounded-2xl shadow-xl flex flex-col justify-between">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase">TODAY'S LOGINS</span>
              <span className="text-2xl font-black text-indigo-400 font-mono">{todaysLogins}</span>
            </div>

            <div className="p-3.5 bg-[#111827] border border-[#334155] rounded-2xl shadow-xl flex flex-col justify-between">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase">TOTAL SURVEYS</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{totalSurveys}</span>
            </div>

            <div className="p-3.5 bg-[#111827] border border-[#334155] rounded-2xl shadow-xl flex flex-col justify-between">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase">TOTAL PARCELS</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{totalParcels}</span>
            </div>
          </div>

          {/* User Management View */}
          {activeTab === 'users' && (
            <div className="bg-[#111827] border border-[#334155] rounded-2xl p-5 shadow-2xl space-y-4">
              {/* Search & Filters Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full max-w-xs flex items-center">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, username, email..."
                    className="w-full bg-[#0B1220] text-xs text-white placeholder-[#94A3B8] pl-9 pr-3 py-2 rounded-xl border border-[#334155] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <Filter className="w-4 h-4 text-[#94A3B8]" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-[#0B1220] text-white text-xs border border-[#334155] rounded-xl px-2.5 py-2"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#0B1220] text-white text-xs border border-[#334155] rounded-xl px-2.5 py-2"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Users Data Table */}
              <div className="overflow-x-auto rounded-xl border border-[#1E293B]">
                <table className="w-full text-left text-xs text-white">
                  <thead className="bg-[#172033] text-[#94A3B8] uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3">Status</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3">IP ID</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] bg-[#0B1220]">
                    {filteredUsers.map((u) => {
                      const isActive = isUserActiveNow(u.lastActive);
                      return (
                        <tr
                          key={u.uid}
                          onClick={() => setSelectedUser(u)}
                          className="hover:bg-[#172033]/60 cursor-pointer transition"
                        >
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}>
                              {isActive ? '🟢 ACTIVE' : '⚪ INACTIVE'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-white">{u.fullName}</td>
                          <td className="p-3 font-mono text-indigo-300">{u.username}</td>
                          <td className="p-3 text-[#94A3B8]">{u.email}</td>
                          <td className="p-3">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              u.role === 'ADMIN' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[#94A3B8]">
                            {u.lastActive ? new Date(u.lastActive).toLocaleTimeString() : '--'}
                          </td>
                          <td className="p-3 font-mono text-[#94A3B8]">{u.ipAddressMasked || 'IP-7F3A••••'}</td>
                          <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleUserStatus(u.uid)}
                              className="px-2 py-1 text-[10px] font-bold rounded bg-[#172033] hover:bg-[#1E293B] border border-[#334155] text-indigo-300"
                            >
                              Toggle Status
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activity Logs View */}
          {activeTab === 'activity' && (
            <div className="bg-[#111827] border border-[#334155] rounded-2xl p-5 shadow-2xl space-y-3">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live User Activity Log Stream
              </h3>

              <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-3 font-mono text-xs max-h-96 overflow-y-auto space-y-2 divide-y divide-[#172033]">
                {logs.map((log) => (
                  <div key={log.id} className="pt-2 first:pt-0 flex items-start justify-between">
                    <div>
                      <span className="text-[#94A3B8] mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <strong className="text-indigo-400 mr-2">{log.username}:</strong>
                      <span className="text-white">{log.description}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#172033] text-emerald-400 border border-[#334155]">
                      {log.activityType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Details Side Slide-over Panel */}
      {selectedUser && (
        <div className="fixed top-0 right-0 h-full w-96 bg-[#111827] border-l border-[#334155] z-50 shadow-2xl p-5 flex flex-col space-y-4 animate-in fade-in slide-in-from-right-6 duration-200 text-white">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-sm uppercase">USER DETAILS</h3>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="p-1 text-[#94A3B8] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 text-xs divide-y divide-[#1E293B]">
            <div className="space-y-2">
              <div className="font-bold text-base text-white">{selectedUser.fullName}</div>
              <div className="font-mono text-indigo-300">@{selectedUser.username}</div>
              <div className="text-[#94A3B8]">{selectedUser.email}</div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Role: {selectedUser.role}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  isUserActiveNow(selectedUser.lastActive) ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-400'
                }`}>
                  {isUserActiveNow(selectedUser.lastActive) ? '🟢 ACTIVE' : '⚪ INACTIVE'}
                </span>
              </div>
            </div>

            <div className="pt-3 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Created Date:</span>
                <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Last Active:</span>
                <span>{new Date(selectedUser.lastActive).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Masked IP:</span>
                <span>{selectedUser.ipAddressMasked || 'IP-7F3A••••'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Network Region:</span>
                <span>{selectedUser.networkRegion || 'Chennai, India'}</span>
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <div className="font-bold text-indigo-300 text-[11px] uppercase">Activity History</div>
              <div className="space-y-1 max-h-40 overflow-y-auto font-mono text-[10px] pr-1">
                {logs
                  .filter((l) => l.username === selectedUser.username)
                  .map((log) => (
                    <div key={log.id} className="p-1.5 bg-[#172033] rounded border border-[#1E293B]">
                      <span className="text-emerald-400 font-bold">[{log.activityType}]</span> {log.description}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
