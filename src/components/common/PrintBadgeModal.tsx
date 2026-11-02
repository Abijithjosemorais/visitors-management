import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Visitor } from '../../types'
import { formatQatarDate } from '../../api/db'
import { Printer, X } from 'lucide-react'

interface PrintBadgeModalProps {
  visitor: Visitor
  isOpen: boolean
  onClose: () => void
}

export const PrintBadgeModal: React.FC<PrintBadgeModalProps> = ({ visitor, isOpen, onClose }) => {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-left space-y-6">
        {/* Modal Top */}
        <div className="flex items-center justify-between no-print">
          <div>
            <h3 className="text-lg font-bold text-white">Print Visitor ID Card</h3>
            <p className="text-xs text-slate-400">Standard Qatar KTSQ site badge format</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Badge Area */}
        <div className="flex justify-center p-2">
          <div
            id="printable-visitor-badge"
            className="printable-badge w-full max-w-[360px] bg-white text-slate-900 rounded-2xl border-2 border-slate-900 p-4 shadow-xl flex flex-col justify-between"
            style={{ minHeight: '230px' }}
          >
            {/* Badge Header */}
            <div className="border-b-2 border-cyan-700 pb-2 flex items-center justify-between">
              <div>
                <span className="font-heading text-lg font-black tracking-tight text-slate-900 block leading-tight">
                  KELVION
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-cyan-800 block">
                  Thermal Solutions W.L.L. • Doha
                </span>
              </div>
              <span className="rounded bg-cyan-700 text-white text-[9px] font-extrabold uppercase px-2 py-0.5">
                VISITOR PASS
              </span>
            </div>

            {/* Badge Body */}
            <div className="flex items-center gap-3.5 py-3">
              {/* Photo */}
              <div className="h-24 w-20 shrink-0 rounded-lg border border-slate-300 overflow-hidden bg-slate-100 flex items-center justify-center">
                {visitor.photo ? (
                  <img src={visitor.photo} alt={visitor.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-slate-400">NO PHOTO</span>
                )}
              </div>

              {/* Name & Details */}
              <div className="flex-1 min-w-0">
                <h4
                  className="font-bold text-sm text-slate-950 leading-snug line-clamp-2"
                  dir="auto"
                >
                  {visitor.name}
                </h4>
                <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                  {visitor.company}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className="inline-block rounded bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold px-1.5 py-0.5">
                    {visitor.visitorType.replace('_', ' ')}
                  </span>
                  <span className="inline-block text-[10px] text-slate-500 py-0.5">
                    {visitor.idType}: {visitor.idNumber}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="shrink-0 flex flex-col items-center">
                <QRCodeSVG
                  value={visitor.id}
                  size={64}
                  level="M"
                  includeMargin={false}
                />
                <span className="text-[8px] font-mono font-bold text-slate-600 mt-1">
                  {visitor.id}
                </span>
              </div>
            </div>

            {/* Badge Footer */}
            <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between text-[9px] text-slate-600">
              <span>Pass ID: <strong>{visitor.id}</strong></span>
              <span>Issued: <strong>{formatQatarDate(new Date())}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 no-print pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            id="print-badge-action-btn"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/30 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Badge</span>
          </button>
        </div>
      </div>
    </div>
  )
}
