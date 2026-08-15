import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch,
  increment,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { InventoryItem, Order, OrderStatus } from '../types/inventory';
import { INITIAL_SAMPLE_ITEMS, INITIAL_SAMPLE_ORDERS } from '../data/sampleData';

const ITEMS_COLLECTION = 'Items';
const ORDERS_COLLECTION = 'Orders';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Subscribe to real-time updates for Inventory Items
 */
export const subscribeToItems = (onData: (items: InventoryItem[]) => void, onError?: (err: Error) => void) => {
  const itemsRef = collection(db, ITEMS_COLLECTION);
  const q = query(itemsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: InventoryItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          legacy_ids: data.legacy_ids || '',
          common_name: data.common_name || '',
          description: data.description || '',
          storage_location: data.storage_location || '',
          stock_quantity: typeof data.stock_quantity === 'number' ? data.stock_quantity : 0,
          category: data.category || 'General',
          unit: data.unit || 'pcs',
          min_stock: data.min_stock || 10,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      });

      // Sort in memory by common_name
      items.sort((a, b) => a.common_name.localeCompare(b.common_name));
      onData(items);
    },
    (err) => {
      console.error('Error listening to Items collection:', err);
      if (onError) {
        onError(err);
      } else {
        handleFirestoreError(err, OperationType.LIST, ITEMS_COLLECTION);
      }
    }
  );
};

/**
 * Subscribe to real-time updates for Orders / Pick Lists
 */
export const subscribeToOrders = (onData: (orders: Order[]) => void, onError?: (err: Error) => void) => {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(ordersRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          jobNumber: data.jobNumber || 'N/A',
          status: (data.status as OrderStatus) || 'pending',
          items: Array.isArray(data.items) ? data.items : [],
          priority: data.priority || 'normal',
          notes: data.notes || '',
          createdByUid: data.createdByUid || '',
          createdByName: data.createdByName || 'Anonymous',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || '',
          completedAt: data.completedAt || '',
        };
      });

      // Sort by newest created first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(orders);
    },
    (err) => {
      console.error('Error listening to Orders collection:', err);
      if (onError) {
        onError(err);
      } else {
        handleFirestoreError(err, OperationType.LIST, ORDERS_COLLECTION);
      }
    }
  );
};

/**
 * Add a new inventory item to Firestore
 */
export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<string> => {
  try {
    const itemsRef = collection(db, ITEMS_COLLECTION);
    const now = new Date().toISOString();
    const docRef = await addDoc(itemsRef, {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, ITEMS_COLLECTION);
    throw err;
  }
};

/**
 * Update existing inventory item
 */
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>): Promise<void> => {
  try {
    const itemDoc = doc(db, ITEMS_COLLECTION, id);
    await updateDoc(itemDoc, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ITEMS_COLLECTION}/${id}`);
  }
};

/**
 * Delete inventory item
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const itemDoc = doc(db, ITEMS_COLLECTION, id);
    await deleteDoc(itemDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${ITEMS_COLLECTION}/${id}`);
  }
};

/**
 * Adjust item stock quantity
 */
export const adjustStockQuantity = async (id: string, delta: number): Promise<void> => {
  try {
    const itemDoc = doc(db, ITEMS_COLLECTION, id);
    await updateDoc(itemDoc, {
      stock_quantity: increment(delta),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ITEMS_COLLECTION}/${id}`);
  }
};

/**
 * Create a new Pick List order in Firestore
 */
export const createPickListOrder = async (orderData: Omit<Order, 'id'>): Promise<string> => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const now = new Date().toISOString();
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: orderData.createdAt || now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, ORDERS_COLLECTION);
    throw err;
  }
};

/**
 * Update fulfillment status of an order
 * Option to automatically deduct item quantities from stock upon completion
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  deductStockOnComplete = false
): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }

    const orderData = orderSnap.data() as Order;
    const oldStatus = orderData.status;

    const updates: Record<string, any> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    // If status changed to completed and stock hasn't been deducted yet
    if (deductStockOnComplete && newStatus === 'completed' && oldStatus !== 'completed') {
      const batch = writeBatch(db);
      // Deduct quantity requested for each item in the order
      if (Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          if (item.itemId) {
            const itemRef = doc(db, ITEMS_COLLECTION, item.itemId);
            batch.update(itemRef, {
              stock_quantity: increment(-Math.abs(item.quantityRequested)),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
      batch.update(orderRef, updates);
      await batch.commit();
    } else {
      await updateDoc(orderRef, updates);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
};

/**
 * Delete an order
 */
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${ORDERS_COLLECTION}/${orderId}`);
  }
};

/**
 * Seed initial inventory items and sample orders into Firestore if database is empty
 */
export const seedSampleData = async (): Promise<{ itemsAdded: number; ordersAdded: number }> => {
  try {
    const itemsRef = collection(db, ITEMS_COLLECTION);
    const ordersRef = collection(db, ORDERS_COLLECTION);

    let itemsAdded = 0;
    const createdItemIds: string[] = [];

    // Add items if none or force seed
    for (const item of INITIAL_SAMPLE_ITEMS) {
      const docRef = await addDoc(itemsRef, {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      createdItemIds.push(docRef.id);
      itemsAdded++;
    }

    // Add sample orders linked to created items
    let ordersAdded = 0;
    for (let i = 0; i < INITIAL_SAMPLE_ORDERS.length; i++) {
      const sampleOrder = INITIAL_SAMPLE_ORDERS[i];
      // map items to created IDs if available
      const mappedItems = sampleOrder.items.map((item, idx) => ({
        ...item,
        itemId: createdItemIds[idx % createdItemIds.length] || `item-${idx}`,
      }));

      await addDoc(ordersRef, {
        ...sampleOrder,
        items: mappedItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      ordersAdded++;
    }

    return { itemsAdded, ordersAdded };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seed');
    throw err;
  }
};
