// ==========================================
// FACTORY PATTERN: Order & Line Item Factory
// ==========================================

import { Customer, Order, OrderItem, PaymentMethod, Product } from '../types';
import { PricingCalculator, PricingResult } from '../strategies/pricing/pricingStrategy';

export interface CreateOrderParams {
  customer: Customer;
  items: Array<{ product: Product; quantity: number }>;
  paymentMethod?: PaymentMethod;
  notes?: string;
  preferredStrategy?: 'standard' | 'vip' | 'bulk';
}

export class OrderFactory {
  private static sequence = 1001;

  static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-4);
    const num = this.sequence++;
    return `ORD-${new Date().getFullYear()}-${num}-${timestamp}`;
  }

  static create(params: CreateOrderParams): { order: Order; items: OrderItem[]; pricing: PricingResult } {
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = this.generateOrderNumber();
    const now = new Date().toISOString();

    const pricingInput = {
      items: params.items.map((i) => ({
        unitPrice: i.product.price,
        quantity: i.quantity,
      })),
      customerTier: params.customer.tier,
    };

    const pricing = PricingCalculator.calculate(pricingInput, params.preferredStrategy);

    const order: Order = {
      id: orderId,
      orderNumber,
      customerId: params.customer.id,
      status: 'pending',
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount,
      totalAmount: pricing.totalAmount,
      paymentStatus: 'unpaid',
      paymentMethod: params.paymentMethod || 'cash',
      pricingStrategyName: pricing.strategyName,
      notes: params.notes,
      createdAt: now,
      updatedAt: now,
    };

    const items: OrderItem[] = params.items.map((i) => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderId,
      productId: i.product.id,
      productName: i.product.name,
      productSku: i.product.sku,
      quantity: i.quantity,
      unitPrice: i.product.price,
      subtotal: i.product.price * i.quantity,
    }));

    return { order, items, pricing };
  }
}
