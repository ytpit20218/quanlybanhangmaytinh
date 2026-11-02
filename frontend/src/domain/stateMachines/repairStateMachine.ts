// ==========================================
// STATE PATTERN: Repair Ticket Lifecycle State Machine
// ==========================================

import { RepairStatus } from '../../types';

export interface RepairState {
  readonly status: RepairStatus;
  canTransitionTo(nextStatus: RepairStatus): boolean;
  canAddParts(): boolean;
  getAllowedTransitions(): RepairStatus[];
  getDescription(): string;
  getBadgeClass(): string;
}

export class IntakeRepairState implements RepairState {
  readonly status: RepairStatus = 'intake';
  canTransitionTo(next: RepairStatus) { return next === 'diagnosing' || next === 'cancelled'; }
  canAddParts() { return false; }
  getAllowedTransitions() { return ['diagnosing', 'cancelled'] as RepairStatus[]; }
  getDescription() { return 'Device received from customer. Visual inspection & hardware serial verified.'; }
  getBadgeClass() { return 'bg-slate-100 text-slate-700 border-slate-300'; }
}

export class DiagnosingRepairState implements RepairState {
  readonly status: RepairStatus = 'diagnosing';
  canTransitionTo(next: RepairStatus) { return next === 'waiting_parts' || next === 'in_progress' || next === 'cancelled'; }
  canAddParts() { return true; }
  getAllowedTransitions() { return ['waiting_parts', 'in_progress', 'cancelled'] as RepairStatus[]; }
  getDescription() { return 'Technician bench examination in progress. Diagnostic logs & tests running.'; }
  getBadgeClass() { return 'bg-cyan-100 text-cyan-800 border-cyan-300'; }
}

export class WaitingPartsRepairState implements RepairState {
  readonly status: RepairStatus = 'waiting_parts';
  canTransitionTo(next: RepairStatus) { return next === 'in_progress' || next === 'cancelled'; }
  canAddParts() { return true; }
  getAllowedTransitions() { return ['in_progress', 'cancelled'] as RepairStatus[]; }
  getDescription() { return 'Awaiting replacement components from warehouse inventory or procurement.'; }
  getBadgeClass() { return 'bg-amber-100 text-amber-800 border-amber-300'; }
}

export class InProgressRepairState implements RepairState {
  readonly status: RepairStatus = 'in_progress';
  canTransitionTo(next: RepairStatus) { return next === 'repaired' || next === 'cancelled'; }
  canAddParts() { return true; }
  getAllowedTransitions() { return ['repaired', 'cancelled'] as RepairStatus[]; }
  getDescription() { return 'Component replacement, soldering, or firmware flashing actively underway.'; }
  getBadgeClass() { return 'bg-blue-100 text-blue-800 border-blue-300'; }
}

export class RepairedRepairState implements RepairState {
  readonly status: RepairStatus = 'repaired';
  canTransitionTo(next: RepairStatus) { return next === 'handed_over' || next === 'cancelled'; }
  canAddParts() { return false; }
  getAllowedTransitions() { return ['handed_over', 'cancelled'] as RepairStatus[]; }
  getDescription() { return 'Repair completed and hardware bench stress-tested. Ready for customer pickup.'; }
  getBadgeClass() { return 'bg-emerald-100 text-emerald-800 border-emerald-300'; }
}

export class HandedOverRepairState implements RepairState {
  readonly status: RepairStatus = 'handed_over';
  canTransitionTo(_next: RepairStatus) { return false; } // Terminal
  canAddParts() { return false; }
  getAllowedTransitions() { return [] as RepairStatus[]; }
  getDescription() { return 'Hardware returned to customer. Payment and warranty coverage documented.'; }
  getBadgeClass() { return 'bg-purple-100 text-purple-800 border-purple-300'; }
}

export class CancelledRepairState implements RepairState {
  readonly status: RepairStatus = 'cancelled';
  canTransitionTo(_next: RepairStatus) { return false; } // Terminal
  canAddParts() { return false; }
  getAllowedTransitions() { return [] as RepairStatus[]; }
  getDescription() { return 'Repair aborted or customer declined estimate. Device returned unserviced.'; }
  getBadgeClass() { return 'bg-rose-100 text-rose-800 border-rose-300'; }
}

export class RepairStateMachine {
  static getState(status: RepairStatus): RepairState {
    switch (status) {
      case 'intake': return new IntakeRepairState();
      case 'diagnosing': return new DiagnosingRepairState();
      case 'waiting_parts': return new WaitingPartsRepairState();
      case 'in_progress': return new InProgressRepairState();
      case 'repaired': return new RepairedRepairState();
      case 'handed_over': return new HandedOverRepairState();
      case 'cancelled': return new CancelledRepairState();
      default: throw new Error(`Unknown repair status: ${status}`);
    }
  }

  static validateTransition(currentStatus: RepairStatus, nextStatus: RepairStatus): { valid: boolean; error?: string } {
    const state = this.getState(currentStatus);
    if (!state.canTransitionTo(nextStatus)) {
      return {
        valid: false,
        error: `Invalid repair status transition from [${currentStatus}] to [${nextStatus}]. Permitted: [${state.getAllowedTransitions().join(', ') || 'terminal state'}]`,
      };
    }
    return { valid: true };
  }
}
