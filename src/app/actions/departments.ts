'use server'

import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import type { Department, DepartmentInsert } from '@/types/department'

export async function getDepartments(): Promise<{
  data: Department[] | null
  error: string | null
}> {
  const { supabase, organization } = await requireAuth()

  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('organization_id', organization.id)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) {
    console.error('Lỗi lấy departments:', error.message)
    return { data: null, error: error.message }
  }

  return { data: data || [], error: null }
}

export async function createDepartment(department: DepartmentInsert): Promise<{
  data: Department | null
  error: string | null
}> {
  const { supabase, user, organization, role } = await requireAuth()
  requirePermission(role, 'departments:write')

  const { data, error } = await supabase
    .from('departments')
    .insert({
      ...department,
      user_id: user.id,
      organization_id: organization.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Lỗi tạo department:', error.message)
    return { data: null, error: error.message }
  }

  revalidatePath('/end-user')
  revalidatePath('/department')
  revalidatePath('/organization')
  return { data, error: null }
}

export async function updateDepartment(
  id: string,
  updates: Partial<DepartmentInsert>
): Promise<{
  data: Department | null
  error: string | null
}> {
  const { supabase, role } = await requireAuth()
  requirePermission(role, 'departments:write')

  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Lỗi cập nhật department:', error.message)
    return { data: null, error: error.message }
  }

  revalidatePath('/end-user')
  revalidatePath('/department')
  revalidatePath('/organization')
  return { data, error: null }
}

export async function deleteDepartment(id: string): Promise<{
  success: boolean
  error: string | null
}> {
  const { supabase, role } = await requireAuth()
  requirePermission(role, 'departments:write')

  const { error } = await supabase
    .from('departments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Lỗi xóa department:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/end-user')
  revalidatePath('/department')
  revalidatePath('/organization')
  return { success: true, error: null }
}
