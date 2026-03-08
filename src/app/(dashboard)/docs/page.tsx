import { getAllDocs } from '@/lib/docs'
import { redirect } from 'next/navigation'

export default function DocsPage() {
  const docs = getAllDocs()

  if (docs.length > 0) {
    redirect(`/docs/${docs[0].slug}`)
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="container py-10 text-center">
        <h2 className="text-2xl font-bold">Chưa có tài liệu nào</h2>
        <p className="text-muted-foreground mt-2">
          Vui lòng thêm file .md vào thư mục <code>docs/</code>
        </p>
      </div>
    </div>
  )
}
