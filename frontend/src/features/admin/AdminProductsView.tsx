// ==========================================
// ADMIN HARDWARE CATALOG & THRESHOLDS MATRIX
// ==========================================

import React, { useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Cpu,
  Layers,
  Search,
  Shield,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { Product } from '../../types';

export const AdminProductsView: React.FC = () => {
  const { products, inventory } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
            <span>EXECUTIVE CATALOG MANAGEMENT</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900">
            Hardware Catalog & Safety Margins
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Component SKUs, cost vs retail margins, warranty periods, and minStockAlert thresholds
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="mt-6 bg-white p-4 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search SKU or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="all">ALL HARDWARE CATEGORIES</option>
            <option value="laptops">LAPTOPS & WORKSTATIONS</option>
            <option value="pc_parts">PC PARTS & SILICON</option>
            <option value="displays">DISPLAYS & PANELS</option>
            <option value="accessories">ACCESSORIES</option>
          </select>
        </div>

        <div className="text-slate-500 text-xs">
          Catalog SKUs: <strong className="text-slate-900 font-mono">{filtered.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">SKU / Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Wholesale Cost</th>
                <th className="py-3 px-4 text-right">Retail Price</th>
                <th className="py-3 px-4 text-right">Margin</th>
                <th className="py-3 px-4 text-center">Warranty</th>
                <th className="py-3 px-4 text-right">Threshold Alert</th>
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
                        {p.category.replace('_', ' ')}
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
                      {p.warrantyMonths} months
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                      ≤ {p.minStockAlert} units
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
