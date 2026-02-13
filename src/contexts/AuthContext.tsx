"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User, LoginCredentials } from '@/lib/auth'
import * as authLib from '@/lib/auth'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Check session on mount
    useEffect(() => {
        async function initAuth() {
            try {
                const userData = await authLib.checkSession()
                setUser(userData)
            } finally {
                setIsLoading(false)
            }
        }
        initAuth()
    }, [])

    const login = async (credentials: LoginCredentials) => {
        await authLib.login(credentials)
        const userData = await authLib.checkSession()
        setUser(userData)
        router.push('/devices')
    }

    const logout = async () => {
        await authLib.logout()
        setUser(null)
        // Router push is handled in authLib or we can do it here
        router.push('/sign-in')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
