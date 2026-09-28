import { get, set, del, keys, clear } from 'idb-keyval';

export const imageStore = {
  async save(id: string, blob: Blob): Promise<void> {
    await set('vision-img-' + id, blob);
  },
  async get(id: string): Promise<Blob | undefined> {
    return await get<Blob>('vision-img-' + id);
  },
  async delete(id: string): Promise<void> {
    await del('vision-img-' + id);
  },
  async getAllKeys(): Promise<string[]> {
    const allKeys = await keys();
    return allKeys.filter(k => String(k).startsWith('vision-img-')).map(k => String(k).replace('vision-img-', ''));
  },
  async clearAll(): Promise<void> {
    await clear();
  },
  createObjectURL(blob: Blob): string { return URL.createObjectURL(blob); },
  revokeObjectURL(url: string): void { URL.revokeObjectURL(url); }
};