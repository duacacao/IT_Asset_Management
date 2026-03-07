import Link from 'next/link'
import { Boxes } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 p-6 md:p-10 dark:bg-zinc-900">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-xl shadow-sm">
              <Boxes className="size-4" />
            </div>
            IT Asset Management
          </Link>
          <div className="bg-card text-card-foreground overflow-hidden rounded-xl border-border/50 border shadow-md transition-shadow hover:shadow-lg">
            <div className="grid min-h-[600px] md:grid-cols-2">
              <div className="bg-muted relative hidden border-r md:block">
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')",
                  }}
                />
                <div className="absolute inset-0 bg-zinc-900/40 mix-blend-multiply" />
                <div className="absolute bottom-0 left-0 z-20 p-6 text-white">
                  <blockquote className="space-y-2">
                    <p className="text-lg leading-snug font-medium">
                      &ldquo;Scale without chaos.&rdquo;
                    </p>
                    <footer className="text-xs text-zinc-300">IT Operations Platform</footer>
                  </blockquote>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-6 p-6 md:p-8">{children}</div>
            </div>
          </div>
          <div className="text-muted-foreground [&_a]:hover:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
            By continuing, you agree to our <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}
