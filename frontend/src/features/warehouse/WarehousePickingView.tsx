// ==========================================
// WAREHOUSE ORDER PICKING & DISPATCH QUEUE
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Package,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { OrderProcessingFacade } from '../../services/orderProcessingFacade';
import { mockDb } from '../../services/mockDatabase';
import { useAuth } from '../../state/AuthContext';
import { useApp } from '../../state/AppContext';
import { Order } from '../../types';

export const WarehousePickingView: React.FC = () => {
  const { user } = useAuth();
  const { orders, customers, refreshData } = useApp();

  const [activeTab, setActiveTab] = useState<'pending_pick' | 'dispatched'>('pending_pick');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // Confirmed orders have reserved stock and are ready for warehouse picking
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const handlePickAndDispatch = (orderId: string) => {
    setActionError(null);
    setActionSuccess(null);
    if (!user) return;

    const res = OrderProcessingFacade.transitionStatus(orderId, 'completed', user);
    if (!res.success) {
      setActionError(res.errors.join(' | '));
    } else {
      setActionSuccess(`Order ${res.order?.orderNumber} picked, inventory deducted, and dispatched.`);
      refreshData();
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const currentList = activeTab === 'pending_pick' ? confirmedOrders : completedOrders;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 font-semibold text-xs mb-1">
              <PackageCheck className="w-4 h-4" />
              <span>WAREHOUSE DISPATCH HUB</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Order Picking Queue & Physical Fulfillment
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Orders in [CONFIRMED] state have stock reserved. Pick hardware components and dispatch to complete order (BR.03, BR.05)
            </p>
          </div>

          {/* Tab Switch */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('pending_pick')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'pending_pick'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ready to Pick ({confirmedOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('dispatched')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'dispatched'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed & Dispatched ({completedOrders.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {actionError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Orders Queue Grid */}
        <div className="space-y-4">
          {currentList.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-400 text-xs">
              No orders found in this picking stage.
            </div>
          ) : (
            currentList.map((order) => {
              const cust = customers.find((c) => c.id === order.customerId);
              const items = mockDb.getOrderItems(order.id);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:border-blue-300 transition text-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-sm text-blue-600">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          order.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {order.status === 'confirmed' ? 'Stock Reserved' : 'Fulfillment Complete'}
                      </span>
                    </div>

                    <div className="text-slate-500 font-mono text-[11px]">
                      Created: {new Date(order.createdAt).toLocaleString()} • Recipient: <strong className="text-slate-800">{cust?.name}</strong> ({cust?.phone})
                    </div>
                  </div>

                  {/* Line Items to Pick */}
                  <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Components to Pick & Verify from Bays:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {items.map((it) => (
                        <div key={it.id} className="p-2.5 bg-white rounded border border-slate-200 flex justify-between items-center">
                          <div className="min-w-0 pr-2">
                            <div className="font-medium text-slate-900 truncate">{it.productName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{it.productSku}</div>
                          </div>
                          <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded font-mono font-bold shrink-0">
                            x{it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Action */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-1 gap-3">
                    <div className="text-slate-500">
                      Destination Address: <strong className="text-slate-800">{cust?.address}</strong>
                    </div>

                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handlePickAndDispatch(order.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Pick Hardware & Dispatch (BR.03)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
