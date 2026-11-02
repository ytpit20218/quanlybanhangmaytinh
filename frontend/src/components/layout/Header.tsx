// ==========================================
// UNIFIED COMMAND HEADER & ROLE SWITCHER
// ==========================================

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Cpu,
  Layers,
  RotateCcw,
  Search,
  ShoppingCart,
  Store,
  Terminal,
  UserCheck,
  Wrench,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp, WorkspaceMode } from '../../state/AppContext';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    activeWorkspace,
    setActiveWorkspace,
    cart,
    setIsCartOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetDatabase,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const workspaces: Array<{ id: WorkspaceMode; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'storefront', label: 'Storefront', icon: <Store className="w-4 h-4" /> },
    { id: 'pos', label: 'POS Counter', icon: <Terminal className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory Matrix', icon: <Layers className="w-4 h-4" /> },
    { id: 'repairs', label: 'Repair Bench', icon: <Wrench className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Operations & Audit', icon: <Cpu className="w-4 h-4" /> },
    { id: 'tracking', label: 'Self-Service Tracking', icon: <Search className="w-4 h-4" /> },
  ];

  const roleLabels: Record<UserRole, { title: string; color: string }> = {
    customer: { title: 'Customer', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    admin: { title: 'Administrator', color: 'bg-purple-100 text-purple-900 border-purple-300' },
    sale: { title: 'Sales Executive', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    warehouse: { title: 'Warehouse Lead', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    technician: { title: 'Bench Specialist', color: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950 text-slate-100 border-b border-slate-800 shadow-md">
      {/* Top Bar: Brand, Switcher, Role, Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveWorkspace('storefront')}>
            <div className="w-9 h-9 rounded bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-display font-bold text-white shadow-sm">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-lg tracking-tight leading-none text-white">
                COMPUTER<span className="text-orange-500">TECH</span>
              </div>
              <div className="font-mono text-[10px] text-slate-400 tracking-wider uppercase">
                Hardware & Lab Operations
              </div>
            </div>
          </div>

          {/* Application Switcher (Tabs) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-md border border-slate-800">
            {workspaces.map((ws) => {
              const active = activeWorkspace === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    active
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {ws.icon}
                  <span>{ws.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Role Selector, Notifications, Cart, Reset */}
          <div className="flex items-center space-x-3">
            {/* Cart Trigger (Storefront & Counter) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Open Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[11px] font-mono-num font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartTotalItems}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowRoleMenu(false);
                }}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-md shadow-2xl z-50 text-slate-200 py-2">
                  <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      System Audit Notifications ({unreadCount} unread)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-orange-400 hover:text-orange-300 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">No notifications yet.</div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.linkTo) {
                              setActiveWorkspace(notif.linkTo.module as WorkspaceMode);
                            }
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 hover:bg-slate-800 cursor-pointer transition ${
                            !notif.read ? 'bg-slate-800/50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {notif.severity === 'warning' && (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            {notif.severity === 'alert' && (
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            )}
                            {notif.severity === 'success' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            )}
                            {notif.severity === 'info' && (
                              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-200 truncate">{notif.title}</div>
                              <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowNotifMenu(false);
                }}
                className="flex items-center space-x-2 p-1.5 rounded hover:bg-slate-800 transition border border-slate-800"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded object-cover border border-slate-700"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold leading-none text-slate-200">{currentUser.name}</div>
                  <div className="text-[10px] font-mono text-orange-400 capitalize">{roleLabels[currentUser.role]?.title}</div>
                </div>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-md shadow-2xl z-50 text-slate-200 py-1">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    Switch Active Operational Role
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center space-x-3 text-xs hover:bg-slate-800 transition ${
                        u.id === currentUser.id ? 'bg-slate-800/80 font-semibold text-orange-400' : 'text-slate-300'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded object-cover" />
                      <div className="flex-1">
                        <div>{u.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{roleLabels[u.role]?.title}</div>
                      </div>
                      {u.id === currentUser.id && <UserCheck className="w-4 h-4 text-orange-500" />}
                    </button>
                  ))}
                  <div className="border-t border-slate-800 mt-1 pt-1 px-3 py-2">
                    <button
                      onClick={() => {
                        if (confirm('Reset mock database to initial seed data? All custom orders and inventory changes will revert.')) {
                          resetDatabase();
                          setShowRoleMenu(false);
                        }
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Mock Data to Initial</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Workspaces Bar */}
        <div className="flex md:hidden overflow-x-auto space-x-2 py-2 border-t border-slate-800">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => setActiveWorkspace(ws.id)}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs whitespace-nowrap rounded font-medium ${
                activeWorkspace === ws.id ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {ws.icon}
              <span>{ws.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
