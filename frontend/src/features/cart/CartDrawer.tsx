// ==========================================
// CART & CHECKOUT TASK DRAWER
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  X,
  CreditCard,
  Banknote,
  Building,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderProcessingFacade } from '../../services/orderProcessingFacade';
import { PricingCalculator } from '../../strategies/pricing/pricingStrategy';
import { useApp } from '../../state/AppContext';
import { Customer, CustomerTier, PaymentMethod } from '../../types';
import { mockDb } from '../../services/mockDatabase';

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

  const navigate = useNavigate();

  // Selected customer for checkout
  const isGuest = currentUser.id === 'guest' || (!currentUser.customerId && currentUser.role === 'customer');

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    currentUser.role === 'customer' && currentUser.customerId
      ? currentUser.customerId
      : customers[0]?.id || ''
  );

  // Guest checkout form state
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAddress, setGuestAddress] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [orderNotes, setOrderNotes] = useState('');

  // Submission feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const selectedCustomer = !isGuest
    ? customers.find((c) => c.id === selectedCustomerId) || customers[0]
    : undefined;

  // Live pricing computation using Strategy Pattern
  const pricingInput = {
    items: cart.map((i) => ({ unitPrice: i.product.price, quantity: i.quantity })),
    customerTier: (selectedCustomer?.tier || 'standard') as CustomerTier,
  };
  const pricing = PricingCalculator.calculate(pricingInput);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleCheckout = () => {
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
        actor: currentUser,
      });

      if (!result.success) {
        setErrorMessage(result.errors?.[0] || 'Đặt hàng thất bại. Vui lòng kiểm tra lại tồn kho.');
      } else {
        setSuccessOrderNumber(result.order!.orderNumber);
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
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-white text-slate-900 flex items-center justify-between border-b border-slate-200">
            <div>
              <h2 className="font-display font-bold text-lg">Hardware Requisition Cart</h2>
              <p className="text-xs text-slate-500 font-mono">
                {cart.length} item(s) selected • Live inventory checked
              </p>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setSuccessOrderNumber(null);
                setErrorMessage(null);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {successOrderNumber ? (
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900">Order Placed Successfully!</h3>
              <p className="font-mono text-sm font-semibold text-blue-600 mt-2 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                {successOrderNumber}
              </p>
              <p className="text-sm text-slate-600 mt-3 max-w-xs leading-relaxed">
                Your order is registered under status <span className="font-semibold text-slate-800">PENDING</span>.
                Warehouse allocation has been initialized.
              </p>

              <div className="mt-8 flex flex-col w-full space-y-3">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setSuccessOrderNumber(null);
                    navigate('/store/tracking');
                  }}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center justify-center space-x-2"
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
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm rounded-lg transition"
                >
                  Tiếp tục mua hàng
                </button>
                {(currentUser.role === 'admin' || currentUser.role === 'sale') && (
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setSuccessOrderNumber(null);
                      navigate(currentUser.role === 'admin' ? '/admin/orders' : '/sales/orders');
                    }}
                    className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-900 text-slate-300 font-medium text-xs rounded-lg transition"
                  >
                    Mở quản lý đơn hàng POS
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                    <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No components in cart</p>
                    <p className="text-xs text-slate-400 mt-1">Browse catalog hardware to add items</p>
                  </div>
                ) : (
                  cart.map(({ product, quantity }) => {
                    const inv = inventory[product.id];
                    const available = inv ? Math.max(0, inv.quantityOnHand - inv.quantityReserved) : 0;
                    const isAtMax = quantity >= available;

                    return (
                      <div key={product.id} className="py-4 flex space-x-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{product.name}</h4>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
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
                                className="p-1 text-slate-600 hover:bg-slate-100"
                                title="Decrease"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 font-mono text-xs font-semibold">{quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(product.id, quantity + 1)}
                                disabled={isAtMax}
                                className={`p-1 text-slate-600 hover:bg-slate-100 ${
                                  isAtMax ? 'opacity-40 cursor-not-allowed' : ''
                                }`}
                                title="Increase"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-[11px] font-mono text-slate-500">
                              {available} available
                            </span>

                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Checkout Form & Financial Summary */}
              {cart.length > 0 && (
                <div className="bg-slate-50 p-6 border-t border-slate-200">
                  {errorMessage && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{errorMessage}</div>
                    </div>
                  )}

                  {/* Customer Information */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Thông tin người nhận hàng
                    </label>
                    {isGuest ? (
                      <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <span className="text-[11px] text-slate-500 font-medium">Khách mua trực tiếp</span>
                          <Link
                            to="/login"
                            onClick={() => setIsCartOpen(false)}
                            className="text-[11px] text-blue-600 font-semibold hover:underline"
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
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="tel"
                            placeholder="Số điện thoại *"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="email"
                            placeholder="Email (nhận mã đơn)"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Địa chỉ giao hàng nhận máy"
                            value={guestAddress}
                            onChange={(e) => setGuestAddress(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ) : currentUser.role === 'customer' ? (
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                        <div className="font-bold text-slate-900">{selectedCustomer?.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {selectedCustomer?.phone} • {selectedCustomer?.tier.toUpperCase()} Member (5% VIP Discount Applied)
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {selectedCustomer?.address}
                        </div>
                      </div>
                    ) : (
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.tier.toUpperCase()} Member) — {c.phone}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Payment Channel
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank_transfer')}
                        className={`flex items-center justify-center space-x-1.5 py-1.5 text-xs rounded-md border transition ${
                          paymentMethod === 'bank_transfer'
                            ? 'bg-blue-50 border-blue-500 text-blue-800 font-semibold'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5" />
                        <span>Bank (QR)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex items-center justify-center space-x-1.5 py-1.5 text-xs rounded-md border transition ${
                          paymentMethod === 'card'
                            ? 'bg-blue-50 border-blue-500 text-blue-800 font-semibold'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Card/POS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex items-center justify-center space-x-1.5 py-1.5 text-xs rounded-md border transition ${
                          paymentMethod === 'cash'
                            ? 'bg-blue-50 border-blue-500 text-blue-800 font-semibold'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Cash</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Order notes, VAT requirement, or delivery instructions..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Financial Breakdown (Strategy Pattern Result) */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs font-mono mb-4">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>{formatVND(pricing.subtotal)}</span>
                    </div>

                    {pricing.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>{pricing.strategyName}:</span>
                        <span>-{formatVND(pricing.discountAmount)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatVND(pricing.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center justify-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Processing Allocation...' : 'Submit Hardware Requisition'}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
