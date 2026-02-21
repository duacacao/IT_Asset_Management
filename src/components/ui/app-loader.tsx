import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const appLoaderVariants = cva(
    "inline-flex items-center justify-center",
    {
        variants: {
            layout: {
                vertical: "flex-col gap-3 text-muted-foreground",
                horizontal: "flex-row gap-2",
            }
        },
        defaultVariants: {
            layout: "vertical",
        },
    }
)

export interface AppLoaderProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof appLoaderVariants> {
    text?: string;
    hideText?: boolean;
}

function AppLoader({
    className,
    layout,
    text = "Đang tải dữ liệu...",
    hideText = false,
    ...props
}: AppLoaderProps) {
    // Biến thể kích thước icon mặc định tùy thuộc vào layout
    const iconClass = layout === "horizontal" ? "h-4 w-4" : "h-8 w-8";

    return (
        <div
            className={cn(appLoaderVariants({ layout, className }))}
            {...props}
        >
            <LoaderCircle className={cn("animate-spin", iconClass)} />
            {!hideText && <span>{text}</span>}
        </div>
    )
}

export { AppLoader, appLoaderVariants }
