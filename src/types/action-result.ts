// ============================================
// ActionResult<T> — kiểu trả về thống nhất cho tất cả server actions
// Thay thế 4 kiểu return khác nhau đang tồn tại:
//   { data, error } | { success, error } | bare objects | {}
// ============================================
export type ActionResult<T = null> =
    | { success: true; data: T; error: null }
    | { success: false; data: null; error: string }

// Helper: trả về kết quả thành công
export function ok<T>(data: T): ActionResult<T> {
    return { success: true, data, error: null }
}

// Helper: trả về lỗi
export function fail(error: string): ActionResult<never> {
    return { success: false, data: null, error }
}
