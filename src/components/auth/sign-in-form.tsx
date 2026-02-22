'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLoader } from '@/components/ui/app-loader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/app/actions/auth'
import { useAuth } from '@/contexts/AuthContext'

export function SignInForm({ initialMessage }: { initialMessage?: string }) {
  const router = useRouter()
  const { refreshAuth } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(initialMessage || null)

  // KHÔNG dùng useTransition + <form action={...}> vì:
  // React 19 startTransition() DEFER mọi state update bên trong async function
  // → refreshAuth() → setUser() bị defer → dashboard render với user=null → NavUser biến mất
  // Dùng useState(isPending) + <form onSubmit={...}> để setUser() commit ngay lập tức
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    setIsPending(true)

    try {
      const result = await signIn(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      // Server action sign-in → cookies set server-side
      // refreshAuth() → client-side Supabase detect session mới từ cookies
      // Chạy NGOÀI React transition → setUser() commit ngay → NavUser có user khi dashboard render
      await refreshAuth()

      // Navigate — AuthContext đã có user, Middleware sẽ allow through
      router.push('/devices')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="grid gap-6 pt-4">
      <form onSubmit={handleSubmit}>
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
          </div>
          <div className="grid gap-2 text-left">
            <div className="flex items-center">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link
                href="/forgot-password"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                tabIndex={-1}
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="123456"
              autoComplete="off"
              required
              disabled={isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <AppLoader layout="horizontal" hideText className="mr-2" />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
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
        Login with Google (Coming Soon)
      </Button>

      <div className="mt-4 text-center text-sm">
        Chưa có tài khoản?{' '}
        <Link href="/sign-up" className="underline">
          Đăng ký
        </Link>
      </div>
    </div>
  )
}
