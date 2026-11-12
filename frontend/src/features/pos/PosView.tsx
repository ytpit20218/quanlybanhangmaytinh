// ==========================================
// COMMERCIAL POINT-OF-SALE & ORDER LIFECYCLE
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Barcode,
  CheckCircle2,
  Clock,
  CreditCard,
  Banknote,
  Building,
  FileText,
  Filter,
  Info,
  Layers,
  Lock,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Search,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  UserCheck,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react';
import { OrderProcessingFacade } from '../../services/orderProcessingFacade';
import { PricingCalculator } from '../../strategies/pricing/pricingStrategy';
import { useApp } from '../../state/AppContext';
import { Customer, CustomerTier, Order, OrderItem, PaymentMethod, Product, ProductCategory } from '../../types';
import { Link } from 'react-router-dom';

export const PosView: React.FC = () => {
  const {
    currentUser,
    products,
    customers,
    inventory,
    orders,
    refreshData,
  } = useApp();

  // Active Tab: 'counter' (Fast Sales Terminal) or 'orders' (Order Lifecycle Manager)
  const [activeTab, setActiveTab] = useState<'counter' | 'orders'>('counter');

  // --- Counter State ---
  const [cartItems, setCartItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [skuInput, setSkuInput] = useState('');
  const [posSearch, setPosSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [counterNote, setCounterNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<{ order: Order; items: OrderItem[] } | null>(null);

  // --- Orders Management Tab Filter & Action State ---
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  const fallbackGuestCustomer: Customer = {
    id: 'cust_walkin',
    name: 'Khách lẻ vãng lai',
    email: 'khachle@computertech.vn',
    phone: '0900-000-000',
    address: 'Tại quầy POS',
    tier: 'standard',
    createdAt: new Date().toISOString(),
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0] || fallbackGuestCustomer;

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // Counter calculations via Strategy Pattern
  const pricingInput = {
    items: cartItems.map((i) => ({ unitPrice: i.product.price, quantity: i.quantity })),
    customerTier: (selectedCustomer?.tier || 'standard') as CustomerTier,
  };
  const pricing = PricingCalculator.calculate(pricingInput);

  // Quick SKU add
  const handleSkuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!skuInput.trim()) return;

    const found = products.find(
      (p) => p.sku.toLowerCase() === skuInput.trim().toLowerCase()
    );

    if (!found) {
      setErrorMessage(`SKU "${skuInput}" không tồn tại trong danh mục phần cứng.`);
      return;
    }

    addToPosCart(found);
    setSkuInput('');
  };

  const addToPosCart = (product: Product) => {
    setErrorMessage(null);
    const inv = inventory[product.id];
    const available = inv ? Math.max(0, inv.quantityOnHand - inv.quantityReserved) : 0;
    const existing = cartItems.find((i) => i.product.id === product.id);
    const existingQty = existing ? existing.quantity : 0;

    if (existingQty + 1 > available) {
      setErrorMessage(
        `Không thể thêm "${product.name}". Tồn kho khả dụng chỉ còn ${available} sản phẩm.`
      );
      return;
    }

    if (existing) {
      setCartItems((prev) =>
        prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCartItems((prev) => [...prev, { product, quantity: 1 }]);
    }
  };

  const updatePosQty = (productId: string, newQty: number) => {
    setErrorMessage(null);
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }

    const inv = inventory[productId];
    const available = inv ? Math.max(0, inv.quantityOnHand - inv.quantityReserved) : 0;

    if (newQty > available) {
      setErrorMessage(`Số lượng yêu cầu vượt quá tồn kho khả dụng (${available} chiếc).`);
      return;
    }

    setCartItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: newQty } : i))
    );
  };

  // Checkout Execution using Facade Pattern
  const handleCheckoutPos = (autoConfirm: boolean) => {
    setErrorMessage(null);

    if (cartItems.length === 0) {
      setErrorMessage('BR.01: Giao dịch yêu cầu ít nhất một mặt hàng linh kiện.');
      return;
    }

    if (!selectedCustomer) {
      setErrorMessage('BR.01: Vui lòng chọn hồ sơ khách hàng hợp lệ.');
      return;
    }

    const result = OrderProcessingFacade.placeOrder({
      customer: selectedCustomer,
      items: cartItems.map((i) => ({ product: i.product, quantity: i.quantity })),
      paymentMethod,
      notes: counterNote,
      actor: currentUser,
      autoConfirm,
    });

    if (!result.success) {
      setErrorMessage(result.errors.join(' | '));
      return;
    }

    // Capture completed order receipt
    if (autoConfirm && result.order) {
      setLastCompletedOrder({
        order: result.order,
        items: result.items || [],
      });
    }

    // Reset POS form
    setCartItems([]);
    setCounterNote('');
    refreshData();
  };

  // Order Transition Action Handlers for Lifecycle Manager
  const handleTransition = (orderId: string, targetStatus: Order['status'], reason?: string) => {
    setActionError(null);
    const res = OrderProcessingFacade.transitionStatus(orderId, targetStatus, currentUser, reason);

    if (!res.success) {
      setActionError(res.errors.join(' | '));
    } else {
      refreshData();
    }
  };

  const categories: Array<{ id: ProductCategory | 'all'; label: string }> = [
    { id: 'all', label: 'Tất cả danh mục' },
    { id: 'laptops', label: 'Laptops & Máy trạm' },
    { id: 'pc_gaming', label: 'PC Gaming' },
    { id: 'pc_parts', label: 'Linh kiện PC' },
    { id: 'displays', label: 'Màn hình' },
    { id: 'gaming_gear', label: 'Gaming Gear' },
    { id: 'networking', label: 'Thiết bị mạng' },
    { id: 'accessories', label: 'Phụ kiện' },
  ];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (posSearch.trim()) {
      const q = posSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* Top Header: Desk Identity & Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Point-of-Sale Counter
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200 font-mono">
                  POS Terminal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhân viên quầy: <strong className="text-slate-700">{currentUser.name}</strong> • Quét mã SKU & Phân bổ kho tức thì
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto text-xs max-w-full">
            <button
              onClick={() => setActiveTab('counter')}
              className={`px-3 sm:px-4 py-2 font-semibold rounded-md transition flex items-center space-x-2 ${
                activeTab === 'counter'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Quầy bán hàng & Thu ngân</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 font-semibold rounded-md transition flex items-center space-x-2 ${
                activeTab === 'orders'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Quản lý vòng đời đơn hàng</span>
              <span className="font-mono text-[11px] bg-slate-200 px-1.5 py-0.2 rounded-full text-slate-700">
                {orders.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ================= TAB 1: SALES COUNTER ================= */}
        {activeTab === 'counter' && (
          <div className="space-y-6">
            {/* Active Customer Banner */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Khách hàng giao dịch</div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-bold text-slate-900 text-sm">{selectedCustomer.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        selectedCustomer.tier === 'vip'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {selectedCustomer.tier === 'vip' ? 'Thành viên VIP (Giảm 5%)' : 'Khách chuẩn'}
                    </span>
                    <span className="text-xs font-mono text-slate-500">({selectedCustomer.phone})</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto min-w-0">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full sm:w-auto max-w-full min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tier.toUpperCase()}) — {c.phone}
                    </option>
                  ))}
                </select>

                <Link
                  to="/sales/customers"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Đăng ký khách mới</span>
                </Link>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Two-Column Structured Operational Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Rapid Search & Hardware Selection (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Search & Scanner Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSkuSubmit} className="flex-1 flex space-x-2">
                      <div className="relative flex-1">
                        <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Nhập hoặc quét mã SKU (ấn Enter)..."
                          value={skuInput}
                          onChange={(e) => setSkuInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                      >
                        Quét SKU
                      </button>
                    </form>

                    <div className="relative sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm theo tên linh kiện..."
                        value={posSearch}
                        onChange={(e) => setPosSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pt-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition font-medium ${
                          selectedCategory === cat.id
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Structured Hardware List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 uppercase tracking-wider">Danh mục linh kiện sẵn có</span>
                    <span>{filteredProducts.length} mặt hàng</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                    {filteredProducts.map((p) => {
                      const inv = inventory[p.id];
                      const onHand = inv?.quantityOnHand ?? 0;
                      const resv = inv?.quantityReserved ?? 0;
                      const available = Math.max(0, onHand - resv);
                      const isZero = available <= 0;
                      const isLow = available > 0 && available <= p.minStockAlert;

                      return (
                        <div
                          key={p.id}
                          className={`p-3.5 flex items-center justify-between gap-4 transition ${
                            isZero ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white shrink-0 p-1"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-slate-900 truncate">{p.name}</div>
                              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 mt-0.5">
                                <span>{p.sku}</span>
                                <span>•</span>
                                <span>BH: {p.warrantyMonths}T</span>
                                <span>•</span>
                                {isZero ? (
                                  <span className="text-rose-600 font-bold">Hết hàng</span>
                                ) : isLow ? (
                                  <span className="text-amber-600 font-bold">Sắp hết ({available})</span>
                                ) : (
                                  <span className="text-emerald-600 font-semibold">Khả dụng: {available}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 shrink-0">
                            <div className="text-right font-mono font-bold text-xs text-slate-900">
                              {formatVND(p.price)}
                            </div>

                            <button
                              onClick={() => !isZero && addToPosCart(p)}
                              disabled={isZero}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1 ${
                                isZero
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Transaction Register / Order Docket (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900">Hóa đơn thanh toán</h3>
                  </div>
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {cartItems.reduce((s, i) => s + i.quantity, 0)} món
                  </span>
                </div>

                {/* Line Items List */}
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Chưa có sản phẩm nào trong hóa đơn quầy.
                    </div>
                  ) : (
                    cartItems.map(({ product, quantity }) => (
                      <div key={product.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-semibold text-slate-800 truncate">{product.name}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {formatVND(product.price)} × {quantity}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <div className="flex items-center border border-slate-200 rounded-md">
                            <button
                              onClick={() => updatePosQty(product.id, quantity - 1)}
                              className="p-1 text-slate-600 hover:bg-slate-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-mono font-semibold">{quantity}</span>
                            <button
                              onClick={() => updatePosQty(product.id, quantity + 1)}
                              className="p-1 text-slate-600 hover:bg-slate-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="font-mono font-bold text-slate-900 w-24 text-right">
                            {formatVND(product.price * quantity)}
                          </div>

                          <button
                            onClick={() => updatePosQty(product.id, 0)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính tiền hàng:</span>
                    <span>{formatVND(pricing.subtotal)}</span>
                  </div>

                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>{pricing.strategyName}:</span>
                      <span>-{formatVND(pricing.discountAmount)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                    <span>Tổng thanh toán:</span>
                    <span className="text-blue-600">{formatVND(pricing.totalAmount)}</span>
                  </div>
                </div>

                {/* Payment Channel Pills */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Hình thức thanh toán
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg border font-medium transition ${
                        paymentMethod === 'bank_transfer'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>QR Bank</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg border font-medium transition ${
                        paymentMethod === 'card'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Thẻ / POS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg border font-medium transition ${
                        paymentMethod === 'cash'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Tiền mặt</span>
                    </button>
                  </div>
                </div>

                {/* Counter Notes */}
                <div>
                  <input
                    type="text"
                    placeholder="Ghi chú xuất hóa đơn VAT, mã bảo hành..."
                    value={counterNote}
                    onChange={(e) => setCounterNote(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleCheckoutPos(false)}
                    disabled={cartItems.length === 0}
                    className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 text-xs font-semibold rounded-lg transition border border-slate-200 flex items-center justify-center space-x-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Lưu đơn giữ hàng (Pending)</span>
                  </button>

                  <button
                    onClick={() => handleCheckoutPos(true)}
                    disabled={cartItems.length === 0}
                    className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Thu tiền & In hóa đơn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ORDER LIFECYCLE MANAGER ================= */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Quản lý vòng đời đơn hàng & Phê duyệt</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chuyển trạng thái đơn hàng tuân thủ quy tắc máy trạng thái (BR.05 & BR.07)
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
                {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-md font-semibold capitalize transition ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'Tất cả' : st}
                  </button>
                ))}
              </div>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{actionError}</span>
              </div>
            )}

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Mã đơn hàng</th>
                    <th className="py-3 px-4">Khách hàng</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Tổng tiền</th>
                    <th className="py-3 px-4">Thanh toán</th>
                    <th className="py-3 px-4 text-center">Thao tác chuyển bước</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Không có đơn hàng nào khớp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => {
                      const cust = customers.find((c) => c.id === o.customerId);
                      return (
                        <tr key={o.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {o.orderNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{cust?.name || 'Khách vãng lai'}</div>
                            <div className="text-[11px] font-mono text-slate-500">{cust?.phone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                o.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : o.status === 'confirmed'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : o.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {formatVND(o.totalAmount)}
                          </td>
                          <td className="py-3 px-4 font-mono uppercase text-[11px]">
                            {o.paymentMethod} •{' '}
                            <span className={o.paymentStatus === 'paid' ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              {o.status === 'pending' && (
                                <button
                                  onClick={() => handleTransition(o.id, 'confirmed')}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition"
                                >
                                  Duyệt xác nhận
                                </button>
                              )}

                              {o.status === 'confirmed' && (
                                <button
                                  onClick={() => handleTransition(o.id, 'completed')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition"
                                >
                                  Hoàn tất giao máy
                                </button>
                              )}

                              {(o.status === 'pending' || o.status === 'confirmed') && (
                                <button
                                  onClick={() => {
                                    setCancelReasonInput('');
                                    setCancellingOrderId(o.id);
                                  }}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-medium border border-rose-200 transition"
                                >
                                  Hủy
                                </button>
                              )}

                              {(o.status === 'completed' || o.status === 'cancelled') && (
                                <span className="text-slate-400 font-mono text-[11px] flex items-center justify-center">
                                  <Lock className="w-3 h-3 mr-1" /> Khóa
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {lastCompletedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl p-6 text-xs font-mono space-y-4 border border-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-sm text-slate-900 font-display">COMPUTERTECH RETAIL INVOICE</h4>
                <div className="text-[11px] text-slate-500">Mã đơn: {lastCompletedOrder.order.orderNumber}</div>
              </div>
              <button
                onClick={() => setLastCompletedOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-slate-600 space-y-1">
              <div>Khách hàng: <strong>{selectedCustomer.name}</strong></div>
              <div>Số điện thoại: {selectedCustomer.phone}</div>
              <div>Thời gian: {new Date(lastCompletedOrder.order.createdAt).toLocaleString()}</div>
              <div>Thu ngân: {currentUser.name}</div>
            </div>

            <div className="border-t border-b border-slate-200 py-2 divide-y divide-slate-100">
              {lastCompletedOrder.items.map((item) => (
                <div key={item.id} className="py-1.5 flex justify-between">
                  <div className="truncate max-w-[240px]">
                    {item.productName} × {item.quantity}
                  </div>
                  <div className="font-bold">{formatVND(item.subtotal)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right">
              <div>Tạm tính: {formatVND(lastCompletedOrder.order.subtotal)}</div>
              {lastCompletedOrder.order.discountAmount > 0 && (
                <div className="text-emerald-700">Chiết khấu: -{formatVND(lastCompletedOrder.order.discountAmount)}</div>
              )}
              <div className="text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                Tổng thanh toán: {formatVND(lastCompletedOrder.order.totalAmount)}
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In phiếu thu</span>
              </button>
              <button
                onClick={() => setLastCompletedOrder(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Cancel Order Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Xác nhận hủy đơn hàng</h3>
            <p className="text-xs text-slate-500">
              Vui lòng nhập lý do hủy đơn (tồn kho đã giữ sẽ được hoàn trả tự động).
            </p>
            <textarea
              rows={3}
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder="Ví dụ: Khách hàng đổi ý / hết hàng..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setCancellingOrderId(null);
                  setCancelReasonInput('');
                }}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-200 transition"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!cancelReasonInput.trim()}
                onClick={() => {
                  const id = cancellingOrderId;
                  const reason = cancelReasonInput.trim();
                  setCancellingOrderId(null);
                  setCancelReasonInput('');
                  handleTransition(id, 'cancelled', reason);
                }}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
