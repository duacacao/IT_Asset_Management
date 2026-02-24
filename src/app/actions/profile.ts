'use server'

import { requireAuth } from '@/lib/auth'
import type { Profile } from '@/types/supabase'

// ============================================
// Lấy profile user hiện tại
// RLS: chỉ xem được profile mình
// ============================================
export async function getProfile(): Promise<{
  data: Profile | null
  error: string | null
}> {
  const { supabase, user } = await requireAuth()

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (error) {
    console.error('Lỗi lấy profile:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ============================================
// Cập nhật profile (full_name, avatar_url)
// ============================================
export async function updateProfile(updates: { full_name?: string; avatar_url?: string }) {
  const { supabase, user } = await requireAuth()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Lỗi cập nhật profile:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}


// ============================================
// Cập nhật profile settings (JSONB) — atomic merge qua RPC
// Column 'settings' được thêm qua migration: add_profiles_settings_column
// ============================================
export async function updateProfileSettings(settings: Record<string, any>) {
  const { supabase, user } = await requireAuth()

  // Atomic JSONB merge tại DB level — tránh race condition
  const { error } = await supabase.rpc('merge_profile_settings', {
    p_user_id: user.id,
    p_settings: settings,
  })

  if (error) {
    console.error('Lỗi cập nhật settings:', error.message)
    return { data: null, error: error.message }
  }

  return { data: null, error: null }
}

