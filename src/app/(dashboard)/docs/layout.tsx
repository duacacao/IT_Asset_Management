import { getAllDocs, getGroupedDocs } from '@/lib/docs'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const groupedDocs = getGroupedDocs()

    return (
        <div className="flex flex-1 flex-col md:flex-row">
            {/* Docs Sidebar */}
            <aside className="w-full shrink-0 md:w-64 border-r bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="h-full py-6 pr-6 lg:py-8">
                    <h4 className="mb-4 rounded-md px-4 py-1 text-sm font-semibold">
                        Mục lục tài liệu
                    </h4>
                    <div className="w-full">
                        {Object.entries(groupedDocs).map(([section, items]) => (
                            <div key={section} className="pb-4">
                                <h4 className="mb-1 rounded-md px-4 py-1 text-sm font-medium text-muted-foreground uppercase tracking-widest text-xs">
                                    {section}
                                </h4>
                                <div className="grid grid-flow-row auto-rows-max text-sm">
                                    {items.map((item) => (
                                        <Link
                                            key={item.slug}
                                            href={`/docs/${item.slug}`}
                                            className={cn(
                                                "group flex w-full items-center rounded-md border border-transparent px-4 py-1.5 hover:underline text-foreground/80 hover:text-foreground",
                                            )}
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex w-full min-w-0 flex-col overflow-hidden py-6 lg:py-8 pl-4">
                {children}
            </main>
        </div>
    )
}
