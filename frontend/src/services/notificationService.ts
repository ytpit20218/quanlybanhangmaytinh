// ==========================================
// NOTIFICATION SERVICE: Event-driven alerts
// ==========================================

import { AppNotification } from '../types';
import { eventBus } from './eventBus';
import { mockDb } from './mockDatabase';

export class NotificationService {
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    eventBus.subscribe('ORDER_CREATED', (e) => {
      this.send({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `New Order Created: ${e.payload.orderNumber}`,
        message: `Order for ${e.payload.customerName} placed for ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(e.payload.totalAmount)}.`,
        severity: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        linkTo: { module: 'orders', id: e.payload.orderId },
      });
    });

    eventBus.subscribe('ORDER_STATUS_CHANGED', (e) => {
      const isCompleted = e.payload.newStatus === 'completed';
      const isCancelled = e.payload.newStatus === 'cancelled';
      this.send({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `Order ${e.payload.orderNumber} Status: ${e.payload.newStatus.toUpperCase()}`,
        message: `Order transitioned from ${e.payload.previousStatus} to ${e.payload.newStatus}.`,
        severity: isCompleted ? 'success' : isCancelled ? 'alert' : 'info',
        timestamp: new Date().toISOString(),
        read: false,
        linkTo: { module: 'orders', id: e.payload.orderId },
      });
    });

    eventBus.subscribe('LOW_STOCK_ALERT', (e) => {
      this.send({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `Low Stock Reorder Alert: ${e.payload.productName}`,
        message: `Available inventory is down to ${e.payload.available} units (threshold: ${e.payload.minAlert}).`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        linkTo: { module: 'inventory', id: e.payload.productId },
      });
    });

    eventBus.subscribe('REPAIR_CREATED', (e) => {
      this.send({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `Repair Intake: ${e.payload.ticketNumber}`,
        message: `New ticket created for ${e.payload.customerName} - ${e.payload.deviceName}.`,
        severity: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        linkTo: { module: 'repairs', id: e.payload.ticketId },
      });
    });

    eventBus.subscribe('REPAIR_STATUS_CHANGED', (e) => {
      this.send({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `Repair Ticket ${e.payload.ticketNumber}`,
        message: `Bench status updated: ${e.payload.previousStatus} ➔ ${e.payload.newStatus}.`,
        severity: e.payload.newStatus === 'repaired' ? 'success' : 'info',
        timestamp: new Date().toISOString(),
        read: false,
        linkTo: { module: 'repairs', id: e.payload.ticketId },
      });
    });

    eventBus.subscribe('PARTS_CONSUMED', (e) => {
      this.send({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `Spare Part Issued: ${e.payload.ticketNumber}`,
        message: `${e.payload.quantity}x ${e.payload.productName} allocated from workshop stock.`,
        severity: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        linkTo: { module: 'repairs' },
      });
    });
  }

  private static send(notif: AppNotification): void {
    mockDb.addNotification(notif);
  }
}
