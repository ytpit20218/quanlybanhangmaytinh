// ==============================================================
// ADD NEW STOCK & HARDWARE PRODUCT MODAL (WAREHOUSE & ADMIN)
// ==============================================================

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  Boxes,
  CheckCircle2,
  PackagePlus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { InventoryService } from '../../services/inventoryService';
import { useApp } from '../../state/AppContext';
import { Product, ProductCategory } from '../../types';

interface AddStockProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  defaultMode?: 'new_product' | 'restock_existing';
}

export const AddStockProductModal: React.FC<AddStockProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'new_product',
}) => {
  const { products, currentUser, refreshData } = useApp();

  const [activeTab, setActiveTab] = useState<'new_product' | 'restock_existing'>(defaultMode);

  // Form state for New Product
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('pc_parts');
  const [price, setPrice] = useState<number>(1000000);
  const [cost, setCost] = useState<number>(800000);
  const [initialStock, setInitialStock] = useState<number>(10);
  const [location, setLocation] = useState('KHO-TONG-A1');
  const [warrantyMonths, setWarrantyMonths] = useState<number>(24);
  const [minStockAlert, setMinStockAlert] = useState<number>(3);
  const [imageUrl, setImageUrl] = useState('');
  const [newReason, setNewReason] = useState('Nhập lô hàng mới từ nhà phân phối chính hãng');

  // Form state for Restock Existing
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [productSearch, setProductSearch] = useState('');
  const [restockQty, setRestockQty] = useState<number>(5);
  const [restockReason, setRestockReason] = useState('Bổ sung tồn kho từ đợt nhập hàng định kỳ');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSku = () => {
    const prefix = category === 'laptops' ? 'LT' : category === 'pc_gaming' ? 'PC' : 'SP';
    const rand = Math.floor(100000 + Math.random() * 900000);
    setSku(`${prefix}${rand}`);
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập tên sản phẩm / linh kiện.');
      return;
    }
    if (!sku.trim()) {
      setErrorMessage('Vui lòng nhập hoặc tạo mã SKU.');
      return;
    }
    if (price <= 0 || cost <= 0) {
      setErrorMessage('Giá bán và giá vốn phải lớn hơn 0.');
      return;
    }
    if (initialStock < 0) {
      setErrorMessage('Số lượng nhập kho ban đầu không hợp lệ.');
      return;
    }
    if (!newReason.trim() || newReason.trim().length < 3) {
      setErrorMessage('BR.04: Bắt buộc nhập lý do kiểm toán kho (tối thiểu 3 ký tự).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = InventoryService.addNewProductStock(
        {
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category,
          price: Number(price),
          cost: Number(cost),
          initialStock: Number(initialStock),
          location: location.trim() || 'KHO-TONG-A1',
          warrantyMonths: Number(warrantyMonths),
          minStockAlert: Number(minStockAlert),
          image: imageUrl.trim() || undefined,
        },
        newReason.trim(),
        currentUser
      );

      if (!res.success) {
        setErrorMessage(res.error || 'Không thể thêm sản phẩm vào kho.');
      } else {
        refreshData();
        onSuccess(`Đã thêm thành công sản phẩm "${name}" vào kho với số lượng ${initialStock} chiếc.`);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi hệ thống khi lưu kho.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestockExisting = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedProductId) {
      setErrorMessage('Vui lòng chọn sản phẩm cần nhập thêm.');
      return;
    }
    if (restockQty <= 0 || !Number.isInteger(Number(restockQty))) {
      setErrorMessage('Số lượng nhập kho phải là số nguyên dương.');
      return;
    }
    if (!restockReason.trim() || restockReason.trim().length < 3) {
      setErrorMessage('BR.04: Bắt buộc nhập lý do kiểm toán (tối thiểu 3 ký tự).');
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) {
      setErrorMessage('Không tìm thấy sản phẩm trong hệ thống.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = InventoryService.receiveStock(
        selectedProductId,
        Number(restockQty),
        restockReason.trim(),
        currentUser
      );

      if (!res.success) {
        setErrorMessage(res.error || 'Nhập kho thất bại.');
      } else {
        refreshData();
        onSuccess(`Đã nhập thêm +${restockQty} chiếc cho "${prod.name}" thành công.`);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi hệ thống khi nhập kho.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSelectableProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Thêm Hàng Vào Kho (Warehouse Intake)</h2>
              <p className="text-xs text-slate-400">
                Ủy quyền quyền hạn: {currentUser.name} ({currentUser.role.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex space-x-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('new_product');
              setErrorMessage(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'new_product'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Thêm mặt hàng mới vào danh mục & kho</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('restock_existing');
              setErrorMessage(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'restock_existing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>2. Nhập thêm hàng cho mặt hàng có sẵn</span>
          </button>
        </div>

        {/* Feedback message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================= TAB 1: NEW PRODUCT ================= */}
        {activeTab === 'new_product' && (
          <form onSubmit={handleAddNewProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            {/* Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên sản phẩm / Linh kiện <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Màn hình Gaming ASUS TUF VG279Q3A 27 inch 180Hz 1ms IPS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* SKU and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">
                    Mã SKU linh kiện <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-[11px] text-blue-600 hover:underline flex items-center space-x-0.5"
                  >
                    <RefreshCw className="w-3 h-3 mr-0.5" />
                    <span>Tạo tự động</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="VD: SP109888"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Danh mục sản phẩm</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
                >
                  <option value="pc_parts">Linh kiện PC (CPU, Main, RAM, VGA, SSD...)</option>
                  <option value="pc_gaming">PC Gaming & Máy bộ</option>
                  <option value="laptops">Laptop & Máy trạm</option>
                  <option value="displays">Màn hình máy tính</option>
                  <option value="gaming_gear">Gaming Gear (Phím, Chuột, Tai nghe)</option>
                  <option value="accessories">Phụ kiện & Nguồn, Vỏ Case</option>
                  <option value="networking">Thiết bị mạng & Router</option>
                </select>
              </div>
            </div>

            {/* Price and Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Giá vốn nhập hàng (VND) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1000}
                  step={50000}
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Giá niêm yết bán lẻ (VND) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1000}
                  step={50000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            {/* Initial Stock and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số lượng nhập kho <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={initialStock}
                  onChange={(e) => setInitialStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vị trí lưu kho</label>
                <input
                  type="text"
                  placeholder="KHO-TONG-A1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cảnh báo tồn tối thiểu</label>
                <input
                  type="number"
                  min={1}
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Warranty and Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bảo hành (Tháng)</label>
                <select
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={12}>12 Tháng (1 Năm)</option>
                  <option value={24}>24 Tháng (2 Năm - Tiêu chuẩn)</option>
                  <option value={36}>36 Tháng (3 Năm - Linh kiện chính)</option>
                  <option value={60}>60 Tháng (5 Năm - Nguồn/SSD cao cấp)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Hình ảnh (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="https://... (Để trống dùng ảnh mặc định)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Audit Reason */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lý do kiểm toán nhập hàng (BR.04) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Nhập lô hàng từ Synnex FPT / Digiworld có hóa đơn VAT..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition flex items-center space-x-1.5"
              >
                <Boxes className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang lưu...' : 'Xác nhận tạo & Nhập hàng vào kho'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 2: RESTOCK EXISTING ================= */}
        {activeTab === 'restock_existing' && (
          <form onSubmit={handleRestockExisting} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tìm & Chọn mặt hàng có sẵn</label>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Gõ mã SKU hoặc tên linh kiện để lọc nhanh..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                size={5}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {filteredSelectableProducts.map((p) => (
                  <option key={p.id} value={p.id} className="py-1 px-1.5 hover:bg-blue-50 cursor-pointer">
                    [{p.sku}] {p.name} ({new Intl.NumberFormat('vi-VN').format(p.price)} đ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số lượng nhập thêm vào kho <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={restockQty}
                onChange={(e) => setRestockQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lý do kiểm toán nhập kho (BR.04) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Nhập bổ sung 10 chiếc từ kho tổng miền Nam..."
                value={restockReason}
                onChange={(e) => setRestockReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition flex items-center space-x-1.5"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang nhập...' : 'Xác nhận nhập thêm vào kho'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
