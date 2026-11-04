// ==========================================
// FACTORY PATTERN: Repair Ticket Factory
// ==========================================

import { Customer, RepairHistory, RepairTicket, User } from '../types';

export interface CreateRepairTicketParams {
  customer: Customer;
  deviceName: string;
  serialNumber: string;
  issueDescription: string;
  technician?: User;
  diagnosticNotes?: string;
  initialEstimatedCost?: number;
  laborFee?: number;
}

export class RepairTicketFactory {
  private static sequence = 2001;

  static generateTicketNumber(): string {
    const timestamp = Date.now().toString().slice(-4);
    const num = this.sequence++;
    return `RPR-${new Date().getFullYear()}-${num}-${timestamp}`;
  }

  static create(params: CreateRepairTicketParams, creator: User): { ticket: RepairTicket; initialHistory: RepairHistory } {
    const ticketId = `rpr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const ticketNumber = this.generateTicketNumber();
    const now = new Date().toISOString();
    const labor = params.laborFee ?? 250000; // default 250,000 VND baseline inspection fee

    const ticket: RepairTicket = {
      id: ticketId,
      ticketNumber,
      customerId: params.customer.id,
      deviceName: params.deviceName,
      serialNumber: params.serialNumber.trim().toUpperCase(),
      issueDescription: params.issueDescription,
      diagnosticNotes: params.diagnosticNotes || 'Initial check-in completed. Visual inspection clear.',
      status: 'intake',
      technicianId: params.technician?.id || creator.id,
      technicianName: params.technician?.name || creator.name,
      estimatedCost: params.initialEstimatedCost || labor,
      laborFee: labor,
      partsUsed: [],
      finalCost: labor,
      createdAt: now,
      updatedAt: now,
    };

    const initialHistory: RepairHistory = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ticketId,
      ticketNumber,
      previousStatus: 'intake',
      newStatus: 'intake',
      notes: `Ticket intake created: ${params.deviceName} (SN: ${ticket.serialNumber}). Reported: "${params.issueDescription}".`,
      actorId: creator.id,
      actorName: creator.name,
      timestamp: now,
    };

    return { ticket, initialHistory };
  }
}
