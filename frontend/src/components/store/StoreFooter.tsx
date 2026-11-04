// ==========================================
// STORE FOOTER COMPONENT
// Comprehensive e-commerce retail footer
// ==========================================

import React from 'react';
import {
  Building2,
  Cpu,
  CreditCard,
  Headphones,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StoreFooter: React.FC = () => {
  return (
    <footer className="bg-[#0B132B] text-slate-300 font-sans border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/store" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B8D9] to-[#008BA3] flex items-center justify-center font-bold text-white shadow-md">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg text-white font-sans">
                  COMPUTER<span className="text-[#00B8D9]">TECH</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-0.5">
                  Hardware & Systems Distribution
                </div>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Hệ thống bán lẻ máy tính, laptop workstation, linh kiện PC và thiết bị công nghệ chính hãng. Trung tâm bảo hành và chẩn đoán phần cứng theo tiêu chuẩn công nghiệp.
            </p>

            <div className="space-y-2 text-xs text-slate-300 font-medium pt-1">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#00B8D9] shrink-0" />
                <span>123 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-[#FF7043] shrink-0" />
                <span>Hotline tư vấn & CSKH: <strong className="text-white font-mono">1900-888-999</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#00B8D9] shrink-0" />
                <span>Email hỗ trợ: support@computertech.vn</span>
              </div>
            </div>
          </div>

          {/* Col 2: Category Quicklinks */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white font-mono mb-3.5">
              Danh mục sản phẩm
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/store?category=laptops" className="hover:text-[#00B8D9] transition">
                  Laptop & Workstation
                </Link>
              </li>
              <li>
                <Link to="/store?category=pc_parts" className="hover:text-[#00B8D9] transition">
                  Card đồ họa (VGA) & CPU
                </Link>
              </li>
              <li>
                <Link to="/store?category=pc_parts" className="hover:text-[#00B8D9] transition">
                  Bộ nhớ RAM & SSD NVMe
                </Link>
              </li>
              <li>
                <Link to="/store?category=displays" className="hover:text-[#00B8D9] transition">
                  Màn hình OLED 240Hz / 4K
                </Link>
              </li>
              <li>
                <Link to="/store?category=accessories" className="hover:text-[#00B8D9] transition">
                  Bàn phím cơ & Phụ kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service & Policies */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white font-mono mb-3.5">
              Chính sách & Hỗ trợ
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/store/tracking" className="hover:text-[#00B8D9] transition">
                  Tra cứu tiến trình đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/store/tracking" className="hover:text-[#00B8D9] transition">
                  Tra cứu bảo hành & sửa chữa
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Chính sách bảo hành 1-đổi-1 30 ngày</span>
              </li>
              <li>
                <span className="text-slate-400">Chính sách giao hàng hỏa tốc 2H</span>
              </li>
              <li>
                <span className="text-slate-400">Quy định xuất hóa đơn VAT điện tử</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Portals & Authentication */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white font-mono mb-3.5">
              Cổng truy cập hệ thống
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/login" className="hover:text-white transition flex items-center gap-1.5 text-blue-400">
                  <User className="w-3.5 h-3.5" />
                  <span>Đăng nhập Khách hàng</span>
                </Link>
              </li>
              <li>
                <Link to="/store/account" className="hover:text-white transition">
                  Khu vực tài khoản thành viên
                </Link>
              </li>
              <li>
                <Link to="/store/tracking" className="hover:text-white transition">
                  Trung tâm hỗ trợ khách hàng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            © 2026 COMPUTERTECH Platform. All rights reserved. Tiêu chuẩn Google Material 3 / Material You.
          </div>
          <div className="flex items-center gap-4">
            <span>Giấy phép ĐKKD: 0312345678</span>
            <span>•</span>
            <span>Hệ thống phân phối máy tính chính hãng</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
