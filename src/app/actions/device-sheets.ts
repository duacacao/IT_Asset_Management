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

  // Đọc sheet hiện tại
  const { data: sheet, error: readError } = await supabase
    .from('device_sheets')
    .select('sheet_data')
    .eq('id', sheetId)
    .single()

  if (readError || !sheet) {
    return { data: null, error: readError?.message || 'Không tìm thấy sheet' }
  }

  // Sửa cell trong sheet_data (JSONB array)
  const sheetData = (sheet.sheet_data as any[]) || []
  if (rowIndex >= 0 && rowIndex < sheetData.length) {
    sheetData[rowIndex] = {
      ...sheetData[rowIndex],
      [columnKey]: value,
    }
  } else {
    return { data: null, error: `Row index ${rowIndex} ngoài phạm vi` }
  }

  // Ghi lại
  const { data: updated, error: writeError } = await supabase
    .from('device_sheets')
    .update({ sheet_data: sheetData })
    .eq('id', sheetId)
    .select()
    .single()

  if (writeError) {
    return { data: null, error: writeError.message }
  }

  return { data: updated, error: null }
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
// ============================================
export async function reorderSheets(sheetsOrder: { id: string; sort_order: number }[]) {
  const { supabase } = await requireAuth()

  // Update từng sheet với sort_order mới
  const updates = sheetsOrder.map(({ id, sort_order }) =>
    supabase.from('device_sheets').update({ sort_order }).eq('id', id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter((r) => r.error)

  if (errors.length > 0) {
    return { success: false, error: 'Lỗi sắp xếp sheets' }
  }

  return { success: true, error: null }
}

// ============================================
// Thêm row vào sheet
// ============================================
export async function addSheetRow(sheetId: string, rowData: Record<string, any>) {
  const { supabase } = await requireAuth()

  // Đọc sheet hiện tại
  const { data: sheet, error: readError } = await supabase
    .from('device_sheets')
    .select('sheet_data')
    .eq('id', sheetId)
    .single()

  if (readError || !sheet) {
    return { data: null, error: readError?.message || 'Không tìm thấy sheet' }
  }

  // Thêm row mới vào cuối
  const sheetData = (sheet.sheet_data as any[]) || []
  sheetData.push(rowData)

  // Ghi lại
  const { data: updated, error: writeError } = await supabase
    .from('device_sheets')
    .update({ sheet_data: sheetData })
    .eq('id', sheetId)
    .select()
    .single()

  if (writeError) {
    return { data: null, error: writeError.message }
  }

  return { data: updated, error: null }
}

// ============================================
// Xóa row trong sheet
// ============================================
export async function deleteSheetRow(sheetId: string, rowIndex: number) {
  const { supabase } = await requireAuth()

  // Đọc sheet hiện tại
  const { data: sheet, error: readError } = await supabase
    .from('device_sheets')
    .select('sheet_data')
    .eq('id', sheetId)
    .single()

  if (readError || !sheet) {
    return { data: null, error: readError?.message || 'Không tìm thấy sheet' }
  }

  // Xóa row theo index
  const sheetData = (sheet.sheet_data as any[]) || []
  if (rowIndex < 0 || rowIndex >= sheetData.length) {
    return { data: null, error: `Row index ${rowIndex} ngoài phạm vi` }
  }

  sheetData.splice(rowIndex, 1)

  // Ghi lại
  const { data: updated, error: writeError } = await supabase
    .from('device_sheets')
    .update({ sheet_data: sheetData })
    .eq('id', sheetId)
    .select()
    .single()

  if (writeError) {
    return { data: null, error: writeError.message }
  }

  return { data: updated, error: null }
}
