export type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent';

export interface InventoryItem {
  id: string;
  legacy_ids: string;
  common_name: string;
  description: string;
  storage_location: string;
  stock_quantity: number;
  category: string;
  unit: string;
  min_stock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PickListItem {
  itemId: string;
  legacy_ids: string;
  common_name: string;
  storage_location: string;
  quantityRequested: number;
  quantityPicked?: number;
  availableStockAtCreation?: number;
  unit?: string;
}

export interface Order {
  id: string;
  jobNumber: string;
  status: OrderStatus;
  items: PickListItem[];
  priority: PriorityLevel;
  notes?: string;
  createdByUid?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface InventoryFilter {
  search: string;
  category: string;
  location: string;
  stockStatus: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
}
