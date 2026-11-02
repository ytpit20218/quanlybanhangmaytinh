// ==========================================
// STATE PATTERN: Order Lifecycle State Machine
// ==========================================

import { OrderStatus } from '../../types';

export interface OrderState {
  readonly status: OrderStatus;
  canTransitionTo(nextStatus: OrderStatus): boolean;
  canModifyItems(): boolean;
  getAllowedTransitions(): OrderStatus[];
  getDescription(): string;
}

export class PendingOrderState implements OrderState {
  readonly status: OrderStatus = 'pending';

  canTransitionTo(nextStatus: OrderStatus): boolean {
    return nextStatus === 'confirmed' || nextStatus === 'cancelled';
  }

  canModifyItems(): boolean {
    return true;
  }

  getAllowedTransitions(): OrderStatus[] {
    return ['confirmed', 'cancelled'];
  }

  getDescription(): string {
    return 'Order placed, awaiting customer payment verification or inventory commitment.';
  }
}

export class ConfirmedOrderState implements OrderState {
  readonly status: OrderStatus = 'confirmed';

  canTransitionTo(nextStatus: OrderStatus): boolean {
    return nextStatus === 'completed' || nextStatus === 'cancelled';
  }

  canModifyItems(): boolean {
    return false; // Items cannot be modified once stock is reserved and order confirmed
  }

  getAllowedTransitions(): OrderStatus[] {
    return ['completed', 'cancelled'];
  }

  getDescription(): string {
    return 'Stock committed and reserved. Ready for warehouse fulfillment or customer dispatch.';
  }
}

export class CompletedOrderState implements OrderState {
  readonly status: OrderStatus = 'completed';

  canTransitionTo(_nextStatus: OrderStatus): boolean {
    return false; // Terminal state
  }

  canModifyItems(): boolean {
    return false; // Immutable (BR.05)
  }

  getAllowedTransitions(): OrderStatus[] {
    return [];
  }

  getDescription(): string {
    return 'Fulfilled and paid. Stock decremented from on-hand inventory. Transaction completed.';
  }
}

export class CancelledOrderState implements OrderState {
  readonly status: OrderStatus = 'cancelled';

  canTransitionTo(_nextStatus: OrderStatus): boolean {
    return false; // Terminal state
  }

  canModifyItems(): boolean {
    return false; // Immutable (BR.05)
  }

  getAllowedTransitions(): OrderStatus[] {
    return [];
  }

  getDescription(): string {
    return 'Cancelled. Any reserved inventory has been released back to available pool.';
  }
}

export class OrderStateMachine {
  static getState(status: OrderStatus): OrderState {
    switch (status) {
      case 'pending':
        return new PendingOrderState();
      case 'confirmed':
        return new ConfirmedOrderState();
      case 'completed':
        return new CompletedOrderState();
      case 'cancelled':
        return new CancelledOrderState();
      default:
        throw new Error(`Unknown order status: ${status}`);
    }
  }

  static validateTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): { valid: boolean; error?: string } {
    const state = this.getState(currentStatus);
    if (!state.canTransitionTo(nextStatus)) {
      return {
        valid: false,
        error: `Invalid order state transition from [${currentStatus}] to [${nextStatus}]. Allowed transitions: [${state.getAllowedTransitions().join(', ') || 'none (terminal state)'}]`,
      };
    }
    return { valid: true };
  }
}
