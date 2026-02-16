export const ACTIVITY_LOG_ACTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LOGIN: 'login',
    LOGOUT: 'logout',
    IMPORT: 'import',
    EXPORT: 'export',
    ASSIGN: 'assign',
    RETURN: 'return',
    MAINTENANCE: 'maintenance',
} as const;

export type ActivityLogAction = typeof ACTIVITY_LOG_ACTIONS[keyof typeof ACTIVITY_LOG_ACTIONS];
