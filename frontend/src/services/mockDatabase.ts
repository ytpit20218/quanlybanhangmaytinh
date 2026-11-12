// ==========================================
// RELATIONAL MOCK DATABASE & PERSISTENCE
// ==========================================

import {
  AppNotification,
  Customer,
  Inventory,
  InventoryTransaction,
  Order,
  OrderItem,
  Product,
  RepairHistory,
  RepairTicket,
  User,
} from '../types';
import { REAL_PRODUCTS, REAL_INVENTORY } from './realCatalogData';

export interface DatabaseState {
  users: User[];
  customers: Customer[];
  products: Product[];
  inventory: Record<string, Inventory>; // key: productId
  orders: Order[];
  order_items: OrderItem[];
  inventory_transactions: InventoryTransaction[];
  repair_tickets: RepairTicket[];
  repair_histories: RepairHistory[];
  notifications: AppNotification[];
}

const STORAGE_KEY = 'computertech_db_v11_expanded_users';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_staff_admin',
    name: 'Nguyễn Minh Kiệt',
    email: 'admin@computertech.vn',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0901-888-999',
  },
  {
    id: 'usr_staff_sale',
    name: 'Nguyễn Việt Anh',
    email: 'sale@computertech.vn',
    password: 'sale123',
    role: 'sale',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0908-776-554',
  },
  {
    id: 'usr_staff_sale_2',
    name: 'Lê Thị Mai Hương',
    email: 'huong.le@computertech.vn',
    password: 'sale123',
    role: 'sale',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0912-345-678',
  },
  {
    id: 'usr_staff_warehouse',
    name: 'Ngô Thành Tâm',
    email: 'warehouse@computertech.vn',
    password: 'warehouse123',
    role: 'warehouse',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0977-889-112',
  },
  {
    id: 'usr_staff_wh_2',
    name: 'Võ Thành Đạt',
    email: 'dat.vo@computertech.vn',
    password: 'warehouse123',
    role: 'warehouse',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0988-123-456',
  },
  {
    id: 'usr_staff_tech',
    name: 'Trần Hoàng Nam',
    email: 'tech@computertech.vn',
    password: 'tech123',
    role: 'technician',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0933-221-144',
  },
  {
    id: 'usr_cust_01',
    name: 'Phan Quốc Bảo',
    email: 'bao.gamer@gmail.com',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    active: true,
    customerId: 'cust_01',
    phone: '0903-456-789',
  },
  {
    id: 'usr_cust_02',
    name: 'Đặng Thu Trang',
    email: 'thutrang.arch@gmail.com',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    active: true,
    customerId: 'cust_02',
    phone: '0918-654-321',
  },
  {
    id: 'usr_cust_03',
    name: 'Vũ Đức Hải (TechVision)',
    email: 'hai.vu@techvision.vn',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    active: true,
    customerId: 'cust_03',
    phone: '0979-998-877',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_01',
    name: 'Phan Quốc Bảo',
    email: 'bao.gamer@gmail.com',
    phone: '0903-456-789',
    address: '45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    tier: 'vip',
    createdAt: '2026-01-15T08:30:00.000Z',
  },
  {
    id: 'cust_02',
    name: 'Đặng Thu Trang',
    email: 'thutrang.arch@gmail.com',
    phone: '0918-654-321',
    address: '182 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP. Hồ Chí Minh',
    tier: 'standard',
    createdAt: '2026-02-20T10:15:00.000Z',
  },
  {
    id: 'cust_03',
    name: 'Vũ Đức Hải (TechVision)',
    email: 'hai.vu@techvision.vn',
    phone: '0979-998-877',
    address: 'Tầng 18, Tòa nhà Bitexco, 2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    tier: 'vip',
    createdAt: '2026-03-05T14:45:00.000Z',
  },
];

export const INITIAL_PRODUCTS: Product[] = [...REAL_PRODUCTS];

export const INITIAL_INVENTORY: Record<string, Inventory> = { ...REAL_INVENTORY };

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_ORDER_ITEMS: OrderItem[] = [];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [];

export const INITIAL_REPAIR_TICKETS: RepairTicket[] = [];

export const INITIAL_REPAIR_HISTORIES: RepairHistory[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

class MockDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read mock database from localStorage, initializing defaults:', e);
    }
    const initial: DatabaseState = {
      users: INITIAL_USERS,
      customers: INITIAL_CUSTOMERS,
      products: INITIAL_PRODUCTS,
      inventory: INITIAL_INVENTORY,
      orders: INITIAL_ORDERS,
      order_items: INITIAL_ORDER_ITEMS,
      inventory_transactions: INITIAL_TRANSACTIONS,
      repair_tickets: INITIAL_REPAIR_TICKETS,
      repair_histories: INITIAL_REPAIR_HISTORIES,
      notifications: INITIAL_NOTIFICATIONS,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {
      // ignore in SSR/private mode
    }
    return initial;
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save mock database to localStorage:', e);
    }
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      users: INITIAL_USERS,
      customers: INITIAL_CUSTOMERS,
      products: INITIAL_PRODUCTS,
      inventory: INITIAL_INVENTORY,
      orders: INITIAL_ORDERS,
      order_items: INITIAL_ORDER_ITEMS,
      inventory_transactions: INITIAL_TRANSACTIONS,
      repair_tickets: INITIAL_REPAIR_TICKETS,
      repair_histories: INITIAL_REPAIR_HISTORIES,
      notifications: INITIAL_NOTIFICATIONS,
    };
    this.save();
  }

  // --- Getters ---
  getState(): Readonly<DatabaseState> {
    return this.state;
  }

  getUsers(): User[] {
    return [...this.state.users];
  }

  getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.state.users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
  }

  getCustomers(): Customer[] {
    return [...this.state.customers];
  }

  getCustomerById(id: string): Customer | undefined {
    return this.state.customers.find((c) => c.id === id);
  }

  getProducts(): Product[] {
    return [...this.state.products];
  }

  getProductById(id: string): Product | undefined {
    return this.state.products.find((p) => p.id === id);
  }

  getInventory(): Record<string, Inventory> {
    return { ...this.state.inventory };
  }

  getInventoryByProductId(productId: string): Inventory | undefined {
    return this.state.inventory[productId];
  }

  getOrders(): Order[] {
    return [...this.state.orders];
  }

  getOrdersByCustomerId(customerId: string): Order[] {
    return this.state.orders.filter((o) => o.customerId === customerId);
  }

  getOrderItems(orderId: string): OrderItem[] {
    return this.state.order_items.filter((item) => item.orderId === orderId);
  }

  getAllOrderItems(): OrderItem[] {
    return [...this.state.order_items];
  }

  getTransactions(): InventoryTransaction[] {
    return [...this.state.inventory_transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getRepairTickets(): RepairTicket[] {
    return [...this.state.repair_tickets].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getRepairTicketsByCustomerId(customerId: string): RepairTicket[] {
    return this.state.repair_tickets
      .filter((t) => t.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getRepairHistories(ticketId: string): RepairHistory[] {
    return this.state.repair_histories
      .filter((h) => h.ticketId === ticketId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getNotifications(): AppNotification[] {
    return [...this.state.notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // --- Mutators ---
  saveUser(user: User): void {
    const idx = this.state.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.state.users[idx] = user;
    } else {
      this.state.users.push(user);
    }
    this.save();
  }

  saveCustomer(customer: Customer): void {
    const idx = this.state.customers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      this.state.customers[idx] = customer;
    } else {
      this.state.customers.push(customer);
    }
    this.save();
  }

  toggleUserActiveStatus(userId: string): boolean {
    const user = this.state.users.find((u) => u.id === userId);
    if (user) {
      user.active = !user.active;
      this.save();
      return user.active;
    }
    return false;
  }

  saveOrder(order: Order, items: OrderItem[]): void {
    const existingIndex = this.state.orders.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      this.state.orders[existingIndex] = order;
    } else {
      this.state.orders.unshift(order);
    }

    // Replace items for this order
    this.state.order_items = this.state.order_items.filter((i) => i.orderId !== order.id).concat(items);
    this.save();
  }

  removeOrder(orderId: string): void {
    this.state.orders = this.state.orders.filter((o) => o.id !== orderId);
    this.state.order_items = this.state.order_items.filter((i) => i.orderId !== orderId);
    this.save();
  }

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  updateInventoryRecord(inventory: Inventory): void {
    this.state.inventory[inventory.productId] = inventory;
    this.save();
  }

  addInventoryTransaction(tx: InventoryTransaction): void {
    this.state.inventory_transactions.unshift(tx);
    this.save();
  }

  saveRepairTicket(ticket: RepairTicket, historyEntry?: RepairHistory): void {
    const index = this.state.repair_tickets.findIndex((t) => t.id === ticket.id);
    if (index >= 0) {
      this.state.repair_tickets[index] = ticket;
    } else {
      this.state.repair_tickets.unshift(ticket);
    }

    if (historyEntry) {
      this.state.repair_histories.unshift(historyEntry);
    }
    this.save();
  }

  createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const customer: Customer = {
      ...data,
      id: `cust_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.addCustomer(customer);
    return customer;
  }

  addCustomer(customer: Customer): void {
    this.state.customers.unshift(customer);
    this.save();
  }

  addNotification(notif: AppNotification): void {
    this.state.notifications.unshift(notif);
    this.save();
  }

  markNotificationAsRead(id: string): void {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  markAllNotificationsAsRead(): void {
    this.state.notifications.forEach((n) => (n.read = true));
    this.save();
  }
}

export const mockDb = new MockDatabase();
