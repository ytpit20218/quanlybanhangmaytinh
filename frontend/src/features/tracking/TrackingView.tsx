// ==========================================
// SELF-SERVICE TRACKING & WARRANTY PORTAL
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  History,
  Package,
  Search,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import { mockDb } from '../../services/mockDatabase';
import { useApp } from '../../state/AppContext';
import { Order, OrderItem, RepairHistory, RepairTicket } from '../../types';

export const TrackingView: React.FC = () => {
  const { orders, repairTickets, customers, products } = useApp();

  const [trackingMode, setTrackingMode] = useState<'order' | 'repair'>('order');
  const [lookupQuery, setLookupQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [searchedTicket, setSearchedTicket] = useState<RepairTicket | null>(null);
  const [searchedItems, setSearchedItems] = useState<OrderItem[]>([]);
  const [searchedHistory, setSearchedHistory] = useState<RepairHistory[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSearchedOrder(null);
    setSearchedTicket(null);
    setSearchedItems([]);
    setSearchedHistory([]);

    const q = lookupQuery.trim().toUpperCase();
    if (!q) {
      setErrorMessage('Please enter an Order Number or Repair Ticket / Serial Number.');
      return;
    }

    if (trackingMode === 'order') {
      const found = orders.find(
        (o) => o.orderNumber.toUpperCase() === q || o.id.toUpperCase() === q
      );
      if (found) {
        setSearchedOrder(found);
        setSearchedItems(mockDb.getOrderItems(found.id));
      } else {
        setErrorMessage(`Order "${lookupQuery}" not found. Try e.g. ORD-2026-1001.`);
      }
    } else {
      const found = repairTickets.find(
        (t) =>
          t.ticketNumber.toUpperCase() === q ||
          t.serialNumber.toUpperCase() === q ||
          t.id.toUpperCase() === q
      );
      if (found) {
        setSearchedTicket(found);
        setSearchedHistory(mockDb.getRepairHistories(found.id));
      } else {
        setErrorMessage(
          `Repair ticket or Serial "${lookupQuery}" not found. Try e.g. RPR-2026-2001 or CT-CUSTOM-88219.`
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-800 rounded-full text-xs text-blue-400 mb-3 border border-slate-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TRANSPARENT HARDWARE AUDIT PORTAL</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-white">
            Self-Service Order & Warranty Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Verify real-time warehouse fulfillment, component reservation, and lab diagnosis telemetry
          </p>

          {/* Mode Switcher */}
          <div className="mt-6 inline-flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => {
                setTrackingMode('order');
                setLookupQuery('');
                setErrorMessage(null);
              }}
              className={`px-5 py-2 font-semibold rounded-lg transition ${
                trackingMode === 'order'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Order Status Tracking
            </button>
            <button
              onClick={() => {
                setTrackingMode('repair');
                setLookupQuery('');
                setErrorMessage(null);
              }}
              className={`px-5 py-2 font-semibold rounded-lg transition ${
                trackingMode === 'repair'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Warranty & Bench Telemetry
            </button>
          </div>

          {/* Search Box */}
          <form onSubmit={handleLookup} className="mt-6 max-w-xl mx-auto flex space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  trackingMode === 'order'
                    ? 'Enter Order ID (e.g. ORD-2026-1001)...'
                    : 'Enter Ticket # or Serial (e.g. RPR-2026-2001 / CT-CUSTOM-88219)...'
                }
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
            >
              LOCATE
            </button>
          </form>

          {/* Quick Examples for User Convenience */}
          <div className="mt-3 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-center gap-2">
            <span>Quick test:</span>
            {trackingMode === 'order' ? (
              <>
                <button
                  type="button"
                  onClick={() => setLookupQuery('ORD-2026-1001')}
                  className="text-blue-400 hover:underline"
                >
                  ORD-2026-1001
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setLookupQuery('ORD-2026-1002')}
                  className="text-blue-400 hover:underline"
                >
                  ORD-2026-1002
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setLookupQuery('RPR-2026-2001')}
                  className="text-blue-400 hover:underline"
                >
                  RPR-2026-2001
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setLookupQuery('CT-CUSTOM-88219')}
                  className="text-blue-400 hover:underline"
                >
                  CT-CUSTOM-88219
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* ORDER TRACKING RESULT */}
        {searchedOrder && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="font-mono text-xs uppercase text-slate-400 font-semibold">Order Verification</span>
                <h2 className="font-display font-bold text-2xl text-slate-900 mt-0.5">
                  {searchedOrder.orderNumber}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider ${
                    searchedOrder.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : searchedOrder.status === 'confirmed'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : searchedOrder.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {searchedOrder.status}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  className={`p-3 rounded-lg border ${
                    ['pending', 'confirmed', 'completed'].includes(searchedOrder.status)
                      ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono">Stage 1</div>
                  <div className="mt-1">Order Placed</div>
                </div>

                <div
                  className={`p-3 rounded-lg border ${
                    ['confirmed', 'completed'].includes(searchedOrder.status)
                      ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono">Stage 2</div>
                  <div className="mt-1">Inventory Reserved</div>
                </div>

                <div
                  className={`p-3 rounded-lg border ${
                    searchedOrder.status === 'completed'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono">Stage 3</div>
                  <div className="mt-1">Fulfilled & Closed</div>
                </div>
              </div>
            </div>

            {/* Hardware Items Manifest */}
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900 mb-3 flex items-center">
                <Package className="w-4 h-4 text-blue-600 mr-1.5" />
                <span>Components Manifest</span>
              </h4>
              <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-200 text-xs">
                {searchedItems.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{item.productName}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        SKU: {item.productSku} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      {formatVND(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>{formatVND(searchedOrder.subtotal)}</span>
              </div>
              {searchedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount ({searchedOrder.pricingStrategyName}):</span>
                  <span>-{formatVND(searchedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-blue-400">{formatVND(searchedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* REPAIR TRACKING RESULT */}
        {searchedTicket && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="font-mono text-xs uppercase text-slate-400 font-semibold">Bench Ticket Diagnostic Record</span>
                <h2 className="font-display font-bold text-2xl text-slate-900 mt-0.5">
                  {searchedTicket.ticketNumber}
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Device: <strong className="text-slate-800">{searchedTicket.deviceName}</strong> (SN:{' '}
                  <strong className="text-blue-600 font-mono">{searchedTicket.serialNumber}</strong>)
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  {searchedTicket.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Diagnostic Logs */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="text-slate-500 uppercase text-[10px] font-bold">Reported Symptom:</div>
              <div className="text-slate-800 italic">"{searchedTicket.issueDescription}"</div>

              <div className="text-slate-500 uppercase text-[10px] font-bold pt-2">Lab Diagnostic Telemetry:</div>
              <div className="text-slate-900 font-semibold">{searchedTicket.diagnosticNotes}</div>
            </div>

            {/* Requisitioned Spare Parts */}
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900 mb-3 flex items-center">
                <Wrench className="w-4 h-4 text-blue-600 mr-1.5" />
                <span>Replacement Hardware & Parts Consumed</span>
              </h4>
              <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-200 text-xs">
                {searchedTicket.partsUsed.length === 0 ? (
                  <div className="p-4 text-slate-400 text-center">
                    No replacement parts consumed. Standard diagnostic service rate.
                  </div>
                ) : (
                  searchedTicket.partsUsed.map((p, i) => (
                    <div key={i} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">{p.productName}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          SKU: {p.productSku} • Qty: {p.quantity}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-blue-600">
                        {formatVND(p.subtotal)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* History timeline */}
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900 mb-3 flex items-center">
                <History className="w-4 h-4 text-slate-600 mr-1.5" />
                <span>Bench Activity History</span>
              </h4>
              <div className="space-y-2 text-xs">
                {searchedHistory.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-start">
                    <div>
                      <div className="text-slate-800 font-medium">{h.notes}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Actor: {h.actorName} • Stage: {h.newStatus.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 whitespace-nowrap ml-4">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                      {new Date(h.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
