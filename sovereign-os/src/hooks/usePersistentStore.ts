import { useState, useEffect } from 'react';

export function usePersistentStore<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch (e) { console.error('Failed to save:', e); }
  }, [key, state]);

  return [state, setState];
}
