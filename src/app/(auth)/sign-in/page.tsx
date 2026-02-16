import { SignInForm } from '@/components/auth/sign-in-form'

// Force dynamic rendering to handle searchParams properly
export const dynamic = 'force-dynamic'

export default async function SignInPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams
  const message = searchParams?.message

  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập hệ thống</h1>
      <p className="text-muted-foreground text-sm">
        Nhập tên đăng nhập để truy cập quản lý tài sản
      </p>

      <SignInForm initialMessage={message} />
    </div>
  )
}
