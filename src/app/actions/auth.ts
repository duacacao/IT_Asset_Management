'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

// ============================================
// Schema Zod để validate input auth — tránh `as string` cast không an toàn
// Validate tại server, không phụ thuộc vào form client
// ============================================
const signInSchema = z.object({
  username: z
    .string()
    .min(1, 'Tên đăng nhập không được để trống')
    .max(100, 'Tên đăng nhập tối đa 100 ký tự'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự'),
})

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, 'Tên đăng nhập phải ít nhất 3 ký tự')
    .max(100, 'Tên đăng nhập tối đa 100 ký tự')
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới, chấm, gạch ngang'
    ),
  password: z
    .string()
    .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự'),
})

// Helper to determine Source configuration
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function signIn(formData: FormData) {
  try {
    // Validate input với Zod — thay thế `as string` cast không an toàn
    const parsed = signInSchema.safeParse({
      username: formData.get('username'),
      password: formData.get('password'),
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return { error: firstError?.message || 'Dữ liệu đăng nhập không hợp lệ' }
    }

    const { username, password } = parsed.data
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
    // Validate input với Zod — thay thế `as string` cast không an toàn
    const parsed = signUpSchema.safeParse({
      username: formData.get('username'),
      password: formData.get('password'),
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return { error: firstError?.message || 'Dữ liệu đăng ký không hợp lệ' }
    }

    const { username, password } = parsed.data
    const email = `${username}@it-management.local`

    const supabase = await createClient()

    // Redirect URL for email verification (if enabled)
    const redirectUrl = `${getBaseUrl()}/auth/callback`

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      return { error: error.message }
    }

    // Auto-create organization + membership cho user mới
    // Dùng service role key để bypass RLS vì user mới chưa có org membership
    const newUserId = signUpData.user?.id
    if (newUserId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (supabaseUrl && serviceRoleKey) {
        const adminClient = createAdminClient(supabaseUrl, serviceRoleKey)

        // Tạo slug từ username — đảm bảo unique
        const slug = `${username.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`
        const orgName = `${username}'s Organization`

        // Tạo organization
        const { data: org } = await adminClient
          .from('organizations')
          .insert({
            name: orgName,
            slug,
            created_by: newUserId,
          })
          .select('id')
          .single()

        if (org) {
          // Tạo membership (owner)
          await adminClient.from('organization_members').insert({
            organization_id: org.id,
            user_id: newUserId,
            role: 'owner',
          })

          // Set current_organization_id cho profile
          await adminClient
            .from('profiles')
            .update({ current_organization_id: org.id })
            .eq('id', newUserId)
        }
      }
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
