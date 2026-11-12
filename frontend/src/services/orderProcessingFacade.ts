// ==========================================
// FACADE PATTERN: Order Processing Facade
// ==========================================

import { BusinessRulesValidator } from '../domain/validation/businessRules';
import { CreateOrderParams, OrderFactory } from '../factories/orderFactory';
import { Customer, Order, OrderItem, OrderStatus, Product, User } from '../types';
import { eventBus } from './eventBus';
import { InventoryService } from './inventoryService';
import { mockDb } from './mockDatabase';

export interface PlaceOrderInput {
  customer: Customer;
  items: Array<{ product: Product; quantity: number }>;
  paymentMethod?: 'cash' | 'bank_transfer' | 'card';
  notes?: string;
  actor: User;
  autoConfirm?: boolean; // POS counter can auto-confirm and complete
}

export interface OrderOperationResult {
  success: boolean;
  order?: Order;
  items?: OrderItem[];
  errors: string[];
}

export class OrderProcessingFacade {
  /**
   * Primary entry point for order placement
   */
  static placeOrder(input: PlaceOrderInput): OrderOperationResult {
    // 1. Validate customer and items existence (BR.01)
    const dummyItems = input.items.map((i) => ({
      id: '',
      orderId: '',
      productId: i.product.id,
      productName: i.product.name,
      productSku: i.product.sku,
      quantity: i.quantity,
      unitPrice: i.product.price,
      subtotal: i.product.price * i.quantity,
    }));

    const reqCheck = BusinessRulesValidator.validateOrderRequirements(input.customer, dummyItems);
    if (!reqCheck.isValid) {
      return { success: false, errors: reqCheck.errors };
    }

    // 2. Validate stock availability (BR.02)
    const stockErrors: string[] = [];
    for (const item of input.items) {
      const inv = mockDb.getInventoryByProductId(item.product.id);
      const stockCheck = BusinessRulesValidator.validateAvailableStock(item.quantity, inv, item.product.name);
      if (!stockCheck.isValid) {
        stockErrors.push(...stockCheck.errors);
      }
    }

    if (stockErrors.length > 0) {
      return { success: false, errors: stockErrors };
    }

    // 3. Create order and line items via Factory
    const factoryParams: CreateOrderParams = {
      customer: input.customer,
      items: input.items,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
    };

    const { order, items } = OrderFactory.create(factoryParams);

    // 4. Save to database
    mockDb.saveOrder(order, items);

    // 5. Broadcast creation event
    eventBus.emit({
      type: 'ORDER_CREATED',
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        customerName: input.customer.name,
      },
    });

    // If POS auto-confirm is flagged, transition immediately to confirmed
    if (input.autoConfirm) {
      const confirmResult = this.transitionStatus(order.id, 'confirmed', input.actor);
      if (!confirmResult.success) {
        mockDb.removeOrder(order.id);
        return { success: false, errors: confirmResult.errors };
      }
      return { success: true, order: confirmResult.order, items, errors: [] };
    }

    return {
      success: true,
      order,
      items,
      errors: [],
    };
  }

  /**
   * Unified Order Status Transition Controller (State Pattern & Business Rules)
   */
  static transitionStatus(
    orderId: string,
    targetStatus: OrderStatus,
    actor: User,
    cancellationReason?: string
  ): OrderOperationResult {
    const orders = mockDb.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, errors: [`Order with ID [${orderId}] does not exist.`] };
    }

    const items = mockDb.getOrderItems(orderId);

    // Check if order is already terminal (BR.05)
    const modifiableCheck = BusinessRulesValidator.validateOrderModifiable(order);
    if (!modifiableCheck.isValid) {
      return { success: false, errors: modifiableCheck.errors };
    }

    // Validate state transition validity (BR.07)
    const transitionCheck = BusinessRulesValidator.validateOrderStateTransition(order.status, targetStatus);
    if (!transitionCheck.isValid) {
      return { success: false, errors: transitionCheck.errors };
    }

    const previousStatus = order.status;

    // --- EXECUTE ACTIONS ASSOCIATED WITH STATE CHANGE ---

    // 1. PENDING -> CONFIRMED: Reserve inventory for all line items
    if (previousStatus === 'pending' && targetStatus === 'confirmed') {
      const reservedItems: typeof items = [];
      for (const item of items) {
        const reserveRes = InventoryService.reserveStock(item.productId, item.quantity, order.orderNumber, actor);
        if (!reserveRes.success) {
          // Roll back any reservations made earlier in this loop so partial stock stays consistent
          for (const reserved of reservedItems) {
            InventoryService.releaseStock(reserved.productId, reserved.quantity, order.orderNumber, actor);
          }
          return { success: false, errors: [reserveRes.error || 'Failed to reserve stock.'] };
        }
        reservedItems.push(item);
      }
    }

    // 2. CONFIRMED -> COMPLETED: Fulfill and decrement reserved & on-hand inventory
    if (previousStatus === 'confirmed' && targetStatus === 'completed') {
      for (const item of items) {
        const fulfillRes = InventoryService.fulfillReservedStock(item.productId, item.quantity, order.orderNumber, actor);
        if (!fulfillRes.success) {
          return { success: false, errors: [fulfillRes.error || 'Failed to issue reserved stock.'] };
        }
      }
      order.paymentStatus = 'paid';
    }

    // 3. CONFIRMED -> CANCELLED: Release reserved inventory back to available pool
    if (previousStatus === 'confirmed' && targetStatus === 'cancelled') {
      for (const item of items) {
        InventoryService.releaseStock(item.productId, item.quantity, order.orderNumber, actor);
      }
    }

    // Apply status update
    order.status = targetStatus;
    order.updatedAt = new Date().toISOString();
    if (cancellationReason && targetStatus === 'cancelled') {
      order.notes = order.notes ? `${order.notes} | Cancel reason: ${cancellationReason}` : `Cancel reason: ${cancellationReason}`;
    }

    mockDb.updateOrderStatus(order.id, targetStatus);

    // Broadcast state transition event
    eventBus.emit({
      type: 'ORDER_STATUS_CHANGED',
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        previousStatus,
        newStatus: targetStatus,
      },
    });

    return {
      success: true,
      order,
      items,
      errors: [],
    };
  }
}
