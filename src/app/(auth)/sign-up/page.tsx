import { SignUpForm } from '@/components/auth/sign-up-form'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Tạo tài khoản mới</h1>
      <p className="text-muted-foreground text-sm">Nhập thông tin bên dưới để khởi tạo tài khoản</p>

      <SignUpForm initialMessage={params?.message} />
    </div>
  )
}
