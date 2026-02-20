import { getDocBySlug, getAllDocs } from '@/lib/docs'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const docs = getAllDocs()
  return docs.map((doc) => ({
    slug: doc.slug,
  }))
}

export default async function DocPage(props: PageProps) {
  const params = await props.params
  const doc = getDocBySlug(params.slug)

  if (!doc) {
    notFound()
  }

  return (
    <div className="relative container max-w-3xl py-6 lg:py-10">
      <div className="space-y-4">
        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
          <Link href="/docs" className="hover:underline">
            Docs
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate font-semibold">{doc.title}</span>
        </div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">{doc.title}</h1>
        {doc.description && <p className="text-muted-foreground text-xl">{doc.description}</p>}
      </div>
      <div className="pt-8 pb-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <MDXRemote source={doc.content} />
        </div>
      </div>
    </div>
  )
}
