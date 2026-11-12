// ==========================================
// ADMIN USER & ROLE MANAGEMENT
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Plus,
  Shield,
  ShieldAlert,
  Unlock,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { mockDb } from '../../services/mockDatabase';
import { useAuth } from '../../state/AuthContext';
import { useApp } from '../../state/AppContext';
import { User, UserRole } from '../../types';

export const AdminUsersView: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { users, refreshData } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('sale');
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    if (u.role === 'customer') return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleToggleStatus = (targetUser: User) => {
    setActionBanner(null);
    if (targetUser.id === currentAdmin?.id) {
      setActionBanner('Cannot suspend your own active administrator account.');
      return;
    }

    mockDb.toggleUserActiveStatus(targetUser.id);
    refreshData();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setFormError('All fields are required.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setFormError('Initial password must be at least 6 characters.');
      return;
    }

    const existing = mockDb.getUserByEmail(newEmail);
    if (existing) {
      setFormError(`An account with email "${newEmail}" already exists.`);
      return;
    }

    const created: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      password: newPassword.trim(),
      role: newRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      active: true,
    };

    mockDb.saveUser(created);
    refreshData();
    setIsAddUserOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-bold uppercase text-[11px] mb-1">
            <Users className="w-4 h-4" />
            <span>EXECUTIVE AUTHORIZATION DIRECTORY</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900">
            Staff Accounts & Role Governance
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage multi-tenant operational credentials, role assignments, and active account status (Requirement #5 & #10)
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center space-x-1.5 self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {actionBanner && (
        <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center justify-between text-xs shadow-sm">
          <span className="font-medium">{actionBanner}</span>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="ml-4 font-semibold text-rose-700 hover:text-rose-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="mt-6 bg-white p-4 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search staff or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="all">ALL ROLES</option>
            <option value="admin">ADMINISTRATOR</option>
            <option value="sale">SALES</option>
            <option value="warehouse">WAREHOUSE</option>
            <option value="technician">TECHNICIAN</option>
          </select>
        </div>

        <div className="text-slate-500 text-xs">
          Total Registered Users: <strong className="text-slate-900 font-mono">{filteredUsers.length}</strong>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="mt-4 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Account Holder</th>
                <th className="py-3 px-4">Role Assignment</th>
                <th className="py-3 px-4">Email Identifier</th>
                <th className="py-3 px-4 text-center">Account Status</th>
                <th className="py-3 px-4 text-center">Security Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentAdmin?.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-bold uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: {u.id}</div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'sale'
                            ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                            : u.role === 'warehouse'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : u.role === 'technician'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {u.email}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {u.active ? (
                        <span className="inline-flex items-center text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <ShieldAlert className="w-3 h-3 mr-1 text-rose-600" /> SUSPENDED
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={isSelf}
                        className={`px-3 py-1 rounded font-semibold transition flex items-center space-x-1 mx-auto text-[11px] ${
                          isSelf
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : u.active
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.active ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Deactivate Access</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Restore Access</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 max-w-md w-full rounded-lg shadow-xl p-6 text-xs font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Provision Operational Account</h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Full Name / Operator Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tran Minh Tuan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Account Email / Identity</label>
                <input
                  type="email"
                  required
                  placeholder="name@computertech.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Assigned Operational Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 uppercase focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="sale">SALES (Counter POS & Registration)</option>
                  <option value="warehouse">WAREHOUSE (Stock Matrix & Picking)</option>
                  <option value="technician">TECHNICIAN (Diagnostic Bench & Requisition)</option>
                  <option value="admin">ADMINISTRATOR (Executive Oversight)</option>
                  <option value="customer">CUSTOMER (Online Storefront)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-sm transition"
                >
                  Create & Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
