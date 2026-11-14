// ==========================================
// CART & CHECKOUT TASK DRAWER
// ==========================================

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  X,
  Banknote,
  Building,
  Truck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderProcessingFacade } from '../../services/orderProcessingFacade';
import { PricingCalculator } from '../../strategies/pricing/pricingStrategy';
import { useApp } from '../../state/AppContext';
import { useAuth } from '../../state/AuthContext';
import { Customer, CustomerTier, PaymentMethod } from '../../types';
import { mockDb } from '../../services/mockDatabase';
import { BankTransferQrCard } from '../../components/payment/BankTransferQrCard';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    customers,
    inventory,
    currentUser,
    refreshData,
  } = useApp();

  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  // Determine if active user is authenticated
  const activeUser = authUser || (currentUser && currentUser.id !== 'guest' ? currentUser : null);
  const isAuthenticated = !!activeUser;
  const isGuest = !isAuthenticated;

  // Match or resolve customer profile for checkout
  const matchedCustomer: Customer | undefined = activeUser
    ? customers.find(
        (c) =>
          (activeUser.customerId && c.id === activeUser.customerId) ||
          (c.email && activeUser.email && c.email.toLowerCase() === activeUser.email.toLowerCase()) ||
          (activeUser.phone && c.phone && c.phone.replace(/\D/g, '') === activeUser.phone.replace(/\D/g, ''))
      ) || {
        id: activeUser.customerId || `cust_${activeUser.id}`,
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone || '0901-234-567',
        address: '45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        tier: (activeUser.role === 'customer' ? 'standard' : 'vip') as CustomerTier,
        createdAt: new Date().toISOString(),
      }
    : undefined;

  // Guest checkout form state
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAddress, setGuestAddress] = useState('');

  // Logged-in user shipping address override
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    if (matchedCustomer?.address && !deliveryAddress) {
      setDeliveryAddress(matchedCustomer.address);
    }
  }, [matchedCustomer?.address]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [orderNotes, setOrderNotes] = useState('');

  // Submission feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<{
    orderNumber: string;
    totalAmount: number;
    method: PaymentMethod;
  } | null>(null);

  if (!isCartOpen) return null;

  const selectedCustomer = !isGuest ? matchedCustomer : undefined;

  // Live pricing computation using Strategy Pattern
  const pricingInput = {
    items: cart.map((i) => ({ unitPrice: i.product.price, quantity: i.quantity })),
    customerTier: (selectedCustomer?.tier || 'standard') as CustomerTier,
  };
  const pricing = PricingCalculator.calculate(pricingInput);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleCheckout = async () => {
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage('Giỏ hàng trống. Vui lòng thêm ít nhất một sản phẩm.');
      return;
    }

    let customerToUse = selectedCustomer;

    // If guest, create or locate guest customer
    if (isGuest) {
      if (!guestName.trim()) {
        setErrorMessage('Vui lòng nhập Họ và tên người nhận hàng.');
        return;
      }
      if (!guestPhone.trim() || guestPhone.trim().length < 8) {
        setErrorMessage('Vui lòng nhập Số điện thoại hợp lệ để giao hàng.');
        return;
      }
      if (guestEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
        setErrorMessage('Địa chỉ email nhận mã đơn không hợp lệ.');
        return;
      }

      // Check if phone or email already in CRM
      let existingCustomer = customers.find(
        (c) => c.phone === guestPhone.trim() || (guestEmail && c.email.toLowerCase() === guestEmail.trim().toLowerCase())
      );

      if (!existingCustomer) {
        existingCustomer = {
          id: `cust_guest_${Date.now()}`,
          name: guestName.trim(),
          phone: guestPhone.trim(),
          email: guestEmail.trim() || `guest_${Date.now()}@customer.vn`,
          address: guestAddress.trim() || 'Nhận trực tiếp tại showroom Hồ Chí Minh',
          tier: 'standard',
          createdAt: new Date().toISOString(),
        };
        mockDb.addCustomer(existingCustomer);
        refreshData();
      }
      customerToUse = existingCustomer;
    } else if (customerToUse) {
      // If delivery address was specified/edited, apply it
      if (deliveryAddress.trim()) {
        customerToUse = { ...customerToUse, address: deliveryAddress.trim() };
      }
    }

    if (!customerToUse) {
      setErrorMessage('Không thể xác thực thông tin khách hàng hợp lệ.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = OrderProcessingFacade.placeOrder({
        customer: customerToUse,
        items: cart,
        paymentMethod,
        notes: orderNotes.trim() ? `[STOREFRONT] ${orderNotes.trim()}` : '[STOREFRONT] Direct online order',
        actor: activeUser || currentUser,
      });

      if (!result.success) {
        setErrorMessage(result.errors?.[0] || 'Đặt hàng thất bại. Vui lòng kiểm tra lại tồn kho.');
      } else {
        const ord = result.order!;
        setSuccessOrderNumber(ord.orderNumber);
        setPlacedOrderInfo({
          orderNumber: ord.orderNumber,
          totalAmount: ord.totalAmount,
          method: paymentMethod,
        });
        clearCart();
        refreshData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi hệ thống trong quá trình phân bổ đơn hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-4 bg-white text-slate-900 flex items-center justify-between border-b border-slate-200 shrink-0">
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Giỏ Hàng Linh Kiện (Hardware Requisition Cart)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-mono">
                {cart.length} sản phẩm đã chọn • Kiểm tra tồn kho thời gian thực
              </p>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setSuccessOrderNumber(null);
                setErrorMessage(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {successOrderNumber ? (
            <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mb-3 shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                Đặt hàng thành công! (Order Placed Successfully)
              </h3>
              <p className="font-mono text-sm font-bold text-blue-600 mt-1 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                Mã đơn: {successOrderNumber}
              </p>
              <p className="text-xs text-slate-600 mt-2 max-w-xs leading-relaxed">
                Đơn hàng của bạn đã được ghi nhận ở trạng thái <span className="font-semibold text-slate-800">CHỜ DUYỆT (PENDING)</span>.
                Kho tổng đang chuẩn bị giữ chỗ linh kiện cho bạn.
              </p>

              {placedOrderInfo?.method === 'bank_transfer' && (
                <div className="w-full mt-4 text-left">
                  <BankTransferQrCard
                    orderNumber={placedOrderInfo.orderNumber}
                    amount={placedOrderInfo.totalAmount}
                    customerName={isGuest ? guestName : selectedCustomer?.name}
                    compact={true}
                  />
                </div>
              )}

              <div className="mt-6 flex flex-col w-full space-y-2.5">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setSuccessOrderNumber(null);
                    navigate('/store/tracking');
                  }}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Tra cứu tiến trình đơn hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setSuccessOrderNumber(null);
                    navigate('/store');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs sm:text-sm rounded-lg transition cursor-pointer"
                >
                  Tiếp tục mua hàng
                </button>
                {activeUser && (activeUser.role === 'admin' || activeUser.role === 'sale') && (
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setSuccessOrderNumber(null);
                      navigate(activeUser.role === 'admin' ? '/admin/orders' : '/sales/orders');
                    }}
                    className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-900 text-slate-300 font-medium text-xs rounded-lg transition cursor-pointer"
                  >
                    Mở quản lý đơn hàng POS
                  </button>
                )}
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Giỏ hàng của bạn đang trống</p>
              <p className="text-xs text-slate-400 mt-1">Khám phá các sản phẩm và linh kiện để thêm vào giỏ</p>
            </div>
          ) : (
            <>
              {/* Scrollable Body: Cart Items + Checkout Form */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {/* Cart Items List */}
                <div className="px-5 py-4 divide-y divide-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Linh kiện đã chọn ({cart.length})
                  </div>
                  {cart.map(({ product, quantity }) => {
                    const inv = inventory[product.id];
                    const available = inv ? Math.max(0, inv.quantityOnHand - inv.quantityReserved) : 0;
                    const isAtMax = quantity >= available;

                    return (
                      <div key={product.id} className="py-3 flex space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{product.name}</h4>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            SKU: {product.sku}
                          </div>
                          <div className="font-mono text-xs font-bold text-blue-600 mt-1">
                            {formatVND(product.price)}
                          </div>

                          {/* Quantity and stock constraint indicator */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-slate-200 rounded-md">
                              <button
                                onClick={() => updateCartQuantity(product.id, quantity - 1)}
                                className="p-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
                                title="Giảm"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 font-mono text-xs font-semibold">{quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(product.id, quantity + 1)}
                                disabled={isAtMax}
                                className={`p-1 text-slate-600 hover:bg-slate-100 cursor-pointer ${
                                  isAtMax ? 'opacity-40 cursor-not-allowed' : ''
                                }`}
                                title="Tăng"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-[10px] font-mono text-slate-500">
                              Còn {available}
                            </span>

                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Checkout Form */}
                <div className="bg-slate-50 p-5 border-t border-slate-200 space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{errorMessage}</div>
                    </div>
                  )}

                  {/* Customer Information */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Thông tin người nhận hàng
                    </label>

                    {isGuest ? (
                      /* Guest Form */
                      <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="text-[11px] text-slate-500 font-medium">Khách mua trực tiếp (Chưa đăng nhập)</span>
                          <Link
                            to="/login"
                            onClick={() => setIsCartOpen(false)}
                            className="text-[11px] text-blue-600 font-bold hover:underline"
                          >
                            Đăng nhập để nhận VIP 5%
                          </Link>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Họ và tên người nhận *"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="tel"
                            placeholder="Số điện thoại *"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                          <input
                            type="email"
                            placeholder="Email (nhận mã đơn)"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Địa chỉ nhận linh kiện *"
                            value={guestAddress}
                            onChange={(e) => setGuestAddress(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Authenticated User Profile Card */
                      <div className="bg-white p-3.5 rounded-xl border border-blue-200/90 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center space-x-2">
                            <img
                              src={activeUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt={activeUser.name}
                              className="w-7 h-7 rounded-full object-cover border border-blue-400"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{activeUser.name}</span>
                                {matchedCustomer?.tier === 'vip' ? (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    VIP 5%
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                    Thành viên
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-emerald-600 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã đăng nhập</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-400 block text-[10px]">Số điện thoại:</span>
                            <span className="font-mono font-bold text-slate-800">
                              {matchedCustomer?.phone || activeUser.phone || 'Chưa cập nhật'}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-400 block text-[10px]">Email:</span>
                            <span className="font-medium text-slate-800 truncate block">
                              {activeUser.email}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 font-medium block mb-1">
                            Địa chỉ giao hàng nhận máy:
                          </label>
                          <input
                            type="text"
                            placeholder="Nhập địa chỉ nhận hàng..."
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phương thức thanh toán
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank_transfer')}
                        className={`flex flex-col items-center justify-center p-2 text-center rounded-xl border transition cursor-pointer ${
                          paymentMethod === 'bank_transfer'
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <Building className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[11px]">Chuyển khoản</span>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-0.5">Qua ngân hàng</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`flex flex-col items-center justify-center p-2 text-center rounded-xl border transition cursor-pointer ${
                          paymentMethod === 'cod'
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <Truck className="w-3.5 h-3.5 text-slate-700" />
                          <span className="text-[11px]">COD</span>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-0.5">Khi nhận hàng</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex flex-col items-center justify-center p-2 text-center rounded-xl border transition cursor-pointer ${
                          paymentMethod === 'cash'
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <Banknote className="w-3.5 h-3.5 text-slate-700" />
                          <span className="text-[11px]">Tiền mặt</span>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-0.5">Tại Showroom</span>
                      </button>
                    </div>

                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-3">
                        <BankTransferQrCard
                          amount={pricing.totalAmount}
                          customerName={isGuest ? guestName : selectedCustomer?.name}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Ghi chú đơn hàng
                    </label>
                    <input
                      type="text"
                      placeholder="Ghi chú thêm, yêu cầu xuất VAT hoặc hướng dẫn giao hàng..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* Financial Breakdown (Strategy Pattern Result) */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs font-mono shadow-2xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Tạm tính ({cart.length} món):</span>
                      <span>{formatVND(pricing.subtotal)}</span>
                    </div>

                    {pricing.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>{pricing.strategyName}:</span>
                        <span>-{formatVND(pricing.discountAmount)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                      <span>Tổng chi phí:</span>
                      <span className="text-blue-600">{formatVND(pricing.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Drawer Footer */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Tổng thanh toán:</span>
                    {pricing.discountAmount > 0 && (
                      <span className="ml-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Đã giảm {formatVND(pricing.discountAmount)}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-base font-bold text-blue-600">
                    {formatVND(pricing.totalAmount)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang phân bổ linh kiện...' : 'Xác nhận đặt hàng ngay (Submit Hardware Requisition)'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
