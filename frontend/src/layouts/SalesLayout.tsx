// ==========================================
// COMMERCIAL SALES PORTAL LAYOUT
// Google Material 3 Design
// Point-of-Sale & Sales Rep Operations Workspace
// ==========================================

import React, { useState } from 'react';
import {
  Bell,
  Cpu,
  FileText,
  LogOut,
  Package,
  ShoppingBag,
  Store,
  UserCheck,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useApp } from '../state/AppContext';

export const SalesLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useApp();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/company/login', { replace: true });
  };

  const navLinks = [
    { to: '/sales/pos', label: 'POS Terminal', icon: <ShoppingBag className="w-4 h-4" /> },
    { to: '/sales/orders', label: 'Order Processing', icon: <Package className="w-4 h-4" /> },
    { to: '/sales/intake', label: 'Device Intake / Return', icon: <Wrench className="w-4 h-4" /> },
    { to: '/sales/customers', label: 'Customer Accounts', icon: <UserPlus className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-m3-surface-container-low text-m3-on-surface font-sans selection:bg-m3-primary selection:text-white">
      {/* Top Professional Header (Material 3 Top App Bar) */}
      <header className="sticky top-0 z-40 bg-white border-b border-m3-outline-variant/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/sales/pos" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-m3-md bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-base tracking-tight leading-none text-m3-on-surface">
                  COMPUTER<span className="text-blue-600">TECH</span>
                </div>
                <div className="text-[10px] text-m3-on-surface-variant font-mono tracking-wider uppercase mt-0.5">
                  Retail & Sales Operations
                </div>
              </div>
            </Link>

            {/* Sales Navigation (M3 Pill Tabs) */}
            <nav className="hidden md:flex items-center gap-1 bg-m3-surface-container p-1 rounded-m3-full border border-m3-outline-variant/40 text-xs">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 font-medium rounded-m3-full transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-blue-700 font-bold shadow-xs'
                        : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Right Profile Controls */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/store"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-m3-full border border-m3-outline-variant hover:bg-m3-surface-container text-m3-on-surface transition"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Xem Cửa hàng</span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 p-1.5 rounded-m3-full hover:bg-m3-surface-container border border-m3-outline-variant/60 transition"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-m3-full object-cover border border-slate-300"
                  />
                  <div className="hidden sm:block text-left pr-1">
                    <div className="text-xs font-semibold text-m3-on-surface leading-none">{user?.name}</div>
                    <div className="text-[10px] text-blue-600 font-mono font-bold mt-0.5 uppercase">
                      Sales Desk
                    </div>
                  </div>
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-m3-outline-variant/60 rounded-m3-lg shadow-xl z-50 text-m3-on-surface py-1 text-xs">
                    <div className="px-3.5 py-2.5 border-b border-m3-surface-container">
                      <div className="font-semibold text-m3-on-surface">{user?.name}</div>
                      <div className="text-[11px] text-m3-on-surface-variant font-mono">{user?.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-m3-xs border border-blue-200">
                        Sales Representative
                      </span>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-m3-error hover:bg-m3-error-container/40 rounded-m3-sm flex items-center gap-2 transition font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex gap-1 px-4 py-2 border-t border-m3-outline-variant/60 overflow-x-auto text-xs bg-m3-surface-container-low">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1 whitespace-nowrap rounded-m3-full font-medium ${
                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-m3-on-surface-variant'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Sales Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
