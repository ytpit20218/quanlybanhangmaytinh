import fs from 'fs';

let content = fs.readFileSync('src/services/mockDatabase.ts', 'utf8');

// 1. Replace STORAGE_KEY
content = content.replace(/const STORAGE_KEY = '[^']+';/, "const STORAGE_KEY = 'computertech_db_v10_real_clean_catalog_and_staff';");

// 2. Replace INITIAL_USERS
const newUsers = `export const INITIAL_USERS: User[] = [
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
    id: 'usr_staff_warehouse',
    name: 'Ngô Thành Tâm',
    email: 'warehouse@computertech.vn',
    password: 'warehouse123',
    role: 'warehouse',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0977-889-112',
  },
];`;
content = content.replace(/export const INITIAL_USERS: User\[\] = \[[\s\S]*?\];\s*export const INITIAL_CUSTOMERS/, `${newUsers}\n\nexport const INITIAL_CUSTOMERS`);

// 3. Replace INITIAL_CUSTOMERS
content = content.replace(/export const INITIAL_CUSTOMERS: Customer\[\] = \[[\s\S]*?\];\s*export const INITIAL_PRODUCTS/, 'export const INITIAL_CUSTOMERS: Customer[] = [];\n\nexport const INITIAL_PRODUCTS');

// 4. Replace INITIAL_PRODUCTS
content = content.replace(/export const INITIAL_PRODUCTS: Product\[\] = \[[\s\S]*?\];\s*export const INITIAL_INVENTORY/, 'export const INITIAL_PRODUCTS: Product[] = [...REAL_PRODUCTS];\n\nexport const INITIAL_INVENTORY');

// 5. Replace INITIAL_INVENTORY
content = content.replace(/export const INITIAL_INVENTORY: Record<string, Inventory> = \{[\s\S]*?\};\s*export const INITIAL_ORDERS/, 'export const INITIAL_INVENTORY: Record<string, Inventory> = { ...REAL_INVENTORY };\n\nexport const INITIAL_ORDERS');

// 6. Replace INITIAL_ORDERS
content = content.replace(/export const INITIAL_ORDERS: Order\[\] = \[[\s\S]*?\];\s*export const INITIAL_ORDER_ITEMS/, 'export const INITIAL_ORDERS: Order[] = [];\n\nexport const INITIAL_ORDER_ITEMS');

// 7. Replace INITIAL_ORDER_ITEMS
content = content.replace(/export const INITIAL_ORDER_ITEMS: OrderItem\[\] = \[[\s\S]*?\];\s*export const INITIAL_TRANSACTIONS/, 'export const INITIAL_ORDER_ITEMS: OrderItem[] = [];\n\nexport const INITIAL_TRANSACTIONS');

// 8. Replace INITIAL_TRANSACTIONS
content = content.replace(/export const INITIAL_TRANSACTIONS: InventoryTransaction\[\] = \[[\s\S]*?\];\s*export const INITIAL_REPAIR_TICKETS/, 'export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [];\n\nexport const INITIAL_REPAIR_TICKETS');

// 9. Replace INITIAL_REPAIR_TICKETS
content = content.replace(/export const INITIAL_REPAIR_TICKETS: RepairTicket\[\] = \[[\s\S]*?\];\s*export const INITIAL_REPAIR_HISTORIES/, 'export const INITIAL_REPAIR_TICKETS: RepairTicket[] = [];\n\nexport const INITIAL_REPAIR_HISTORIES');

// 10. Replace INITIAL_REPAIR_HISTORIES
content = content.replace(/export const INITIAL_REPAIR_HISTORIES: RepairHistory\[\] = \[[\s\S]*?\];\s*export const INITIAL_NOTIFICATIONS/, 'export const INITIAL_REPAIR_HISTORIES: RepairHistory[] = [];\n\nexport const INITIAL_NOTIFICATIONS');

// 11. Replace INITIAL_NOTIFICATIONS
content = content.replace(/export const INITIAL_NOTIFICATIONS: AppNotification\[\] = \[[\s\S]*?\];\s*class MockDatabase/, 'export const INITIAL_NOTIFICATIONS: AppNotification[] = [];\n\nclass MockDatabase');

fs.writeFileSync('src/services/mockDatabase.ts', content, 'utf8');
console.log('mockDatabase.ts updated successfully!');
