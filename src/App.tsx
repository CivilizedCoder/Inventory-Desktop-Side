import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { InventoryItem, Order } from './types/inventory';
import {
  subscribeToItems,
  subscribeToOrders,
  addInventoryItem,
  updateInventoryItem,
  createPickListOrder,
  seedSampleData,
} from './services/inventoryService';

import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { PickListBuilder } from './components/PickListBuilder';
import { OrdersTable } from './components/OrdersTable';
import { InventoryCatalog } from './components/InventoryCatalog';
import { ItemFormModal } from './components/ItemFormModal';
import { OrderDetailModal } from './components/OrderDetailModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pick-list' | 'orders' | 'inventory'>('dashboard');

  // Firestore real-time state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore subscriptions for Items and Orders
  useEffect(() => {
    const unsubItems = subscribeToItems((data) => setItems(data));
    const unsubOrders = subscribeToOrders((data) => setOrders(data));

    return () => {
      unsubItems();
      unsubOrders();
    };
  }, []);

  // Auto seed demo data if database is initialized and completely empty
  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      const res = await seedSampleData();
      alert(`Successfully seeded ${res.itemsAdded} inventory items and ${res.ordersAdded} sample orders!`);
    } catch (err) {
      console.error('Error seeding data:', err);
      alert('Failed to seed sample data.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Add or Edit Item handler
  const handleSaveItem = async (itemData: Omit<InventoryItem, 'id'>, existingId?: string) => {
    if (existingId) {
      await updateInventoryItem(existingId, itemData);
    } else {
      await addInventoryItem(itemData);
    }
  };

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  // Handle Pick List Submission
  const handlePickListSubmit = async (orderData: Omit<Order, 'id'>) => {
    await createPickListOrder(orderData);
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Navbar Header */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        itemsCount={items.length}
        pendingOrdersCount={pendingOrdersCount}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <StatsOverview
            items={items}
            orders={orders}
            onNavigateTab={setActiveTab}
            onOpenAddItem={handleOpenAddItem}
            onSeedData={handleSeedData}
            isSeeding={isSeeding}
          />
        )}

        {activeTab === 'pick-list' && (
          <PickListBuilder
            items={items}
            user={user}
            onSubmitPickList={handlePickListSubmit}
            onNavigateOrders={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTable
            orders={orders}
            onOpenOrderDetail={(order) => setSelectedOrderDetail(order)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryCatalog
            items={items}
            onOpenAddItem={handleOpenAddItem}
            onOpenEditItem={handleOpenEditItem}
            onSeedData={handleSeedData}
            isSeeding={isSeeding}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p className="max-w-7xl mx-auto px-4">
          StockTrack Pro Inventory & Pick List Dispatch • Powered by Firebase Firestore Real-Time DB & Google Auth
        </p>
      </footer>

      {/* Modals */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        initialItem={editingItem}
      />

      <OrderDetailModal
        order={selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
      />
    </div>
  );
}
