import { keys as idbKeys, get as idbGet } from 'idb-keyval';
import { cloudStorage } from './cloudStorage';
import { imageStore } from './imageStore';

// One-time helper for people who used Sovereign OS before accounts existed:
// pulls whatever is sitting in this browser's real localStorage/IndexedDB
// into the newly-authenticated cloud account. Must run AFTER sign-in, since
// imageStore.save() needs a current user id to know where to upload.

export function hasLocalData(): boolean {
  return window.localStorage.length > 0;
}

export async function importLocalDataToCloud(): Promise<{ keysImported: number; imagesImported: number }> {
  let keysImported = 0;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    const value = window.localStorage.getItem(key);
    if (value === null) continue;
    cloudStorage.setItem(key, value);
    keysImported++;
  }

  let imagesImported = 0;
  try {
    const allKeys = await idbKeys();
    const visionKeys = allKeys.map(String).filter(k => k.startsWith('vision-img-'));
    for (const fullKey of visionKeys) {
      const blob = await idbGet<Blob>(fullKey);
      if (!blob) continue;
      const id = fullKey.replace('vision-img-', '');
      await imageStore.save(id, blob);
      imagesImported++;
    }
  } catch (e) {
    console.error('Failed to import local images:', e);
  }

  return { keysImported, imagesImported };
}
