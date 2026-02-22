'use server'

import { createClient } from '@/utils/supabase/server'

// Helper to determine Source configuration
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function signIn(formData: FormData) {
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const email = `${username}@it-management.local`

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: `Đăng nhập thất bại: ${error.message}` }
    }

    // Return empty success object instead of redirecting
    // Let the client handle redirection after refreshing cache
    return {}
  } catch (error) {
    return { error: 'Lỗi hệ thống không mong muốn' }
  }
}

export async function signUp(formData: FormData) {
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const email = `${username}@it-management.local`

    const supabase = await createClient()

    // Redirect URL for email verification (if enabled)
    const redirectUrl = `${getBaseUrl()}/auth/callback`

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      return { error: error.message }
    }

    // Force sign out to require manual login
    await supabase.auth.signOut()

    return {}
  } catch (error) {
    return { error: 'Lỗi hệ thống không mong muốn' }
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Server signOut error:', error.message)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Server signOut exception:', error)
    return { error: 'Lỗi đăng xuất' }
  }
}
