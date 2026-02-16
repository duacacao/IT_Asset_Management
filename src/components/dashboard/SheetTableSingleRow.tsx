import { ScrollArea } from '@/components/ui/scroll-area'

type SheetRow = Record<string, string | number | boolean | null | undefined>

interface SingleRowViewProps {
  data: SheetRow[]
  headers: string[]
}

export function SingleRowView({ data, headers }: SingleRowViewProps) {
  const row = data[0]

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {headers.map((header) => (
            <div
              key={header}
              className="group bg-card/50 hover:bg-card relative space-y-1.5 rounded-lg border p-3 transition-all hover:shadow-sm md:p-4"
            >
              <h4 className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase select-none md:text-xs">
                {header}
              </h4>
              <p className="text-foreground text-sm leading-relaxed font-medium break-words md:text-base">
                {row[header]?.toString() || '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
