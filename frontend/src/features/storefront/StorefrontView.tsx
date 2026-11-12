// ==========================================
// STOREFRONT VIEW — MODERN RETAIL E-COMMERCE
// Brand Identity: COMPUTERTECH
// Colors: Primary Navy (#14213D), Secondary Cyan (#00B8D9), Accent Coral (#FF7043)
// ==========================================

import React, { useEffect, useState } from 'react';
import { cleanHtmlText } from '../../domain/textSanitizer';
import {
  ChevronRight,
  Cpu,
  Filter,
  Gamepad2,
  Grid3X3,
  HardDrive,
  Laptop,
  LayoutList,
  Monitor,
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { Product, ProductCategory } from '../../types';
import { ProductDetailModal } from '../catalog/ProductDetailModal';
import { HeroBanner } from '../../components/store/HeroBanner';
import { CategoryShowcase } from '../../components/store/CategoryShowcase';
import { BenefitStrip } from '../../components/store/BenefitStrip';
import { PromotionSection } from '../../components/store/PromotionSection';
import { ProductSection } from '../../components/store/ProductSection';
import { MidPagePromoBanner } from '../../components/store/MidPagePromoBanner';
import { M3Chip } from '../../components/m3/M3Chip';
import { M3Button } from '../../components/m3/M3Button';

export const StorefrontView: React.FC = () => {
  const {
    products,
    inventory,
    addToCart,
    setIsCartOpen,
    selectedProductForDetail,
    setSelectedProductForDetail,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const urlSearch = searchParams.get('search') || searchParams.get('q') || '';
  const urlCategory = (searchParams.get('category') as ProductCategory) || 'all';
  const urlSub = searchParams.get('sub') || 'all';

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(urlCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(urlSub);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'name'>('default');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const COMPONENT_SUBCATEGORIES = [
    { id: 'all', label: 'Tất cả Linh Kiện' },
    { id: 'mainboard', label: 'Mainboard (Bo mạch)' },
    { id: 'cpu', label: 'CPU (Vi xử lý)' },
    { id: 'ram', label: 'RAM (Bộ nhớ)' },
    { id: 'vga', label: 'VGA (Card đồ họa)' },
    { id: 'ssd_hdd', label: 'Ổ cứng SSD/HDD' },
    { id: 'psu', label: 'Nguồn PSU' },
    { id: 'case', label: 'Vỏ Case' },
    { id: 'cooling', label: 'Tản nhiệt' },
  ];

  const GEAR_SUBCATEGORIES = [
    { id: 'all', label: 'Tất cả Gaming Gear' },
    { id: 'keyboards', label: 'Bàn phím cơ' },
    { id: 'mice', label: 'Chuột Gaming' },
    { id: 'headsets', label: 'Tai nghe & Audio' },
    { id: 'gaming-chairs', label: 'Ghế Gaming' },
    { id: 'gaming-gear', label: 'Combo & Gear khác' },
  ];

  const PC_SUBCATEGORIES = [
    { id: 'all', label: 'Tất cả PC' },
    { id: 'pc-gaming', label: 'PC Gaming' },
    { id: 'pc-dong-bo', label: 'PC Đồng bộ' },
    { id: 'pc-van-phong', label: 'PC Văn phòng' },
  ];

  useEffect(() => {
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    if (urlSub !== selectedSubCategory) setSelectedSubCategory(urlSub);
  }, [urlSub]);

  useEffect(() => {
    if (location.hash === '#section-promo') {
      const timer = setTimeout(() => {
        document.getElementById('section-promo')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.search]);

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getAvailable = (productId: string) => {
    const inv = inventory[productId];
    return inv ? Math.max(0, inv.quantityOnHand - inv.quantityReserved) : 0;
  };

  const handleAddToCart = (product: Product) => {
    const res = addToCart(product, 1);
    if (res.success) {
      setIsCartOpen(true);
    }
  };

  // Filter products when search or category is active
  let filtered = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedSubCategory !== 'all' && p.subCategory !== selectedSubCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.sku.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q) &&
        !(p.subCategory && p.subCategory.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    const avail = getAvailable(p.id);
    if (inStockOnly && avail <= 0) return false;
    return true;
  });

  if (sortBy === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  const isFiltering = searchQuery.trim() !== '' || selectedCategory !== 'all' || inStockOnly || selectedSubCategory !== 'all';

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat as any);
    setSelectedSubCategory('all');
    const nextParams = new URLSearchParams(searchParams);
    if (cat === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    nextParams.delete('sub');
    setSearchParams(nextParams);
    if (cat !== 'all') {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const handleSubCategoryClick = (sub: string) => {
    setSelectedSubCategory(sub);
    const nextParams = new URLSearchParams(searchParams);
    if (sub === 'all') {
      nextParams.delete('sub');
    } else {
      nextParams.set('sub', sub);
    }
    setSearchParams(nextParams);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('search');
    nextParams.delete('q');
    setSearchParams(nextParams);
  };

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSubCategory('all');
    setSearchQuery('');
    setInStockOnly(false);
    setSortBy('default');
    setSearchParams({});
  };

  // Categorized product groups for showcase sections
  const pcGamingProducts = products.filter((p) => p.category === 'pc_gaming');
  const componentProducts = products.filter((p) => p.category === 'pc_parts');
  const laptopProducts = products.filter((p) => p.category === 'laptops');
  const displayProducts = products.filter((p) => p.category === 'displays');
  const gearAndAccessoryProducts = products.filter(
    (p) => p.category === 'gaming_gear' || p.category === 'accessories'
  );

  // Curated featured/standout items for homepage (uncluttered, fast showcase)
  const featuredPcGaming = pcGamingProducts.slice(0, 4);
  const featuredComponents = componentProducts
    .filter((p) => ['cpu', 'vga', 'mainboard', 'ram', 'ssd_hdd'].includes(p.subCategory || ''))
    .slice(0, 8);
  const featuredLaptops = laptopProducts.slice(0, 4);
  const featuredDisplays = displayProducts.slice(0, 4);
  const featuredGear = gearAndAccessoryProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-16">
      {/* ── CONDITIONAL VIEW RENDERING: ───────────────────────────────── */}
      {/* If actively searching or filtering by a specific category, render the filtered catalog */}
      {isFiltering ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Active Filter Chips & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Bộ lọc:</span>
              {selectedCategory !== 'all' && (
                <M3Chip selected onRemove={() => handleCategoryClick('all')}>
                  Danh mục: {selectedCategory === 'pc_gaming' ? 'PC Gaming' : selectedCategory === 'pc_parts' ? 'Linh kiện PC' : selectedCategory.replace('_', ' ')}
                </M3Chip>
              )}
              {selectedSubCategory !== 'all' && (
                <M3Chip selected onRemove={() => handleSubCategoryClick('all')}>
                  Linh kiện: {COMPONENT_SUBCATEGORIES.find(s => s.id === selectedSubCategory)?.label || selectedSubCategory}
                </M3Chip>
              )}
              {searchQuery.trim() && (
                <M3Chip selected onRemove={handleClearSearch}>
                  Từ khóa: "{searchQuery}"
                </M3Chip>
              )}
              {inStockOnly && (
                <M3Chip selected onRemove={() => setInStockOnly(false)}>
                  Sẵn kho HCM
                </M3Chip>
              )}
              <button
                onClick={resetAllFilters}
                className="text-xs text-blue-600 hover:underline font-semibold ml-2"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-600">
                Tìm thấy <strong className="font-mono text-[#14213D]">{filtered.length}</strong> thiết bị
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-[#00B8D9]"
              >
                <option value="default">Sắp xếp: Mặc định</option>
                <option value="price_asc">Giá: Thấp → Cao</option>
                <option value="price_desc">Giá: Cao → Thấp</option>
                <option value="name">Tên sản phẩm (A-Z)</option>
              </select>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded transition ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#14213D] font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Dạng lưới thẻ"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded transition ${
                    viewMode === 'list'
                      ? 'bg-white text-[#14213D] font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Dạng danh sách thông số"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Subcategories for Linh Kiện Máy Tính */}
          {selectedCategory === 'pc_parts' && (
            <div className="mb-5 p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-1">
                <Cpu className="w-4 h-4 text-[#00B8D9]" /> Phân loại linh kiện:
              </span>
              {COMPONENT_SUBCATEGORIES.map((sub) => {
                const active = selectedSubCategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubCategoryClick(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      active
                        ? 'bg-[#00B8D9] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Subcategories for Gaming Gear */}
          {selectedCategory === 'gaming_gear' && (
            <div className="mb-5 p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-1">
                <Zap className="w-4 h-4 text-amber-500" /> Phân loại Gaming Gear:
              </span>
              {GEAR_SUBCATEGORIES.map((sub) => {
                const active = selectedSubCategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubCategoryClick(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      active
                        ? 'bg-[#00B8D9] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Banner & Subcategories for PC Gaming */}
          {selectedCategory === 'pc_gaming' && (
            <div className="space-y-3 mb-5">
              <div className="p-4 bg-gradient-to-r from-violet-900 to-indigo-900 text-white rounded-xl border border-violet-700/50 shadow-sm flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-600/40 flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-6 h-6 text-violet-300" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-white">Dàn PC Gaming & Cấu Hình Máy Trạm Đồ Họa</h2>
                    <p className="text-xs text-violet-200">Cấu hình hoàn thiện, kiểm thử tải 24H Full-load, bảo hành trọn bộ tại chỗ</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-violet-800/80 px-3 py-1 rounded-full border border-violet-500/40">
                  {filtered.length} Cấu hình sẵn hàng
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-2">
                {PC_SUBCATEGORIES.map((sub) => {
                  const active = selectedSubCategory === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategoryClick(sub.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        active
                          ? 'bg-[#00B8D9] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zero Results State */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-card">
              <Package className="w-14 h-14 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-[#172033] text-base mb-1">
                Không tìm thấy linh kiện hoặc thiết bị phù hợp
              </h3>
              <p className="text-xs text-slate-500 mb-5 max-w-md mx-auto">
                Vui lòng thử tìm kiếm với mã SKU khác, tên model hoặc xóa các bộ lọc đang chọn.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-5 py-2.5 bg-[#14213D] hover:bg-[#00B8D9] text-white text-xs font-bold rounded-full transition shadow-sm"
              >
                Đặt lại toàn bộ tiêu chí
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Filtered Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => {
                const avail = getAvailable(product.id);
                const specs = Object.entries(product.specs)
                  .map(([k, v]) => [cleanHtmlText(k), cleanHtmlText(v)] as const)
                  .filter(([_, clean]) => clean.length > 0)
                  .slice(0, 3);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden group transform hover:-translate-y-1"
                  >
                    {/* Thumbnail — Preserves `div.relative.bg-slate-900.p-6` for Test A selector */}
                    <div
                      onClick={() => setSelectedProductForDetail(product)}
                      className="relative bg-slate-900 p-6 flex items-center justify-center h-48 cursor-pointer overflow-hidden"
                      title="Bấm để xem thông số chi tiết"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 font-bold">
                        {product.sku}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                        BH {product.warrantyMonths}T
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          {avail <= 0 ? (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              Hết hàng
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Sẵn kho HCM ({avail})
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-[#00B8D9] font-bold uppercase">
                            {product.category.replace('_', ' ')}
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedProductForDetail(product)}
                          className="font-bold text-xs sm:text-sm text-[#172033] hover:text-[#00B8D9] cursor-pointer line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </h3>

                        {specs.length > 0 && (
                          <div className="mt-2.5 space-y-1 text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {specs.map(([k, v]) => (
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

                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="font-mono font-bold text-base text-[#14213D] tabular-nums">
                          {formatVND(product.price)}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedProductForDetail(product)}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-[#00B8D9] transition"
                            title="Chi tiết"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={avail <= 0}
                            className="px-3 py-2 bg-[#14213D] hover:bg-[#00B8D9] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition shadow-xs"
                          >
                            {avail <= 0 ? 'Hết hàng' : '+ Giỏ'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Filtered List View */
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-card overflow-hidden">
              {filtered.map((product) => {
                const avail = getAvailable(product.id);
                return (
                  <div
                    key={product.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 hover:bg-slate-50/80 transition"
                  >
                    <div
                      onClick={() => setSelectedProductForDetail(product)}
                      className="relative bg-slate-900 p-6 shrink-0 w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#00B8D9] border border-slate-800 transition shadow-xs"
                      title="Xem chi tiết"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain p-1"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold">
                          {product.sku}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Sẵn kho HCM · {avail} cái
                        </span>
                      </div>

                      <h3
                        onClick={() => setSelectedProductForDetail(product)}
                        className="font-bold text-sm sm:text-base text-[#172033] hover:text-[#00B8D9] cursor-pointer"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {cleanHtmlText(product.description)}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate-600 mt-2">
                        {Object.entries(product.specs)
                          .map(([k, v]) => [cleanHtmlText(k), cleanHtmlText(v)] as const)
                          .filter(([_, clean]) => clean.length > 0)
                          .slice(0, 4)
                          .map(([k, v]) => (
                            <span key={k}>
                              <strong className="text-slate-400">{k}:</strong> {v}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="shrink-0 text-right flex flex-col items-end gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
                      <div className="font-mono font-bold text-lg text-[#14213D]">
                        {formatVND(product.price)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bảo hành chính hãng {product.warrantyMonths} Tháng
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={avail <= 0}
                        className="px-4 py-2 bg-[#14213D] hover:bg-[#00B8D9] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition shadow-xs"
                      >
                        {avail <= 0 ? 'Hết hàng' : '+ Thêm giỏ'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── 3. FULL RETAIL STOREFRONT HOME EXPERIENCE ────────────────────── */
        <div className="space-y-2">
          {/* A. 16:5 / 16:6 Aspect Ratio Hero Banner System */}
          <HeroBanner onSelectCategory={handleCategoryClick} />

          {/* B. Visual Category Exploration Showcase */}
          <CategoryShowcase onCategoryClick={handleCategoryClick} />

          {/* C. Verified Retail Service Commitments */}
          <BenefitStrip />

          {/* D. Flash Sale / Hot Promotions Section */}
          <div id="section-promo">
            <PromotionSection
              products={products}
              inventory={inventory}
              onDetail={(p) => setSelectedProductForDetail(p)}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Department: Dàn PC Gaming Chuyên Nghiệp */}
          <ProductSection
            title="Dàn Máy PC Gaming & Đồ Họa Cao Cấp"
            subtitle="Cấu hình hoàn thiện tối ưu chiến game AAA, livestream và render đồ họa 3D"
            icon={<Gamepad2 className="w-5 h-5 text-violet-600" />}
            categoryTag="pc_gaming"
            products={featuredPcGaming}
            totalCount={pcGamingProducts.length}
            maxDisplay={4}
            inventory={inventory}
            onDetail={(p) => setSelectedProductForDetail(p)}
            onAddToCart={handleAddToCart}
            onViewAll={() => handleCategoryClick('pc_gaming')}
            accentColor="#7C3AED"
          />

          {/* Department: Linh Kiện Máy Tính Chính Hãng */}
          <ProductSection
            title="Linh Kiện Máy Tính & Nâng Cấp Phần Cứng"
            subtitle="Đầy đủ Bo mạch chủ (Main), Vi xử lý (CPU), Bộ nhớ (RAM), Card đồ họa (VGA), Ổ cứng SSD, Nguồn và Vỏ Case"
            icon={<Cpu className="w-5 h-5 text-cyan-600" />}
            categoryTag="pc_parts"
            products={featuredComponents}
            totalCount={componentProducts.length}
            maxDisplay={8}
            inventory={inventory}
            onDetail={(p) => setSelectedProductForDetail(p)}
            onAddToCart={handleAddToCart}
            onViewAll={() => handleCategoryClick('pc_parts')}
            accentColor="#00B8D9"
          />

          {/* Department: Laptop & Workstation Cao Cấp */}
          <ProductSection
            title="Laptop & Máy Trạm Chuyên Nghiệp"
            subtitle="Hiệu năng mạnh mẽ với Intel Core Ultra 9 & Apple Silicon M3 Max"
            icon={<Laptop className="w-5 h-5 text-blue-600" />}
            categoryTag="laptops"
            products={featuredLaptops}
            totalCount={laptopProducts.length}
            maxDisplay={4}
            inventory={inventory}
            onDetail={(p) => setSelectedProductForDetail(p)}
            onAddToCart={handleAddToCart}
            onViewAll={() => handleCategoryClick('laptops')}
            accentColor="#2563EB"
          />

          {/* G. Mid-Page Interactive Campaign: Build PC Theo Yêu Cầu */}
          <MidPagePromoBanner onBuildClick={() => handleCategoryClick('pc_parts')} />

          {/* Department: Màn Hình Chuyên Dụng Đồ Họa & Gaming */}
          <ProductSection
            title="Màn Hình Chuyên Dụng & Gaming OLED"
            subtitle="LG UltraGear Dual-Hz 240Hz/480Hz & ASUS ProArt chuẩn màu Delta E < 2"
            icon={<Monitor className="w-5 h-5 text-emerald-600" />}
            categoryTag="displays"
            products={featuredDisplays}
            totalCount={displayProducts.length}
            maxDisplay={4}
            inventory={inventory}
            onDetail={(p) => setSelectedProductForDetail(p)}
            onAddToCart={handleAddToCart}
            onViewAll={() => handleCategoryClick('displays')}
            accentColor="#059669"
          />

          {/* Department: Gaming Gear & Phụ Kiện Kỹ Thuật */}
          <ProductSection
            title="Gaming Gear & Thiết Bị Ngoại Vi"
            subtitle="Bàn phím cơ Keychron, Chuột gaming Logitech G, Tai nghe HyperX và Phụ kiện"
            icon={<Wrench className="w-5 h-5 text-amber-600" />}
            categoryTag="gaming_gear"
            products={featuredGear}
            totalCount={gearAndAccessoryProducts.length}
            maxDisplay={4}
            inventory={inventory}
            onDetail={(p) => setSelectedProductForDetail(p)}
            onAddToCart={handleAddToCart}
            onViewAll={() => handleCategoryClick('gaming_gear')}
            accentColor="#D97706"
          />
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
      />
    </div>
  );
};
