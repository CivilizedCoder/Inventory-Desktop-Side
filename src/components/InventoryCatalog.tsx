import React, { useState } from 'react';
import { InventoryItem } from '../types/inventory';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  AlertTriangle,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import { adjustStockQuantity, deleteInventoryItem } from '../services/inventoryService';

interface InventoryCatalogProps {
  items: InventoryItem[];
  onOpenAddItem: () => void;
  onOpenEditItem: (item: InventoryItem) => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const InventoryCatalog: React.FC<InventoryCatalogProps> = ({
  items,
  onOpenAddItem,
  onOpenEditItem,
  onSeedData,
  isSeeding,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category || 'General')))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.legacy_ids.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.storage_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = item.stock_quantity <= (item.min_stock ?? 10);
    } else if (stockFilter === 'out') {
      matchesStock = item.stock_quantity === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleAdjustQty = async (id: string, delta: number) => {
    try {
      await adjustStockQuantity(id, delta);
    } catch (err) {
      console.error('Error adjusting stock quantity:', err);
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete inventory item "${name}"?`)) {
      try {
        await deleteInventoryItem(id);
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Failed to delete item.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-600" />
              <span>Inventory Items Catalog</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Manage legacy IDs, storage bin locations, stock quantities, and descriptions in Firestore.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {items.length === 0 && (
              <button
                id="catalog-seed-btn"
                onClick={onSeedData}
                disabled={isSeeding}
                className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{isSeeding ? 'Seeding...' : 'Seed Sample Items'}</span>
              </button>
            )}

            <button
              id="add-new-item-btn"
              onClick={onOpenAddItem}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Common Name, Legacy IDs, Location, or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStockFilter('all')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                stockFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                stockFilter === 'low'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                stockFilter === 'out'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Item Details</th>
                <th className="py-3.5 px-4">Legacy IDs</th>
                <th className="py-3.5 px-4">Storage Location</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Stock Quantity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredItems.map((item) => {
                const isLow = item.stock_quantity <= (item.min_stock ?? 10);
                const isOut = item.stock_quantity === 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Common Name & Description */}
                    <td className="py-4 px-4 max-w-xs">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.common_name}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {item.description || 'No description provided.'}
                        </p>
                      </div>
                    </td>

                    {/* Legacy IDs */}
                    <td className="py-4 px-4 font-mono text-xs">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200">
                        {item.legacy_ids || 'N/A'}
                      </span>
                    </td>

                    {/* Storage Location */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{item.storage_location}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-xs font-medium text-slate-600">
                      {item.category || 'General'}
                    </td>

                    {/* Stock Quantity with Quick Adjust controls */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleAdjustQty(item.id, -1)}
                          disabled={item.stock_quantity <= 0}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                          title="Decrease stock by 1"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>

                        <span
                          className={`font-mono font-extrabold text-sm px-2.5 py-1 rounded-md min-w-[60px] text-center ${
                            isOut
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.stock_quantity} {item.unit || 'pcs'}
                        </span>

                        <button
                          onClick={() => handleAdjustQty(item.id, 1)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Increase stock by 1"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                      {isLow && (
                        <p className="text-[10px] text-amber-600 font-bold mt-1">
                          Low Stock Alert (Min: {item.min_stock ?? 10})
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onOpenEditItem(item)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Item Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteItem(item.id, item.common_name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No items found matching the selected search or category filters.
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
