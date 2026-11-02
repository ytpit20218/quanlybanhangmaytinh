// ==========================================
// STORE BENEFIT STRIP
// Real verified customer service commitments
// ==========================================

import React from 'react';
import {
  Clock,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';

export const BenefitStrip: React.FC = () => {
  const BENEFITS = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#00B8D9]" />,
      title: '100% Hàng chính hãng',
      desc: 'Xuất xứ rõ ràng, đầy đủ hóa đơn VAT và CO/CQ',
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-[#FF7043]" />,
      title: 'Bảo hành 1-đổi-1 30 ngày',
      desc: 'Lỗi phần cứng do nhà sản xuất đổi mới tức thì',
    },
    {
      icon: <Truck className="w-6 h-6 text-[#16A34A]" />,
      title: 'Giao hỏa tốc 2H',
      desc: 'Nội thành TP.HCM và miễn phí đơn từ 2 triệu',
    },
    {
      icon: <Headphones className="w-6 h-6 text-[#14213D]" />,
      title: 'Hỗ trợ kỹ thuật 24/7',
      desc: 'Hotline 1900-888-999 giải đáp & cài đặt phần mềm',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-card">
        {BENEFITS.map((b, idx) => (
          <div
            key={b.title}
            className={`flex items-start gap-3.5 p-2 ${
              idx !== BENEFITS.length - 1 ? 'lg:border-r border-slate-100' : ''
            }`}
          >
            <div className="shrink-0 p-2.5 rounded-xl bg-slate-50 border border-slate-100 shadow-xs">
              {b.icon}
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#172033]">
                {b.title}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {b.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
