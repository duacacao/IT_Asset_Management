import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming global utils exist in template

interface ImportDeviceProps {
    onImport: (file: File) => Promise<any>;
    isLoading?: boolean;
}

export function ImportDevice({ onImport, isLoading }: ImportDeviceProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onImport(acceptedFiles[0]);
        }
    }, [onImport]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
        maxFiles: 1,
        disabled: isLoading,
    });

    return (
        <Card className={cn("border-dashed border-2 cursor-pointer transition-colors hover:bg-muted/50", isDragActive && "bg-muted")}>
            <CardContent className="p-0">
                <div
                    {...getRootProps()}
                    className="flex flex-col items-center justify-center p-10 text-center gap-4 min-h-[200px]"
                >
                    <input {...getInputProps()} />

                    {isLoading ? (
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    ) : (
                        <div className="bg-primary/10 p-4 rounded-full">
                            <Upload className="h-8 w-8 text-primary" />
                        </div>
                    )}

                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">
                            {isLoading ? "Importing..." : isDragActive ? "Drop file here" : "Import Excel File"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Drag & drop or click to upload
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        <FileSpreadsheet className="h-3 w-3" />
                        <span>Support .xlsx, .xls</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
