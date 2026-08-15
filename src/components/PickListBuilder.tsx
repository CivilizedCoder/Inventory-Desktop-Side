import React, { useState } from 'react';
import { InventoryItem, Order, PickListItem, PriorityLevel } from '../types/inventory';
import {
  ClipboardList,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  MapPin,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { User } from 'firebase/auth';

interface PickListBuilderProps {
  items: InventoryItem[];
  user: User | null;
  onSubmitPickList: (order: Omit<Order, 'id'>) => Promise<void>;
  onNavigateOrders: () => void;
}

export const PickListBuilder: React.FC<PickListBuilderProps> = ({
  items,
  user,
  onSubmitPickList,
  onNavigateOrders,
}) => {
  // Order header state
  const [jobNumber, setJobNumber] = useState<string>(() => `JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [notes, setNotes] = useState<string>('');
  const [requestorName, setRequestorName] = useState<string>(
    user?.displayName || user?.email?.split('@')[0] || 'Manager'
  );

  // Selected pick list items
  const [selectedItems, setSelectedItems] = useState<PickListItem[]>([]);

  // Inventory search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto generate new job number
  const handleGenerateJobNumber = () => {
    setJobNumber(`JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Filter available items
  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category || 'General')))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.legacy_ids.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.storage_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle adding item to pick list
  const handleAddItemToPickList = (item: InventoryItem) => {
    const qty = itemQuantities[item.id] || 1;
    if (qty <= 0) return;

    setSelectedItems((prev) => {
      const existingIdx = prev.findIndex((p) => p.itemId === item.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantityRequested: updated[existingIdx].quantityRequested + qty,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            itemId: item.id,
            legacy_ids: item.legacy_ids,
            common_name: item.common_name,
            storage_location: item.storage_location,
            quantityRequested: qty,
            availableStockAtCreation: item.stock_quantity,
            unit: item.unit || 'pcs',
          },
        ];
      }
    });

    // Reset qty input for this item
    setItemQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  // Handle removing item from draft
  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  // Update requested quantity in cart
  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, quantityRequested: newQty } : i))
    );
  };

  // Submit new Pick List
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobNumber.trim()) {
      alert('Please enter or generate a valid Job Number.');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Please select at least one item for the Pick List.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newOrder: Omit<Order, 'id'> = {
        jobNumber: jobNumber.trim(),
        status: 'pending',
        priority,
        notes: notes.trim(),
        createdByName: requestorName || 'Manager',
        createdByUid: user?.uid || 'manager-uid',
        createdAt: new Date().toISOString(),
        items: selectedItems,
      };

      await onSubmitPickList(newOrder);
      setSuccessMessage(`Pick List for ${jobNumber} saved to Orders collection!`);
      
      // Reset form
      setSelectedItems([]);
      setNotes('');
      setJobNumber(`JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err) {
      console.error('Failed to save Pick List order:', err);
      alert('Failed to save Pick List. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            <span>Generate Material Pick List</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Select materials from inventory, assign a job number, and generate a dispatched order pick list.
          </p>
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
            <button
              onClick={onNavigateOrders}
              className="ml-2 font-bold underline hover:text-emerald-950"
            >
              View Orders Tracker →
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inventory Item Selector (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <span>1. Select Materials from Inventory</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {filteredItems.length} items available
              </span>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Common Name, Legacy ID, or Storage Location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Inventory Items List */}
            <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 pr-1">
              {filteredItems.map((item) => {
                const qtyInput = itemQuantities[item.id] ?? 1;
                const isOutOfStock = item.stock_quantity === 0;

                return (
                  <div
                    key={item.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.common_name}
                        </span>
                        <span className="text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.storage_location}
                        </span>
                        {item.legacy_ids && (
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.legacy_ids}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-600 font-medium">Category: {item.category}</span>
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? 'text-rose-600'
                              : item.stock_quantity <= (item.min_stock ?? 10)
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          Stock: {item.stock_quantity} {item.unit || 'pcs'}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Picker & Add Button */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <input
                        type="number"
                        min="1"
                        max={item.stock_quantity || 1}
                        value={qtyInput}
                        onChange={(e) =>
                          setItemQuantities({
                            ...itemQuantities,
                            [item.id]: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        disabled={isOutOfStock}
                        className="w-16 px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItemToPickList(item)}
                        disabled={isOutOfStock}
                        className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No materials match your search filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Job Details & Pick List Cart (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>2. Job Order & Pick List Details</span>
              </h2>
            </div>

            {/* Job Number & Priority */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Job Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    value={jobNumber}
                    onChange={(e) => setJobNumber(e.target.value)}
                    placeholder="e.g. JOB-2026-9042"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateJobNumber}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors"
                    title="Generate random job number"
                  >
                    Auto-ID
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Dispatched</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Requestor / Manager
                  </label>
                  <input
                    type="text"
                    value={requestorName}
                    onChange={(e) => setRequestorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Job Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Stage materials at Loading Bay 3 by 8:00 AM..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Selected Pick List Table */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pick List Selected Items ({selectedItems.length})
                </span>
                {selectedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedItems([])}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {selectedItems.map((item) => {
                  const hasStockWarning =
                    item.availableStockAtCreation !== undefined &&
                    item.quantityRequested > item.availableStockAtCreation;

                  return (
                    <div
                      key={item.itemId}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {item.common_name}
                          </p>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                            {item.storage_location}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {item.legacy_ids}
                        </p>

                        {hasStockWarning && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold mt-0.5">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Requested ({item.quantityRequested}) exceeds available stock ({item.availableStockAtCreation})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantityRequested - 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-xs text-slate-900">
                            {item.quantityRequested}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantityRequested + 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {selectedItems.length === 0 && (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No items selected yet. Pick items from the left list.
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <button
              id="save-picklist-order-btn"
              type="submit"
              disabled={isSubmitting || selectedItems.length === 0}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Orders Collection...</span>
                </>
              ) : (
                <>
                  <ClipboardList className="w-4 h-4" />
                  <span>Save Pick List to Orders</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
