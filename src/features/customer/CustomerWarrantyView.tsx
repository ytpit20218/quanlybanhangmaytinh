// ==========================================
// CUSTOMER PERSONAL WARRANTY & REPAIR PORTAL
// ==========================================

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  History,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockDb } from '../../services/mockDatabase';
import { useAuth } from '../../state/AuthContext';
import { useApp } from '../../state/AppContext';
import { RepairTicket } from '../../types';

export const CustomerWarrantyView: React.FC = () => {
  const { user } = useAuth();
  const { repairTickets } = useApp();

  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // PRIVACY REQUIREMENT: Scoped strictly to authenticated customer ID
  const customerId = user?.customerId;
  const myTickets = customerId
    ? repairTickets.filter((t) => t.customerId === customerId)
    : [];

  const ticketHistory = selectedTicket ? mockDb.getRepairHistories(selectedTicket.id) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-600 mb-1">
            <Wrench className="w-4 h-4" />
            <span>OFFICIAL HARDWARE SERVICE DESK</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            My Registered Hardware & Repair Tickets
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Real-time diagnostic progress, verified replacement components, and warranty validity
          </p>
        </div>
      </div>

      <div className="mt-8">
        {!user ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 font-display">Vui lòng đăng nhập tài khoản</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Đăng nhập để xem danh sách thiết bị và tiến độ sửa chữa của bạn, hoặc tra cứu trực tiếp bằng mã phiếu / số serial.
            </p>
            <div className="mt-5 flex items-center justify-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Đăng nhập tài khoản
              </Link>
              <Link
                to="/store/tracking"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Tra cứu bằng Serial / Mã phiếu
              </Link>
            </div>
          </div>
        ) : myTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 font-display">Không có phiếu bảo hành nào đang xử lý</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Mọi linh kiện phần cứng của bạn hiện đang hoạt động bình thường. Nếu cần bảo hành hoặc sửa chữa, bạn có thể gửi thiết bị tại quầy tiếp nhận.
            </p>
            <div className="mt-5">
              <Link
                to="/store/tracking"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Tra cứu tiến trình chẩn đoán
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-blue-600 font-bold">{ticket.ticketNumber}</span>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">{ticket.deviceName}</h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">SN: {ticket.serialNumber}</div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ticket.status === 'handed_over'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ticket.status === 'repaired'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : ticket.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div><strong>Mô tả lỗi:</strong> {ticket.issueDescription}</div>
                  {ticket.diagnosticNotes && (
                    <div><strong>Ghi chú kỹ thuật:</strong> {ticket.diagnosticNotes}</div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="font-mono text-slate-500">
                    Kỹ thuật phụ trách: <strong>{ticket.technicianName}</strong>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition"
                  >
                    Lịch sử xử lý
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket History Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl p-6 text-xs space-y-4 border border-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-base text-slate-900 font-display">Nhật ký xử lý thiết bị</h4>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  {selectedTicket.ticketNumber} • {selectedTicket.deviceName}
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {ticketHistory.length === 0 ? (
                <div className="text-center py-6 text-slate-400">Chưa có lịch sử cập nhật.</div>
              ) : (
                ticketHistory.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 uppercase">{h.newStatus}</span>
                      <span className="font-mono text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-600">{h.notes}</div>
                    <div className="text-[10px] text-slate-400">Người thực hiện: {h.actorName}</div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
