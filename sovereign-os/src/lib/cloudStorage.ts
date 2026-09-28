import { supabase, supabaseConfigured } from './supabaseClient';
import { getCurrentUserId } from './session';

// A localStorage-shaped object (getItem/setItem/removeItem/clear/key/length)
// backed by an in-memory cache + a Supabase table, so usePersistentStore and
// the handful of raw localStorage call sites can swap to this with no other
// code changes. The cache is synchronous (required for usePersistentStore's
// lazy useState initializer); writes update it immediately and push to
// Supabase via a per-key debounced upsert.

const TABLE = 'user_data';
const DEBOUNCE_MS = 600;

const cache = new Map<string, string>();
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();
let hydrated = false;

function scheduleUpsert(userId: string, key: string, value: string) {
  const existing = pendingTimers.get(key);
  if (existing) clearTimeout(existing);
  pendingTimers.set(key, setTimeout(() => {
    pendingTimers.delete(key);
    supabase.from(TABLE).upsert({ user_id: userId, key, value, updated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) console.error('cloudStorage: failed to save', key, error); });
  }, DEBOUNCE_MS));
}

export const cloudStorage = {
  getItem(key: string): string | null {
    return cache.has(key) ? cache.get(key)! : null;
  },
  setItem(key: string, value: string): void {
    cache.set(key, value);
    const userId = getCurrentUserId();
    if (userId && supabaseConfigured) scheduleUpsert(userId, key, value);
  },
  removeItem(key: string): void {
    cache.delete(key);
    const timer = pendingTimers.get(key);
    if (timer) { clearTimeout(timer); pendingTimers.delete(key); }
    const userId = getCurrentUserId();
    if (userId && supabaseConfigured) {
      supabase.from(TABLE).delete().eq('user_id', userId).eq('key', key)
        .then(({ error }) => { if (error) console.error('cloudStorage: failed to delete', key, error); });
    }
  },
  clear(): void {
    cache.clear();
    pendingTimers.forEach(t => clearTimeout(t));
    pendingTimers.clear();
    const userId = getCurrentUserId();
    if (userId && supabaseConfigured) {
      supabase.from(TABLE).delete().eq('user_id', userId)
        .then(({ error }) => { if (error) console.error('cloudStorage: failed to clear', error); });
    }
  },
  key(index: number): string | null {
    return Array.from(cache.keys())[index] ?? null;
  },
  get length(): number {
    return cache.size;
  },
};

export async function hydrateCloudStorage(userId: string): Promise<void> {
  cache.clear();
  hydrated = false;
  if (supabaseConfigured) {
    const { data, error } = await supabase.from(TABLE).select('key, value').eq('user_id', userId);
    if (error) throw error;
    for (const row of data || []) cache.set(row.key, row.value);
  }
  hydrated = true;
}

export function resetCloudStorage(): void {
  cache.clear();
  pendingTimers.forEach(t => clearTimeout(t));
  pendingTimers.clear();
  hydrated = false;
}

export function isCloudStorageHydrated(): boolean {
  return hydrated;
}

export function cloudStorageSize(): number {
  return cache.size;
}
