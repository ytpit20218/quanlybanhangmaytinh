// ==========================================
// STORE PRODUCT SECTION COMPONENT
// Standalone departmental product showcase with filter tabs
// ==========================================

import React, { useState } from 'react';
import { cleanHtmlText } from '../../domain/textSanitizer';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Cpu,
  Eye,
  Heart,
  Laptop,
  Monitor,
  Package,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Product } from '../../types';

interface ProductSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  categoryTag: string;
  products: Product[];
  inventory: Record<string, { quantityOnHand: number; quantityReserved: number }>;
  onDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewAll?: () => void;
  accentColor?: string;
  maxDisplay?: number;
  totalCount?: number;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  icon,
  categoryTag,
  products,
  inventory,
  onDetail,
  onAddToCart,
  onViewAll,
  accentColor = '#00B8D9',
  maxDisplay,
  totalCount,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'flagship' | 'best_value'>('all');

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getAvailable = (productId: string) => {
    const inv = inventory[productId];
    return inv ? Math.max(0, inv.quantityOnHand - inv.quantityReserved) : 0;
  };

  // Filter based on active tab
  let displayProducts = [...products];
  if (activeTab === 'flagship') {
    displayProducts = displayProducts.sort((a, b) => b.price - a.price);
  } else if (activeTab === 'best_value') {
    displayProducts = displayProducts.sort((a, b) => a.price - b.price);
  }

  if (displayProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold shadow-xs"
            style={{ color: accentColor }}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-[#172033] tracking-tight">
                {title}
              </h2>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {totalCount ? `Nổi bật (${Math.min(displayProducts.length, maxDisplay || displayProducts.length)}/${totalCount})` : `${products.length} sản phẩm`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Filter Tabs & "Xem tất cả" Link */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                activeTab === 'all'
                  ? 'bg-white text-[#172033] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab('flagship')}
              className={`px-2.5 py-1 rounded-md transition ${
                activeTab === 'flagship'
                  ? 'bg-white text-[#172033] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cao cấp
            </button>
            <button
              onClick={() => setActiveTab('best_value')}
              className={`px-2.5 py-1 rounded-md transition ${
                activeTab === 'best_value'
                  ? 'bg-white text-[#172033] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Giá tốt
            </button>
          </div>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-[#00B8D9] hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(maxDisplay ? displayProducts.slice(0, maxDisplay) : displayProducts).map((product) => {
          const avail = getAvailable(product.id);
          const topSpecEntries = Object.entries(product.specs)
            .map(([k, val]) => [cleanHtmlText(k), cleanHtmlText(val)] as const)
            .filter(([_, clean]) => clean.length > 0)
            .slice(0, 3);

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden group transform hover:-translate-y-1"
            >
              {/* Product Thumbnail Container — Preserves `div.relative.bg-slate-900.p-6` for Test A */}
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

                {/* SKU Badge */}
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 font-bold">
                  {product.sku}
                </div>

                {/* Warranty Badge */}
                <div className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                  BH {product.warrantyMonths}T
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  {/* Stock status pill */}
                  <div className="flex items-center justify-between mb-1.5">
                    {avail <= 0 ? (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        Hết hàng
                      </span>
                    ) : avail <= product.minStockAlert ? (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Sắp hết · còn {avail}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Sẵn kho HCM · {avail} cái
                      </span>
                    )}
                  </div>

                  {/* Product Name */}
                  <h3
                    onClick={() => onDetail(product)}
                    className="font-bold text-xs sm:text-sm text-[#172033] hover:text-[#00B8D9] cursor-pointer line-clamp-2 leading-snug"
                  >
                    {product.name}
                  </h3>

                  {/* Compact Spec Snippets */}
                  {topSpecEntries.length > 0 && (
                    <div className="mt-2.5 space-y-1 text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {topSpecEntries.map(([k, v]) => (
                        <div key={k} className="flex justify-between truncate">
                          <span className="text-slate-400 shrink-0 mr-1">{k}:</span>
                          <span className="text-[#172033] font-medium truncate">
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price & Action */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono">Giá niêm yết</div>
                    <div className="font-mono font-bold text-base text-[#14213D] tabular-nums">
                      {formatVND(product.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDetail(product)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-[#00B8D9] hover:border-[#00B8D9] transition"
                      title="Xem cấu hình đầy đủ"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={avail <= 0}
                      className="px-3 py-2 bg-[#14213D] hover:bg-[#00B8D9] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{avail <= 0 ? 'Hết hàng' : '+ Giỏ'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Bottom View All CTA */}
      {totalCount && totalCount > (maxDisplay || 8) && onViewAll && (
        <div className="mt-5 text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#00B8D9] hover:border-[#00B8D9] text-xs font-bold transition shadow-xs"
          >
            <span>Xem tất cả {totalCount} sản phẩm {title}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};
