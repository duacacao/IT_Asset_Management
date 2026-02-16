// ============================================
// QUERY KEYS - Centralized key management for React Query
// This ensures consistency across the app
// ============================================

export const queryKeys = {
  // End Users
  endUsers: {
    all: ['end-users'] as const,
    list: () => [...queryKeys.endUsers.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.endUsers.all, 'detail', id] as const,
  },

  // Departments
  departments: {
    all: ['departments'] as const,
    list: () => [...queryKeys.departments.all, 'list'] as const,
  },

  // Positions
  positions: {
    all: ['positions'] as const,
    list: () => [...queryKeys.positions.all, 'list'] as const,
  },

  // Available Devices (for assignment)
  availableDevices: {
    all: ['available-devices'] as const,
    list: () => [...queryKeys.availableDevices.all, 'list'] as const,
  },

  // Devices (for reference)
  devices: {
    all: ['devices'] as const,
    list: () => [...queryKeys.devices.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.devices.all, 'detail', id] as const,
  },
} as const

// Type-safe helper to get query keys
export type QueryKeys = typeof queryKeys
