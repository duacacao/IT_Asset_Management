import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { indexedDBStorage } from '@/lib/indexeddb-storage';
import type { ImportedTheme } from '@/types/theme-customizer';

interface AppearanceState {
    // Theme selections
    selectedTheme: string;
    selectedTweakcnTheme: string;
    selectedRadius: string;
    importedTheme: ImportedTheme | null;
    brandColorsValues: Record<string, string>;

    // Sidebar config
    sidebarVariant: 'sidebar' | 'floating' | 'inset';
    sidebarCollapsible: 'offcanvas' | 'icon' | 'none';
    sidebarSide: 'left' | 'right';

    // Actions — Theme
    setSelectedTheme: (theme: string) => void;
    setSelectedTweakcnTheme: (theme: string) => void;
    setSelectedRadius: (radius: string) => void;
    setImportedTheme: (theme: ImportedTheme | null) => void;
    setBrandColorsValues: (values: Record<string, string>) => void;
    resetAppearance: () => void;

    // Actions — Sidebar
    updateSidebarConfig: (config: Partial<Pick<AppearanceState, 'sidebarVariant' | 'sidebarCollapsible' | 'sidebarSide'>>) => void;
}

const DEFAULT_STATE = {
    selectedTheme: 'default',
    selectedTweakcnTheme: '',
    selectedRadius: '0.5rem',
    importedTheme: null,
    brandColorsValues: {},
    sidebarVariant: 'inset' as const,
    sidebarCollapsible: 'offcanvas' as const,
    sidebarSide: 'left' as const,
};

export const useAppearanceStore = create<AppearanceState>()(
    persist(
        (set) => ({
            ...DEFAULT_STATE,

            setSelectedTheme: (theme) =>
                set({ selectedTheme: theme, selectedTweakcnTheme: '', importedTheme: null, brandColorsValues: {} }),

            setSelectedTweakcnTheme: (theme) =>
                set({ selectedTweakcnTheme: theme, selectedTheme: '', importedTheme: null, brandColorsValues: {} }),

            setSelectedRadius: (radius) => set({ selectedRadius: radius }),

            setImportedTheme: (theme) =>
                set({ importedTheme: theme, selectedTheme: '', selectedTweakcnTheme: '' }),

            setBrandColorsValues: (values) => set({ brandColorsValues: values }),

            resetAppearance: () => set(DEFAULT_STATE),

            updateSidebarConfig: (config) =>
                set((state) => ({
                    sidebarVariant: config.sidebarVariant ?? state.sidebarVariant,
                    sidebarCollapsible: config.sidebarCollapsible ?? state.sidebarCollapsible,
                    sidebarSide: config.sidebarSide ?? state.sidebarSide,
                })),
        }),
        {
            name: 'appearance-storage',
            storage: indexedDBStorage,
        }
    )
);
