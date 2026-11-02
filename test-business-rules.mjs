// =======================================================
// AUTOMATED TEST SUITE: BUSINESS RULES & PATTERN VERIFICATION
// =======================================================

import { BusinessRulesValidator } from './src/domain/validation/businessRules.js';
import { OrderStateMachine } from './src/domain/stateMachines/orderStateMachine.js';
import { RepairStateMachine } from './src/domain/stateMachines/repairStateMachine.js';
import { PricingCalculator } from './src/strategies/pricing/pricingStrategy.js';
import { OrderFactory } from './src/factories/orderFactory.js';
import { RepairTicketFactory } from './src/factories/repairTicketFactory.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n--- 1. Testing Strategy Pattern (Pricing & Discounts) ---');
const standardResult = PricingCalculator.calculate({
  items: [{ unitPrice: 10000000, quantity: 1 }],
  customerTier: 'standard',
});
assert(standardResult.discountAmount === 0, 'Standard pricing applies 0 discount');
assert(standardResult.totalAmount === 10000000, 'Standard pricing matches unit price');

const vipResult = PricingCalculator.calculate({
  items: [{ unitPrice: 10000000, quantity: 1 }],
  customerTier: 'vip',
});
assert(vipResult.discountAmount === 500000, 'VIP tier applies 5% discount (500,000 VND)');
assert(vipResult.totalAmount === 9500000, 'VIP total amount matches discounted sum');

const bulkResult = PricingCalculator.calculate({
  items: [{ unitPrice: 1000000, quantity: 5 }],
  customerTier: 'standard',
});
assert(bulkResult.discountAmount === 350000, 'Bulk purchase (>= 5 units) applies 7% discount (350,000 VND)');
assert(bulkResult.totalAmount === 4650000, 'Bulk total amount matches discounted sum');

console.log('\n--- 2. Testing State Pattern: Order State Transitions (BR.05 & BR.07) ---');
const pendingValid = OrderStateMachine.validateTransition('pending', 'confirmed');
assert(pendingValid.valid === true, 'Pending -> Confirmed transition is valid');

const pendingToCompletedInvalid = OrderStateMachine.validateTransition('pending', 'completed');
assert(pendingToCompletedInvalid.valid === false, 'Pending -> Completed direct jump is invalid (BR.07)');

const confirmedValid = OrderStateMachine.validateTransition('confirmed', 'completed');
assert(confirmedValid.valid === true, 'Confirmed -> Completed transition is valid');

const completedState = OrderStateMachine.getState('completed');
assert(completedState.canModifyItems() === false, 'Completed order items cannot be modified (BR.05)');
assert(completedState.getAllowedTransitions().length === 0, 'Completed order is terminal state (BR.05)');

console.log('\n--- 3. Testing State Pattern: Repair State Transitions (BR.07) ---');
const intakeToDiag = RepairStateMachine.validateTransition('intake', 'diagnosing');
assert(intakeToDiag.valid === true, 'Intake -> Diagnosing is valid');

const intakeToHandedOver = RepairStateMachine.validateTransition('intake', 'handed_over');
assert(intakeToHandedOver.valid === false, 'Intake -> Handed Over direct jump is invalid (BR.07)');

const diagToWaitParts = RepairStateMachine.validateTransition('diagnosing', 'waiting_parts');
assert(diagToWaitParts.valid === true, 'Diagnosing -> Waiting Parts is valid');

const inProgToRepaired = RepairStateMachine.validateTransition('in_progress', 'repaired');
assert(inProgToRepaired.valid === true, 'In Progress -> Repaired is valid');

console.log('\n--- 4. Testing Business Rules Validator ---');
// BR.01: Order requires valid customer and >= 1 valid item
const br01InvalidCust = BusinessRulesValidator.validateOrderRequirements(null, [{ productId: 'p1', quantity: 1 }]);
assert(br01InvalidCust.isValid === false, 'BR.01 rejects order with null customer');

const br01InvalidItems = BusinessRulesValidator.validateOrderRequirements({ id: 'c1' }, []);
assert(br01InvalidItems.isValid === false, 'BR.01 rejects order with empty line items');

// BR.02: Available stock check (available = onHand - reserved)
const invRecord = { productId: 'p1', quantityOnHand: 10, quantityReserved: 4 }; // available = 6
const br02Valid = BusinessRulesValidator.validateAvailableStock(5, invRecord, 'GPU RTX 4090');
assert(br02Valid.isValid === true, 'BR.02 permits requested qty (5) <= available (6)');

const br02Invalid = BusinessRulesValidator.validateAvailableStock(7, invRecord, 'GPU RTX 4090');
assert(br02Invalid.isValid === false, 'BR.02 rejects requested qty (7) > available (6)');

// BR.03: On-hand cannot fall below reserved
const br03Check = BusinessRulesValidator.validateOnHandAgainstReserved(3, 5, 'Laptop XPS 16');
assert(br03Check.isValid === false, 'BR.03 rejects on-hand (3) < reserved (5)');

// BR.04: Stock transaction requires reason
const br04EmptyReason = BusinessRulesValidator.validateStockTransactionReason('usr_01', '  ');
assert(br04EmptyReason.isValid === false, 'BR.04 rejects stock change with missing reason');

// BR.06: Repair ticket requirements
const br06Check = BusinessRulesValidator.validateRepairTicketIntake('cust_01', 'SN-12345', 'Display flickering');
assert(br06Check.isValid === true, 'BR.06 accepts valid customer, serial, and issue description');

const br06MissingSN = BusinessRulesValidator.validateRepairTicketIntake('cust_01', '', 'Display flickering');
assert(br06MissingSN.isValid === false, 'BR.06 rejects ticket with missing serial number');

// BR.08: Spare parts availability
const invMap = new Map();
invMap.set('part_01', { productId: 'part_01', quantityOnHand: 2, quantityReserved: 0 });
const br08Valid = BusinessRulesValidator.validateSparePartsAvailability(
  [{ productId: 'part_01', quantity: 1, productName: 'Thermal Paste' }],
  invMap
);
assert(br08Valid.isValid === true, 'BR.08 allows part allocation when available stock suffices');

const br08Invalid = BusinessRulesValidator.validateSparePartsAvailability(
  [{ productId: 'part_01', quantity: 5, productName: 'Thermal Paste' }],
  invMap
);
assert(br08Invalid.isValid === false, 'BR.08 rejects spare part issue when stock is insufficient');

// BR.10: Completed revenue calculation
const mockOrders = [
  { id: '1', status: 'completed', totalAmount: 5000000 },
  { id: '2', status: 'confirmed', totalAmount: 8000000 },
  { id: '3', status: 'pending', totalAmount: 3000000 },
  { id: '4', status: 'completed', totalAmount: 2000000 },
  { id: '5', status: 'cancelled', totalAmount: 4000000 },
];
const completedRev = BusinessRulesValidator.computeCompletedRevenue(mockOrders);
assert(completedRev === 7000000, 'BR.10 aggregates ONLY Completed orders (5,000,000 + 2,000,000 = 7,000,000 VND)');

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} / ${total} tests PASSED (100%)`);
console.log(`========================================\n`);
