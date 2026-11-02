// ==========================================
// STRATEGY PATTERN: Pricing & Discount Strategies
// ==========================================

import { CustomerTier } from '../../types';

export interface PricingItem {
  unitPrice: number;
  quantity: number;
}

export interface PricingContextInput {
  items: PricingItem[];
  customerTier: CustomerTier;
  laborFee?: number;
}

export interface PricingResult {
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  strategyName: string;
  description: string;
}

export interface PricingStrategy {
  calculate(input: PricingContextInput): PricingResult;
}

/**
 * Standard Pricing: direct sum of quantities * unit price without discounts
 */
export class StandardPricingStrategy implements PricingStrategy {
  calculate(input: PricingContextInput): PricingResult {
    const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const labor = input.laborFee || 0;
    return {
      subtotal: subtotal + labor,
      discountAmount: 0,
      totalAmount: subtotal + labor,
      strategyName: 'Standard List Price',
      description: 'Standard retail pricing with no discounts applied',
    };
  }
}

/**
 * VIP Tier Pricing: 5% loyalty discount for VIP registered clients
 */
export class VipDiscountStrategy implements PricingStrategy {
  private discountRate = 0.05; // 5%

  calculate(input: PricingContextInput): PricingResult {
    const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const labor = input.laborFee || 0;
    const isVip = input.customerTier === 'vip';
    const discountAmount = isVip ? Math.round(subtotal * this.discountRate) : 0;
    const totalAmount = Math.max(0, subtotal + labor - discountAmount);

    return {
      subtotal: subtotal + labor,
      discountAmount,
      totalAmount,
      strategyName: isVip ? 'VIP Privilege (5%)' : 'Standard List Price',
      description: isVip
        ? '5% member loyalty discount applied across all hardware components'
        : 'VIP status inactive; regular pricing applied',
    };
  }
}

/**
 * Bulk Purchase Pricing: 7% discount for orders containing 5 or more total units
 */
export class BulkDiscountStrategy implements PricingStrategy {
  private discountRate = 0.07; // 7%
  private minQuantity = 5;

  calculate(input: PricingContextInput): PricingResult {
    const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const labor = input.laborFee || 0;
    const totalUnits = input.items.reduce((sum, item) => sum + item.quantity, 0);
    const qualifies = totalUnits >= this.minQuantity;
    const discountAmount = qualifies ? Math.round(subtotal * this.discountRate) : 0;
    const totalAmount = Math.max(0, subtotal + labor - discountAmount);

    return {
      subtotal: subtotal + labor,
      discountAmount,
      totalAmount,
      strategyName: qualifies ? `Bulk Volume Discount (7%)` : 'Standard List Price',
      description: qualifies
        ? `7% bulk procurement discount applied for order volume (${totalUnits} items)`
        : `Order volume (${totalUnits} items) does not meet bulk threshold (${this.minQuantity} items)`,
    };
  }
}

/**
 * Strategy Selector Context
 */
export class PricingCalculator {
  static resolveOptimalStrategy(input: PricingContextInput): PricingStrategy {
    const totalUnits = input.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // If VIP and qualifies for bulk, pick the one yielding higher discount
    if (input.customerTier === 'vip' && totalUnits >= 5) {
      // 7% bulk > 5% VIP
      return new BulkDiscountStrategy();
    }
    if (input.customerTier === 'vip') {
      return new VipDiscountStrategy();
    }
    if (totalUnits >= 5) {
      return new BulkDiscountStrategy();
    }
    return new StandardPricingStrategy();
  }

  static calculate(input: PricingContextInput, preferredStrategy?: 'standard' | 'vip' | 'bulk'): PricingResult {
    let strategy: PricingStrategy;
    if (preferredStrategy === 'vip') {
      strategy = new VipDiscountStrategy();
    } else if (preferredStrategy === 'bulk') {
      strategy = new BulkDiscountStrategy();
    } else if (preferredStrategy === 'standard') {
      strategy = new StandardPricingStrategy();
    } else {
      strategy = this.resolveOptimalStrategy(input);
    }

    return strategy.calculate(input);
  }
}
