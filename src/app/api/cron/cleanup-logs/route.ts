import { NextRequest, NextResponse } from 'next/server'
import { deleteOldActivityLogs } from '@/app/actions/activity-logs'

/**
 * API endpoint để xóa activity logs cũ hơn 30 ngày.
 *
 * Bảo vệ bởi CRON_SECRET — chỉ cho phép gọi khi có header Authorization đúng.
 * Dùng với external cron service (cron-job.org, Vercel Cron, etc.)
 *
 * Cách gọi:
 *   GET /api/cron/cleanup-logs
 *   Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
    try {
        // Xác thực bằng CRON_SECRET — ngăn chặn gọi trái phép
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (!cronSecret) {
            console.error('[Cron Cleanup] CRON_SECRET chưa được cấu hình')
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Thực hiện xóa log cũ
        const result = await deleteOldActivityLogs()

        if (!result.success) {
            console.error('[Cron Cleanup] Lỗi:', result.error)
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: `Đã xóa ${result.deletedCount} log cũ hơn 30 ngày`,
            deletedCount: result.deletedCount,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('[Cron Cleanup] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
