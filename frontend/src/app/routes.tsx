// ==========================================
// CENTRAL APPLICATION ROUTING & PORTAL GUARDS
// Google Material 3 Experience Isolation:
// 1. Public Storefront (/store)
// 2. Customer Personal Account Portal (/store/account)
// 3. Dedicated Staff Login (/company/login) & Customer Login (/login)
// 4. Internal Workspaces (/admin, /sales, /warehouse, /technician)
// ==========================================

import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleGuard } from '../components/auth/RoleGuard';
import { AdminCustomersView } from '../features/admin/AdminCustomersView';
import { AdminProductsView } from '../features/admin/AdminProductsView';
import { AdminUsersView } from '../features/admin/AdminUsersView';
import { CustomerAccountView } from '../features/customer/CustomerAccountView';
import { CustomerOrdersView } from '../features/customer/CustomerOrdersView';
import { CustomerWarrantyView } from '../features/customer/CustomerWarrantyView';
import { DashboardView } from '../features/dashboard/DashboardView';
import { InventoryView } from '../features/inventory/InventoryView';
import { PosView } from '../features/pos/PosView';
import { RepairBenchView } from '../features/repairs/RepairBenchView';
import { SalesCustomerRegistrationView } from '../features/sales/SalesCustomerRegistrationView';
import { StorefrontView } from '../features/storefront/StorefrontView';
import { WarehousePickingView } from '../features/warehouse/WarehousePickingView';
import { AdminLayout } from '../layouts/AdminLayout';
import { SalesLayout } from '../layouts/SalesLayout';
import { StoreLayout } from '../layouts/StoreLayout';
import { TechnicianLayout } from '../layouts/TechnicianLayout';
import { WarehouseLayout } from '../layouts/WarehouseLayout';
import { Forbidden403 } from '../pages/Forbidden403';
import { CustomerLoginPage } from '../pages/CustomerLoginPage';
import { CompanyLoginPage } from '../pages/CompanyLoginPage';
import { useAuth } from '../state/AuthContext';
import { TrackingView } from '../features/tracking/TrackingView';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, getDefaultRoute } = useAuth();
  if (isAuthenticated && user) {
    if (user.role === 'customer') {
      return <Navigate to="/store" replace />;
    }
    return <Navigate to={getDefaultRoute()} replace />;
  }
  return <Navigate to="/store" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Entry: always lands on /store for public visitors */}
      <Route path="/" element={<RootRedirect />} />

      {/* Two Separate Login Portals */}
      <Route path="/login" element={<CustomerLoginPage />} />
      <Route path="/company/login" element={<CompanyLoginPage />} />
      <Route path="/403" element={<Forbidden403 />} />

      {/* ================= 1. PUBLIC STORE & CUSTOMER PORTAL (/store) ================= */}
      <Route path="/store" element={<StoreLayout />}>
        {/* Public Storefront */}
        <Route index element={<StorefrontView />} />
        <Route path="tracking" element={<TrackingView />} />

        {/* Dedicated Authenticated Customer Account Area */}
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['customer', 'admin']}>
                <CustomerAccountView />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['customer', 'admin']}>
                <CustomerAccountView />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="warranty"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['customer', 'admin']}>
                <CustomerAccountView />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ================= 2. INTERNAL ADMIN PORTAL (/admin) ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="users" element={<AdminUsersView />} />
        <Route path="products" element={<AdminProductsView />} />
        <Route path="customers" element={<AdminCustomersView />} />
        <Route path="orders" element={<PosView />} />
        <Route path="inventory" element={<InventoryView />} />
        <Route path="repairs" element={<RepairBenchView />} />
      </Route>

      {/* ================= 3. INTERNAL SALES PORTAL (/sales) ================= */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['sale', 'admin']}>
              <SalesLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/sales/pos" replace />} />
        <Route path="pos" element={<PosView />} />
        <Route path="orders" element={<PosView />} />
        <Route path="intake" element={<RepairBenchView />} />
        <Route path="customers" element={<SalesCustomerRegistrationView />} />
      </Route>

      {/* ================= 4. INTERNAL WAREHOUSE PORTAL (/warehouse) ================= */}
      <Route
        path="/warehouse"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['warehouse', 'admin']}>
              <WarehouseLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/warehouse/inventory" replace />} />
        <Route path="inventory" element={<InventoryView />} />
        <Route path="picking" element={<WarehousePickingView />} />
        <Route path="ledger" element={<InventoryView />} />
      </Route>

      {/* ================= 5. INTERNAL TECHNICIAN PORTAL (/technician) ================= */}
      <Route
        path="/technician"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['technician', 'admin']}>
              <TechnicianLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/technician/tickets" replace />} />
        <Route path="tickets" element={<RepairBenchView />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
