// ==========================================
// CUSTOMER PERSONAL ORDER HISTORY
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Package,
  Printer,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockDb } from '../../services/mockDatabase';
import { useAuth } from '../../state/AuthContext';
import { useApp } from '../../state/AppContext';
import { Order, OrderItem } from '../../types';

export const CustomerOrdersView: React.FC = () => {
  const { user } = useAuth();
  const { orders } = useApp();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // PRIVACY REQUIREMENT: Scoped strictly to authenticated customer ID
  const customerId = user?.customerId;
  const myOrders = customerId
    ? orders.filter((o) => o.customerId === customerId)
    : [];

  const selectedItems = selectedOrder ? mockDb.getOrderItems(selectedOrder.id) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-600 mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>CONFIDENTIAL CUSTOMER PORTAL</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            My Purchase & Requisition History
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Account: {user?.name} • ID: {customerId || 'GUEST'}
          </p>
        </div>

        <Link
          to="/store"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5 self-start"
        >
          <span>Shop More Hardware</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-8">
        {!user ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 font-display">Vui lòng đăng nhập tài khoản</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Đăng nhập tài khoản khách hàng để xem toàn bộ lịch sử đơn hàng cá nhân, hoặc tra cứu nhanh bằng mã đơn hàng.
            </p>
            <div className="mt-5 flex items-center justify-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Đăng nhập tài khoản
              </Link>
              <Link
                to="/store/tracking"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Tra cứu bằng mã đơn
              </Link>
            </div>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 font-display">Chưa có đơn hàng nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Bạn chưa tạo đơn hàng nào với tài khoản này. Khám phá danh mục phần cứng chính hãng tại cửa hàng.
            </p>
            <Link
              to="/store"
              className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <span>Xem danh mục sản phẩm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Tổng cộng {myOrders.length} đơn hàng</span>
              <span className="font-mono">Chính sách bảo hành chính hãng toàn diện</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-6">Mã đơn hàng</th>
                    <th className="py-3 px-6">Ngày khởi tạo</th>
                    <th className="py-3 px-6">Trạng thái xử lý</th>
                    <th className="py-3 px-6 text-right">Tổng tiền thanh toán</th>
                    <th className="py-3 px-6">Phương thức</th>
                    <th className="py-3 px-6 text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {myOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : order.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                        {formatVND(order.totalAmount)}
                      </td>
                      <td className="py-4 px-6 font-mono uppercase text-[11px] text-slate-500">
                        {order.paymentMethod}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl p-6 text-xs space-y-4 border border-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-base text-slate-900 font-display">Chi tiết đơn hàng</h4>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">{selectedOrder.orderNumber}</div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-slate-600">
              <div>Thời gian: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
              <div>Ghi chú đơn hàng: {selectedOrder.notes || 'Không có ghi chú'}</div>
              <div>Chiến lược giá: <strong className="text-slate-900">{selectedOrder.pricingStrategyName}</strong></div>
            </div>

            <div className="border-t border-b border-slate-100 py-3 divide-y divide-slate-100">
              {selectedItems.map((item) => (
                <div key={item.id} className="py-2 flex justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-900 truncate">{item.productName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{item.productSku} • Qty: {item.quantity}</div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 shrink-0">{formatVND(item.subtotal)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-right font-mono text-xs">
              <div className="text-slate-500">Tạm tính: {formatVND(selectedOrder.subtotal)}</div>
              {selectedOrder.discountAmount > 0 && (
                <div className="text-emerald-700">Chiết khấu: -{formatVND(selectedOrder.discountAmount)}</div>
              )}
              <div className="text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                Tổng thanh toán: {formatVND(selectedOrder.totalAmount)}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
