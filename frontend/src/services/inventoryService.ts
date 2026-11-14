// ==========================================
// INVENTORY SERVICE: Stock & Audit Ledger
// ==========================================

import { BusinessRulesValidator } from '../domain/validation/businessRules';
import { Inventory, InventoryTransaction, Product, ProductCategory, User } from '../types';
import { eventBus } from './eventBus';
import { mockDb } from './mockDatabase';

export class InventoryService {
  /**
   * Helper to derive available stock
   */
  static getAvailableQuantity(inventory: Inventory): number {
    return Math.max(0, inventory.quantityOnHand - inventory.quantityReserved);
  }

  /**
   * Stock Intake / Receipt (increases onHand)
   */
  static receiveStock(
    productId: string,
    quantity: number,
    reason: string,
    actor: User,
    referenceId?: string
  ): { success: boolean; error?: string } {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return { success: false, error: 'Received quantity must be a positive integer.' };
    }

    const reasonValidation = BusinessRulesValidator.validateStockTransactionReason(actor.id, reason);
    if (!reasonValidation.isValid) {
      return { success: false, error: reasonValidation.errors.join(' ') };
    }

    const current = mockDb.getInventoryByProductId(productId);
    const product = mockDb.getProductById(productId);
    if (!current || !product) {
      return { success: false, error: `Product [${productId}] not found in inventory.` };
    }

    const prevOnHand = current.quantityOnHand;
    const newOnHand = prevOnHand + quantity;

    const updated: Inventory = {
      ...current,
      quantityOnHand: newOnHand,
      lastUpdated: new Date().toISOString(),
    };

    mockDb.updateInventoryRecord(updated);

    const tx: InventoryTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      type: 'receipt',
      quantity,
      previousOnHand: prevOnHand,
      newOnHand,
      previousReserved: current.quantityReserved,
      newReserved: current.quantityReserved,
      reason,
      actorId: actor.id,
      actorName: actor.name,
      referenceType: 'manual_adjustment',
      referenceId: referenceId || 'RECEIPT-MANUAL',
      createdAt: new Date().toISOString(),
    };

    mockDb.addInventoryTransaction(tx);

    eventBus.emit({
      type: 'STOCK_UPDATED',
      payload: {
        productId,
        productName: product.name,
        newOnHand,
        newReserved: current.quantityReserved,
        available: newOnHand - current.quantityReserved,
      },
    });

    return { success: true };
  }

  /**
   * Add a brand new hardware product and initialize stock into inventory
   */
  static addNewProductStock(
    productData: {
      name: string;
      sku: string;
      category: ProductCategory;
      price: number;
      cost: number;
      minStockAlert: number;
      warrantyMonths: number;
      location?: string;
      initialStock: number;
      image?: string;
      specs?: Record<string, string>;
      description?: string;
    },
    reason: string,
    actor: User
  ): { success: boolean; error?: string; product?: Product } {
    if (!productData.name || productData.name.trim().length < 3) {
      return { success: false, error: 'Tên sản phẩm phải có ít nhất 3 ký tự.' };
    }
    if (!productData.sku || productData.sku.trim().length < 3) {
      return { success: false, error: 'Mã SKU phải có ít nhất 3 ký tự.' };
    }
    const reasonValidation = BusinessRulesValidator.validateStockTransactionReason(actor.id, reason);
    if (!reasonValidation.isValid) {
      return { success: false, error: reasonValidation.errors.join(' ') };
    }

    const skuUpper = productData.sku.trim().toUpperCase();
    const existing = mockDb.getProducts().find((p) => p.sku.toUpperCase() === skuUpper);
    if (existing) {
      return { success: false, error: `Mã SKU [${skuUpper}] đã tồn tại trong danh mục.` };
    }

    const productId = `prod_${Date.now()}`;
    const newProduct: Product = {
      id: productId,
      sku: skuUpper,
      name: productData.name.trim(),
      category: productData.category,
      price: Number(productData.price),
      cost: Number(productData.cost),
      warrantyMonths: Number(productData.warrantyMonths) || 24,
      minStockAlert: Number(productData.minStockAlert) || 3,
      description:
        productData.description?.trim() ||
        `Sản phẩm chính hãng ${productData.name.trim()}, bảo hành ${productData.warrantyMonths || 24} tháng 1-đổi-1.`,
      image:
        productData.image?.trim() ||
        'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
      specs: productData.specs || {
        'Bảo hành': `${productData.warrantyMonths || 24} Tháng`,
        'Tình trạng': 'Mới 100% nguyên niêm phong',
      },
    };

    const initialStock = Math.max(0, Number(productData.initialStock) || 0);
    const location = productData.location?.trim() || 'KHO-TONG-A1';

    mockDb.addProduct(newProduct, initialStock, location, actor.name);

    eventBus.emit({
      type: 'STOCK_UPDATED',
      payload: {
        productId,
        productName: newProduct.name,
        newOnHand: initialStock,
        newReserved: 0,
        available: initialStock,
      },
    });

    return { success: true, product: newProduct };
  }

  /**
   * Stock Issue / Dispatch (decreases onHand directly)
   */
  static issueStock(
    productId: string,
    quantity: number,
    reason: string,
    actor: User,
    referenceId?: string
  ): { success: boolean; error?: string } {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return { success: false, error: 'Issued quantity must be a positive integer.' };
    }

    const reasonValidation = BusinessRulesValidator.validateStockTransactionReason(actor.id, reason);
    if (!reasonValidation.isValid) {
      return { success: false, error: reasonValidation.errors.join(' ') };
    }

    const current = mockDb.getInventoryByProductId(productId);
    const product = mockDb.getProductById(productId);
    if (!current || !product) {
      return { success: false, error: `Product [${productId}] not found in inventory.` };
    }

    const prevOnHand = current.quantityOnHand;
    const newOnHand = prevOnHand - quantity;

    // BR.03: On-hand cannot fall below reserved
    const br03Check = BusinessRulesValidator.validateOnHandAgainstReserved(newOnHand, current.quantityReserved, product.name);
    if (!br03Check.isValid) {
      return { success: false, error: br03Check.errors.join(' ') };
    }

    const updated: Inventory = {
      ...current,
      quantityOnHand: newOnHand,
      lastUpdated: new Date().toISOString(),
    };

    mockDb.updateInventoryRecord(updated);

    const tx: InventoryTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      type: 'issue',
      quantity,
      previousOnHand: prevOnHand,
      newOnHand,
      previousReserved: current.quantityReserved,
      newReserved: current.quantityReserved,
      reason,
      actorId: actor.id,
      actorName: actor.name,
      referenceType: 'manual_adjustment',
      referenceId: referenceId || 'ISSUE-MANUAL',
      createdAt: new Date().toISOString(),
    };

    mockDb.addInventoryTransaction(tx);

    const available = newOnHand - current.quantityReserved;
    eventBus.emit({
      type: 'STOCK_UPDATED',
      payload: {
        productId,
        productName: product.name,
        newOnHand,
        newReserved: current.quantityReserved,
        available,
      },
    });

    if (available <= product.minStockAlert) {
      eventBus.emit({
        type: 'LOW_STOCK_ALERT',
        payload: {
          productId,
          productName: product.name,
          available,
          minAlert: product.minStockAlert,
        },
      });
    }

    return { success: true };
  }

  /**
   * Stock Adjustment (sets absolute on-hand quantity with reconciliation reason)
   */
  static adjustStock(
    productId: string,
    newOnHand: number,
    reason: string,
    actor: User
  ): { success: boolean; error?: string } {
    if (newOnHand < 0 || !Number.isInteger(newOnHand)) {
      return { success: false, error: 'Adjusted quantity must be a non-negative integer.' };
    }

    const reasonValidation = BusinessRulesValidator.validateStockTransactionReason(actor.id, reason);
    if (!reasonValidation.isValid) {
      return { success: false, error: reasonValidation.errors.join(' ') };
    }

    const current = mockDb.getInventoryByProductId(productId);
    const product = mockDb.getProductById(productId);
    if (!current || !product) {
      return { success: false, error: `Product [${productId}] not found in inventory.` };
    }

    // BR.03: Proposed on-hand cannot fall below existing reserved
    const br03Check = BusinessRulesValidator.validateOnHandAgainstReserved(newOnHand, current.quantityReserved, product.name);
    if (!br03Check.isValid) {
      return { success: false, error: br03Check.errors.join(' ') };
    }

    const prevOnHand = current.quantityOnHand;
    const diff = newOnHand - prevOnHand;

    const updated: Inventory = {
      ...current,
      quantityOnHand: newOnHand,
      lastUpdated: new Date().toISOString(),
    };

    mockDb.updateInventoryRecord(updated);

    const tx: InventoryTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      type: 'adjustment',
      quantity: Math.abs(diff),
      previousOnHand: prevOnHand,
      newOnHand,
      previousReserved: current.quantityReserved,
      newReserved: current.quantityReserved,
      reason: `Audit adjustment: ${reason} (Diff: ${diff > 0 ? '+' : ''}${diff})`,
      actorId: actor.id,
      actorName: actor.name,
      referenceType: 'manual_adjustment',
      referenceId: 'AUDIT-ADJUST',
      createdAt: new Date().toISOString(),
    };

    mockDb.addInventoryTransaction(tx);

    const available = newOnHand - current.quantityReserved;
    eventBus.emit({
      type: 'STOCK_UPDATED',
      payload: {
        productId,
        productName: product.name,
        newOnHand,
        newReserved: current.quantityReserved,
        available,
      },
    });

    if (available <= product.minStockAlert) {
      eventBus.emit({
        type: 'LOW_STOCK_ALERT',
        payload: {
          productId,
          productName: product.name,
          available,
          minAlert: product.minStockAlert,
        },
      });
    }

    return { success: true };
  }

  /**
   * Internal Reserve Stock (for Confirmed orders)
   */
  static reserveStock(
    productId: string,
    quantity: number,
    orderNumber: string,
    actor: User
  ): { success: boolean; error?: string } {
    const current = mockDb.getInventoryByProductId(productId);
    const product = mockDb.getProductById(productId);
    if (!current || !product) {
      return { success: false, error: `Product [${productId}] not found.` };
    }

    const available = current.quantityOnHand - current.quantityReserved;
    if (quantity > available) {
      return {
        success: false,
        error: `BR.02: Cannot reserve ${quantity} units for "${product.name}". Only ${available} available.`,
      };
    }

    const prevReserved = current.quantityReserved;
    const newReserved = prevReserved + quantity;

    const updated: Inventory = {
      ...current,
      quantityReserved: newReserved,
      lastUpdated: new Date().toISOString(),
    };
    mockDb.updateInventoryRecord(updated);

    const tx: InventoryTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      type: 'reserve',
      quantity,
      previousOnHand: current.quantityOnHand,
      newOnHand: current.quantityOnHand,
      previousReserved: prevReserved,
      newReserved,
      reason: `Inventory reservation for confirmed order ${orderNumber}`,
      actorId: actor.id,
      actorName: actor.name,
      referenceType: 'order',
      referenceId: orderNumber,
      createdAt: new Date().toISOString(),
    };
    mockDb.addInventoryTransaction(tx);

    const newAvailable = current.quantityOnHand - newReserved;
    if (newAvailable <= product.minStockAlert) {
      eventBus.emit({
        type: 'LOW_STOCK_ALERT',
        payload: {
          productId,
          productName: product.name,
          available: newAvailable,
          minAlert: product.minStockAlert,
        },
      });
    }

    return { success: true };
  }

  /**
   * Internal Release Stock (when Confirmed order is cancelled)
   */
  static releaseStock(
    productId: string,
    quantity: number,
    orderNumber: string,
    actor: User
  ): { success: boolean; error?: string } {
    const current = mockDb.getInventoryByProductId(productId);
    if (!current) return { success: false, error: 'Product not found.' };

    const prevReserved = current.quantityReserved;
    const newReserved = Math.max(0, prevReserved - quantity);

    const updated: Inventory = {
      ...current,
      quantityReserved: newReserved,
      lastUpdated: new Date().toISOString(),
    };
    mockDb.updateInventoryRecord(updated);

    const tx: InventoryTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      type: 'release',
      quantity,
      previousOnHand: current.quantityOnHand,
      newOnHand: current.quantityOnHand,
      previousReserved: prevReserved,
      newReserved,
      reason: `Release reserved inventory due to cancellation of ${orderNumber}`,
      actorId: actor.id,
      actorName: actor.name,
      referenceType: 'order',
      referenceId: orderNumber,
      createdAt: new Date().toISOString(),
    };
    mockDb.addInventoryTransaction(tx);

    return { success: true };
  }

  /**
   * Internal Deduct Stock (when order transitions from Confirmed to Completed)
   * Decrements both onHand and reserved, keeping available balance intact.
   */
  static fulfillReservedStock(
    productId: string,
    quantity: number,
    orderNumber: string,
    actor: User
  ): { success: boolean; error?: string } {
    const current = mockDb.getInventoryByProductId(productId);
    if (!current) return { success: false, error: 'Product not found.' };

    const prevOnHand = current.quantityOnHand;
    const prevReserved = current.quantityReserved;
    const newOnHand = Math.max(0, prevOnHand - quantity);
    const newReserved = Math.max(0, prevReserved - quantity);

    const updated: Inventory = {
      ...current,
      quantityOnHand: newOnHand,
      quantityReserved: newReserved,
      lastUpdated: new Date().toISOString(),
    };
    mockDb.updateInventoryRecord(updated);

    const tx: InventoryTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      type: 'issue',
      quantity,
      previousOnHand: prevOnHand,
      newOnHand,
      previousReserved: prevReserved,
      newReserved,
      reason: `Order fulfillment dispatch for ${orderNumber}`,
      actorId: actor.id,
      actorName: actor.name,
      referenceType: 'order',
      referenceId: orderNumber,
      createdAt: new Date().toISOString(),
    };
    mockDb.addInventoryTransaction(tx);

    return { success: true };
  }
}
