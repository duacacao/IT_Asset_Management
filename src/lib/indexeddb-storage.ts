import { get, set, del } from 'idb-keyval';
import { createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

// Raw storage adapter sử dụng IndexedDB (string-based)
const rawStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await get(name)) ?? null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name);
    },
};

// Zustand persist storage — wraps raw IndexedDB với JSON serialization
// Hỗ trợ lưu trữ hàng trăm MB — phù hợp cho 60-70+ files Excel
export const indexedDBStorage = createJSONStorage(() => rawStorage);
