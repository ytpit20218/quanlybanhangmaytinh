// ==========================================
// VISUAL CATEGORY SHOWCASE
// 12 Visual category cards with iconography & product imagery
// ==========================================

import React from 'react';
import {
  Cpu,
  Flame,
  Gamepad2,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  Layers,
  MemoryStick,
  Monitor,
  Mouse,
  Network,
  Wrench,
  Zap,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  categoryFilter: string;
  icon: React.ReactNode;
  bgGradient: string;
  accent: string;
  countText: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat_laptop',
    name: 'Laptop & Máy trạm',
    categoryFilter: 'laptops',
    icon: <Laptop className="w-6 h-6" />,
    bgGradient: 'from-blue-50 to-indigo-50/60',
    accent: 'text-blue-600',
    countText: 'Dell, Apple, ROG',
  },
  {
    id: 'cat_pc_gaming',
    name: 'PC Gaming Build',
    categoryFilter: 'pc_gaming',
    icon: <Gamepad2 className="w-6 h-6" />,
    bgGradient: 'from-violet-50 to-purple-50/60',
    accent: 'text-violet-600',
    countText: 'Full Load 24H',
  },
  {
    id: 'cat_cpu',
    name: 'Vi xử lý (CPU)',
    categoryFilter: 'pc_parts',
    icon: <Cpu className="w-6 h-6" />,
    bgGradient: 'from-amber-50 to-orange-50/60',
    accent: 'text-amber-600',
    countText: 'Ryzen 9, Core Ultra',
  },
  {
    id: 'cat_vga',
    name: 'Card đồ họa (VGA)',
    categoryFilter: 'pc_parts',
    icon: <Zap className="w-6 h-6" />,
    bgGradient: 'from-emerald-50 to-teal-50/60',
    accent: 'text-emerald-600',
    countText: 'RTX 4090, 4080',
  },
  {
    id: 'cat_ram',
    name: 'Bộ nhớ RAM',
    categoryFilter: 'pc_parts',
    icon: <Layers className="w-6 h-6" />,
    bgGradient: 'from-cyan-50 to-sky-50/60',
    accent: 'text-cyan-600',
    countText: 'DDR5 6000MHz',
  },
  {
    id: 'cat_ssd',
    name: 'Ổ cứng SSD NVMe',
    categoryFilter: 'pc_parts',
    icon: <HardDrive className="w-6 h-6" />,
    bgGradient: 'from-rose-50 to-pink-50/60',
    accent: 'text-rose-600',
    countText: 'Gen 4 7450 MB/s',
  },
  {
    id: 'cat_mainboard',
    name: 'Bo mạch chủ',
    categoryFilter: 'pc_parts',
    icon: <Layers className="w-6 h-6" />,
    bgGradient: 'from-slate-50 to-gray-100',
    accent: 'text-slate-700',
    countText: 'AM5 & LGA1700',
  },
  {
    id: 'cat_monitor',
    name: 'Màn hình chuyên dụng',
    categoryFilter: 'displays',
    icon: <Monitor className="w-6 h-6" />,
    bgGradient: 'from-indigo-50 to-blue-50/60',
    accent: 'text-indigo-600',
    countText: 'OLED 240Hz, 4K Pro',
  },
  {
    id: 'cat_keyboard',
    name: 'Bàn phím cơ & Chuột',
    categoryFilter: 'accessories',
    icon: <Keyboard className="w-6 h-6" />,
    bgGradient: 'from-teal-50 to-emerald-50/60',
    accent: 'text-teal-600',
    countText: 'Keychron QMK/VIA',
  },
  {
    id: 'cat_headphones',
    name: 'Tai nghe & Audio Lab',
    categoryFilter: 'accessories',
    icon: <Headphones className="w-6 h-6" />,
    bgGradient: 'from-fuchsia-50 to-purple-50/60',
    accent: 'text-fuchsia-600',
    countText: 'Gaming 7.1 & Studio',
  },
  {
    id: 'cat_network',
    name: 'Thiết bị mạng Wi-Fi 7',
    categoryFilter: 'pc_parts',
    icon: <Network className="w-6 h-6" />,
    bgGradient: 'from-blue-50 to-cyan-50/60',
    accent: 'text-blue-600',
    countText: 'Router & Switch Pro',
  },
  {
    id: 'cat_accessories',
    name: 'Phụ kiện & Keo tản nhiệt',
    categoryFilter: 'accessories',
    icon: <Wrench className="w-6 h-6" />,
    bgGradient: 'from-amber-50 to-yellow-50/60',
    accent: 'text-amber-600',
    countText: 'Kryonaut, CableMod',
  },
];

export const CategoryShowcase: React.FC<{ onCategoryClick: (categoryFilter: string) => void }> = ({
  onCategoryClick,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#172033] tracking-tight">
            Khám phá danh mục phần cứng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Linh kiện, máy tính và thiết bị công nghệ chính hãng có sẵn tại kho
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick(cat.categoryFilter)}
            className={`group p-3 sm:p-4 rounded-xl border border-slate-200/80 hover:border-[#00B8D9] bg-gradient-to-br ${cat.bgGradient} hover:shadow-card-hover transition-all text-left flex flex-col justify-between min-h-[110px] transform hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-11 h-11 rounded-lg bg-white shadow-xs flex items-center justify-center ${cat.accent} group-hover:scale-110 transition-transform duration-200`}
              >
                {cat.icon}
              </div>
            </div>

            <div className="mt-2.5">
              <div className="font-bold text-xs sm:text-sm text-[#172033] group-hover:text-[#00B8D9] transition-colors line-clamp-1">
                {cat.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                {cat.countText}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
