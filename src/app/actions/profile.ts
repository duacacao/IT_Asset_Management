'use server'

import { createClient } from '@/utils/supabase/server'
import type { Profile } from '@/types/supabase'

// ============================================
// Lấy profile user hiện tại
// RLS: chỉ xem được profile mình
// ============================================
export async function getProfile(): Promise<{
  data: Profile | null
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Chưa đăng nhập' }
  }

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
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Chưa đăng nhập' }
  }

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
// Cập nhật profile settings (JSONB)
// ============================================
export async function updateProfileSettings(settings: Record<string, any>) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Chưa đăng nhập' }
  }

  // 1. Get current settings (for merging)
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('settings')
    .eq('id', user.id)
    .single()

  if (fetchError) {
    console.error('Lỗi lấy settings cũ:', fetchError.message)
    return { data: null, error: fetchError.message }
  }

  const currentSettings = (profile.settings as Record<string, any>) || {}
  const newSettings = {
    ...currentSettings,
    ...settings,
  }

  // 2. Update with merged settings
  const { data, error } = await supabase
    .from('profiles')
    .update({
      settings: newSettings,
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Lỗi cập nhật settings:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
