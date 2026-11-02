// ==========================================
// COMMERCIAL TECHNICIAN WORKSHOP LAYOUT
// Google Material 3 Design
// Diagnostic Bench & Lab Specialist Workspace
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  History,
  LogOut,
  Package,
  Store,
  Wrench,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useApp } from '../state/AppContext';
import { M3Badge } from '../components/m3/M3Badge';

export const TechnicianLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { repairTickets } = useApp();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);

  const activeTicketsCount = repairTickets.filter(
    (t) => t.status !== 'handed_over' && t.status !== 'cancelled'
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/company/login', { replace: true });
  };

  const navLinks = [
    { to: '/technician/tickets', label: 'Diagnostic Bench Queue', icon: <Wrench className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-m3-surface-container-low text-m3-on-surface font-sans selection:bg-m3-primary selection:text-white">
      {/* Top Header (Material 3 Top App Bar) */}
      <header className="sticky top-0 z-40 bg-white border-b border-m3-outline-variant/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/technician/tickets" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-m3-md bg-purple-700 flex items-center justify-center font-bold text-white shadow-xs">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-base tracking-tight leading-none text-m3-on-surface">
                  COMPUTER<span className="text-purple-700">TECH</span>
                </div>
                <div className="text-[10px] text-m3-on-surface-variant font-mono tracking-wider uppercase mt-0.5">
                  Hardware Diagnostic Lab
                </div>
              </div>
            </Link>

            {/* Technician Navigation (M3 Pill Tabs) */}
            <nav className="hidden md:flex items-center gap-1 bg-m3-surface-container p-1 rounded-m3-full border border-m3-outline-variant/40 text-xs">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 font-medium rounded-m3-full transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-purple-700 font-bold shadow-xs'
                        : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Right Profile & Ticket Badge Controls */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/store"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-m3-full border border-m3-outline-variant hover:bg-m3-surface-container text-m3-on-surface transition"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Xem Cửa hàng</span>
              </Link>

              {activeTicketsCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-m3-full">
                  <Wrench className="w-3.5 h-3.5 text-purple-600" />
                  <span>{activeTicketsCount} thiết bị đang xử lý</span>
                </span>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 p-1.5 rounded-m3-full hover:bg-m3-surface-container border border-m3-outline-variant/60 transition"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-m3-full object-cover border border-slate-300"
                  />
                  <div className="hidden sm:block text-left pr-1">
                    <div className="text-xs font-semibold text-m3-on-surface leading-none">{user?.name}</div>
                    <div className="text-[10px] text-purple-700 font-mono font-bold mt-0.5 uppercase">
                      Diagnostic Specialist
                    </div>
                  </div>
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-m3-outline-variant/60 rounded-m3-lg shadow-xl z-50 text-m3-on-surface py-1 text-xs">
                    <div className="px-3.5 py-2.5 border-b border-m3-surface-container">
                      <div className="font-semibold text-m3-on-surface">{user?.name}</div>
                      <div className="text-[11px] text-m3-on-surface-variant font-mono">{user?.email}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-m3-xs border border-purple-200">
                        Hardware Diagnostic Lead
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
                  isActive ? 'bg-purple-700 text-white font-semibold' : 'text-m3-on-surface-variant'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Technician Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
