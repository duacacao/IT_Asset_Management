import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SheetTableProps {
    data: any[];
    sheetName: string;
}

export function SheetTable({ data, sheetName }: SheetTableProps) {
    if (!data || data.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No data in this sheet</div>;
    }

    const headers = Object.keys(data[0]);

    if (data.length === 1) {
        const row = data[0];
        return (
            <div className="h-full w-full overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {headers.map((header) => (
                        <div key={header} className="space-y-1.5 p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {header}
                            </h4>
                            <p className="text-sm font-medium text-foreground break-words">
                                {row[header]?.toString() || '-'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <div className="h-full w-full overflow-auto rounded-md border relative">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b sticky top-0 bg-background z-10 shadow-sm">
                        <TableRow>
                            {headers.map((header) => (
                                <TableHead key={header} className="whitespace-nowrap px-4 py-3 bg-muted/50 font-medium text-foreground">
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {data.map((row, index) => (
                            <TableRow key={index} className="hover:bg-muted/5 border-b">
                                {headers.map((header) => (
                                    <TableCell key={`${index}-${header}`} className="whitespace-nowrap px-4 py-3">
                                        {row[header]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
