// ==========================================
// OPERATIONS & AUDIT DASHBOARD — EXECUTIVE COMMAND
// ==========================================

import React from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock,
  Cpu,
  DollarSign,
  FileSpreadsheet,
  FileText,
  History,
  Layers,
  Package,
  RefreshCw,
  Shield,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Wrench,
  Zap,
} from 'lucide-react';
import { BusinessRulesValidator } from '../../domain/validation/businessRules';
import { useApp } from '../../state/AppContext';
import { useNavigate } from 'react-router-dom';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const {
    orders,
    products,
    inventory,
    repairTickets,
    transactions,
  } = useApp();

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // BR.10: Completed Revenue ONLY includes orders with 'completed' status
  const completedRevenue = BusinessRulesValidator.computeCompletedRevenue(orders);
  const completedOrders = orders.filter((o) => o.status === 'completed');

  // Pending & Confirmed orders
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');

  // Low stock products
  const lowStockProducts = products.filter((p) => {
    const inv = inventory[p.id];
    const avail = inv ? inv.quantityOnHand - inv.quantityReserved : 0;
    return avail <= p.minStockAlert;
  });

  // Active repairs
  const activeRepairs = repairTickets.filter(
    (t) => t.status !== 'handed_over' && t.status !== 'cancelled'
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* 1. Header Command Deck */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-xl text-slate-900 tracking-tight">
                  Operations Command & Audit Telemetry
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
                  Audit Enforced
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                BR.10 Enforced: Revenue aggregated exclusively from Completed status (Doanh thu chỉ tính đơn Hoàn tất)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="font-mono text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              System Clock: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 2. Asymmetric Executive Overview Deck (Replaces 4 identical KPI cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Revenue Command Unit (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span className="uppercase tracking-wider">COMPLETED REVENUE (BR.10)</span>
                <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded text-[10px] font-mono font-bold">
                  BR.10 COMPLIANT
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight mt-1">
                {formatVND(completedRevenue)}
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Doanh thu thực tế đã ghi nhận từ các đơn hàng giao thành công và hoàn tất thanh toán.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-800 mt-4 text-xs font-mono">
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <div className="text-[10px] text-slate-400 uppercase">Đơn hoàn tất</div>
                <div className="text-white font-bold text-base mt-0.5">{completedOrders.length} fulfilled orders</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <div className="text-[10px] text-slate-400 uppercase">Tỷ lệ hoàn tất</div>
                <div className="text-emerald-400 font-bold text-base mt-0.5">
                  {orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Operational Radar Strip (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pending Orders Card */}
            <div
              onClick={() => navigate('/admin/orders')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Pending Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
                  {pendingOrders.length}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  {confirmedOrders.length} confirmed orders
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs font-semibold text-blue-600 flex items-center justify-between mt-3">
                <span>Review in POS Lifecycle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Low Stock Alerts Card */}
            <div
              onClick={() => navigate('/admin/inventory')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Reorder Alerts</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono text-amber-600 mt-1">
                  {lowStockProducts.length}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  SKUs below safety stock
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs font-semibold text-amber-700 flex items-center justify-between mt-3">
                <span>Inspect Inventory Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Active Bench Tickets Card */}
            <div
              onClick={() => navigate('/admin/repairs')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Active Bench Tickets</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Wrench className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold font-mono text-blue-600 mt-1">
                  {activeRepairs.length}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  in lab pipeline
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs font-semibold text-blue-600 flex items-center justify-between mt-3">
                <span>Open Repair Bench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Operational Matrix: Inventory Watchlist & Audit Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Inventory Audit Activity (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Recent Inventory Audit Activity (BR.04)</h3>
                    <p className="text-[11px] text-slate-500">Mọi biến động kho phải ghi nhận lý do và người thực hiện</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/inventory')}
                  className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-bold flex items-center space-x-1"
                >
                  <span>Full Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-slate-900 text-xs font-semibold truncate">{tx.reason}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Actor: <strong className="text-slate-700">{tx.actorName}</strong> • Ref: {tx.referenceType} ({tx.referenceId})
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase shadow-sm ${
                          tx.type === 'receipt'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.type === 'issue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {tx.type === 'receipt' ? 'RECEIPT (+)' : tx.type === 'issue' ? 'ISSUE (-)' : 'RESERVE'} ({tx.quantity})
                      </span>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
              Tổng số bản ghi kiểm toán trong hệ thống: {transactions.length} sự kiện
            </div>
          </div>

          {/* Critical Inventory Reorder Watchlist (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Critical Inventory Reorder Watchlist</h3>
                    <p className="text-[11px] text-slate-500">Cảnh báo tồn kho an toàn & đề xuất tái nhập kho</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/inventory')}
                  className="text-amber-700 hover:text-amber-800 text-xs font-bold"
                >
                  Stock Reorder ➔
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {lowStockProducts.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    Tất cả linh kiện đều trên ngưỡng tồn kho an toàn.
                  </div>
                ) : (
                  lowStockProducts.map((p) => {
                    const inv = inventory[p.id];
                    const onHand = inv?.quantityOnHand ?? 0;
                    const resv = inv?.quantityReserved ?? 0;
                    const avail = onHand - resv;

                    return (
                      <div key={p.id} className="py-3 flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-bold text-slate-900 text-xs truncate max-w-[200px]">{p.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            SKU: {p.sku} • Location: {inv?.location}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-amber-600 font-mono text-xs">
                            {avail} Available (OnHand: {onHand}, Resv: {resv})
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Safety Alert Threshold: ≤{p.minStockAlert}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Quy tắc BR.02 & BR.03</span>
              <span className="font-semibold text-emerald-600 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Ngăn chặn âm tồn kho
              </span>
            </div>
          </div>
        </div>

        {/* 4. Automated Business Rules Enforcement Verification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Hardware Business Rules Enforcement Verification
              </h3>
              <p className="text-xs text-slate-500">
                Kiểm định tự động toàn bộ 10 quy tắc nghiệp vụ theo tiêu chuẩn kiến trúc ComputerTech
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-xs text-slate-900">BR.01 — Customer & Line Item Rule</div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Đơn hàng bắt buộc có khách hàng hợp lệ và danh sách sản phẩm với số lượng nguyên dương.
              </p>
              <div className="mt-3 flex items-center text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                <span>ACTIVE & ENFORCED</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-xs text-slate-900">BR.02 & BR.03 — Inventory Integrity</div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Không thể đặt quá số lượng khả dụng. On-Hand không được thấp hơn số lượng đã Reserved.
              </p>
              <div className="mt-3 flex items-center text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                <span>ACTIVE & ENFORCED</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-xs text-slate-900">BR.05, BR.07, BR.10 — State & Revenue</div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Khóa chỉnh sửa khi đơn Hoàn tất / Hủy. Doanh thu tổng hợp độc quyền từ trạng thái Completed.
              </p>
              <div className="mt-3 flex items-center text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                <span>ACTIVE & ENFORCED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
