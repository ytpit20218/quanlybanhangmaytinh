// ==========================================
// APPLICATION CONTEXT & STATE MANAGER
// ==========================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotificationService } from '../services/notificationService';
import { mockDb } from '../services/mockDatabase';
import {
  AppNotification,
  Customer,
  Inventory,
  InventoryTransaction,
  Order,
  Product,
  RepairTicket,
  User,
} from '../types';

export type WorkspaceMode = 'storefront' | 'pos' | 'inventory' | 'repairs' | 'dashboard' | 'tracking';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeWorkspace: WorkspaceMode;
  setActiveWorkspace: (mode: WorkspaceMode) => void;
  
  // Data entities
  users: User[];
  customers: Customer[];
  products: Product[];
  inventory: Record<string, Inventory>;
  orders: Order[];
  repairTickets: RepairTicket[];
  transactions: InventoryTransaction[];
  notifications: AppNotification[];
  refreshData: () => void;
  resetDatabase: () => void;

  // Cart state
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; error?: string };
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; error?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Deep inspection modals / view selections
  selectedProductForDetail: Product | null;
  setSelectedProductForDetail: (p: Product | null) => void;
  selectedOrderForDetail: Order | null;
  setSelectedOrderForDetail: (o: Order | null) => void;
  selectedTicketForDetail: RepairTicket | null;
  setSelectedTicketForDetail: (t: RepairTicket | null) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

import { useAuth } from './AuthContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>(() => mockDb.getUsers());
  const guestUser: User = {
    id: 'guest',
    name: 'Khách mua hàng',
    email: 'khachhang@computertech.vn',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    role: 'customer',
    active: true,
  };
  const currentUser = authUser || guestUser;
  const setCurrentUser = () => {};
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceMode>('storefront');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Record<string, Inventory>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairTickets, setRepairTickets] = useState<RepairTicket[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('computertech_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Inspector targets
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<RepairTicket | null>(null);

  const refreshData = () => {
    setUsers(mockDb.getUsers());
    setCustomers(mockDb.getCustomers());
    setProducts(mockDb.getProducts());
    setInventory(mockDb.getInventory());
    setOrders(mockDb.getOrders());
    setRepairTickets(mockDb.getRepairTickets());
    setTransactions(mockDb.getTransactions());
    setNotifications(mockDb.getNotifications());
  };

  useEffect(() => {
    NotificationService.initialize();
    refreshData();
  }, []);

  useEffect(() => {
    localStorage.setItem('computertech_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity = 1): { success: boolean; error?: string } => {
    const inv = inventory[product.id];
    const available = inv ? Math.max(0, inv.quantityOnHand - inv.quantityReserved) : 0;
    const existing = cart.find((i) => i.product.id === product.id);
    const existingQty = existing ? existing.quantity : 0;
    const targetQty = existingQty + quantity;

    if (targetQty > available) {
      return {
        success: false,
        error: `Only ${available} unit(s) available for "${product.name}". Cannot add ${quantity} more.`,
      };
    }

    if (existing) {
      setCart((prev) =>
        prev.map((i) => (i.product.id === product.id ? { ...i, quantity: targetQty } : i))
      );
    } else {
      setCart((prev) => [...prev, { product, quantity }]);
    }

    setIsCartOpen(true);
    return { success: true };
  };

  const updateCartQuantity = (productId: string, quantity: number): { success: boolean; error?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const inv = inventory[productId];
    const available = inv ? Math.max(0, inv.quantityOnHand - inv.quantityReserved) : 0;
    const product = products.find((p) => p.id === productId);

    if (quantity > available) {
      return {
        success: false,
        error: `Requested ${quantity} units exceeds available stock (${available}) for "${product?.name}".`,
      };
    }

    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const resetDatabase = () => {
    mockDb.reset();
    clearCart();
    refreshData();
  };

  const markNotificationAsRead = (id: string) => {
    mockDb.markNotificationAsRead(id);
    setNotifications(mockDb.getNotifications());
  };

  const markAllNotificationsAsRead = () => {
    mockDb.markAllNotificationsAsRead();
    setNotifications(mockDb.getNotifications());
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeWorkspace,
        setActiveWorkspace,
        users,
        customers,
        products,
        inventory,
        orders,
        repairTickets,
        transactions,
        notifications,
        refreshData,
        resetDatabase,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        selectedProductForDetail,
        setSelectedProductForDetail,
        selectedOrderForDetail,
        setSelectedOrderForDetail,
        selectedTicketForDetail,
        setSelectedTicketForDetail,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
