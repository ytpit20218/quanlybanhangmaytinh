// ==========================================
// CUSTOMER ACCOUNT PORTAL (/store/account)
// Google Material 3 Design
// Dedicated dashboard for authenticated retail & VIP buyers
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Building,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  RotateCcw,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { mockDb } from '../../services/mockDatabase';
import { useAuth } from '../../state/AuthContext';
import { useApp } from '../../state/AppContext';
import { Order, OrderItem, RepairTicket } from '../../types';
import { M3Button } from '../../components/m3/M3Button';
import { M3Card } from '../../components/m3/M3Card';
import { M3Badge } from '../../components/m3/M3Badge';
import { M3TextField } from '../../components/m3/M3TextField';

export const CustomerAccountView: React.FC = () => {
  const { user, logout } = useAuth();
  const { orders, repairTickets } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'warranty' | 'profile'>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // Filter orders strictly by customer ID
  const customerId = user?.customerId;
  const myOrders = customerId
    ? orders.filter((o) => o.customerId === customerId)
    : [];

  // Filter repair tickets strictly by customer ID
  const myTickets = customerId
    ? repairTickets.filter((t) => t.customerId === customerId)
    : [];

  // Lookup full customer record from DB
  const customerRecord = customerId ? mockDb.getCustomerById(customerId) : null;
  const isVip = customerRecord?.tier === 'vip';

  const selectedItems = selectedOrder ? mockDb.getOrderItems(selectedOrder.id) : [];

  const handleLogout = () => {
    logout();
    navigate('/store', { replace: true });
  };

  const getOrderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-m3-full px-2.5 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã hoàn thành
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-m3-full px-2.5 py-0.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Đã xác nhận & xuất kho
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-m3-full px-2.5 py-0.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ tiếp nhận
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-m3-full px-2.5 py-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Đã hủy
          </span>
        );
      default:
        return <span className="text-xs text-slate-500 font-mono">{status}</span>;
    }
  };

  const getRepairStatusBadge = (status: RepairTicket['status']) => {
    switch (status) {
      case 'repaired':
      case 'handed_over':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-m3-full px-2.5 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã hoàn tất sửa chữa
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-m3-full px-2.5 py-0.5">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            Đang xử lý tại phòng Lab
          </span>
        );
      case 'diagnosing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-m3-full px-2.5 py-0.5">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            Đang chẩn đoán kỹ thuật
          </span>
        );
      case 'intake':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-m3-full px-2.5 py-0.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Đã tiếp nhận thiết bị
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-m3-surface-container-low font-sans pb-16">
      {/* 1. Account Top Surface Bar */}
      <div className="bg-white border-b border-m3-outline-variant/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user?.name || 'Customer'}
                className="w-14 h-14 rounded-m3-full object-cover border-2 border-m3-primary/20 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-m3-on-surface tracking-tight">
                    {user?.name || 'Tài khoản Khách hàng'}
                  </h1>
                  {isVip && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-m3-full bg-m3-primary text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      VIP Partner · Giảm 5%
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-m3-on-surface-variant font-mono mt-0.5">
                  <span>Mã KH: {customerId || 'GUEST-001'}</span>
                  <span>•</span>
                  <span>Email: {user?.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link to="/store">
                <M3Button variant="tonal" size="sm" icon={<Store className="w-4 h-4" />}>
                  Tiếp tục mua hàng
                </M3Button>
              </Link>
              <M3Button variant="outlined" size="sm" onClick={handleLogout} icon={<LogOut className="w-4 h-4 text-m3-error" />}>
                Đăng xuất
              </M3Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Sidebar Navigation + Tab Content) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Navigation Drawer (M3 Navigation Drawer Style) */}
          <aside className="lg:col-span-1 bg-white border border-m3-outline-variant/60 rounded-m3-lg p-3 shadow-xs space-y-1">
            {[
              {
                id: 'overview',
                label: 'Tổng quan tài khoản',
                icon: <User className="w-4 h-4" />,
                badge: undefined,
              },
              {
                id: 'orders',
                label: 'Lịch sử đơn hàng',
                icon: <Package className="w-4 h-4" />,
                badge: myOrders.length,
              },
              {
                id: 'warranty',
                label: 'Bảo hành & Sửa chữa',
                icon: <Wrench className="w-4 h-4" />,
                badge: myTickets.length,
              },
              {
                id: 'profile',
                label: 'Hồ sơ & Địa chỉ nhận hàng',
                icon: <MapPin className="w-4 h-4" />,
                badge: undefined,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-m3-full text-xs font-medium transition select-none ${
                    isActive
                      ? 'bg-m3-secondary-container text-m3-on-secondary-container font-semibold shadow-xs'
                      : 'text-m3-on-surface-variant hover:bg-m3-surface-container-low hover:text-m3-on-surface'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-m3-full ${
                        isActive
                          ? 'bg-m3-primary text-white font-bold'
                          : 'bg-m3-surface-container text-m3-on-surface-variant'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Main Tab Surface Area */}
          <main className="lg:col-span-3 space-y-6">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <M3Card variant="elevated" className="p-4 bg-white border border-m3-outline-variant/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-m3-on-surface-variant uppercase tracking-wider">
                        Tổng đơn đã đặt
                      </span>
                      <Package className="w-5 h-5 text-m3-primary" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-m3-on-surface mt-2">
                      {myOrders.length}
                    </div>
                    <div className="text-[11px] text-m3-on-surface-variant mt-1">
                      {myOrders.filter((o) => o.status === 'completed').length} đơn giao thành công
                    </div>
                  </M3Card>

                  <M3Card variant="elevated" className="p-4 bg-white border border-m3-outline-variant/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-m3-on-surface-variant uppercase tracking-wider">
                        Hạng thành viên
                      </span>
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-m3-on-surface mt-2">
                      {isVip ? 'VIP Partner' : 'Standard'}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                      {isVip ? 'Áp dụng chiết khấu 5% tự động (BR.02)' : 'Tích lũy để nâng hạng VIP'}
                    </div>
                  </M3Card>

                  <M3Card variant="elevated" className="p-4 bg-white border border-m3-outline-variant/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-m3-on-surface-variant uppercase tracking-wider">
                        Thiết bị gửi sửa
                      </span>
                      <Wrench className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-m3-on-surface mt-2">
                      {myTickets.length}
                    </div>
                    <div className="text-[11px] text-m3-on-surface-variant mt-1">
                      {myTickets.filter((t) => t.status === 'repaired' || t.status === 'handed_over').length} thiết bị đã xử lý xong
                    </div>
                  </M3Card>
                </div>

                {/* Recent Orders Preview */}
                <M3Card variant="outlined" className="p-5 bg-white border border-m3-outline-variant/60">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-m3-outline-variant/60">
                    <h3 className="font-bold text-sm text-m3-on-surface">Đơn hàng gần đây</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-m3-primary hover:underline font-semibold"
                    >
                      Xem toàn bộ ➔
                    </button>
                  </div>

                  {myOrders.length === 0 ? (
                    <div className="py-8 text-center text-m3-on-surface-variant text-xs">
                      Bạn chưa có đơn đặt hàng nào trong lịch sử tài khoản.
                    </div>
                  ) : (
                    <div className="divide-y divide-m3-surface-container">
                      {myOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-mono font-bold text-m3-primary">{order.id}</div>
                            <div className="text-[11px] text-m3-on-surface-variant mt-0.5">
                              Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                          <div>{getOrderStatusBadge(order.status)}</div>
                          <div className="font-mono font-bold text-right text-m3-on-surface">
                            {formatVND(order.totalAmount)}
                          </div>
                          <M3Button
                            variant="outlined"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setActiveTab('orders');
                            }}
                          >
                            Chi tiết
                          </M3Button>
                        </div>
                      ))}
                    </div>
                  )}
                </M3Card>
              </div>
            )}

            {/* TAB 2: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-m3-on-surface">Danh sách Đơn hàng cá nhân</h2>
                  <span className="text-xs text-m3-on-surface-variant font-mono">
                    Tổng: {myOrders.length} đơn
                  </span>
                </div>

                {myOrders.length === 0 ? (
                  <M3Card variant="outlined" className="p-12 text-center bg-white border border-m3-outline-variant/60">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-m3-on-surface-variant">Không có đơn hàng nào.</p>
                  </M3Card>
                ) : (
                  <div className="space-y-3">
                    {myOrders.map((order) => {
                      const items = mockDb.getOrderItems(order.id);
                      return (
                        <M3Card
                          key={order.id}
                          variant="outlined"
                          className="p-4 bg-white border border-m3-outline-variant/60 hover:border-m3-primary/60 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-m3-surface-container gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-sm text-m3-primary">
                                {order.id}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-m3-on-surface-variant font-mono">
                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getOrderStatusBadge(order.status)}
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-m3-on-surface-variant">
                            {items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center">
                                <span className="text-m3-on-surface">
                                  {item.productName} × <strong className="font-mono">{item.quantity}</strong>
                                </span>
                                <span className="font-mono text-slate-600">
                                  {formatVND(item.unitPrice * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-3 mt-3 border-t border-m3-surface-container flex items-center justify-between">
                            <div className="text-xs">
                              <span className="text-m3-on-surface-variant">Tổng thanh toán: </span>
                              <span className="font-mono font-bold text-sm text-m3-on-surface">
                                {formatVND(order.totalAmount)}
                              </span>
                              {order.discountAmount > 0 && (
                                <span className="text-[11px] text-emerald-700 ml-2 font-mono">
                                  (Đã giảm {formatVND(order.discountAmount)})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Link to="/store/tracking">
                                <M3Button variant="tonal" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                                  Tra cứu tiến trình
                                </M3Button>
                              </Link>
                            </div>
                          </div>
                        </M3Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WARRANTY & REPAIRS */}
            {activeTab === 'warranty' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-m3-on-surface">Hồ sơ Thiết bị Bảo hành & Sửa chữa</h2>
                  <span className="text-xs text-m3-on-surface-variant font-mono">
                    {myTickets.length} phiếu
                  </span>
                </div>

                {myTickets.length === 0 ? (
                  <M3Card variant="outlined" className="p-12 text-center bg-white border border-m3-outline-variant/60">
                    <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-m3-on-surface-variant">
                      Chưa có phiếu sửa chữa hoặc thiết bị gửi bảo hành nào cho tài khoản này.
                    </p>
                  </M3Card>
                ) : (
                  <div className="space-y-3">
                    {myTickets.map((ticket) => (
                      <M3Card
                        key={ticket.id}
                        variant="outlined"
                        className="p-4 bg-white border border-m3-outline-variant/60"
                      >
                        <div className="flex items-center justify-between pb-3 mb-2 border-b border-m3-surface-container">
                          <div>
                            <div className="font-mono font-bold text-sm text-m3-primary">{ticket.id}</div>
                            <div className="text-xs font-semibold text-m3-on-surface mt-0.5">
                              {ticket.deviceName}
                            </div>
                          </div>
                          <div>{getRepairStatusBadge(ticket.status)}</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2">
                          <div className="bg-m3-surface-container-low p-2.5 rounded-m3-sm">
                            <span className="text-[10px] text-m3-on-surface-variant uppercase font-mono block">
                              Số Serial máy:
                            </span>
                            <span className="font-mono font-bold text-m3-on-surface">
                              {ticket.serialNumber}
                            </span>
                          </div>
                          <div className="bg-m3-surface-container-low p-2.5 rounded-m3-sm">
                            <span className="text-[10px] text-m3-on-surface-variant uppercase font-mono block">
                              Mô tả lỗi tiếp nhận:
                            </span>
                            <span className="text-m3-on-surface">{ticket.issueDescription}</span>
                          </div>
                        </div>

                        {ticket.diagnosticNotes && (
                          <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-100 rounded-m3-sm text-xs text-emerald-900">
                            <strong>Ghi chú chẩn đoán:</strong> {ticket.diagnosticNotes}
                          </div>
                        )}
                      </M3Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PROFILE & SHIPPING ADDRESS */}
            {activeTab === 'profile' && (
              <M3Card variant="outlined" className="p-6 bg-white border border-m3-outline-variant/60 space-y-5">
                <div>
                  <h2 className="text-base font-bold text-m3-on-surface">Hồ sơ Cá nhân & Địa chỉ Giao hàng</h2>
                  <p className="text-xs text-m3-on-surface-variant mt-0.5">
                    Thông tin phục vụ xuất hóa đơn và vận chuyển phần cứng
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <M3TextField
                    label="Tên khách hàng / Tên doanh nghiệp"
                    defaultValue={customerRecord?.name || user?.name}
                    leadingIcon={<User className="w-4 h-4" />}
                  />
                  <M3TextField
                    label="Số điện thoại nhận hàng"
                    defaultValue={customerRecord?.phone || '0987-654-321'}
                    leadingIcon={<Phone className="w-4 h-4" />}
                  />
                  <M3TextField
                    label="Địa chỉ Email chính thức"
                    defaultValue={customerRecord?.email || user?.email}
                    leadingIcon={<Mail className="w-4 h-4" />}
                  />
                  <M3TextField
                    label="Địa chỉ giao hàng mặc định"
                    defaultValue={customerRecord?.address || '123 Đường Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP.HCM'}
                    leadingIcon={<MapPin className="w-4 h-4" />}
                  />
                </div>

                <div className="pt-2 text-right">
                  <M3Button
                    variant="filled"
                    size="md"
                    onClick={() => alert('Đã lưu thông tin hồ sơ thành công!')}
                  >
                    Lưu thay đổi hồ sơ
                  </M3Button>
                </div>
              </M3Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
