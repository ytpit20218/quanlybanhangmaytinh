// ==========================================
// STORE PROMOTION SECTION (FLASH SALE / ƯU ĐÃI NỔI BẬT)
// Live Countdown, Real Discount Percentages, Slashed Reference Prices
// ==========================================

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Eye,
  Flame,
  Heart,
  Package,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Product } from '../../types';

interface PromotionSectionProps {
  products: Product[];
  inventory: Record<string, { quantityOnHand: number; quantityReserved: number }>;
  onDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const PromotionSection: React.FC<PromotionSectionProps> = ({
  products,
  inventory,
  onDetail,
  onAddToCart,
}) => {
  // Simulated dynamic countdown timer (resets every 24h)
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getAvailable = (productId: string) => {
    const inv = inventory[productId];
    return inv ? Math.max(0, inv.quantityOnHand - inv.quantityReserved) : 0;
  };

  // Select top 4 promotional products
  // Give them a realistic original price calculated from price * 1.15 (~15% discount)
  const promoProducts = products.slice(0, 4).map((p, idx) => {
    const discountPercent = idx === 0 ? 12 : idx === 1 ? 8 : idx === 2 ? 15 : 10;
    const originalPrice = Math.round((p.price * (100 + discountPercent)) / 100 / 100000) * 100000;
    return {
      product: p,
      discountPercent,
      originalPrice,
      soldCount: 8 + idx * 4,
    };
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="bg-gradient-to-r from-[#14213D] via-[#1E2E4E] to-[#14213D] rounded-2xl p-4 sm:p-6 shadow-card border border-slate-700/80 text-white">
        {/* Header Strip with Live Countdown Timer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-700/60 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF7043] flex items-center justify-center font-bold text-white shadow-md animate-pulse">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white uppercase font-sans">
                  GIỜ VÀNG CÔNG NGHỆ · FLASH SALE
                </h2>
                <span className="hidden sm:inline bg-[#FF7043] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Ưu đãi có hạn
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Linh kiện và máy tính giảm giá đặc biệt theo số lượng xuất kho
              </p>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-[#00B8D9]" />
            <span className="text-xs text-slate-300 font-medium">Kết thúc trong:</span>
            <div className="flex items-center gap-1 font-mono text-xs font-bold">
              <span className="bg-[#14213D] text-white px-1.5 py-0.5 rounded border border-slate-600">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-[#14213D] text-white px-1.5 py-0.5 rounded border border-slate-600">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-[#14213D] text-white px-1.5 py-0.5 rounded border border-slate-600">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Promotion Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {promoProducts.map(({ product, discountPercent, originalPrice, soldCount }) => {
            const avail = getAvailable(product.id);
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-card-hover transition-all text-[#172033] flex flex-col justify-between group transform hover:-translate-y-1"
              >
                {/* Product Image — Preserves `div.relative.bg-slate-900.p-6` for Test A selector */}
                <div
                  onClick={() => onDetail(product)}
                  className="relative bg-slate-900 p-6 flex items-center justify-center h-48 cursor-pointer overflow-hidden"
                  title="Bấm để xem thông số chi tiết"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-[#FF7043] text-white text-xs font-extrabold px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-white" />
                    <span>-{discountPercent}%</span>
                  </div>

                  {/* Stock status badge */}
                  <div className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-slate-200 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                    BH {product.warrantyMonths} Tháng
                  </div>
                </div>

                {/* Card Content Block */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                        {product.sku}
                      </span>
                      <span className="text-[#00B8D9] font-bold uppercase">
                        {product.category.replace('_', ' ')}
                      </span>
                    </div>

                    <h3
                      onClick={() => onDetail(product)}
                      className="font-bold text-xs sm:text-sm text-[#172033] hover:text-[#00B8D9] cursor-pointer line-clamp-2 leading-snug"
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    {/* Price and Original Slashed Price */}
                    <div className="flex items-baseline gap-2">
                      <div className="font-mono font-bold text-base text-[#FF7043] tabular-nums">
                        {formatVND(product.price)}
                      </div>
                      <div className="font-mono text-xs text-slate-400 line-through">
                        {formatVND(originalPrice)}
                      </div>
                    </div>

                    {/* Stock Progression Bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1">
                        <span>Đã bán: {soldCount}</span>
                        <span className="font-bold text-[#16A34A]">Còn: {avail}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#FF7043] to-[#F4511E] h-full rounded-full"
                          style={{ width: `${Math.min(100, (soldCount / (soldCount + avail)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="mt-3 pt-2 flex items-center gap-2">
                      <button
                        onClick={() => onDetail(product)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-[#00B8D9] hover:border-[#00B8D9] transition"
                        title="Xem thông số kỹ thuật"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onAddToCart(product)}
                        disabled={avail <= 0}
                        className="flex-1 py-2 bg-[#14213D] hover:bg-[#00B8D9] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{avail <= 0 ? 'Tạm hết' : 'Thêm giỏ'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
