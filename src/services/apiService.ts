/**
 * Database Interaction Layer with Offline-First Service Worker & IndexedDB Sync Strategy.
 * Seamlessly handles network drops by caching pending uploads and submissions when offline,
 * and performing auto-synchronization when connectivity is re-established.
 */

import { 
  enqueuePendingItem, 
  getPendingItems, 
  syncPendingQueue, 
  PendingSyncItem 
} from './offlineSync';
import { FleetDatabase } from '../types';

export interface ApiCallResult {
  success: boolean;
  isOfflineQueued: boolean;
  message: string;
  updatedDatabase?: FleetDatabase;
  data?: any;
}

// Global simulation flag for testing offline mode inside preview
let isSimulatedOfflineMode = false;

export function setSimulatedOfflineMode(offline: boolean) {
  isSimulatedOfflineMode = offline;
}

export function getIsOffline(): boolean {
  if (isSimulatedOfflineMode) return true;
  return typeof navigator !== 'undefined' ? !navigator.onLine : false;
}

/**
 * Refactored Database Interaction: Upload Document (Cloud Storage)
 */
export async function uploadCloudDocument(payload: {
  name: string;
  documentType: string;
  source: string;
  notes?: string;
  fileSize?: string;
  fileData?: string;
}, currentFleet: FleetDatabase | null): Promise<ApiCallResult> {
  const isOffline = getIsOffline();
  const title = `Cloud Doc: ${payload.name} (${payload.documentType})`;

  if (isOffline) {
    // Queue item in IndexedDB
    await enqueuePendingItem('DOCUMENT_UPLOAD', title, payload);

    // Create optimistic local state update
    let updatedDb = currentFleet ? { ...currentFleet } : null;
    if (updatedDb) {
      const mockDoc = {
        id: `offline_doc_${Date.now()}`,
        plateNumber: "TN68AB1234",
        name: `${payload.name} (Offline Pending)`,
        type: "Other" as const,
        uploadedAt: new Date().toISOString().split("T")[0],
        url: payload.fileData || ""
      };
      // Optimistically add to vehicles docs
      if (updatedDb.vehicles.length > 0) {
        updatedDb.vehicles[0].documents.unshift(mockDoc);
      }
    }

    return {
      success: true,
      isOfflineQueued: true,
      message: `⚡ Device is offline! Document "${payload.name}" cached in Service Worker queue for auto-sync.`,
      updatedDatabase: updatedDb || undefined
    };
  }

  // Attempt real network call
  try {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        isOfflineQueued: false,
        message: `Uploaded ${payload.name} successfully to server!`,
        updatedDatabase: data.database || data.currentDatabase
      };
    } else {
      throw new Error(`Server returned status ${res.status}`);
    }
  } catch (error: any) {
    console.warn('Network request failed during document upload. Falling back to offline queue...', error);
    
    // Fallback to offline queue
    await enqueuePendingItem('DOCUMENT_UPLOAD', title, payload);

    return {
      success: true,
      isOfflineQueued: true,
      message: `⚡ Network connection issue! Saved document to offline Service Worker queue. Will sync when online.`,
    };
  }
}

/**
 * Refactored Database Interaction: Submit Expense Log
 */
export async function submitExpenseLog(payload: {
  plateNumber: string;
  amount: number;
  category: 'Fuel' | 'Maintenance' | 'Repairs' | 'Tolls' | 'Fines' | 'Others';
  description: string;
  date?: string;
}, currentFleet: FleetDatabase | null): Promise<ApiCallResult> {
  const isOffline = getIsOffline();
  const dateStr = payload.date || new Date().toISOString().split('T')[0];
  const title = `Expense Log: Rs. ${payload.amount} (${payload.category} - ${payload.plateNumber})`;

  const chatActionPayload = {
    message: `Logged expense of Rs. ${payload.amount} for ${payload.plateNumber} under ${payload.category}: ${payload.description}`,
    history: []
  };

  if (isOffline) {
    // Queue item in IndexedDB
    await enqueuePendingItem('EXPENSE_SUBMISSION', title, chatActionPayload);

    // Apply local optimistic update
    let updatedDb = currentFleet ? JSON.parse(JSON.stringify(currentFleet)) : null;
    if (updatedDb) {
      const newExp = {
        id: `offline_exp_${Date.now()}`,
        plateNumber: payload.plateNumber,
        date: dateStr,
        amount: Number(payload.amount),
        category: payload.category,
        description: `${payload.description} (Offline Queued)`
      };
      updatedDb.expenseLogs.unshift(newExp);
      
      const vIndex = updatedDb.vehicles.findIndex((v: any) => v.plateNumber === payload.plateNumber);
      if (vIndex !== -1) {
        updatedDb.vehicles[vIndex].expenses.unshift(newExp);
      }
    }

    return {
      success: true,
      isOfflineQueued: true,
      message: `⚡ Device is offline! Logged Rs. ${payload.amount} expense locally in Service Worker storage. Will sync when online.`,
      updatedDatabase: updatedDb || undefined
    };
  }

  // Attempt real network call
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatActionPayload)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        isOfflineQueued: false,
        message: `Expense of Rs. ${payload.amount} submitted successfully!`,
        updatedDatabase: data.currentDatabase || data.database
      };
    } else {
      throw new Error(`Server returned status ${res.status}`);
    }
  } catch (error: any) {
    console.warn('Network request failed during expense submission. Falling back to offline queue...', error);

    await enqueuePendingItem('EXPENSE_SUBMISSION', title, chatActionPayload);

    return {
      success: true,
      isOfflineQueued: true,
      message: `⚡ Connection failed! Saved expense log to Service Worker queue for auto-sync.`,
    };
  }
}

/**
 * Refactored Database Interaction: Confirm Document Extraction Verification
 */
export async function confirmDocumentData(payload: {
  fileName: string;
  data: any;
}, currentFleet: FleetDatabase | null): Promise<ApiCallResult> {
  const isOffline = getIsOffline();
  const title = `Verified Doc: ${payload.fileName}`;

  if (isOffline) {
    await enqueuePendingItem('CONFIRM_DOCUMENT', title, payload);

    return {
      success: true,
      isOfflineQueued: true,
      message: `⚡ Offline mode active! Verified document data queued in Service Worker for auto-sync.`,
    };
  }

  try {
    const res = await fetch('/api/confirm-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        isOfflineQueued: false,
        message: data.message || "Document verified and saved to fleet log!",
        updatedDatabase: data.currentDatabase || data.database
      };
    } else {
      throw new Error(`Server status ${res.status}`);
    }
  } catch (error: any) {
    await enqueuePendingItem('CONFIRM_DOCUMENT', title, payload);
    return {
      success: true,
      isOfflineQueued: true,
      message: `⚡ Saved verified document to Service Worker queue due to network status.`,
    };
  }
}

/**
 * Synchronize all pending items in IndexedDB with the backend server
 */
export async function autoSyncPendingQueue(
  onProgress?: (msg: string) => void
): Promise<{ syncedCount: number; failedCount: number; updatedDatabase?: FleetDatabase }> {
  const result = await syncPendingQueue(onProgress);

  // If items were synced and server returned fresh DB, return it
  if (result.syncedCount > 0) {
    try {
      const freshRes = await fetch('/api/fleet');
      if (freshRes.ok) {
        const freshDb = await freshRes.json();
        return { ...result, updatedDatabase: freshDb };
      }
    } catch (err) {
      console.warn("Could not refetch fleet after sync:", err);
    }
  }

  return { ...result, updatedDatabase: result.lastDatabaseState };
}
