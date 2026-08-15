import React, { useState } from 'react';
import { Order, OrderStatus } from '../types/inventory';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  User,
  Trash2,
  MapPin,
  AlertCircle,
  FileText
} from 'lucide-react';
import { updateOrderStatus, deleteOrder } from '../services/inventoryService';

interface OrdersTableProps {
  orders: Order[];
  onOpenOrderDetail: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onOpenOrderDetail }) => {
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [checkedPickedItems, setCheckedPickedItems] = useState<Record<string, boolean>>({});

  // Filter orders by status and search term
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeTab === 'all' || order.status === activeTab;
    const matchesSearch =
      order.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.createdByName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((i) =>
        i.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.legacy_ids.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesStatus && matchesSearch;
  });

  // Handle status update
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // When changing to completed, pass true to automatically deduct stock from Items collection
      const deduct = newStatus === 'completed';
      await updateOrderStatus(orderId, newStatus, deduct);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update order status.');
    }
  };

  const handleDelete = async (orderId: string, jobNumber: string) => {
    if (confirm(`Are you sure you want to delete order ${jobNumber}?`)) {
      try {
        await deleteOrder(orderId);
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Failed to delete order.');
      }
    }
  };

  const togglePickCheck = (key: string) => {
    setCheckedPickedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Status Badge Colors
  const statusStyles: Record<OrderStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: {
      bg: 'bg-amber-100 text-amber-800 border-amber-200',
      text: 'Pending',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
    'in-progress': {
      bg: 'bg-blue-100 text-blue-800 border-blue-200',
      text: 'In-Progress',
      icon: <PlayCircle className="w-3.5 h-3.5 text-blue-600" />,
    },
    completed: {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      text: 'Completed',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    cancelled: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      text: 'Cancelled',
      icon: <XCircle className="w-3.5 h-3.5 text-slate-500" />,
    },
  };

  const priorityStyles: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700',
    normal: 'bg-blue-50 text-blue-700',
    high: 'bg-amber-100 text-amber-800',
    urgent: 'bg-rose-100 text-rose-800 animate-pulse',
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
              <span>Real-Time Pick List Fulfillment Tracker</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Live status tracking for active material requests and job pick lists.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Job #, Item or Requestor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {(['all', 'pending', 'in-progress', 'completed', 'cancelled'] as const).map((tab) => {
            const count =
              tab === 'all' ? orders.length : orders.filter((o) => o.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab === 'all' ? 'All Orders' : tab}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    activeTab === tab ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Job Number</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Items Requested</th>
                <th className="py-3.5 px-4">Manager / Requestor</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const style = statusStyles[order.status];

                return (
                  <React.Fragment key={order.id}>
                    <tr
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isExpanded ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      {/* Job Number */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : order.id)
                            }
                            className="p-1 hover:bg-slate-200 rounded text-slate-500"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <span className="font-extrabold text-slate-900 font-mono text-base">
                            {order.jobNumber}
                          </span>
                        </div>
                      </td>

                      {/* Status Selector Badge */}
                      <td className="py-4 px-4">
                        <div className="relative inline-block">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.bg}`}
                          >
                            {style.icon}
                            <span>{style.text}</span>
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            priorityStyles[order.priority || 'normal']
                          }`}
                        >
                          {order.priority || 'normal'}
                        </span>
                      </td>

                      {/* Items Count */}
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {order.items.length} materials
                      </td>

                      {/* Requestor */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1.5 text-xs text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{order.createdByName || 'Manager'}</span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                        {new Date(order.createdAt).toLocaleDateString()}{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Action Dropdown / Controls */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Quick Workflow Action */}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'in-progress')}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                              title="Begin picking items"
                            >
                              Start Pick
                            </button>
                          )}

                          {order.status === 'in-progress' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'completed')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                              title="Mark order complete and deduct stock from inventory"
                            >
                              Complete & Deduct
                            </button>
                          )}

                          <button
                            onClick={() => onOpenOrderDetail(order)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Printable Pick List View"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(order.id, order.jobNumber)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail / Picking Checklist Row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <td colSpan={7} className="p-4 sm:p-6">
                          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-inner space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-indigo-600" />
                                  <span>Warehouse Pick List Checklist — {order.jobNumber}</span>
                                </h3>
                                {order.notes && (
                                  <p className="text-xs text-slate-600 mt-1 italic bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                                    Notes: {order.notes}
                                  </p>
                                )}
                              </div>

                              {/* Manual Status Buttons */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-500 font-semibold mr-1">
                                  Change Status:
                                </span>
                                {(
                                  ['pending', 'in-progress', 'completed', 'cancelled'] as OrderStatus[]
                                ).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleStatusChange(order.id, st)}
                                    disabled={order.status === st}
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize border transition-all ${
                                      order.status === st
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Pick List Items Checklist */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {order.items.map((item, idx) => {
                                const checkKey = `${order.id}-${idx}`;
                                const isPicked = !!checkedPickedItems[checkKey];

                                return (
                                  <div
                                    key={idx}
                                    onClick={() => togglePickCheck(checkKey)}
                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                      isPicked
                                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <input
                                        type="checkbox"
                                        checked={isPicked}
                                        onChange={() => {}}
                                        className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                      />
                                      <div>
                                        <p
                                          className={`font-bold text-xs ${
                                            isPicked ? 'line-through text-slate-500' : 'text-slate-900'
                                          }`}
                                        >
                                          {item.common_name}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-mono">
                          Legacy IDs: {item.legacy_ids}
                        </p>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <span className="font-extrabold text-indigo-700 text-xs bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                                        Qty: {item.quantityRequested} {item.unit || 'pcs'}
                                      </span>
                                      <p className="text-[10px] text-slate-500 mt-1 font-mono flex items-center justify-end gap-0.5">
                                        <MapPin className="w-3 h-3 text-indigo-500" />
                                        {item.storage_location}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No orders match the current filter or search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
