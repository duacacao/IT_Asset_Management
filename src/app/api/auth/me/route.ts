import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Lấy thông tin user hiện tại từ Supabase Auth session
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0],
      created_at: user.created_at,
    },
  })
}
