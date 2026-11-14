import React, { useState } from 'react';
import { Check, Copy, QrCode } from 'lucide-react';
import qrBankImg from '../../assets/qr-bank.png';

export interface BankTransferQrCardProps {
  amount?: number;
  orderNumber?: string;
  customerName?: string;
  compact?: boolean;
  className?: string;
}

export const BankTransferQrCard: React.FC<BankTransferQrCardProps> = ({
  amount,
  orderNumber,
  customerName,
  compact = false,
  className = '',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankInfo = {
    bankName: 'MBBank (Quân Đội)',
    accountNumber: '56438217082004',
    accountHolder: 'NGUYEN MINH KIET',
  };

  const transferContent = orderNumber
    ? `CT ${orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`
    : customerName
    ? `CT ${customerName.trim().toUpperCase()}`
    : 'THANH TOAN DON HANG';

  const copyToClipboard = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
    }
  };

  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-200/80 rounded-2xl p-3.5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 pb-2.5 border-b border-blue-100">
        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <QrCode className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Chuyển khoản qua mã VietQR / Napas 247
          </h4>
          <p className="text-[11px] text-slate-500">
            Quét mã QR bằng ứng dụng ngân hàng bất kỳ để thanh toán nhanh
          </p>
        </div>
      </div>

      <div className={`mt-3 flex flex-col ${compact ? 'sm:flex-row' : 'sm:flex-row'} items-center sm:items-start gap-3`}>
        {/* QR Image Frame */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`${compact ? 'w-28 h-28 sm:w-32 sm:h-32' : 'w-36 h-36 sm:w-40 sm:h-40'} rounded-xl overflow-hidden border-2 border-blue-300/60 bg-white p-1.5 shadow-sm transition hover:scale-102 flex items-center justify-center`}>
            <img
              src={qrBankImg}
              alt="Mã QR Chuyển khoản MBBank - NGUYEN MINH KIET"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="mt-1 text-center text-[10px] text-blue-700 font-semibold">
            <span>Quét để tự động nhận thông tin</span>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="flex-1 w-full space-y-1.5 text-xs">
          {/* Bank Name & Holder */}
          <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase">
              <span>Ngân hàng</span>
              <span>Chủ TK</span>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span className="font-bold text-slate-900">{bankInfo.bankName}</span>
              <span className="font-bold text-slate-900 uppercase font-mono">{bankInfo.accountHolder}</span>
            </div>
          </div>

          {/* Account Number */}
          <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Số tài khoản</div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-mono text-sm font-extrabold text-blue-700 tracking-wider">
                {bankInfo.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(bankInfo.accountNumber, 'accountNumber')}
                className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-[10px] transition flex items-center space-x-1 cursor-pointer"
              >
                {copiedField === 'accountNumber' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Amount if available */}
          {amount !== undefined && amount > 0 && (
            <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/80 shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-emerald-700">Số tiền</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-mono text-sm font-bold text-emerald-700">
                  {formatVND(amount)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(String(amount), 'amount')}
                  className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold rounded text-[10px] transition flex items-center space-x-1 cursor-pointer"
                >
                  {copiedField === 'amount' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span className="text-emerald-700">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Content / Memo */}
          <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Nội dung chuyển khoản</div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-mono text-xs font-bold text-slate-800 truncate pr-1">
                {transferContent}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(transferContent, 'content')}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[10px] transition flex items-center space-x-1 shrink-0 cursor-pointer"
              >
                {copiedField === 'content' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
