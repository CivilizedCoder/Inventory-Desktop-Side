import React from 'react';
import { Order } from '../types/inventory';
import { X, Printer, MapPin, ClipboardList, CheckSquare, Calendar, User, FileText } from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base">Material Pick List — {order.jobNumber}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-900 print:p-0">
          {/* Document Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                DISPATCH PICK LIST
              </span>
              <h1 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {order.jobNumber}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Generated via StockTrack Pro Inventory System
              </p>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                  order.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : order.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {order.status}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Priority: <span className="font-bold uppercase">{order.priority}</span>
              </p>
            </div>
          </div>

          {/* Job Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Requestor / Manager</span>
              <span className="font-bold text-slate-800">{order.createdByName || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Date Requested</span>
              <span className="font-bold text-slate-800">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Total Line Items</span>
              <span className="font-bold text-indigo-700">{order.items.length} materials</span>
            </div>
          </div>

          {order.notes && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-0.5">
                Job Notes & Instructions:
              </p>
              <p className="text-xs text-amber-800">{order.notes}</p>
            </div>
          )}

          {/* Items Pick Table */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span>Requested Items Checklist</span>
            </h3>

            <table className="w-full text-left border-collapse border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                  <th className="p-2.5 w-10 text-center">Pick</th>
                  <th className="p-2.5">Material / Common Name</th>
                  <th className="p-2.5">Legacy IDs</th>
                  <th className="p-2.5">Bin / Location</th>
                  <th className="p-2.5 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="p-2.5 text-center">
                      <div className="w-4 h-4 border-2 border-slate-400 rounded mx-auto"></div>
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">{item.common_name}</td>
                    <td className="p-2.5 font-mono text-slate-600">{item.legacy_ids || 'N/A'}</td>
                    <td className="p-2.5 font-mono font-bold text-indigo-800">
                      {item.storage_location}
                    </td>
                    <td className="p-2.5 text-right font-extrabold text-slate-900 text-sm">
                      {item.quantityRequested} {item.unit || 'pcs'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Verification Footer for Print */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="font-semibold text-slate-500 mb-6">Picker Signature:</p>
              <div className="border-b border-slate-300"></div>
            </div>
            <div>
              <p className="font-semibold text-slate-500 mb-6">Received By (Site):</p>
              <div className="border-b border-slate-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
