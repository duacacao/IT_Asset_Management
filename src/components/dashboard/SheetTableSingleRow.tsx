import { ScrollArea } from '@/components/ui/scroll-area';

type SheetRow = Record<string, string | number | boolean | null | undefined>;

interface SingleRowViewProps {
    data: SheetRow[];
    headers: string[];
}

export function SingleRowView({ data, headers }: SingleRowViewProps) {
    const row = data[0];
    
    return (
        <ScrollArea className="h-full w-full">
            <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {headers.map((header) => (
                        <div key={header} className="group relative space-y-1.5 p-3 md:p-4 rounded-lg border bg-card/50 hover:bg-card transition-all hover:shadow-sm">
                            <h4 className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                                {header}
                            </h4>
                            <p className="text-sm md:text-base font-medium text-foreground break-words leading-relaxed">
                                {row[header]?.toString() || '-'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </ScrollArea>
    );
}
