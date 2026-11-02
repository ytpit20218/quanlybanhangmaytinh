// ==========================================
// STORE MID-PAGE PROMO BANNER (BUILD PC CAMPAIGN)
// Horizontal interactive banner between product sections
// ==========================================

import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';

export const MidPagePromoBanner: React.FC<{ onBuildClick?: () => void }> = ({
  onBuildClick,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0B132B] via-[#14213D] to-[#003640] border border-cyan-900/60 p-6 sm:p-8 lg:p-10 text-white shadow-card">
        {/* Abstract Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#00B8D9]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF7043]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B8D9]/20 border border-[#00B8D9]/40 text-[#00B8D9] text-[11px] font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7043]" />
              <span>DỊCH VỤ WORKSTATION & PC GAMING THEO YÊU CẦU</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              TỰ BUILD PC THEO CÁCH CỦA BẠN
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tối ưu từng khung hình và luồng render với 100% linh kiện chính hãng. Kỹ thuật viên ComputerTech hỗ trợ tính toán công suất nguồn (PSU), đối lưu gió và chạy benchmark stress-test 24H trước khi giao.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00B8D9]" />
                <span>Miễn phí 100% công lắp ráp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00B8D9]" />
                <span>Bảo hành tận nơi 3 năm</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00B8D9]" />
                <span>Hỗ trợ mượn linh kiện thay thế</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onBuildClick}
                className="px-6 py-3 bg-[#00B8D9] hover:bg-[#00A3C2] text-white text-xs sm:text-sm font-bold rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Tư vấn cấu hình ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="w-full max-w-[300px] aspect-video rounded-xl bg-slate-900/80 border border-slate-700/80 p-2 shadow-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80"
                alt="Build PC Rig"
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
