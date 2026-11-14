// ==========================================
// ADMIN HARDWARE CATALOG & THRESHOLDS MATRIX
// ==========================================

import React, { useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Cpu,
  Layers,
  PackagePlus,
  Search,
  Shield,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { Product } from '../../types';
import { AddStockProductModal } from '../inventory/AddStockProductModal';

export const AdminProductsView: React.FC = () => {
  const { products, inventory } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const filtered = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-bold uppercase text-[11px] mb-1">
            <Layers className="w-4 h-4" />
            <span>QUẢN LÝ DANH MỤC LINH KIỆN & GIÁ</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900">
            Danh Mục Sản Phẩm & Biên Lợi Nhuận
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Mã SKU linh kiện, giá vốn vs giá niêm yết bán lẻ, thời hạn bảo hành và ngưỡng cảnh báo tồn kho tối thiểu
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <PackagePlus className="w-4 h-4" />
          <span>+ Thêm Sản Phẩm Mới Vào Kho</span>
        </button>
      </div>

      {/* Global Success Banner */}
      {successBanner && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successBanner}</span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="mt-6 bg-white p-4 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm theo mã SKU hoặc tên linh kiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="all">TẤT CẢ DANH MỤC</option>
            <option value="laptops">LAPTOP & MÁY TRẠM</option>
            <option value="pc_gaming">PC GAMING & ĐỒ HỌA</option>
            <option value="pc_parts">LINH KIỆN PC</option>
            <option value="displays">MÀN HÌNH MÁY TÍNH</option>
            <option value="gaming_gear">GAMING GEAR & PHÍM CHUỘT</option>
            <option value="accessories">PHỤ KIỆN CÔNG NGHỆ</option>
            <option value="networking">THIẾT BỊ MẠNG & CAMERA</option>
          </select>
        </div>

        <div className="text-slate-500 text-xs">
          Tổng số mặt hàng: <strong className="text-slate-900 font-mono">{filtered.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Mã SKU / Tên linh kiện</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4 text-right">Giá vốn</th>
                <th className="py-3 px-4 text-right">Giá niêm yết</th>
                <th className="py-3 px-4 text-right">Biên lợi nhuận</th>
                <th className="py-3 px-4 text-center">Bảo hành</th>
                <th className="py-3 px-4 text-right">Ngưỡng cảnh báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {filtered.map((p) => {
                const margin = p.price - p.cost;
                const marginPct = Math.round((margin / p.price) * 100);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{p.sku}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold uppercase">
                        {p.category === 'laptops'
                          ? 'Laptop'
                          : p.category === 'pc_gaming'
                          ? 'PC Gaming'
                          : p.category === 'pc_parts'
                          ? 'Linh kiện'
                          : p.category === 'displays'
                          ? 'Màn hình'
                          : p.category === 'gaming_gear'
                          ? 'Gaming Gear'
                          : p.category === 'accessories'
                          ? 'Phụ kiện'
                          : 'Mạng'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatVND(p.cost)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatVND(p.price)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      <span className="text-emerald-700 font-semibold">
                        +{formatVND(margin)} ({marginPct}%)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {p.warrantyMonths} Tháng
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                      ≤ {p.minStockAlert} SP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product & Initial Stock Modal */}
      <AddStockProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(msg) => {
          setSuccessBanner(msg);
          setTimeout(() => setSuccessBanner(null), 5000);
        }}
      />
    </div>
  );
};
