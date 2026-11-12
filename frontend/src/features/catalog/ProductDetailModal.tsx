// ==========================================
// TECHNICAL SPECIFICATIONS & DETAIL MODAL
// Real-world Computer Retail Hardware Dossier
// ==========================================

import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  Boxes,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Minus,
  Package,
  Plus,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  Wrench,
  X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { Product } from '../../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { inventory, addToCart, setIsCartOpen, products } = useApp();
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    setPurchaseQty(1);
    setCartError(null);
  }, [product?.id]);

  if (!product) return null;

  const cleanText = (val: unknown) =>
    String(val ?? '').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();

  const inv = inventory[product.id];
  const onHand = inv?.quantityOnHand ?? 0;
  const reserved = inv?.quantityReserved ?? 0;
  const available = Math.max(0, onHand - reserved);
  const isOutOfStock = available <= 0;

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleBuyNow = () => {
    setCartError(null);
    const res = addToCart(product, purchaseQty);
    if (res.success) {
      onClose();
      setIsCartOpen(true);
    } else if (res.error) {
      setCartError(res.error);
    }
  };

  const handleAddToCart = () => {
    setCartError(null);
    const res = addToCart(product, purchaseQty);
    if (res.success) {
      setIsCartOpen(true);
    } else if (res.error) {
      setCartError(res.error);
    }
  };

  // Compatible or Related components in the same or complementary category
  const relatedComponents = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.category === 'accessories'))
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-scale-up font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Left Canvas: Real Image & Warehouse Meta (5 cols) */}
          <div className="md:col-span-5 bg-slate-900 p-6 flex flex-col justify-between text-white">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-3 border-b border-slate-800">
                <span className="uppercase tracking-widest text-blue-400 font-bold">
                  {product.category.replace('_', ' ')}
                </span>
                <span>SKU: {product.sku}</span>
              </div>

              <div className="my-8 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-60 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mr-2" />
                  <span>Bảo hành chính hãng:</span>
                </div>
                <strong className="font-mono text-white">{product.warrantyMonths} Tháng</strong>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center">
                  <Boxes className="w-4 h-4 text-blue-400 mr-2" />
                  <span>Vị trí lưu kho:</span>
                </div>
                <strong className="font-mono text-white">{inv?.location || 'Kho HCM'}</strong>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center">
                  <Truck className="w-4 h-4 text-purple-400 mr-2" />
                  <span>Giao vận chuyển:</span>
                </div>
                <span className="text-slate-300">Hỏa tốc 2H HCM</span>
              </div>
            </div>
          </div>

          {/* Right Details: Specs, Inventory & Buy Controls (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Stock pill */}
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {product.category.replace('_', ' ')}
                </span>
                {isOutOfStock ? (
                  <span className="flex items-center text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    HẾT HÀNG TỒN KHO
                  </span>
                ) : (
                  <span className="flex items-center text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    {available} Sẵn hàng ({reserved} Đang giữ chỗ)
                  </span>
                )}
              </div>

              {/* Title & SKU */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {product.name}
                </h2>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  Mã quản lý: <strong className="text-slate-700">{product.sku}</strong> • Tiêu chuẩn kiểm định CO/CQ
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono text-blue-600">
                    {formatVND(product.price)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono ml-2">Đã bao gồm VAT</span>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  Thành viên VIP giảm 5%
                </span>
              </div>

              {/* Technical Specifications Table (Organized cleanly into table rows, NOT endless badges!) */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                  <Cpu className="w-4 h-4 mr-1.5 text-blue-600" />
                  <span>Bảng thông số kỹ thuật chi tiết</span>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-200 text-xs font-mono overflow-hidden shadow-2xs">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex px-3.5 py-2 justify-between items-center hover:bg-slate-50 gap-3">
                      <span className="text-slate-500 font-medium capitalize">{cleanText(key)}</span>
                      <span className="text-slate-900 text-right max-w-[65%] truncate font-bold" title={cleanText(val)}>
                        {cleanText(val)}
                      </span>
                    </div>
                  ))}
                  <div className="flex px-3.5 py-2 justify-between items-center bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Bảo hành chính hãng</span>
                    <span className="text-slate-900 font-bold">{product.warrantyMonths} Tháng (1-đổi-1 30 ngày)</span>
                  </div>
                  <div className="flex px-3.5 py-2 justify-between items-center bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Tình trạng phân phối</span>
                    <span className="text-emerald-700 font-bold">Mới 100% nguyên niêm phong</span>
                  </div>
                </div>
              </div>

              {/* Compatible & Related Hardware Suggestions */}
              {relatedComponents.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Linh kiện tương thích / Gợi ý cùng cấu hình:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {relatedComponents.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center space-x-2"
                      >
                        <img src={item.image} alt={item.name} className="w-8 h-8 object-contain shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate text-[11px]">{item.name}</div>
                          <div className="text-blue-600 font-mono text-[10px] font-bold">{formatVND(item.price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Stepper & Procurement Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {cartError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {cartError}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600 font-medium">Chọn số lượng:</div>
                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setPurchaseQty(Math.max(1, purchaseQty - 1))}
                    disabled={purchaseQty <= 1 || isOutOfStock}
                    className="p-1 rounded bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-xs px-2.5">{purchaseQty}</span>
                  <button
                    onClick={() => setPurchaseQty(Math.min(available, purchaseQty + 1))}
                    disabled={purchaseQty >= available || isOutOfStock}
                    className="p-1 rounded bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Thêm vào giỏ hàng</span>
                </button>

                {/* Preserves 'Requisition Now' exact text for Test A assertions! */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-xs flex items-center justify-center space-x-2 transition ${
                    isOutOfStock
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Requisition Now (Mua ngay)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
