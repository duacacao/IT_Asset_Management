import { create } from 'zustand'

// ============================================
// UI Store — chỉ quản lý transient state
// KHÔNG persist — data sống trên server (Supabase)
// ============================================

interface ImportProgress {
  current: number
  total: number
  fileName: string
}

const INITIAL_PROGRESS: ImportProgress = {
  current: 0,
  total: 0,
  fileName: '',
}

interface UIState {
  // Device đang được chọn (ID)
  selectedDeviceId: string | null
  setSelectedDeviceId: (id: string | null) => void

  // Loading state cho import
  isImporting: boolean
  importProgress: ImportProgress
  setImporting: (loading: boolean) => void
  setImportProgress: (progress: ImportProgress) => void
  resetImportProgress: () => void

  // Highlight device mới tạo/import (flash animation)
  highlightId: string | null
  setHighlightId: (id: string | null) => void
}

export const useUIStore = create<UIState>()((set) => ({
  selectedDeviceId: null,
  setSelectedDeviceId: (id) => set({ selectedDeviceId: id }),

  isImporting: false,
  importProgress: INITIAL_PROGRESS,
  setImporting: (loading) => set({ isImporting: loading }),
  setImportProgress: (progress) => set({ importProgress: progress }),
  resetImportProgress: () => set({ importProgress: INITIAL_PROGRESS }),

  highlightId: null,
  setHighlightId: (id) => set({ highlightId: id }),
}))
