/**
 * Offline Sync & IndexedDB Persistence Manager
 * Caches pending document uploads and expense log submissions when offline,
 * and synchronizes them automatically with the PostgreSQL backend once online.
 */

export type PendingSyncType = 
  | 'DOCUMENT_UPLOAD' 
  | 'EXPENSE_SUBMISSION' 
  | 'CONFIRM_DOCUMENT' 
  | 'CHAT_ACTION'
  | 'DRIVER_DOC_UPLOAD';

export interface PendingSyncItem {
  id: string;
  type: PendingSyncType;
  title: string;
  payload: any;
  createdAt: string;
  attempts: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}

const DB_NAME = 'FleetOfflineSyncDB';
const DB_VERSION = 1;
const STORE_NAME = 'pending_queue';

let dbInstance: IDBDatabase | null = null;

// Initialize IndexedDB
export async function initOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB opening error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Add item to IndexedDB queue
export async function enqueuePendingItem(
  type: PendingSyncType, 
  title: string, 
  payload: any
): Promise<PendingSyncItem> {
  const db = await initOfflineDB();
  const newItem: PendingSyncItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type,
    title,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
    status: 'pending'
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(newItem);

    request.onsuccess = () => {
      // Notify service worker or background sync
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC' });
      }
      resolve(newItem);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Get all pending items
export async function getPendingItems(): Promise<PendingSyncItem[]> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const items = (request.result as PendingSyncItem[]) || [];
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(items);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Remove item from queue
export async function removePendingItem(id: string): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Clear all items
export async function clearPendingQueue(): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Register Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Fleet Assistant Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

/**
 * Process the pending sync queue by attempting to resend each queued item to backend API.
 * On success, removes item from queue.
 */
export async function syncPendingQueue(
  onSyncProgress?: (msg: string) => void
): Promise<{ syncedCount: number; failedCount: number; lastDatabaseState?: any }> {
  const items = await getPendingItems();
  if (items.length === 0) {
    return { syncedCount: 0, failedCount: 0 };
  }

  let syncedCount = 0;
  let failedCount = 0;
  let lastDatabaseState: any = null;

  for (const item of items) {
    try {
      if (onSyncProgress) {
        onSyncProgress(`Syncing: ${item.title}...`);
      }

      let res: Response | null = null;

      if (item.type === 'DOCUMENT_UPLOAD') {
        res = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });
      } else if (item.type === 'EXPENSE_SUBMISSION') {
        // Send as chat database action or direct expense creation
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });
      } else if (item.type === 'CONFIRM_DOCUMENT') {
        res = await fetch('/api/confirm-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });
      } else if (item.type === 'DRIVER_DOC_UPLOAD') {
        res = await fetch(`/api/drivers/${item.payload.driverId}/document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload.data)
        });
      } else if (item.type === 'CHAT_ACTION') {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.currentDatabase || data.database) {
          lastDatabaseState = data.currentDatabase || data.database;
        }
        await removePendingItem(item.id);
        syncedCount++;
      } else {
        failedCount++;
      }
    } catch (err) {
      console.error(`Failed to sync item ${item.id}:`, err);
      failedCount++;
    }
  }

  return { syncedCount, failedCount, lastDatabaseState };
}
