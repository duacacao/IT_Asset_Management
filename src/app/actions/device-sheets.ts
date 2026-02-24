'use server'

import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { DeviceSheetInsert, DeviceSheetUpdate } from '@/types/supabase'

// ============================================
// Lấy tất cả sheets của 1 device
// RLS tự động filter — chỉ owner device mới xem được sheets
// ============================================
export async function getDeviceSheets(deviceId: string) {
  const { supabase } = await requireAuth()

  const { data, error } = await supabase
    .from('device_sheets')
    .select('*')
    .eq('device_id', deviceId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Lỗi lấy sheets:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ============================================
// Tạo sheet mới cho device
// ============================================
export async function createSheet(sheetData: Omit<DeviceSheetInsert, 'id' | 'created_at'>) {
  const { supabase } = await requireAuth()

  const { data, error } = await supabase.from('device_sheets').insert(sheetData).select().single()

  if (error) {
    console.error('Lỗi tạo sheet:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ============================================
// Cập nhật toàn bộ sheet_data (khi edit cells)
// ============================================
export async function updateSheetData(sheetId: string, sheetData: any[]) {
  const { supabase } = await requireAuth()

  const { data, error } = await supabase
    .from('device_sheets')
    .update({ sheet_data: sheetData })
    .eq('id', sheetId)
    .select()
    .single()

  if (error) {
    console.error('Lỗi cập nhật sheet data:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ============================================
// Cập nhật 1 cell trong sheet
// Đọc sheet_data hiện tại → sửa cell → ghi lại
// ============================================
export async function updateSheetCell(
  sheetId: string,
  rowIndex: number,
  columnKey: string,
  value: any
) {
  const { supabase } = await requireAuth()

  // Atomic update tại DB level — tránh race condition read-modify-write
  const { data, error } = await supabase
    .rpc('update_sheet_cell', {
      p_sheet_id: sheetId,
      p_row_index: rowIndex,
      p_key: columnKey,
      p_value: JSON.stringify(value),
    })
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ============================================
// Rename sheet
// ============================================
export async function renameSheet(sheetId: string, newName: string) {
  const { supabase } = await requireAuth()

  const { data, error } = await supabase
    .from('device_sheets')
    .update({ sheet_name: newName })
    .eq('id', sheetId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ============================================
// Xóa sheet
// ============================================
export async function deleteSheet(sheetId: string) {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('device_sheets').delete().eq('id', sheetId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

// ============================================
// Sắp xếp lại thứ tự sheets (drag & drop)
// Dùng RPC Postgres function để batch update trong 1 query thay vì N queries
// ============================================
export async function reorderSheets(sheetsOrder: { id: string; sort_order: number }[]) {
  const { supabase } = await requireAuth()

  // 1 round-trip thay vì N UPDATE queries song song
  const { error } = await supabase.rpc('reorder_sheets', {
    p_orders: JSON.stringify(sheetsOrder),
  })

  if (error) {
    return { success: false, error: 'Lỗi sắp xếp sheets: ' + error.message }
  }

  return { success: true, error: null }
}

// ============================================
// Thêm row vào sheet
// ============================================
export async function addSheetRow(sheetId: string, rowData: Record<string, any>) {
  const { supabase } = await requireAuth()

  // Atomic append tại DB level — tránh race condition
  const { data, error } = await supabase
    .rpc('add_sheet_row', {
      p_sheet_id: sheetId,
      p_row_data: rowData,
    })
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ============================================
// Xóa row trong sheet
// ============================================
export async function deleteSheetRow(sheetId: string, rowIndex: number) {
  const { supabase } = await requireAuth()

  // Atomic delete tại DB level — tránh race condition
  const { data, error } = await supabase
    .rpc('delete_sheet_row', {
      p_sheet_id: sheetId,
      p_row_index: rowIndex,
    })
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
