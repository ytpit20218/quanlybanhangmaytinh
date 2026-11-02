// ==========================================
// ADMIN PORTAL LAYOUT
// Google Material 3 Design
// Navigation Rail / App Bar for Enterprise Management
// ==========================================

import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Boxes,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  Info,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  RotateCcw,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useApp } from '../state/AppContext';
import { M3Badge } from '../components/m3/M3Badge';
import { M3Button } from '../components/m3/M3Button';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, resetDatabase } = useApp();
  const navigate = useNavigate();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/company/login', { replace: true });
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Business Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/users', label: 'Staff & Roles', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/products', label: 'Catalog Matrix', icon: <Layers className="w-4 h-4" /> },
    { to: '/admin/customers', label: 'Customer Directory', icon: <UserCheck className="w-4 h-4" /> },
    { to: '/admin/orders', label: 'Orders & POS', icon: <Package className="w-4 h-4" /> },
    { to: '/admin/inventory', label: 'Warehouse Stock', icon: <Boxes className="w-4 h-4" /> },
    { to: '/admin/repairs', label: 'Diagnostic Lab', icon: <Wrench className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-m3-surface-container-low text-m3-on-surface font-sans selection:bg-m3-primary selection:text-white">
      {/* Top Admin Command Header (Material 3 Top App Bar) */}
      <header className="sticky top-0 z-40 bg-white border-b border-m3-outline-variant/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand Logo */}
            <Link to="/admin/dashboard" className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-m3-md bg-m3-primary flex items-center justify-center font-bold text-white shadow-xs">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg tracking-tight leading-none text-m3-on-surface">
                  COMPUTER<span className="text-m3-primary">TECH</span>
                </div>
                <div className="text-[10px] text-m3-on-surface-variant font-semibold tracking-wider uppercase font-mono mt-0.5">
                  Executive Admin Portal
                </div>
              </div>
            </Link>

            {/* Admin Desktop Navigation (M3 Pill Navigation) */}
            <nav className="hidden xl:flex items-center gap-1 bg-m3-surface-container p-1 rounded-m3-full border border-m3-outline-variant/40">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-semibold rounded-m3-full transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-m3-primary shadow-xs font-bold'
                        : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Right Controls: Notifications & Admin Profile */}
            <div className="flex items-center gap-2.5">
              {/* Link to Storefront */}
              <Link
                to="/store"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-m3-full border border-m3-outline-variant hover:bg-m3-surface-container text-m3-on-surface transition"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Xem Cửa hàng</span>
              </Link>

              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="p-2 text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container rounded-m3-full transition relative border border-m3-outline-variant/60"
                  title="System Notifications"
                >
                  <M3Badge content={unreadCount > 0 ? unreadCount : undefined}>
                    <Bell className="w-4 h-4" />
                  </M3Badge>
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-m3-outline-variant/60 rounded-m3-lg shadow-xl z-50 text-m3-on-surface py-2">
                    <div className="px-4 py-2 border-b border-m3-surface-container flex items-center justify-between text-xs">
                      <span className="font-bold text-m3-on-surface uppercase tracking-wider font-mono">
                        Admin Audit Alerts ({unreadCount})
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-m3-primary hover:underline text-[11px] font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-m3-surface-container text-xs">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-m3-on-surface-variant">No alerts logged.</div>
                      ) : (
                        notifications.slice(0, 6).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              setShowNotifs(false);
                            }}
                            className={`p-3 hover:bg-m3-surface-container-low cursor-pointer transition ${
                              !notif.read ? 'bg-m3-primary-container/20' : ''
                            }`}
                          >
                            <div className="font-semibold text-m3-on-surface">{notif.title}</div>
                            <div className="text-[11px] text-m3-on-surface-variant mt-0.5">{notif.message}</div>
                            <div className="text-[10px] text-m3-on-surface-variant font-mono mt-1">
                              {new Date(notif.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-m3-full hover:bg-m3-surface-container border border-m3-outline-variant/60 transition"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-m3-full object-cover border border-m3-outline-variant"
                  />
                  <div className="hidden sm:block text-left pr-1">
                    <div className="text-xs font-semibold text-m3-on-surface leading-none">{user?.name}</div>
                    <div className="text-[10px] text-m3-primary uppercase font-bold mt-0.5 font-mono">
                      Super Admin
                    </div>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-m3-outline-variant/60 rounded-m3-lg shadow-xl z-50 text-m3-on-surface py-1 text-xs">
                    <div className="px-4 py-3 border-b border-m3-surface-container">
                      <div className="font-bold text-m3-on-surface">{user?.name}</div>
                      <div className="text-[11px] text-m3-on-surface-variant font-mono">{user?.email}</div>
                      <div className="text-[10px] text-purple-700 font-bold uppercase mt-1">
                        System Superuser (All Permissions)
                      </div>
                    </div>

                    <div className="p-2 border-b border-m3-surface-container">
                      <button
                        onClick={() => {
                          if (window.confirm('Reset database to initial seed state?')) {
                            resetDatabase();
                            setShowProfileMenu(false);
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-m3-sm flex items-center gap-2 font-medium"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Seed Database</span>
                      </button>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-m3-error hover:bg-m3-error-container/40 rounded-m3-sm flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Admin Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Subnav for Small / Medium screens */}
        <div className="xl:hidden flex gap-1 px-4 py-2 border-t border-m3-outline-variant/60 overflow-x-auto text-xs bg-m3-surface-container-low">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1 whitespace-nowrap rounded-m3-full font-medium flex items-center gap-1.5 ${
                  isActive ? 'bg-m3-primary text-white font-semibold' : 'text-m3-on-surface-variant'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Admin View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer className="bg-m3-surface-container-highest border-t border-m3-outline-variant/60 py-4 px-6 text-xs text-m3-on-surface-variant font-mono">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>ComputerTech Enterprise Admin Core • Google Material 3</div>
          <div>Audit Logging: ACTIVE (BR.01-BR.10 Enforced)</div>
        </div>
      </footer>
    </div>
  );
};
