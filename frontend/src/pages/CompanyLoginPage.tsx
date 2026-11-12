// ==========================================
// COMPANY INTERNAL LOGIN PORTAL (/company/login)
// Google Material 3 Design
// High-security internal access for Admin, Sales, Warehouse, and Technician
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Building2,
  Cpu,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { M3Button } from '../components/m3/M3Button';
import { M3TextField } from '../components/m3/M3TextField';
import { M3Card } from '../components/m3/M3Card';

export const CompanyLoginPage: React.FC = () => {
  const { user, isAuthenticated, login, logout, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated and staff member, redirect to authorized workspace
  if (isAuthenticated && user) {
    if (user.role !== 'customer') {
      return <Navigate to={getDefaultRoute()} replace />;
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password, { portal: 'company' });
      if (!result.success) {
        setErrorMessage(result.error || 'Xác thực không thành công. Vui lòng kiểm tra lại thông tin đăng nhập.');
      } else if (result.user) {
        // Enforce RBAC boundary: customers cannot enter internal enterprise portal
        if (result.user.role === 'customer') {
          logout();
          setErrorMessage('Truy cập bị từ chối: Tài khoản của bạn là khách hàng mua lẻ, không có quyền truy cập hệ thống quản trị nội bộ. Vui lòng đăng nhập tại Cổng Khách hàng (/login).');
          return;
        }

        // Automatic redirect to authorized workspace by role
        const targetRoute = result.destinationRoute || getDefaultRoute();
        navigate(targetRoute, { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối cổng bảo mật nội bộ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-m3-primary selection:text-white">
      {/* 1. Header with Store Navigation */}
      <header className="max-w-lg w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-m3-sm bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white leading-none">
              COMPUTER<span className="text-blue-400">TECH</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-0.5">
              Enterprise Internal System
            </div>
          </div>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-m3-full border border-slate-700 hover:border-slate-500 bg-slate-800/80 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về Đăng nhập Khách hàng</span>
        </Link>
      </header>

      {/* 2. Main Login Card Container */}
      <div className="max-w-lg w-full mx-auto my-auto py-6">
        <div className="bg-slate-800/95 border border-slate-700/80 rounded-m3-xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          {/* Header Badge & Title */}
          <div className="pb-5 mb-5 border-b border-slate-700/60">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-m3-full bg-blue-950/80 border border-blue-700 text-blue-300 text-[11px] font-mono font-semibold uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Cổng Xác Thực Nội Bộ • Role-Based Access Control</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Đăng nhập Hệ thống Quản trị & Vận hành
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Dành riêng cho nhân viên và ban quản trị ComputerTech. Quyền hạn và không gian làm việc được xác định tự động dựa trên tài khoản được xác thực.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-m3-sm text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                Email Doanh Nghiệp (@computertech.vn)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@computertech.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-m3-xs text-slate-100 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                Mật Khẩu Bảo Mật
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-m3-xs text-slate-100 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-m3-sm border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Vai trò (Admin, Sale, Warehouse, Technician) được phân giải tự động từ cơ sở dữ liệu.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-m3-full shadow-sm transition flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <span>Đang thẩm định phân quyền & Token...</span>
              ) : (
                <>
                  <span>Xác thực & Mở Workspace tương ứng</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 3. Footer Disclaimer */}
      <footer className="max-w-lg w-full mx-auto text-center mt-6 text-xs text-slate-500 font-mono">
        ComputerTech Internal Operations Platform • RBAC Security Enforced
      </footer>
    </div>
  );
};
