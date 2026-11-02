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
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { M3Button } from '../components/m3/M3Button';
import { M3TextField } from '../components/m3/M3TextField';
import { M3Card } from '../components/m3/M3Card';
import { UserRole } from '../types';

interface InternalAccountDemo {
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  active: boolean;
  notes: string;
}

const INTERNAL_STAFF_DEMOS: InternalAccountDemo[] = [
  {
    name: 'Nguyễn Minh Kiệt',
    email: 'admin@computertech.vn',
    role: 'admin',
    roleTitle: 'Hệ thống & Ban Giám đốc (Admin)',
    active: true,
    notes: 'Quyền quản trị toàn diện: Dashboard, Nhân sự, Danh mục, Kho & Tài chính',
  },
  {
    name: 'Nguyễn Việt Anh',
    email: 'sale@computertech.vn',
    role: 'sale',
    roleTitle: 'Chuyên viên Bán hàng & Quầy POS (Sale)',
    active: true,
    notes: 'Quầy POS thu ngân, quét mã SKU, đăng ký khách hàng mới, chốt đơn hàng',
  },
  {
    name: 'Lê Thị Mai Hương',
    email: 'huong.le@computertech.vn',
    role: 'sale',
    roleTitle: 'Tư vấn Bán hàng & CSKH (Sale 2)',
    active: true,
    notes: 'Tư vấn cấu hình PC Gaming cao cấp, hỗ trợ khách VIP và báo giá linh kiện',
  },
  {
    name: 'Ngô Thành Tâm',
    email: 'warehouse@computertech.vn',
    role: 'warehouse',
    roleTitle: 'Trưởng bộ phận Kho vận (Kho)',
    active: true,
    notes: 'Ma trận tồn kho (On-hand, Reserved, Available), phiếu xuất/nhập/điều chuyển kho',
  },
  {
    name: 'Võ Thành Đạt',
    email: 'dat.vo@computertech.vn',
    role: 'warehouse',
    roleTitle: 'Điều phối & Kiểm soát Kho (Kho 2)',
    active: true,
    notes: 'Kiểm kê định kỳ, phân bổ vị trí kệ hàng và chuẩn bị đơn hàng xuất kho',
  },
  {
    name: 'Trần Hoàng Nam',
    email: 'tech@computertech.vn',
    role: 'technician',
    roleTitle: 'Kỹ thuật viên Lab & Sửa chữa (Tech)',
    active: true,
    notes: 'Bàn chẩn đoán phần cứng, chẩn đoán lỗi linh kiện, tiếp nhận & xử lý phiếu bảo hành',
  },
];

export const CompanyLoginPage: React.FC = () => {
  const { user, isAuthenticated, login, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
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
      const result = await login(email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Xác thực không thành công. Vui lòng kiểm tra lại thông tin đăng nhập.');
      } else if (result.user) {
        // Enforce RBAC boundary: customers cannot enter internal enterprise portal
        if (result.user.role === 'customer') {
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

  const fillStaffDemo = (demo: InternalAccountDemo) => {
    setEmail(demo.email);
    setPassword(
      demo.role === 'admin'
        ? 'admin123'
        : demo.role === 'sale'
        ? 'sale123'
        : demo.role === 'warehouse'
        ? 'warehouse123'
        : demo.role === 'technician'
        ? 'tech123'
        : 'password123'
    );
    setErrorMessage(null);
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

        {/* 3. Internal Role Fast Selector (Testing & Quick Evaluation) */}
        <div className="mt-6 bg-slate-800/80 border border-slate-700 rounded-m3-lg p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Tài khoản Nhân viên Mẫu (1-Chạm Kiểm Thử)
            </span>
            <span className="text-[10px] font-mono text-slate-500">Internal Evaluation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {INTERNAL_STAFF_DEMOS.map((demo) => {
              const isSelected = email === demo.email;
              return (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => fillStaffDemo(demo)}
                  className={`p-2.5 rounded-m3-sm border text-left transition ${
                    isSelected
                      ? 'bg-blue-950/80 border-blue-500 text-white'
                      : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white truncate">{demo.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase font-mono ${
                        !demo.active
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : demo.role === 'admin'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : demo.role === 'sale'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : demo.role === 'warehouse'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {demo.role}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{demo.email}</div>
                  <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{demo.notes}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Footer Disclaimer */}
      <footer className="max-w-lg w-full mx-auto text-center mt-6 text-xs text-slate-500 font-mono">
        ComputerTech Internal Operations Platform • RBAC Security Enforced
      </footer>
    </div>
  );
};
