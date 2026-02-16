// Tiện ích thời gian tương đối dùng Intl.RelativeTimeFormat chuẩn
// Hỗ trợ tiếng Việt, dùng chung cho toàn app

const rtf = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' })

/**
 * Chuyển đổi chuỗi ngày thành thời gian tương đối (vd: "2 giờ trước")
 * Sử dụng Intl.RelativeTimeFormat chuẩn thay vì tự build chuỗi
 */
export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date

  // Tránh hiển thị thời gian tương lai hoặc vừa xong
  if (diffMs < 60_000) return 'Vừa xong'

  const diffMinutes = Math.floor(diffMs / 60_000)
  if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute')

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return rtf.format(-diffHours, 'hour')

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return rtf.format(-diffDays, 'day')

  // Quá 30 ngày → hiển thị ngày cụ thể
  return new Date(dateStr).toLocaleDateString('vi-VN')
}
