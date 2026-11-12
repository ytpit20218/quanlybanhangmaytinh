// ==========================================
// CUSTOMER LOGIN PORTAL (/login)
// Google Material 3 Design
// Dedicated strictly to retail & enterprise hardware buyers
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  Shield,
  ShoppingBag,
  Store,
  User,
  UserPlus,
} from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useApp } from '../state/AppContext';
import { mockDb } from '../services/mockDatabase';
import { M3Button } from '../components/m3/M3Button';
import { M3TextField } from '../components/m3/M3TextField';
import { M3Card } from '../components/m3/M3Card';

export const CustomerLoginPage: React.FC = () => {
  const { user, isAuthenticated, login, getDefaultRoute } = useAuth();
  const { refreshData } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Customer registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // If already logged in:
  if (isAuthenticated && user) {
    if (user.role === 'customer') {
      return <Navigate to="/store/account" replace />;
    }
    return <Navigate to={getDefaultRoute()} replace />;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      } else if (result.user) {
        // If customer: check if target page is authorized for customer (starts with /store)
        if (result.user.role === 'customer') {
          const from = (location.state as any)?.from?.pathname;
          if (from && from.startsWith('/store')) {
            navigate(from, { replace: true });
          } else {
            navigate('/store/account', { replace: true });
          }
        } else {
          // If staff logs in here, redirect to their workspace
          navigate(getDefaultRoute(), { replace: true });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối hệ thống.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRegSuccess(false);

    const emailClean = regEmail.trim().toLowerCase();
    const nameClean = regName.trim();
    const phoneClean = regPhone.trim();
    const passwordClean = regPassword.trim();

    if (!nameClean || nameClean.length < 2) {
      setErrorMessage('Vui lòng nhập họ và tên hợp lệ (ít nhất 2 ký tự).');
      return;
    }
    if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!phoneClean || phoneClean.replace(/\D/g, '').length < 9) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (ít nhất 9 chữ số).');
      return;
    }
    if (!passwordClean || passwordClean.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    const existingUser = mockDb.getUserByEmail(emailClean);
    const existingCustomer = mockDb
      .getCustomers()
      .find((c) => c.email.toLowerCase() === emailClean);
    if (existingUser || existingCustomer) {
      setErrorMessage('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
      return;
    }

    const stamp = Date.now();
    const newUserId = `usr_cust_${stamp}`;
    const newCustId = `cust_${stamp}`;

    mockDb.saveCustomer({
      id: newCustId,
      name: nameClean,
      email: emailClean,
      phone: phoneClean,
      address: 'TP. Hồ Chí Minh',
      tier: 'standard',
      createdAt: new Date().toISOString(),
    });

    mockDb.saveUser({
      id: newUserId,
      customerId: newCustId,
      name: nameClean,
      email: emailClean,
      phone: phoneClean,
      password: passwordClean,
      role: 'customer',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    });

    refreshData();
    setRegSuccess(true);
    setEmail(emailClean);
    setPassword('');
    setRegPassword('');
    setActiveTab('signin');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail.trim()) {
      setForgotSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-m3-surface-container-low text-m3-on-surface flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-m3-primary selection:text-white">
      {/* 1. Header with Store Navigation */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pb-6">
        <Link
          to="/store"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-m3-primary hover:text-[#00548f] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Cửa hàng</span>
        </Link>
        <Link
          to="/company/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-m3-primary transition"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Cổng Nhân viên</span>
        </Link>
      </header>

      {/* 2. Main Login Card Container */}
      <div className="max-w-md w-full mx-auto">
        <M3Card variant="elevated" className="p-6 sm:p-8 bg-white border border-m3-outline-variant/60 shadow-sm rounded-m3-xl">
          {/* Brand & Title */}
          <div className="text-center pb-5 mb-5 border-b border-m3-surface-container-high">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00B8D9] to-[#008BA3] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-m3-on-surface tracking-tight">
              Tài khoản Khách hàng
            </h1>
            <p className="text-xs text-m3-on-surface-variant mt-1">
              Đăng nhập để theo dõi đơn hàng, hồ sơ bảo hành và chiết khấu thành viên
            </p>
          </div>

          {/* Form Tabs: Đăng nhập / Đăng ký with vibrant branding */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 mb-6 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setActiveTab('signin');
              }}
              className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'signin'
                  ? 'bg-[#14213D] text-white shadow-md shadow-[#14213D]/25 ring-1 ring-[#14213D]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LogIn className={`w-4 h-4 transition-colors ${activeTab === 'signin' ? 'text-[#00B8D9]' : 'text-slate-400'}`} />
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setRegSuccess(false);
                setActiveTab('register');
              }}
              className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-[#14213D] text-white shadow-md shadow-[#14213D]/25 ring-1 ring-[#14213D]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserPlus className={`w-4 h-4 transition-colors ${activeTab === 'register' ? 'text-[#FF7043]' : 'text-slate-400'}`} />
              <span>Đăng ký tài khoản</span>
            </button>
          </div>

          {regSuccess && activeTab === 'signin' && (
            <div className="mb-5 p-3 bg-emerald-50 text-emerald-800 rounded-m3-sm text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đăng ký thành công! Vui lòng nhập mật khẩu vừa tạo để đăng nhập.</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-m3-error-container text-m3-on-error-container rounded-m3-sm text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-m3-error mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {activeTab === 'signin' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <M3TextField
                label="Email hoặc Số điện thoại"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vd: bao.gamer@gmail.com hoặc 0903456789"
                leadingIcon={<Mail className="w-4 h-4" />}
              />

              <M3TextField
                label="Mật khẩu bảo mật"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leadingIcon={<Lock className="w-4 h-4" />}
                trailingIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                onTrailingIconClick={() => setShowPassword(!showPassword)}
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-m3-on-surface-variant">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-3.5 h-3.5 rounded text-m3-primary border-m3-outline focus:ring-m3-primary"
                  />
                  <span>Ghi nhớ phiên</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-m3-primary font-semibold hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <M3Button
                type="submit"
                variant="filled"
                size="lg"
                disabled={isSubmitting}
                className="w-full mt-2 font-semibold"
                trailingIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isSubmitting ? 'Đang xác thực thông tin...' : 'Đăng nhập vào Tài khoản'}
              </M3Button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              {regSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-m3-sm text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Đăng ký thành công! Đang chuyển sang màn hình Đăng nhập...</span>
                </div>
              )}
              <M3TextField
                label="Họ và tên khách hàng"
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                leadingIcon={<User className="w-4 h-4" />}
              />
              <M3TextField
                label="Địa chỉ Email"
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="khachhang@gmail.com"
                leadingIcon={<Mail className="w-4 h-4" />}
              />
              <M3TextField
                label="Số điện thoại liên hệ"
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="0901 234 567"
              />
              <M3TextField
                label="Mật khẩu"
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                leadingIcon={<Lock className="w-4 h-4" />}
              />
              <M3Button
                type="submit"
                variant="filled"
                size="lg"
                className="w-full mt-2 font-semibold"
              >
                Tạo tài khoản khách hàng mới
              </M3Button>
            </form>
          )}

          {/* Forgot Password Modal */}
          {forgotPasswordOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-m3-xl p-6 max-w-sm w-full shadow-xl">
                <h3 className="font-bold text-base text-m3-on-surface mb-2">Khôi phục mật khẩu</h3>
                <p className="text-xs text-m3-on-surface-variant mb-4">
                  Nhập địa chỉ email đăng ký để nhận mã OTP thiết lập lại mật khẩu tài khoản.
                </p>
                {forgotSent ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-m3-sm text-xs mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mã xác minh đã được gửi tới email {forgotEmail}!</span>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-3">
                    <M3TextField
                      label="Email của bạn"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end pt-2">
                      <M3Button type="button" variant="text" onClick={() => setForgotPasswordOpen(false)}>
                        Hủy bỏ
                      </M3Button>
                      <M3Button type="submit" variant="filled">
                        Gửi mã xác nhận
                      </M3Button>
                    </div>
                  </form>
                )}
                {forgotSent && (
                  <div className="text-right">
                    <M3Button variant="filled" size="sm" onClick={() => { setForgotPasswordOpen(false); setForgotSent(false); }}>
                      Hoàn tất
                    </M3Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </M3Card>
      </div>

      {/* 4. Footer */}
      <footer className="max-w-md w-full mx-auto text-center mt-6 text-xs text-m3-on-surface-variant font-sans">
        ComputerTech Customer Identity Services • Tiêu chuẩn Google Material 3
      </footer>
    </div>
  );
};
