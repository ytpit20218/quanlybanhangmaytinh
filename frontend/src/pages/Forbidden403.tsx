// ==========================================
// 403 ACCESS DENIED / FORBIDDEN PAGE
// ==========================================

import React from 'react';
import { ArrowRight, Lock, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { UserRole } from '../types';

interface Forbidden403Props {
  requiredRoles?: UserRole[];
}

export const Forbidden403: React.FC<Forbidden403Props> = ({ requiredRoles = [] }) => {
  const { user, getDefaultRoute, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoToAuthorizedPortal = () => {
    navigate(getDefaultRoute(), { replace: true });
  };

  const roleNameMap: Record<UserRole, string> = {
    customer: 'Customer (Bên mua)',
    admin: 'Administrator (Quản trị viên)',
    sale: 'Sales Representative (Nhân viên bán hàng)',
    warehouse: 'Warehouse Lead (Nhân viên kho)',
    technician: 'Diagnostic Technician (Nhân viên kỹ thuật)',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-block px-3 py-1 bg-rose-50 text-rose-700 font-mono text-xs font-bold rounded-md uppercase tracking-wider mb-2 border border-rose-200">
          HTTP 403 • Quyền Truy Cập Bị Từ Chối (Access Denied)
        </div>

        <h1 className="font-display font-bold text-2xl text-slate-900 mt-1">
          Khu Vực Giới Hạn Quyền Truy Cập
        </h1>

        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          Tài khoản của bạn <span className="text-slate-900 font-semibold font-mono">{user?.email}</span> mang vai trò{' '}
          <span className="text-amber-700 font-bold uppercase font-mono">[{user?.role}]</span>, không được cấp quyền
          truy cập vào phân hệ làm việc này.
        </p>

        {requiredRoles.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <div>Yêu cầu vai trò ủy quyền:</div>
            <div className="text-rose-700 font-bold mt-0.5 uppercase">
              {requiredRoles.map((r) => roleNameMap[r] || r).join(', ')}
            </div>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button
            onClick={handleGoToAuthorizedPortal}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>Về cổng làm việc được ủy quyền</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition border border-slate-200"
          >
            Đăng xuất & Đổi tài khoản
          </button>
        </div>
      </div>
    </div>
  );
};
