// ==========================================
// TECHNICAL REPAIR BENCH & DIAGNOSTIC LAB
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileText,
  HardDrive,
  History,
  Layers,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Tag,
  UserCheck,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import { RepairService } from '../../services/repairService';
import { mockDb } from '../../services/mockDatabase';
import { useApp } from '../../state/AppContext';
import { Customer, RepairStatus, RepairTicket } from '../../types';

export const RepairBenchView: React.FC = () => {
  const {
    repairTickets,
    customers,
    products,
    inventory,
    currentUser,
    refreshData,
  } = useApp();

  // Active selected ticket for workbench inspection
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    repairTickets[0]?.id || ''
  );

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'all'>('all');

  // Intake Form Modal State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [intakeCustomerId, setIntakeCustomerId] = useState(customers[0]?.id || '');
  const [intakeDevice, setIntakeDevice] = useState('');
  const [intakeSerial, setIntakeSerial] = useState('');
  const [intakeIssue, setIntakeIssue] = useState('');
  const [intakeNotes, setIntakeNotes] = useState('');
  const [intakeError, setIntakeError] = useState<string | null>(null);

  // Spare Parts Requisition State
  const [selectedPartId, setSelectedPartId] = useState<string>(products[0]?.id || '');
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [partNotes, setPartNotes] = useState<string>('');
  const [partError, setPartError] = useState<string | null>(null);
  const [partSuccess, setPartSuccess] = useState<string | null>(null);

  // Diagnostic Note Quick Update
  const [editNotes, setEditNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Transition Note
  const [transitionReason, setTransitionReason] = useState<string>('');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const selectedTicket = repairTickets.find((t) => t.id === selectedTicketId) || repairTickets[0];
  const ticketHistory = selectedTicket ? mockDb.getRepairHistories(selectedTicket.id) : [];
  const ticketCustomer = customers.find((c) => c.id === selectedTicket?.customerId);

  const statuses: Array<{ id: RepairStatus; label: string; step: number }> = [
    { id: 'intake', label: '1. Intake', step: 1 },
    { id: 'diagnosing', label: '2. Diagnosing', step: 2 },
    { id: 'waiting_parts', label: '3. Awaiting Parts', step: 3 },
    { id: 'in_progress', label: '4. In Repair', step: 4 },
    { id: 'repaired', label: '5. Repaired', step: 5 },
    { id: 'handed_over', label: '6. Handed Over', step: 6 },
  ];

  // Filtered tickets
  const filteredTickets = repairTickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const handleCreateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeError(null);

    const cust = customers.find((c) => c.id === intakeCustomerId);
    if (!cust) {
      setIntakeError('Please select a valid customer.');
      return;
    }

    const res = RepairService.intakeDevice(
      cust,
      intakeDevice,
      intakeSerial,
      intakeIssue,
      currentUser,
      intakeNotes,
      500000,
      300000
    );

    if (!res.success) {
      setIntakeError(res.errors.join(' | '));
      return;
    }

    refreshData();
    setIsNewTicketOpen(false);
    setIntakeDevice('');
    setIntakeSerial('');
    setIntakeIssue('');
    setIntakeNotes('');
    if (res.ticket) setSelectedTicketId(res.ticket.id);
  };

  const handleAdvanceStatus = (target: RepairStatus) => {
    if (!selectedTicket) return;
    setTransitionError(null);

    const res = RepairService.transitionStatus(
      selectedTicket.id,
      target,
      currentUser,
      transitionReason.trim() || `Bench transition: ${selectedTicket.status} to ${target}`
    );

    if (!res.success) {
      setTransitionError(res.errors.join(' | '));
      return;
    }

    setTransitionReason('');
    refreshData();
  };

  const handleSaveDiagnosticNotes = () => {
    if (!selectedTicket) return;
    RepairService.updateDiagnosticNotes(selectedTicket.id, editNotes);
    setIsEditingNotes(false);
    refreshData();
  };

  const handleIssuePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setPartError(null);
    setPartSuccess(null);

    const res = RepairService.issueSparePart(
      selectedTicket.id,
      selectedPartId,
      Number(partQuantity),
      currentUser,
      partNotes
    );

    if (!res.success) {
      setPartError(res.errors.join(' | '));
      return;
    }

    setPartSuccess('Spare part successfully issued and deducted from stock.');
    setPartQuantity(1);
    setPartNotes('');
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-slate-900">
                  Diagnostic Bench & Hardware Repair Lab
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                  Bench Operations
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Hardware Diagnostics • Component Re-balling & Replacement • State Progression (BR.07)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Intake New Device</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT: TICKETS QUEUE (4 cols) ================= */}
          <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col h-[740px]">
            {/* Filter */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                Bench Queue ({filteredTickets.length})
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white border border-slate-300 text-slate-700 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">ALL STAGES</option>
                <option value="intake">INTAKE</option>
                <option value="diagnosing">DIAGNOSING</option>
                <option value="waiting_parts">WAITING PARTS</option>
                <option value="in_progress">IN PROGRESS</option>
                <option value="repaired">REPAIRED</option>
                <option value="handed_over">HANDED OVER</option>
              </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2 pr-1">
              {filteredTickets.map((t) => {
                const isSelected = t.id === selectedTicket?.id;
                const cust = customers.find((c) => c.id === t.customerId);

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTicketId(t.id);
                      setIsEditingNotes(false);
                      setTransitionError(null);
                      setPartError(null);
                      setPartSuccess(null);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50/70 border border-blue-300 shadow-sm'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-600">{t.ticketNumber}</span>
                      <span
                        className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-semibold ${
                          t.status === 'repaired' || t.status === 'handed_over'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.status === 'waiting_parts'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-900 mt-1 truncate">
                      {t.deviceName}
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      SN: {t.serialNumber} • Client: {cust?.name}
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                      "{t.issueDescription}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= RIGHT: ACTIVE BENCH WORKSPACE (8 cols) ================= */}
          <div className="lg:col-span-8 space-y-5">
            {selectedTicket ? (
              <>
                {/* Active Ticket Banner & Hardware Verification */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start justify-between pb-4 border-b border-slate-200 gap-4">
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                          {selectedTicket.ticketNumber}
                        </span>
                        <h2 className="text-base font-bold text-slate-900">
                          {selectedTicket.deviceName}
                        </h2>
                      </div>
                      <div className="text-xs text-slate-500 mt-1.5 flex items-center space-x-3">
                        <span>Serial: <strong className="font-mono text-slate-900">{selectedTicket.serialNumber}</strong></span>
                        <span>•</span>
                        <span>Customer: <strong className="text-slate-900">{ticketCustomer?.name}</strong> ({ticketCustomer?.phone})</span>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="text-[11px] text-slate-500 uppercase font-medium">Final Repair Cost</div>
                      <div className="text-lg font-bold text-slate-900 font-mono-num">
                        {formatVND(selectedTicket.finalCost)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Labor: {formatVND(selectedTicket.laborFee)} • Parts: {formatVND(selectedTicket.finalCost - selectedTicket.laborFee)}
                      </div>
                    </div>
                  </div>

                  {/* Status Progression Stepper */}
                  <div className="py-5 border-b border-slate-200">
                    <div className="text-xs font-medium text-slate-700 mb-2.5 flex items-center justify-between">
                      <span>Repair Lifecycle State Machine (BR.07)</span>
                      <span className="text-blue-700 font-semibold uppercase text-[11px]">{selectedTicket.status}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                      {statuses.map((st) => {
                        const isCurrent = selectedTicket.status === st.id;
                        return (
                          <div
                            key={st.id}
                            className={`p-2 rounded-md text-center border transition ${
                              isCurrent
                                ? 'bg-blue-50 text-blue-700 font-semibold border-blue-300 shadow-sm'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                          >
                            <div className="text-[10px] uppercase truncate">{st.label}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progression Trigger Actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <input
                        type="text"
                        placeholder="Audit transition note / findings..."
                        value={transitionReason}
                        onChange={(e) => setTransitionReason(e.target.value)}
                        className="flex-1 min-w-[200px] text-xs bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />

                      <div className="flex space-x-2">
                        {selectedTicket.status === 'intake' && (
                          <button
                            onClick={() => handleAdvanceStatus('diagnosing')}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-sm transition"
                          >
                            Begin Diagnostics ➔
                          </button>
                        )}
                        {selectedTicket.status === 'diagnosing' && (
                          <>
                            <button
                              onClick={() => handleAdvanceStatus('waiting_parts')}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-medium shadow-sm transition"
                            >
                              Wait for Parts
                            </button>
                            <button
                              onClick={() => handleAdvanceStatus('in_progress')}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-sm transition"
                            >
                              Start Repair ➔
                            </button>
                          </>
                        )}
                        {selectedTicket.status === 'waiting_parts' && (
                          <button
                            onClick={() => handleAdvanceStatus('in_progress')}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-sm transition"
                          >
                            Parts Received ➔ Resume
                          </button>
                        )}
                        {selectedTicket.status === 'in_progress' && (
                          <button
                            onClick={() => handleAdvanceStatus('repaired')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shadow-sm transition"
                          >
                            Mark Repaired (BR.07)
                          </button>
                        )}
                        {selectedTicket.status === 'repaired' && (
                          <button
                            onClick={() => handleAdvanceStatus('handed_over')}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-sm transition"
                          >
                            Client Handover (BR.07)
                          </button>
                        )}
                        {selectedTicket.status === 'handed_over' && (
                          <span className="text-xs text-emerald-700 font-semibold px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                            Ticket Completed & Handed Over
                          </span>
                        )}
                      </div>
                    </div>

                    {transitionError && (
                      <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{transitionError}</span>
                      </div>
                    )}
                  </div>

                  {/* Customer Stated Problem & Diagnostic Finding */}
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                        Reported Customer Issue (Intake)
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        "{selectedTicket.issueDescription}"
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">
                          Technician Diagnostic Notes
                        </span>
                        {!isEditingNotes && (
                          <button
                            onClick={() => {
                              setEditNotes(selectedTicket.diagnosticNotes);
                              setIsEditingNotes(true);
                            }}
                            className="text-blue-600 hover:underline text-[11px] font-medium"
                          >
                            Edit Note
                          </button>
                        )}
                      </div>

                      {isEditingNotes ? (
                        <div className="space-y-2 mt-1">
                          <textarea
                            rows={3}
                            placeholder="Enter diagnostic bench notes, measurements, or findings..."
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveDiagnosticNotes}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                            >
                              Save Note
                            </button>
                            <button
                              onClick={() => setIsEditingNotes(false)}
                              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-800 leading-relaxed">
                          {selectedTicket.diagnosticNotes || 'No notes documented yet.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Spare Parts Requisition Panel (BR.08) */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-sm text-slate-900">
                        Spare Parts Requisition & Stock Consumption (BR.08)
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500">
                      Auto-validated with real-time warehouse inventory
                    </span>
                  </div>

                  {partError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{partError}</span>
                    </div>
                  )}

                  {partSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-md flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{partSuccess}</span>
                    </div>
                  )}

                  {/* Parts Requisition Form */}
                  <form onSubmit={handleIssuePart} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                    <div className="md:col-span-5">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Select Part from Inventory</label>
                      <select
                        value={selectedPartId}
                        onChange={(e) => setSelectedPartId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900"
                      >
                        {products.map((p) => {
                          const inv = inventory[p.id];
                          const avail = inv ? Math.max(0, inv.quantityOnHand - inv.quantityReserved) : 0;
                          return (
                            <option key={p.id} value={p.id}>
                              {p.sku} • {p.name} ({avail} avail)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={partQuantity}
                        onChange={(e) => setPartQuantity(parseInt(e.target.value) || 1)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 font-semibold"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Bench Note</label>
                      <input
                        type="text"
                        placeholder="e.g. Re-pasting, Thermal pad swap..."
                        value={partNotes}
                        onChange={(e) => setPartNotes(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-end">
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition"
                      >
                        Issue Part
                      </button>
                    </div>
                  </form>

                  {/* Consumed Parts Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Requisitioned Part</th>
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Qty</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {selectedTicket.partsUsed.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400">
                              No spare parts consumed yet. Diagnostic inspection fee only.
                            </td>
                          </tr>
                        ) : (
                          selectedTicket.partsUsed.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-medium text-slate-900">{p.productName}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">{p.productSku}</td>
                              <td className="py-2.5 px-3 text-right font-mono-num">{formatVND(p.unitPrice)}</td>
                              <td className="py-2.5 px-3 text-right font-mono-num font-semibold">{p.quantity}</td>
                              <td className="py-2.5 px-3 text-right font-mono-num font-semibold text-slate-900">
                                {formatVND(p.subtotal)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Diagnostic Audit History Timeline */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-xs">
                  <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 mb-4">
                    <History className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-sm text-slate-900">Diagnostic & Bench Audit History</h3>
                  </div>

                  <div className="space-y-2.5">
                    {ticketHistory.map((h) => (
                      <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-900 font-medium">{h.notes}</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                              {new Date(h.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Status Shift: [{h.previousStatus.toUpperCase()} ➔ {h.newStatus.toUpperCase()}] • Recorded by:{' '}
                            <span className="text-slate-700 font-medium">{h.actorName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-400">
                No active repair ticket selected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ticket Intake Modal (BR.06) */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 text-slate-800 max-w-lg w-full rounded-lg shadow-xl p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-semibold text-base text-slate-900">Hardware Service Intake (BR.06)</h3>
                <p className="text-xs text-slate-500">Register device for lab inspection & diagnostics</p>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {intakeError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{intakeError}</span>
              </div>
            )}

            <form onSubmit={handleCreateIntake} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Customer Profile (BR.06)</label>
                <select
                  value={intakeCustomerId}
                  onChange={(e) => setIntakeCustomerId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) — {c.tier.toUpperCase()} Member
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Device Model & Chassis</label>
                <input
                  type="text"
                  placeholder="e.g. Dell XPS 16 / MacBook Pro 16 / ASUS ROG"
                  value={intakeDevice}
                  onChange={(e) => setIntakeDevice(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Hardware Serial Number (BR.06)</label>
                <input
                  type="text"
                  placeholder="e.g. SN-ROG-8899"
                  value={intakeSerial}
                  onChange={(e) => setIntakeSerial(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono font-semibold uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Customer Reported Issue (BR.06)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Display backlight flickering at high refresh rate, system throttling..."
                  value={intakeIssue}
                  onChange={(e) => setIntakeIssue(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Initial Check-in Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Scratches on bottom chassis, power adapter included..."
                  value={intakeNotes}
                  onChange={(e) => setIntakeNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition"
                >
                  Create Intake Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
