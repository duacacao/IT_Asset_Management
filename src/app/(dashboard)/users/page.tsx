import { Suspense } from 'react'
import { UsersClient } from './UsersClient'
import { getEndUsers } from '@/app/actions/end-users'
import { EndUserWithDevice } from '@/types/end-user'

export default async function UsersPage() {
  const result = await getEndUsers()

  // FIX: Handle new return type { endUsers, assignments }
  const initialData: EndUserWithDevice[] = result.data?.endUsers || []

  if (result.error) {
    console.error('Failed to fetch users:', result.error)
  }

  return (
    <Suspense fallback={<div className="p-4">Đang tải dữ liệu...</div>}>
      <UsersClient initialData={initialData} />
    </Suspense>
  )
}
