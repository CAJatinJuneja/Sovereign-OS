import { supabase } from './supabaseClient';
import { getCurrentUserId } from './session';

const BUCKET = 'vision-images';

function requireUserId(): string {
  const id = getCurrentUserId();
  if (!id) throw new Error('imageStore: no signed-in user');
  return id;
}

export const imageStore = {
  async save(id: string, blob: Blob): Promise<void> {
    const userId = requireUserId();
    const { error } = await supabase.storage.from(BUCKET).upload(`${userId}/${id}`, blob, { upsert: true });
    if (error) throw error;
  },
  async get(id: string): Promise<Blob | undefined> {
    const userId = requireUserId();
    const { data, error } = await supabase.storage.from(BUCKET).download(`${userId}/${id}`);
    if (error) return undefined;
    return data ?? undefined;
  },
  async delete(id: string): Promise<void> {
    const userId = requireUserId();
    await supabase.storage.from(BUCKET).remove([`${userId}/${id}`]);
  },
  async getAllKeys(): Promise<string[]> {
    const userId = getCurrentUserId();
    if (!userId) return [];
    const { data, error } = await supabase.storage.from(BUCKET).list(userId);
    if (error || !data) return [];
    return data.map(f => f.name);
  },
  async clearAll(): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) return;
    const { data } = await supabase.storage.from(BUCKET).list(userId);
    const paths = (data || []).map(f => `${userId}/${f.name}`);
    if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
  },
  createObjectURL(blob: Blob): string { return URL.createObjectURL(blob); },
  revokeObjectURL(url: string): void { URL.revokeObjectURL(url); }
};
