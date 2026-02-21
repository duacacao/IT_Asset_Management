'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLoader } from '@/components/ui/app-loader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/app/actions/auth'

export function SignUpForm({ initialMessage }: { initialMessage?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(initialMessage || null)
  const [fieldErrors, setFieldErrors] = useState<{ confirmPassword?: string }>({})

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setFieldErrors({})

    // Client-side validation
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' })
      return
    }

    startTransition(async () => {
      const result = await signUp(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      // Redirect to sign in on success
      router.push('/sign-in?message=Đăng ký thành công! Vui lòng đăng nhập.')
    })
  }

  return (
    <div className="grid gap-6 pt-4">
      <form action={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2 text-left">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              name="username"
              placeholder="admin"
              type="text"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              required
              disabled={isPending}
            />
            <p className="text-muted-foreground text-[0.8rem]">
              Sử dụng mã nhân viên hoặc tên viết tắt (vd: nv.an)
            </p>
          </div>
          <div className="grid gap-2 text-left">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="123456"
              autoComplete="off"
              required
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2 text-left">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="123456"
              autoComplete="off"
              required
              disabled={isPending}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-destructive text-[0.8rem]">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <AppLoader layout="horizontal" hideText className="mr-2" />
                Đang đăng ký...
              </>
            ) : (
              'Đăng ký tài khoản'
            )}
          </Button>

          {error && (
            <p className="bg-destructive/15 text-destructive animate-in fade-in slide-in-from-top-1 mt-2 rounded-md p-3 text-center text-sm font-medium">
              {error}
            </p>
          )}
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">Hoặc tiếp tục với</span>
        </div>
      </div>

      <Button variant="outline" type="button" disabled>
        Github (Coming Soon)
      </Button>

      <div className="mt-4 text-center text-sm">
        Đã có tài khoản?{' '}
        <Link href="/sign-in" className="hover:text-primary underline underline-offset-4">
          Đăng nhập
        </Link>
      </div>
    </div>
  )
}
