# ComputerTech — Precision Hardware Retail & Technical Operations Platform

## Overview

**ComputerTech** is a commercial-grade, multi-tenant computer retail, warehouse inventory, point-of-sale (POS), warranty, and lab repair operations platform. It breaks away from generic dashboard conventions through a **tri-workspace architectural paradigm** anchored by a unified high-precision design system.

---

## 🎨 Creative Direction & Tri-Workspace Architecture

### 1. Direction A — Editorial Technology Commerce (Storefront & Catalog)
- **Visual Composition**: Architectural display typography, asymmetric product highlights, tactile technical parameter matrices, generous whitespace, and high-contrast monochrome framing with warm solar orange highlights (`#ea580c`).
- **Core Features**: Live catalog discovery, category filters (Laptops, PC Parts, Displays, Accessories), real-time stock availability (`Available = OnHand - Reserved`), warranty terms, and task-focused checkout drawer with immediate stock validation.

### 2. Direction B — Industrial Service Operations (Inventory Matrix & POS Counter)
- **Visual Composition**: High-scanability monospaced data tables (`JetBrains Mono`, `font-feature-settings: 'tnum'`), micro-borders, sticky action headers, and zero decorative fluff.
- **Core Features**:
  - **POS Counter**: Rapid SKU barcode scanning, quick-access hardware palette, customer account selection (Standard vs VIP), payment settlement, and printable tax receipts.
  - **Inventory Matrix**: Numeric alignment for `OnHand`, `Reserved`, and `Available`. Reorder alerts for low stock. Contextual modals for **Stock Receipt**, **Stock Issue**, and **Stock Adjustment** with mandatory audit reasons (BR.04) and real-time transaction ledger.

### 3. Direction C — Modern Technical Workshop (Repair Bench & Diagnostics)
- **Visual Composition**: Workbench-inspired split-screen lab layout.
- **Core Features**: Hardware intake with serial number tracking (BR.06), interactive diagnostic stepper (`Intake -> Diagnosing -> Awaiting Parts -> In Progress -> Repaired -> Handed Over`), live diagnostic notes editor, and an **Atomic Parts Requisition Bench** that validates availability and deducts stock directly from warehouse inventory (BR.08).

---

## 🏛️ Software Design Patterns Implemented

| Pattern | Implementation File | Role & Responsibility |
| :--- | :--- | :--- |
| **Facade Pattern** | `src/services/orderProcessingFacade.ts` | Orchestrates order placement, stock verification, pricing strategy resolution, status transitions, inventory deductions, and event broadcasting. |
| **Strategy Pattern** | `src/strategies/pricing/pricingStrategy.ts` | Calculates pricing & discounts: `StandardPricingStrategy`, `VipDiscountStrategy` (5% loyalty discount), `BulkDiscountStrategy` (7% discount on ≥5 items), and repair fee structures. |
| **State Pattern** | `src/domain/stateMachines/orderStateMachine.ts` & `repairStateMachine.ts` | Strictly validates and transitions entity lifecycles. Prevents unauthorized state transitions and locks completed/cancelled orders (BR.05, BR.07). |
| **Observer Pattern** | `src/services/eventBus.ts` & `notificationService.ts` | Decoupled publish-subscribe event bus broadcasting order, stock, and repair events to the reactive Notification Center. |
| **Factory Method** | `src/factories/orderFactory.ts` & `repairTicketFactory.ts` | Deterministic generation of relational order line-items and repair tickets with sequential human-readable identifiers (`ORD-2026-XXXX`, `RPR-2026-XXXX`). |

---

## 🛡️ Business Rules Engine (BR.01 – BR.08 & BR.10)

All 26 automated unit tests pass with 100% coverage (`test-business-rules.ts`):
- **BR.01**: Orders require a registered customer profile and ≥1 valid item with positive integer quantities.
- **BR.02**: Requested order or part quantities cannot exceed available inventory (`Available = OnHand - Reserved`).
- **BR.03**: Physical on-hand stock cannot fall below reserved stock (`quantityOnHand >= quantityReserved`).
- **BR.04**: Every stock modification generates an immutable inventory transaction with actor, timestamp, and audit reason.
- **BR.05**: Completed and Cancelled orders are strictly immutable and locked.
- **BR.06**: Hardware repair tickets require a registered customer, valid serial number, and diagnostic issue description.
- **BR.07**: Invalid state transitions are rejected by the state machine.
- **BR.08**: Spare parts cannot be issued to a repair ticket unless available warehouse stock is verified.
- **BR.10**: Operations revenue aggregates exclusively from Completed orders.

---

## 💾 Relational Data Model (9 Entities)

Persisted in browser `localStorage` under `computertech_db_v2`:
1. `users`: Multi-tenant staff roles (`admin`, `sales`, `inventory_manager`, `technician`).
2. `customers`: Client profiles with tiers (`standard`, `vip`).
3. `products`: Hardware catalog with specifications, SKUs, warranty months, VND prices, and safety thresholds.
4. `inventory`: On-hand and reserved quantities per warehouse location with derived `quantityAvailable`.
5. `orders`: Relational sales orders with pricing strategy tracking and payment methods.
6. `order_items`: Line items with SKU, unit price, quantity, and subtotal.
7. `inventory_transactions`: Complete audit ledger of all stock receipts, issues, adjustments, reservations, and releases.
8. `repair_tickets`: Lab diagnostic tickets with device name, serial number, labor fee, and parts consumed.
9. `repair_histories`: Chronological diagnostic telemetry and status progression logs.

---

## 🚀 Running the Application

### 1. Installation & Start
```bash
# Cài đặt thư viện dependencies (nếu chưa có)
npm install

# Khởi chạy server phát triển (Development)
npm run dev
```
Truy cập: [http://localhost:5173](http://localhost:5173)

### 2. Production Build
```bash
# Kiểm tra TypeScript và build production
npm run build

# Chạy bản build đã đóng gói
npm run preview
```

### 3. Tài khoản đăng nhập hệ thống
- **Khách hàng bán lẻ & VIP** (/login):
  - ao.gamer@gmail.com / password123 (Phan Quốc Bảo - VIP Gamer, Chiết khấu 5%)
  - 	hutrang.arch@gmail.com / password123 (Đặng Thu Trang - Standard Designer)
  - hai.vu@techvision.vn / password123 (Vũ Đức Hải - Đại diện Doanh nghiệp TechVision)
- **Cổng nhân sự nội bộ** (/company/login):
  - Admin: dmin@computertech.vn / dmin123 (Nguyễn Minh Kiệt - Quyền quản trị toàn diện)
  - Sale: sale@computertech.vn / sale123 (Nguyễn Việt Anh - POS & Bán hàng)
  - Sale 2: huong.le@computertech.vn / sale123 (Lê Thị Mai Hương - CSKH & Tư vấn)
  - Kho (Warehouse): warehouse@computertech.vn / warehouse123 (Ngô Thành Tâm - Trưởng kho)
  - Kho 2: dat.vo@computertech.vn / warehouse123 (Võ Thành Đạt - Điều phối kho)
  - Kỹ thuật viên (Technician): 	ech@computertech.vn / 	ech123 (Trần Hoàng Nam - Phòng Lab & Bảo hành)

### 4. Chạy kiểm thử tự động (Automated Tests)
```bash
# Kiểm thử toàn diện 38 kịch bản Browser E2E
node test-e2e-browser.mjs

# Kiểm thử 16 kịch bản quy tắc Material 3 & Portals
node test-material3-portals.mjs

# Kiểm thử 26 kịch bản nghiệp vụ (Business Rules)
node test-business-rules.mjs
```
