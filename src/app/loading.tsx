export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="animate-in fade-in w-full max-w-6xl space-y-6 duration-500">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="bg-muted h-8 w-64 animate-pulse rounded-lg" />
            <div className="bg-muted/60 h-4 w-96 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-10 w-32 animate-pulse rounded-lg" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="space-y-3">
          <div className="bg-muted h-12 animate-pulse rounded-lg" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-muted/60 h-16 animate-pulse rounded-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
