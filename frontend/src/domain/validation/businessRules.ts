// ==========================================
// BUSINESS RULES ENGINE (BR.01 - BR.08, BR.10)
// ==========================================

import { Customer, Inventory, Order, OrderItem, RepairTicket } from '../../types';
import { OrderStateMachine } from '../stateMachines/orderStateMachine';
import { RepairStateMachine } from '../stateMachines/repairStateMachine';

export interface ValidationOutcome {
  isValid: boolean;
  errors: string[];
}

export class BusinessRulesValidator {
  /**
   * BR.01: Orders require a valid customer and at least one valid item.
   */
  static validateOrderRequirements(customer: Customer | null | undefined, items: OrderItem[]): ValidationOutcome {
    const errors: string[] = [];

    if (!customer || !customer.id) {
      errors.push('BR.01: Order requires a valid customer profile.');
    }

    if (!items || items.length === 0) {
      errors.push('BR.01: Order must contain at least one line item.');
    } else {
      items.forEach((item, idx) => {
        if (!item.productId) {
          errors.push(`BR.01: Item #${idx + 1} has no valid product reference.`);
        }
        if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
          errors.push(`BR.01: Item "${item.productName || idx + 1}" quantity must be a positive integer.`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * BR.02: Requested quantities cannot exceed available inventory.
   * quantityAvailable = quantityOnHand - quantityReserved
   */
  static validateAvailableStock(requestedQty: number, inventory: Inventory | undefined, productName: string): ValidationOutcome {
    const errors: string[] = [];
    if (!inventory) {
      errors.push(`BR.02: No inventory record found for product "${productName}".`);
      return { isValid: false, errors };
    }

    const available = inventory.quantityOnHand - inventory.quantityReserved;
    if (requestedQty > available) {
      errors.push(
        `BR.02: Requested quantity (${requestedQty}) exceeds available inventory (${available} available) for "${productName}".`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * BR.03: On-hand inventory cannot fall below reserved inventory.
   */
  static validateOnHandAgainstReserved(proposedOnHand: number, proposedReserved: number, productName?: string): ValidationOutcome {
    const errors: string[] = [];
    if (proposedOnHand < proposedReserved) {
      errors.push(
        `BR.03: Physical on-hand stock (${proposedOnHand}) cannot fall below reserved stock (${proposedReserved}) for "${productName || 'item'}".`
      );
    }
    if (proposedOnHand < 0 || proposedReserved < 0) {
      errors.push(`BR.03: Stock values cannot be negative.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * BR.04: Every stock change must generate an inventory transaction with actor, timestamp, and reason.
   */
  static validateStockTransactionReason(actorId: string, reason: string): ValidationOutcome {
    const errors: string[] = [];
    if (!actorId || actorId.trim().length === 0) {
      errors.push('BR.04: Stock transaction requires an identified actor (user ID).');
    }
    if (!reason || reason.trim().length < 3) {
      errors.push('BR.04: Mandatory audit reason must be provided (minimum 3 characters).');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * BR.05: Completed and Cancelled orders cannot be modified.
   */
  static validateOrderModifiable(order: Order): ValidationOutcome {
    const errors: string[] = [];
    if (order.status === 'completed' || order.status === 'cancelled') {
      errors.push(`BR.05: Order ${order.orderNumber} is [${order.status.toUpperCase()}] and cannot be modified or re-processed.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * BR.06: Repair tickets require a valid customer, serial number, and issue description.
   */
  static validateRepairTicketIntake(
    customerId: string,
    serialNumber: string,
    issueDescription: string
  ): ValidationOutcome {
    const errors: string[] = [];
    if (!customerId || customerId.trim().length === 0) {
      errors.push('BR.06: Repair ticket requires a registered customer ID.');
    }
    if (!serialNumber || serialNumber.trim().length < 3) {
      errors.push('BR.06: Hardware serial number is required (min 3 characters) for equipment tracking.');
    }
    if (!issueDescription || issueDescription.trim().length < 5) {
      errors.push('BR.06: Diagnostic issue description is required (min 5 characters).');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * BR.07: Invalid state transitions must be rejected.
   */
  static validateOrderStateTransition(current: Order['status'], next: Order['status']): ValidationOutcome {
    const check = OrderStateMachine.validateTransition(current, next);
    return {
      isValid: check.valid,
      errors: check.error ? [`BR.07: ${check.error}`] : [],
    };
  }

  static validateRepairStateTransition(current: RepairTicket['status'], next: RepairTicket['status']): ValidationOutcome {
    const check = RepairStateMachine.validateTransition(current, next);
    return {
      isValid: check.valid,
      errors: check.error ? [`BR.07: ${check.error}`] : [],
    };
  }

  /**
   * BR.08: Spare parts cannot be issued when insufficient stock is available.
   */
  static validateSparePartsAvailability(
    parts: Array<{ productId: string; quantity: number; productName: string }>,
    inventoryMap: Map<string, Inventory>
  ): ValidationOutcome {
    const errors: string[] = [];
    for (const part of parts) {
      const inv = inventoryMap.get(part.productId);
      if (!inv) {
        errors.push(`BR.08: Spare part "${part.productName}" not cataloged in warehouse inventory.`);
        continue;
      }
      const available = inv.quantityOnHand - inv.quantityReserved;
      if (part.quantity > available) {
        errors.push(
          `BR.08: Insufficient inventory to issue spare part "${part.productName}". Required: ${part.quantity}, Available: ${available}.`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * BR.10: Revenue only aggregates Completed orders.
   */
  static computeCompletedRevenue(orders: Order[]): number {
    return orders
      .filter((order) => order.status === 'completed')
      .reduce((sum, order) => sum + order.totalAmount, 0);
  }
}
