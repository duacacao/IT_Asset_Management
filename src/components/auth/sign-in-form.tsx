'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { AppLoader } from '@/components/ui/app-loader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/app/actions/auth'
import { deviceKeys } from '@/hooks/useDevicesQuery'

export function SignInForm({ initialMessage }: { initialMessage?: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(initialMessage || null)

  const handleSubmit = (formData: FormData) => {
    setError(null)

    startTransition(async () => {
      const result = await signIn(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      // Navigate immediately - AuthContext and Middleware will handle the rest
      router.push('/devices')
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
