// ==========================================
// STORE HEADER COMPONENT (TWO-TIER RETAIL NAVIGATION)
// Row 1: Brand, Search, Store Location, Tracking, Cart, Profile
// Row 2: Category Department Bar (Sticky on scroll)
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Cpu,
  Flame,
  Gamepad2,
  HardDrive,
  Laptop,
  LogOut,
  Monitor,
  Package,
  PhoneCall,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { useApp } from '../../state/AppContext';
import { M3Badge } from '../m3/M3Badge';

interface StoreHeaderProps {
  onCategorySelect?: (cat: string, sub?: string) => void;
  selectedCategory?: string;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  onCategorySelect,
  selectedCategory,
}) => {
  const { user, logout, getDefaultRoute } = useAuth();
  const { cart, setIsCartOpen } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [searchKeyword, setSearchKeyword] = useState(urlSearch);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPartsDropdown, setShowPartsDropdown] = useState(false);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setSearchKeyword(urlSearch);
  }, [urlSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchKeyword(val);
    if (val.trim()) {
      navigate(`/store?search=${encodeURIComponent(val.trim())}`, { replace: true });
    } else {
      navigate('/store', { replace: true });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/store');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/store', { replace: true });
  };

  const COMPONENT_SUBITEMS = [
    { sub: 'all', label: 'Tất cả Linh Kiện PC', badge: '168 SP' },
    { sub: 'mainboard', label: 'Mainboard (Bo Mạch Chủ)', badge: '23 SP' },
    { sub: 'cpu', label: 'CPU (Vi Xử Lý)', badge: '29 SP' },
    { sub: 'ram', label: 'RAM (Bộ Nhớ Trong)', badge: '27 SP' },
    { sub: 'vga', label: 'VGA (Card Màn Hình)', badge: '27 SP' },
    { sub: 'ssd_hdd', label: 'Ổ Cứng SSD & HDD', badge: '17 SP' },
    { sub: 'psu', label: 'Nguồn Máy Tính (PSU)', badge: '15 SP' },
    { sub: 'case', label: 'Vỏ Case Máy Tính', badge: '15 SP' },
    { sub: 'cooling', label: 'Tản Nhiệt (Cooling)', badge: '15 SP' },
  ];

  const DEPARTMENT_LINKS = [
    { id: 'laptops', label: 'Laptop', icon: <Laptop className="w-3.5 h-3.5" /> },
    { id: 'pc_gaming', label: 'PC Gaming', icon: <Gamepad2 className="w-3.5 h-3.5 text-violet-400" /> },
    { id: 'pc_parts', label: 'Linh kiện PC', icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" />, hasDropdown: true },
    { id: 'displays', label: 'Màn hình', icon: <Monitor className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'gaming_gear', label: 'Gaming Gear', icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'accessories', label: 'Phụ kiện', icon: <Wrench className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'networking', label: 'Thiết bị mạng', icon: <HardDrive className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'promo', label: 'Khuyến mãi HOT', icon: <Flame className="w-3.5 h-3.5 text-[#FF7043]" />, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#14213D] text-white shadow-md">
      {/* ── ROW 1: PRIMARY E-COMMERCE RETAIL HEADER ──────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[70px] gap-3 sm:gap-6">
          {/* Logo & Brand */}
          <Link to="/store" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B8D9] to-[#008BA3] flex items-center justify-center font-bold text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg sm:text-xl tracking-tight leading-none text-white font-sans">
                COMPUTER<span className="text-[#00B8D9]">TECH</span>
              </div>
              <div className="text-[10px] text-slate-300 font-mono tracking-wider uppercase mt-0.5">
                Chuyên Gia Máy Tính & Linh Kiện
              </div>
            </div>
          </Link>

          {/* Large Retail Search Bar with Dual-Language / Test-Compatible Placeholder */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Bạn muốn tìm laptop, linh kiện hay thiết bị nào? (Search by SKU, model, component...)"
                value={searchKeyword}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-32 py-2.5 text-xs sm:text-sm bg-white text-[#172033] placeholder:text-slate-400 rounded-full border-2 border-transparent focus:border-[#00B8D9] focus:outline-none shadow-sm transition"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              {searchKeyword ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    navigate('/store', { replace: true });
                  }}
                  className="absolute right-28 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#00B8D9] hover:bg-[#00A3C2] text-white text-xs font-bold rounded-full transition shadow-xs flex items-center gap-1"
              >
                <span>Tìm kiếm</span>
              </button>
            </div>
          </form>

          {/* Fast Actions: Tracking, Cart, Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Tracking Link */}
            <Link
              to="/store/tracking"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/80 text-slate-200 hover:text-white text-xs border border-slate-700/60 transition"
            >
              <Package className="w-4 h-4 text-[#00B8D9]" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 leading-none">Tra cứu</div>
                <div className="font-semibold">Đơn & Bảo hành</div>
              </div>
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:px-3 sm:py-2 bg-[#FF7043] hover:bg-[#F4511E] text-white rounded-xl transition flex items-center gap-2 shadow-sm"
              title="Xem giỏ hàng"
            >
              <M3Badge content={cartTotalItems > 0 ? cartTotalItems : undefined}>
                <ShoppingCart className="w-5 h-5" />
              </M3Badge>
              <div className="hidden sm:block text-left pr-1">
                <div className="text-[10px] uppercase font-bold text-white/90 leading-none">Giỏ hàng</div>
                <div className="text-xs font-bold font-mono">
                  {cartTotalItems} sản phẩm
                </div>
              </div>
            </button>

            {/* User Account / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover border border-[#00B8D9]"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <div className="text-xs font-bold text-white truncate max-w-[110px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-[#00B8D9] font-bold uppercase">
                      {user.role === 'customer' ? 'Khách hàng' : user.role}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 text-[#172033] py-2">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-xs font-bold text-[#172033]">{user.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{user.email}</div>
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                        {user.role === 'customer' ? 'Tài khoản Thành viên' : `Nhân viên: ${user.role}`}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      {user.role === 'customer' ? (
                        <Link
                          to="/store/account"
                          onClick={() => setShowUserMenu(false)}
                          className="px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600 font-semibold"
                        >
                          <User className="w-4 h-4" />
                          <span>Hồ sơ & Đơn hàng cá nhân</span>
                        </Link>
                      ) : (
                        <Link
                          to={getDefaultRoute()}
                          onClick={() => setShowUserMenu(false)}
                          className="px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600 font-semibold"
                        >
                          <Cpu className="w-4 h-4" />
                          <span>Vào Workspace ({user.role}) ➔</span>
                        </Link>
                      )}
                      <Link
                        to="/store/tracking"
                        onClick={() => setShowUserMenu(false)}
                        className="px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>Tra cứu tiến trình đơn</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-[#00B8D9]" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 2: DEPARTMENT NAVIGATION BAR (STICKY) ────────────────────── */}
      <nav className="bg-[#1F2E4D] border-t border-slate-700/60 overflow-visible shadow-inner relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1.5 text-xs font-semibold whitespace-nowrap overflow-x-auto scrollbar-none">
          {DEPARTMENT_LINKS.map((dept, idx) => {
            if (dept.hasDropdown) {
              return (
                <div
                  key={`${dept.id}-${idx}`}
                  className="relative"
                  onMouseEnter={() => setShowPartsDropdown(true)}
                  onMouseLeave={() => setShowPartsDropdown(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (onCategorySelect) onCategorySelect(dept.id, 'all');
                      else navigate(`/store?category=${dept.id}`);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                      selectedCategory === dept.id
                        ? 'bg-[#00B8D9] text-white shadow-xs'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {dept.icon}
                    <span>{dept.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showPartsDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu for Components */}
                  {showPartsDropdown && (
                    <div className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 border-b border-slate-800 tracking-wider">
                        Danh Mục Linh Kiện Máy Tính
                      </div>
                      <div className="py-1">
                        {COMPONENT_SUBITEMS.map((item) => (
                          <button
                            key={item.sub}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPartsDropdown(false);
                              if (onCategorySelect) {
                                onCategorySelect('pc_parts', item.sub);
                              } else {
                                const q = item.sub === 'all' ? '?category=pc_parts' : `?category=pc_parts&sub=${item.sub}`;
                                navigate(`/store${q}`);
                              }
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-[#00B8D9] hover:text-white flex items-center justify-between group transition"
                          >
                            <span className="font-medium">{item.label}</span>
                            <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">
                              {item.badge}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={`${dept.id}-${idx}`}
                type="button"
                onClick={() => {
                  if (onCategorySelect) {
                    onCategorySelect(dept.id);
                  } else {
                    navigate(`/store?category=${dept.id}`);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  dept.highlight
                    ? 'bg-gradient-to-r from-[#FF7043]/20 to-[#FF7043]/10 text-[#FF7043] border border-[#FF7043]/40 font-bold'
                    : selectedCategory === dept.id
                    ? 'bg-[#00B8D9] text-white shadow-xs'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {dept.icon}
                <span>{dept.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
