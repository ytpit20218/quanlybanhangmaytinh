// ==========================================
// ADMIN CUSTOMER DIRECTORY & TIERS
// ==========================================

import React, { useState } from 'react';
import {
  Building,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';

export const AdminCustomersView: React.FC = () => {
  const { customers } = useApp();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'standard' | 'vip'>('all');

  const filtered = customers.filter((c) => {
    if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !c.phone.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-bold uppercase text-[11px] mb-1">
            <UserCheck className="w-4 h-4" />
            <span>EXECUTIVE CRM REGISTRY</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900">
            Registered Customers & Loyalty Tiers
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            VIP privileges (5% discount strategy), enterprise commercial accounts, and service addresses
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-6 bg-white p-4 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search customer, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="all">ALL MEMBERSHIP TIERS</option>
            <option value="vip">VIP PRIVILEGE (5% DISCOUNT)</option>
            <option value="standard">STANDARD ACCOUNTS</option>
          </select>
        </div>

        <div className="text-slate-500 text-xs">
          Total Client Profiles: <strong className="text-slate-900 font-mono">{filtered.length}</strong>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-lg border border-slate-200 space-y-3 shadow-sm hover:border-slate-300 transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-900">{c.name}</h3>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Account ID: {c.id}</div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  c.tier === 'vip'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {c.tier} Member
              </span>
            </div>

            <div className="space-y-1.5 text-slate-600 text-xs pt-3 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-700 font-mono text-[11px] truncate">{c.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-700 font-mono text-[11px]">{c.phone}</span>
              </div>
              <div className="flex items-start space-x-2">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600 text-[11px]">{c.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
