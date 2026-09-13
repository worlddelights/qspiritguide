import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface VaultSession {
  id: string;                      // UUID
  timestamp: number;
  signature: string;               // Multiverse coordinate
  seed32: number;                  // Sampling seed
  symbols: [string, string, string];
  promptId: string;                // e.g. "forest-02"
  pendulumState: { theta: number; omega: number; timeDeltaMs: number };
  contextSummary?: string;         // Local rolling summary used for generation
  compactionVersion?: string;      // Version of the summary prompt and format
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>;
}

interface VaultDB extends DBSchema {
  qspirit_vault: {
    key: string;
    value: VaultSession;
    indexes: { 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<VaultDB>> | null = null;

export function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<VaultDB>('qspirit-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('qspirit_vault', { keyPath: 'id' });
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }
  return dbPromise;
}

export async function saveSession(session: VaultSession) {
  const db = await getDB();
  if (db) {
    return db.put('qspirit_vault', session);
  }
}

export async function getSession(id: string) {
  const db = await getDB();
  if (db) {
    return db.get('qspirit_vault', id);
  }
  return null;
}

export async function clearVault() {
  const db = await getDB();
  if (db) {
    return db.clear('qspirit_vault');
  }
}
