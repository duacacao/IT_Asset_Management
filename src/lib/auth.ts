// Authentication utilities via API
// Server-side JWT implementation

export interface User {
    username: string
    role: 'admin' | 'user'
}

export interface LoginCredentials {
    email: string
    password: string
}

/**
 * Login via API
 */
export async function login(credentials: LoginCredentials): Promise<void> {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
    }

    // Cookie is set automatically by the server response
}

/**
 * Verify session via API (check /api/auth/me)
 */
export async function checkSession(): Promise<User | null> {
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            return data.user;
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Logout via API
 */
export async function logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Redirect handled by caller or router
    if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
    }
}
