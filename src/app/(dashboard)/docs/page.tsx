import { getAllDocs } from '@/lib/docs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export default function DocsPage() {
  const docs = getAllDocs()

  if (docs.length > 0) {
    redirect(`/docs/${docs[0].slug}`)
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="font-semibold">Docs Dashboard</h1>
      </header>
      <div className="container py-10 text-center">
        <h2 className="text-2xl font-bold">Chưa có tài liệu nào</h2>
        <p className="text-muted-foreground mt-2">Vui lòng thêm file .md vào thư mục <code>docs/</code></p>
      </div>
    </div>
  )
}
