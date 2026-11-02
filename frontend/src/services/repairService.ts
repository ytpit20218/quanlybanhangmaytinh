// ==========================================
// REPAIR SERVICE: Hardware Diagnostics & Bench Operations
// ==========================================

import { BusinessRulesValidator } from '../domain/validation/businessRules';
import { CreateRepairTicketParams, RepairTicketFactory } from '../factories/repairTicketFactory';
import { Customer, RepairHistory, RepairPartUsed, RepairStatus, RepairTicket, User } from '../types';
import { eventBus } from './eventBus';
import { InventoryService } from './inventoryService';
import { mockDb } from './mockDatabase';

export class RepairService {
  /**
   * Hardware Service Intake (BR.06)
   */
  static intakeDevice(
    customer: Customer,
    deviceName: string,
    serialNumber: string,
    issueDescription: string,
    technician: User,
    diagnosticNotes?: string,
    estimatedCost?: number,
    laborFee?: number
  ): { success: boolean; ticket?: RepairTicket; errors: string[] } {
    // Validate BR.06
    const validation = BusinessRulesValidator.validateRepairTicketIntake(customer.id, serialNumber, issueDescription);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const factoryParams: CreateRepairTicketParams = {
      customer,
      deviceName,
      serialNumber,
      issueDescription,
      technician,
      diagnosticNotes,
      initialEstimatedCost: estimatedCost,
      laborFee,
    };

    const { ticket, initialHistory } = RepairTicketFactory.create(factoryParams, technician);
    mockDb.saveRepairTicket(ticket, initialHistory);

    eventBus.emit({
      type: 'REPAIR_CREATED',
      payload: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        deviceName: ticket.deviceName,
        customerName: customer.name,
      },
    });

    return { success: true, ticket, errors: [] };
  }

  /**
   * Diagnostic Transition (BR.07 & State Pattern)
   */
  static transitionStatus(
    ticketId: string,
    targetStatus: RepairStatus,
    actor: User,
    notes: string
  ): { success: boolean; ticket?: RepairTicket; errors: string[] } {
    const tickets = mockDb.getRepairTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      return { success: false, errors: [`Repair ticket [${ticketId}] not found.`] };
    }

    // Validate transition
    const transitionCheck = BusinessRulesValidator.validateRepairStateTransition(ticket.status, targetStatus);
    if (!transitionCheck.isValid) {
      return { success: false, errors: transitionCheck.errors };
    }

    const previousStatus = ticket.status;
    ticket.status = targetStatus;
    ticket.updatedAt = new Date().toISOString();

    const history: RepairHistory = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      previousStatus,
      newStatus: targetStatus,
      notes: notes || `Bench transition: ${previousStatus} ➔ ${targetStatus}`,
      actorId: actor.id,
      actorName: actor.name,
      timestamp: new Date().toISOString(),
    };

    mockDb.saveRepairTicket(ticket, history);

    eventBus.emit({
      type: 'REPAIR_STATUS_CHANGED',
      payload: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        previousStatus,
        newStatus: targetStatus,
      },
    });

    return { success: true, ticket, errors: [] };
  }

  /**
   * Consume / Issue Replacement Spare Part (BR.08)
   */
  static issueSparePart(
    ticketId: string,
    productId: string,
    quantity: number,
    actor: User,
    notes?: string
  ): { success: boolean; ticket?: RepairTicket; errors: string[] } {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return { success: false, errors: ['Part quantity must be a positive integer.'] };
    }

    const ticket = mockDb.getRepairTickets().find((t) => t.id === ticketId);
    if (!ticket) {
      return { success: false, errors: [`Ticket [${ticketId}] not found.`] };
    }

    const product = mockDb.getProductById(productId);
    const inventory = mockDb.getInventoryByProductId(productId);
    if (!product || !inventory) {
      return { success: false, errors: [`Replacement part [${productId}] not found.`] };
    }

    // Validate BR.08
    const inventoryMap = new Map();
    inventoryMap.set(productId, inventory);
    const br08Check = BusinessRulesValidator.validateSparePartsAvailability(
      [{ productId, quantity, productName: product.name }],
      inventoryMap
    );
    if (!br08Check.isValid) {
      return { success: false, errors: br08Check.errors };
    }

    // Issue stock atomically from warehouse inventory
    const issueRes = InventoryService.issueStock(
      productId,
      quantity,
      `Allocated to repair bench for ticket ${ticket.ticketNumber}: ${notes || 'Replacement part'}`,
      actor,
      ticket.ticketNumber
    );

    if (!issueRes.success) {
      return { success: false, errors: [issueRes.error || 'Failed to issue spare part from inventory.'] };
    }

    const partSubtotal = product.price * quantity;
    const newPart: RepairPartUsed = {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unitPrice: product.price,
      subtotal: partSubtotal,
    };

    ticket.partsUsed.push(newPart);
    ticket.finalCost = (ticket.laborFee || 0) + ticket.partsUsed.reduce((s, p) => s + p.subtotal, 0);
    ticket.updatedAt = new Date().toISOString();

    const history: RepairHistory = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      previousStatus: ticket.status,
      newStatus: ticket.status,
      notes: notes || `Requisitioned ${quantity}x ${product.name} (${product.sku}) into bench ticket.`,
      actorId: actor.id,
      actorName: actor.name,
      partsAdded: [newPart],
      timestamp: new Date().toISOString(),
    };

    mockDb.saveRepairTicket(ticket, history);

    eventBus.emit({
      type: 'PARTS_CONSUMED',
      payload: {
        ticketNumber: ticket.ticketNumber,
        productName: product.name,
        quantity,
      },
    });

    return { success: true, ticket, errors: [] };
  }

  /**
   * Update Diagnostic Notes
   */
  static updateDiagnosticNotes(ticketId: string, notes: string): { success: boolean; errors: string[] } {
    const ticket = mockDb.getRepairTickets().find((t) => t.id === ticketId);
    if (!ticket) return { success: false, errors: ['Ticket not found.'] };

    ticket.diagnosticNotes = notes;
    ticket.updatedAt = new Date().toISOString();
    mockDb.saveRepairTicket(ticket);
    return { success: true, errors: [] };
  }
}
