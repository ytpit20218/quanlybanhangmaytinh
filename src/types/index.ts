// ==========================================
// COMPUTERTECH DOMAIN & RELATIONAL ENTITY TYPES
// ==========================================

export type UserRole = 'customer' | 'admin' | 'sale' | 'warehouse' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  active: boolean; // Requirement: account active verification
  customerId?: string; // For customer accounts, links to their Customer profile
  phone?: string;
}

export type CustomerTier = 'standard' | 'vip';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tier: CustomerTier;
  createdAt: string;
}

export type ProductCategory = 
  | 'laptops' 
  | 'pc_gaming' 
  | 'pc_parts' 
  | 'displays' 
  | 'gaming_gear' 
  | 'accessories' 
  | 'networking' 
  | string;

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  subCategory?: string; // 'cpu' | 'ram' | 'vga' | 'mainboard' | 'ssd_hdd' | 'case' | 'cooling' | 'psu'
  price: number; // in VND
  cost: number;  // in VND
  warrantyMonths: number;
  specs: Record<string, string>;
  image: string;
  minStockAlert: number;
  description: string;
}

export interface Inventory {
  productId: string;
  quantityOnHand: number;
  quantityReserved: number;
  location: string;
  lastUpdated: string;
}

// Derived helper: quantityAvailable = quantityOnHand - quantityReserved

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  pricingStrategyName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type InventoryTransactionType = 'receipt' | 'issue' | 'adjustment' | 'reserve' | 'release';
export type TransactionReferenceType = 'order' | 'repair' | 'manual_adjustment' | 'initial_stock';

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: InventoryTransactionType;
  quantity: number;
  previousOnHand: number;
  newOnHand: number;
  previousReserved: number;
  newReserved: number;
  reason: string;
  actorId: string;
  actorName: string;
  referenceType: TransactionReferenceType;
  referenceId: string;
  createdAt: string;
}

export type RepairStatus = 
  | 'intake' 
  | 'diagnosing' 
  | 'waiting_parts' 
  | 'in_progress' 
  | 'repaired' 
  | 'cancelled' 
  | 'handed_over';

export interface RepairPartUsed {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  deviceName: string;
  serialNumber: string;
  issueDescription: string;
  diagnosticNotes: string;
  status: RepairStatus;
  technicianId: string;
  technicianName: string;
  estimatedCost: number;
  laborFee: number;
  partsUsed: RepairPartUsed[];
  finalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface RepairHistory {
  id: string;
  ticketId: string;
  ticketNumber: string;
  previousStatus: RepairStatus;
  newStatus: RepairStatus;
  notes: string;
  actorId: string;
  actorName: string;
  partsAdded?: RepairPartUsed[];
  timestamp: string;
}

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'alert';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: string;
  read: boolean;
  linkTo?: {
    module: 'orders' | 'inventory' | 'repairs' | 'storefront';
    id?: string;
  };
}
