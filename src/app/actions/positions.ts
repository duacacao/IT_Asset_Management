'use server'

import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { Position, PositionInsert } from '@/types/department'

export async function getPositions(): Promise<{
  data: Position[] | null
  error: string | null
}> {
  const { supabase, user } = await requireAuth()

  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) {
    console.error('Lỗi lấy positions:', error.message)
    return { data: null, error: error.message }
  }

  return { data: data || [], error: null }
}

export async function createPosition(position: PositionInsert): Promise<{
  data: Position | null
  error: string | null
}> {
  const { supabase, user } = await requireAuth()

  const { data, error } = await supabase
    .from('positions')
    .insert({
      ...position,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Lỗi tạo position:', error.message)
    return { data: null, error: error.message }
  }

  revalidatePath('/end-user')
  return { data, error: null }
}

export async function updatePosition(
  id: string,
  updates: Partial<PositionInsert>
): Promise<{
  data: Position | null
  error: string | null
}> {
  const { supabase, user } = await requireAuth()

  const { data, error } = await supabase
    .from('positions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Lỗi cập nhật position:', error.message)
    return { data: null, error: error.message }
  }

  revalidatePath('/end-user')
  return { data, error: null }
}

export async function deletePosition(id: string): Promise<{
  success: boolean
  error: string | null
}> {
  const { supabase, user } = await requireAuth()

  const { error } = await supabase
    .from('positions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Lỗi xóa position:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/end-user')
  return { success: true, error: null }
}
