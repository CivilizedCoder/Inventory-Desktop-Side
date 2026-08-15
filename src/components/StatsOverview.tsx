import React from 'react';
import { InventoryItem, Order } from '../types/inventory';
import {
  Boxes,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Plus
} from 'lucide-react';

interface StatsOverviewProps {
  items: InventoryItem[];
  orders: Order[];
  onNavigateTab: (tab: 'pick-list' | 'orders' | 'inventory') => void;
  onOpenAddItem: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  items,
  orders,
  onNavigateTab,
  onOpenAddItem,
  onSeedData,
  isSeeding,
}) => {
  const lowStockItems = items.filter((item) => item.stock_quantity <= (item.min_stock ?? 10));
  const outOfStockItems = items.filter((item) => item.stock_quantity === 0);
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const inProgressOrders = orders.filter((order) => order.status === 'in-progress');
  const completedOrders = orders.filter((order) => order.status === 'completed');

  // Categories count
  const categories = Array.from(new Set(items.map((i) => i.category || 'General')));

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Real-time Warehouse Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Inventory & Material Dispatch Control
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Track stock levels by legacy IDs and storage bins, generate job-assigned pick lists, and monitor material order fulfillment in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-create-picklist-btn"
              onClick={() => onNavigateTab('pick-list')}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Create Pick List</span>
            </button>

            <button
              id="dash-add-item-btn"
              onClick={onOpenAddItem}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Item</span>
            </button>

            {items.length === 0 && (
              <button
                id="dash-seed-btn"
                onClick={onSeedData}
                disabled={isSeeding}
                className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{isSeeding ? 'Seeding Data...' : 'Seed Sample Items'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total SKUs */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Stock SKUs
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{items.length}</span>
            <span className="text-xs text-slate-500 font-medium">
              {categories.length} Categories
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1 group-hover:underline">
            View full inventory catalog <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 2: Low Stock Alert */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer group ${
            lowStockItems.length > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Low Stock Warnings
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                lowStockItems.length > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{lowStockItems.length}</span>
            <span className="text-xs text-rose-600 font-medium">
              {outOfStockItems.length} Out of Stock
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium flex items-center gap-1 group-hover:underline">
            Inspect depleted materials <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Active Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Pick Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {pendingOrders.length + inProgressOrders.length}
            </span>
            <span className="text-xs text-amber-600 font-medium">
              {pendingOrders.length} Pending | {inProgressOrders.length} In-Progress
            </span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-medium flex items-center gap-1 group-hover:underline">
            Track fulfillment table <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Completed Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{completedOrders.length}</span>
            <span className="text-xs text-emerald-600 font-medium">Fulfilled & Deducted</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1 group-hover:underline">
            View completed job log <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Active Orders Preview + Low Stock Alert Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Job Orders Preview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <span>Active Pick Lists Queue</span>
              </h2>
              <p className="text-xs text-slate-500">Latest open material requests</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
              View All ({orders.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2 flex-1">
            {orders.slice(0, 4).map((order) => {
              const statusColors = {
                pending: 'bg-amber-100 text-amber-800 border-amber-200',
                'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
                completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
              };

              return (
                <div key={order.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{order.jobNumber}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Requested by <span className="font-medium text-slate-700">{order.createdByName}</span> • {order.items.length} items
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateTab('orders')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Details
                  </button>
                </div>
              );
            })}

            {orders.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-sm">
                No orders created yet. Click "Create Pick List" to begin.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Items Alert List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Low Stock Reorder Alerts</span>
              </h2>
              <p className="text-xs text-slate-500">Items at or below reorder threshold</p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
              Inventory Catalog
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2 flex-1">
            {lowStockItems.slice(0, 4).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-900">{item.common_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.storage_location}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Legacy IDs: {item.legacy_ids || 'N/A'}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      item.stock_quantity === 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.stock_quantity} {item.unit} left
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Min: {item.min_stock ?? 10}</p>
                </div>
              </div>
            ))}

            {lowStockItems.length === 0 && (
              <div className="py-8 text-center text-emerald-600 text-sm font-medium flex flex-col items-center justify-center gap-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <span>All items are healthy and above reorder limits!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
