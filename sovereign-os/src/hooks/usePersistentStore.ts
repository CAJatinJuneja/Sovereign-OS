import { useState, useEffect, useCallback } from 'react';
import { cloudStorage } from '../lib/cloudStorage';

type SetStateAction<T> = T | ((prev: T) => T);

export function usePersistentStore<T>(key: string, initialValue: T): [T, (value: SetStateAction<T>) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = cloudStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  useEffect(() => {
    try { cloudStorage.setItem(key, JSON.stringify(state)); }
    catch (e) { console.error('Failed to save:', e); }
  }, [key, state]);

  const setStoreValue = useCallback((value: SetStateAction<T>) => {
    setState(prev => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      return next;
    });
  }, []);

  return [state, setStoreValue];
}
