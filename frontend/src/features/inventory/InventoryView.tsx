// ==========================================
// INVENTORY MATRIX & AUDIT TRANSACTION LEDGER
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  FileSpreadsheet,
  History,
  Layers,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { InventoryService } from '../../services/inventoryService';
import { useApp } from '../../state/AppContext';
import { InventoryTransaction, Product } from '../../types';
import { AddStockProductModal } from './AddStockProductModal';

export const InventoryView: React.FC = () => {
  const {
    products,
    inventory,
    transactions,
    currentUser,
    refreshData,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'ledger'>('matrix');

  // Modal stock operation state
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [opType, setOpType] = useState<'receipt' | 'issue' | 'adjustment'>('receipt');
  const [opQuantity, setOpQuantity] = useState<number>(1);
  const [opReason, setOpReason] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Add stock product modal state
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [addStockDefaultMode, setAddStockDefaultMode] = useState<'new_product' | 'restock_existing'>('new_product');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // Filter products for matrix
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    }
    const inv = inventory[p.id];
    const available = inv ? inv.quantityOnHand - inv.quantityReserved : 0;
    if (filterLowStockOnly && available > p.minStockAlert) return false;
    return true;
  });

  const openStockModal = (product: Product, type: 'receipt' | 'issue' | 'adjustment') => {
    const inv = inventory[product.id];
    setActiveModalProduct(product);
    setOpType(type);
    setOpQuantity(type === 'adjustment' ? (inv?.quantityOnHand ?? 0) : 1);
    setOpReason('');
    setModalError(null);
    setModalSuccess(null);
  };

  const handleExecuteStockOp = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    if (!activeModalProduct) return;

    if (!opReason || opReason.trim().length < 3) {
      setModalError('BR.04: Bắt buộc nhập lý do kiểm toán (tối thiểu 3 ký tự).');
      return;
    }

    let result: { success: boolean; error?: string };

    if (opType === 'receipt') {
      result = InventoryService.receiveStock(
        activeModalProduct.id,
        Number(opQuantity),
        opReason,
        currentUser
      );
    } else if (opType === 'issue') {
      result = InventoryService.issueStock(
        activeModalProduct.id,
        Number(opQuantity),
        opReason,
        currentUser
      );
    } else {
      result = InventoryService.adjustStock(
        activeModalProduct.id,
        Number(opQuantity),
        opReason,
        currentUser
      );
    }

    if (!result.success) {
      setModalError(result.error || 'Thao tác không thành công.');
    } else {
      setModalSuccess(`Cập nhật số lượng kho thành công cho ${activeModalProduct.name}.`);
      refreshData();
      setTimeout(() => {
        setActiveModalProduct(null);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-slate-900">
                  Bảng Quản Lý Tồn Kho Trung Tâm
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                  Kho Tổng TP.HCM
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Công thức: Khả dụng = Tồn thực tế - Đã giữ chỗ • Bắt buộc ghi nhận lý do khi điều chỉnh (BR.04)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-start md:self-auto">
            {/* Primary Action Button: Add Stock / Product */}
            <button
              onClick={() => {
                setAddStockDefaultMode('new_product');
                setIsAddStockModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ Thêm Hàng Vào Kho</span>
            </button>

            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition flex items-center space-x-1.5 ${
                  activeTab === 'matrix'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Tồn kho linh kiện</span>
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition flex items-center space-x-1.5 ${
                  activeTab === 'ledger'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Sổ cái kiểm toán</span>
                <span className="font-mono-num text-[11px] bg-slate-200 px-1.5 rounded text-slate-700">
                  {transactions.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Success Banner */}
      {successBanner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate-fade-in">
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ================= TAB 1: INVENTORY MATRIX ================= */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã SKU hoặc tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">TẤT CẢ DANH MỤC</option>
                  <option value="laptops">LAPTOP & MÁY TRẠM</option>
                  <option value="pc_gaming">PC GAMING</option>
                  <option value="pc_parts">LINH KIỆN PC</option>
                  <option value="displays">MÀN HÌNH</option>
                  <option value="gaming_gear">GAMING GEAR</option>
                  <option value="accessories">PHỤ KIỆN</option>
                  <option value="networking">THIẾT BỊ MẠNG</option>
                </select>

                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={filterLowStockOnly}
                    onChange={(e) => setFilterLowStockOnly(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Chỉ hiện cảnh báo nhập hàng</span>
                </label>
              </div>

              <div className="text-slate-500">
                Hiển thị <span className="text-slate-900 font-semibold">{filteredProducts.length}</span> mã sản phẩm
              </div>
            </div>

            {/* Industrial Data Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-4 font-mono">Mã SKU</th>
                      <th className="py-3 px-4">Tên sản phẩm & Vị trí</th>
                      <th className="py-3 px-4 text-right">Đơn giá</th>
                      <th className="py-3 px-4 text-right">Tồn thực</th>
                      <th className="py-3 px-4 text-right">Giữ chỗ</th>
                      <th className="py-3 px-4 text-right">Khả dụng</th>
                      <th className="py-3 px-4 text-center">Ngưỡng an toàn</th>
                      <th className="py-3 px-4 text-center">Thao tác kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredProducts.map((p) => {
                      const inv = inventory[p.id];
                      const onHand = inv?.quantityOnHand ?? 0;
                      const reserved = inv?.quantityReserved ?? 0;
                      const available = Math.max(0, onHand - reserved);
                      const isLowStock = available <= p.minStockAlert;
                      const isZero = available <= 0;

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-50 transition ${
                            isZero ? 'bg-rose-50/30' : isLowStock ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          {/* SKU */}
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                            {p.sku}
                          </td>

                          {/* Product */}
                          <td className="py-3 px-4">
                            <div className="text-slate-900 font-medium truncate max-w-xs">{p.name}</div>
                            <div className="text-[11px] text-slate-500">
                              Location: {inv?.location || 'General Bay'} • Updated:{' '}
                              {inv?.lastUpdated ? new Date(inv.lastUpdated).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 text-right font-mono-num text-slate-600">
                            {formatVND(p.price)}
                          </td>

                          {/* On Hand */}
                          <td className="py-3 px-4 text-right font-mono-num font-semibold text-slate-900">
                            {onHand}
                          </td>

                          {/* Reserved */}
                          <td className="py-3 px-4 text-right font-mono-num text-blue-600 font-medium">
                            {reserved}
                          </td>

                          {/* Available (Derived) */}
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-mono-num font-bold text-xs px-2 py-0.5 rounded ${
                                isZero
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isLowStock
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {available}
                            </span>
                          </td>

                          {/* Alert threshold */}
                          <td className="py-3 px-4 text-center">
                            {isLowStock ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Cần nhập (≤{p.minStockAlert})
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Tối thiểu: {p.minStockAlert}</span>
                            )}
                          </td>

                          {/* Contextual Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => openStockModal(p, 'receipt')}
                                className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded text-xs font-medium transition flex items-center space-x-1"
                                title="Nhập hàng mới vào kho"
                              >
                                <ArrowDownLeft className="w-3 h-3" />
                                <span>Nhập kho</span>
                              </button>
                              <button
                                onClick={() => openStockModal(p, 'issue')}
                                className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-300 rounded text-xs font-medium transition flex items-center space-x-1"
                                title="Xuất kho / xuất hủy linh kiện"
                              >
                                <ArrowUpRight className="w-3 h-3" />
                                <span>Xuất kho</span>
                              </button>
                              <button
                                onClick={() => openStockModal(p, 'adjustment')}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-medium transition flex items-center space-x-1"
                                title="Điều chỉnh số lượng kiểm kê thực tế"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Điều chỉnh</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: AUDIT LEDGER ================= */}
        {activeTab === 'ledger' && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                Sổ cái Kiểm toán Biến động Kho Bất biến ({transactions.length} bản ghi)
              </span>
              <span className="text-slate-500">
                Kiểm toán truy vết mọi biến động kho kèm định danh nhân sự (BR.04)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4 font-mono">Thời gian</th>
                    <th className="py-2.5 px-4">Mã SKU & Tên sản phẩm</th>
                    <th className="py-2.5 px-4">Hành động</th>
                    <th className="py-2.5 px-4 text-right">Số lượng</th>
                    <th className="py-2.5 px-4 text-right">Biến động (Trước ➔ Sau)</th>
                    <th className="py-2.5 px-4">Nhân sự thực hiện</th>
                    <th className="py-2.5 px-4">Lý do kiểm toán & Tham chiếu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {transactions.map((tx) => {
                    const prod = products.find((p) => p.id === tx.productId);
                    const actionLabel =
                      tx.type === 'receipt' ? 'NHẬP KHO' :
                      tx.type === 'issue' ? 'XUẤT KHO' :
                      tx.type === 'reserve' ? 'GIỮ CHỖ' :
                      tx.type === 'release' ? 'GIẢI PHÓNG' : 'ĐIỀU CHỈNH';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-semibold text-slate-800">{prod?.sku || 'SKU'}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{prod?.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              tx.type === 'receipt'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : tx.type === 'issue'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : tx.type === 'reserve'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : tx.type === 'release'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {actionLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono-num font-semibold text-slate-900">
                          {tx.quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-num text-slate-500">
                          {tx.previousOnHand} ➔ {tx.newOnHand}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{tx.actorName}</td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="text-slate-900 font-medium">{tx.reason}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Tham chiếu: {tx.referenceType} ({tx.referenceId})
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Stock Operation Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 text-slate-800 max-w-md w-full rounded-lg shadow-xl p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 uppercase tracking-wider">
                  Thao tác kho: {opType === 'receipt' ? 'Nhập kho' : opType === 'issue' ? 'Xuất kho' : 'Điều chỉnh tồn'}
                </h3>
                <p className="text-xs text-blue-600 font-mono font-medium">{activeModalProduct.sku}</p>
              </div>
              <button
                onClick={() => setActiveModalProduct(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
              <div className="text-slate-900 font-medium">{activeModalProduct.name}</div>
              {(() => {
                const inv = inventory[activeModalProduct.id];
                const onHand = inv?.quantityOnHand ?? 0;
                const reserved = inv?.quantityReserved ?? 0;
                const avail = onHand - reserved;
                return (
                  <div className="text-xs text-slate-500">
                    Hiện tại: Tồn thực tế <span className="text-slate-900 font-bold">{onHand}</span> | Đang giữ chỗ{' '}
                    <span className="text-blue-600 font-bold">{reserved}</span> | Khả dụng{' '}
                    <span className="text-emerald-600 font-bold">{avail}</span>
                  </div>
                );
              })()}
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleExecuteStockOp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {opType === 'adjustment' ? 'Số lượng tồn kho thực tế mong muốn' : 'Số lượng đơn vị'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={opQuantity}
                  onChange={(e) => setOpQuantity(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Lý do kiểm toán bắt buộc (BR.04)
                </label>
                <textarea
                  rows={2}
                  placeholder="vd: Nhập bổ sung đợt 3 nhà phân phối, Kiểm kê lệch số lượng, Xuất hủy bao bì móp méo..."
                  value={opReason}
                  onChange={(e) => setOpReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="text-[11px] text-slate-500">
                Nhân sự thực hiện: <span className="text-slate-800 font-medium">{currentUser.name}</span> ({currentUser.role})
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition"
                >
                  Xác nhận thao tác & Cập nhật sổ cái
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalProduct(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md transition"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Stock & Product Modal */}
      <AddStockProductModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        defaultMode={addStockDefaultMode}
        onSuccess={(msg) => {
          setSuccessBanner(msg);
          setTimeout(() => setSuccessBanner(null), 5000);
        }}
      />
    </div>
  );
};
