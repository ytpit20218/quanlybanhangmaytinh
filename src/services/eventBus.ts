// ==========================================
// OBSERVER PATTERN: Central Reactive Event Bus
// ==========================================

export type AppEvent =
  | { type: 'ORDER_CREATED'; payload: { orderId: string; orderNumber: string; totalAmount: number; customerName: string } }
  | { type: 'ORDER_STATUS_CHANGED'; payload: { orderId: string; orderNumber: string; previousStatus: string; newStatus: string } }
  | { type: 'STOCK_UPDATED'; payload: { productId: string; productName: string; newOnHand: number; newReserved: number; available: number } }
  | { type: 'LOW_STOCK_ALERT'; payload: { productId: string; productName: string; available: number; minAlert: number } }
  | { type: 'REPAIR_CREATED'; payload: { ticketId: string; ticketNumber: string; deviceName: string; customerName: string } }
  | { type: 'REPAIR_STATUS_CHANGED'; payload: { ticketId: string; ticketNumber: string; previousStatus: string; newStatus: string } }
  | { type: 'PARTS_CONSUMED'; payload: { ticketNumber: string; productName: string; quantity: number } };

export type EventByType<K extends AppEvent['type']> = Extract<AppEvent, { type: K }>;

class EventBus {
  private listeners: Map<string, Set<(event: any) => void>> = new Map();

  subscribe<K extends AppEvent['type']>(eventType: K, listener: (event: EventByType<K>) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  emit<T extends AppEvent>(event: T): void {
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (err) {
          console.error(`Error in event handler for ${event.type}:`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();
