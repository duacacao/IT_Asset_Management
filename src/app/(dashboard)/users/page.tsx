import { Suspense } from 'react'
import { UsersClient } from './UsersClient'
import { getEndUsers } from '@/app/actions/end-users'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { EndUserWithDevice } from '@/types/end-user'

export default async function UsersPage() {
  const result = await getEndUsers()

  // FIX: Handle new return type { endUsers, assignments }
  const initialData: EndUserWithDevice[] = result.data?.endUsers || []

  if (result.error) {
    console.error('Failed to fetch users:', result.error)
    // Có thể thêm Error Boundary hoặc Alert UI ở đây nếu muốn
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-semibold">Quản lý Nhân sự</h1>
        </div>
      </header>

      {/* Client Component Container with Suspense for potential streaming */}
      <Suspense fallback={<div className="p-4">Đang tải dữ liệu...</div>}>
        <UsersClient initialData={initialData} />
      </Suspense>
    </>
  )
}
