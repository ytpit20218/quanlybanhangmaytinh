// ==========================================
// STORE HERO BANNER (16:5 / 16:6 ASPECT RATIO)
// Main Hero Carousel (70-75% width) + Sub-Banners (25-30% width)
// Navy (#14213D) & Cyan (#00B8D9) & Coral (#FF7043)
// ==========================================

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Flame,
  Gamepad2,
  Laptop,
  Monitor,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Slide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  categoryLink: string;
  image: string;
  gradient: string;
  accentColor: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 'slide_1',
    badge: 'FLAGSHIP GAMING & WORKSTATION',
    title: 'NÂNG CẤP GÓC GAMING',
    subtitle: 'Hiệu năng vượt trội · Trải nghiệm khác biệt',
    description: 'Trang bị card đồ họa ASUS ROG RTX 4090 OC 24GB & vi xử lý Zen 5 thế hệ mới nhất cho game thủ và studio đồ họa 4K.',
    ctaText: 'Khám phá ngay',
    categoryLink: 'pc_parts',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&auto=format&fit=crop&q=80',
    gradient: 'from-[#0B132B] via-[#14213D] to-[#1F2E4D]',
    accentColor: '#00B8D9',
  },
  {
    id: 'slide_2',
    badge: 'MÁY TRẠM DI ĐỘNG CAO CẤP',
    title: 'DELL XPS 16 & MACBOOK M3 MAX',
    subtitle: 'Màn hình OLED 3.2K · Chuẩn màu điện ảnh',
    description: 'Sức mạnh tính toán đa nhân với Intel Core Ultra 9 & Apple Silicon M3 Max. Thiết kế vỏ nhôm CNC nguyên khối siêu mỏng.',
    ctaText: 'Xem Laptop cao cấp',
    categoryLink: 'laptops',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1000&auto=format&fit=crop&q=80',
    gradient: 'from-[#0A1128] via-[#101F42] to-[#1B326B]',
    accentColor: '#FF7043',
  },
  {
    id: 'slide_3',
    badge: 'ĐỘT PHÁ CÔNG NGHỆ HIỂN THỊ',
    title: 'LG ULTRAGEAR 32" DUAL-HZ OLED',
    subtitle: 'Chuyển đổi tức thì 4K 240Hz & FHD 480Hz',
    description: 'Màn hình OLED thời gian phản hồi siêu tốc 0.03ms (GtG), độ bao phủ màu DCI-P3 98.5% và chuẩn HDR True Black 400.',
    ctaText: 'Xem Màn hình Pro',
    categoryLink: 'displays',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&auto=format&fit=crop&q=80',
    gradient: 'from-[#0D1527] via-[#162544] to-[#1E3860]',
    accentColor: '#00B8D9',
  },
];

export const HeroBanner: React.FC<{ onSelectCategory?: (cat: string) => void }> = ({
  onSelectCategory,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto rotate carousel every 5 seconds if not paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* ── 1. MAIN HERO CAROUSEL (75% width on desktop) ────────────────── */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={`lg:col-span-8 relative rounded-2xl overflow-hidden shadow-card bg-gradient-to-r ${slide.gradient} text-white flex flex-col justify-between min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] transition-all duration-500 border border-slate-700/60`}
        >
          {/* Background Ambient Glow & Light Accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00B8D9]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#FF7043]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Banner Content Container */}
          <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
              {/* Text Information Column */}
              <div className="md:col-span-7 space-y-3.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#00B8D9] text-[11px] font-mono font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF7043]" />
                  <span>{slide.badge}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
                  {slide.title}
                </h1>

                <div className="text-sm sm:text-base font-semibold text-[#00B8D9]">
                  {slide.subtitle}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-lg">
                  {slide.description}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => onSelectCategory?.(slide.categoryLink)}
                    className="px-6 py-3 bg-gradient-to-r from-[#FF7043] to-[#F4511E] hover:from-[#F4511E] hover:to-[#E65100] text-white text-xs sm:text-sm font-bold rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 group"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-[#00B8D9]" />
                    <span>CO/CQ chính hãng</span>
                  </div>
                </div>
              </div>

              {/* Product Visual Photography Column */}
              <div className="md:col-span-5 flex items-center justify-center relative">
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-700/80 p-3 shadow-2xl group">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none rounded-xl" />
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                      Sẵn hàng kho HCM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls: Indicators & Navigation Arrows */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-4">
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === idx
                        ? 'w-8 bg-[#00B8D9]'
                        : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                    title={`Chuyển tới slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))
                  }
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition"
                  title="Slide trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition"
                  title="Slide kế tiếp"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. SUB-BANNERS (25% width on desktop, stacked) ──────────────── */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
          {/* Sub-banner 1: Build PC On-Demand */}
          <div
            onClick={() => onSelectCategory?.('pc_parts')}
            className="flex-1 bg-gradient-to-br from-[#14213D] to-[#1F2E4D] border border-slate-700/80 rounded-2xl p-5 text-white flex flex-col justify-between shadow-card hover:border-[#00B8D9] transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B8D9]/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#00B8D9] mb-2">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> BUILD PC CHUYÊN NGHIỆP
                </span>
                <span className="bg-[#00B8D9]/20 text-[#00B8D9] px-2 py-0.5 rounded text-[10px]">
                  Tối ưu
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-[#00B8D9] transition-colors">
                Linh kiện chính hãng 100%
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Miễn phí công ráp, kiểm tra full load nhiệt độ 24H trước khi bàn giao.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 text-xs font-bold text-[#00B8D9] group-hover:translate-x-1 transition-transform">
              <span>Khám phá linh kiện</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Sub-banner 2: Flash Promo / Storage & RAM */}
          <div
            onClick={() => onSelectCategory?.('pc_parts')}
            className="flex-1 bg-gradient-to-br from-[#14213D] to-[#251E3E] border border-slate-700/80 rounded-2xl p-5 text-white flex flex-col justify-between shadow-card hover:border-[#FF7043] transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FF7043]/15 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#FF7043] mb-2">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> DEAL ĐỘC QUYỀN
                </span>
                <span className="bg-[#FF7043]/20 text-[#FF7043] px-2 py-0.5 rounded text-[10px]">
                  -15%
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-[#FF7043] transition-colors">
                Samsung 990 PRO & RAM DDR5
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Tốc độ đọc 7,450 MB/s đỉnh cao, tặng kèm tản nhiệt nhôm định hình.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 text-xs font-bold text-[#FF7043] group-hover:translate-x-1 transition-transform">
              <span>Xem ưu đãi lưu trữ</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
