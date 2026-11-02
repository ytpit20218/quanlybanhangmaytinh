// ==========================================
// SALES: QUICK CUSTOMER REGISTRATION & LOOKUP
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Mail,
  Phone,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { mockDb } from '../../services/mockDatabase';
import { useApp } from '../../state/AppContext';
import { Customer, CustomerTier } from '../../types';

export const SalesCustomerRegistrationView: React.FC = () => {
  const { customers, refreshData } = useApp();

  const [search, setSearch] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tier, setTier] = useState<CustomerTier>('standard');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = customers.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.phone.includes(q) && !c.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg('Name, Phone, and Email are required.');
      return;
    }

    const newCust: Customer = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim() || 'Ho Chi Minh City',
      tier,
      createdAt: new Date().toISOString(),
    };

    mockDb.addCustomer(newCust);
    refreshData();

    setSuccessMsg(`Customer "${newCust.name}" registered successfully.`);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setTimeout(() => {
      setIsRegisterOpen(false);
      setSuccessMsg(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 font-semibold text-xs mb-1">
              <UserPlus className="w-4 h-4" />
              <span>SALES COUNTER CUSTOMER HUB</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Client Accounts & Rapid Registration
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Onboard new retail customers or lookup VIP account loyalty discounts
            </p>
          </div>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Client</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {/* Search Bar */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900 font-semibold">{filtered.length}</strong> registered clients
          </div>
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2 hover:border-blue-400 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{c.name}</h3>
                  <div className="text-xs text-blue-600 font-mono mt-0.5">Phone: {c.phone}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    c.tier === 'vip'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {c.tier} Member
                </span>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-1">
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px] text-slate-700">{c.email}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-700 truncate">{c.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 text-slate-800 max-w-md w-full rounded-lg shadow-xl p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-semibold text-sm text-slate-900">Rapid Client Onboarding</h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1">Customer / Studio Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Viet Tech Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1">Phone Number (Mandatory)</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0903-888-777"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@viettech.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1">Delivery / Invoicing Address</label>
                <input
                  type="text"
                  placeholder="e.g. 120 Le Loi, Dist 1, HCMC"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1">Loyalty Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as CustomerTier)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="standard">Standard (0% base discount)</option>
                  <option value="vip">VIP Tier (5% automatic discount on all hardware)</option>
                </select>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition"
                >
                  Save & Register
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
