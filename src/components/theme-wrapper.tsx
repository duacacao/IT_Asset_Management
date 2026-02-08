"use client"

import { cn } from "@/lib/utils"

interface ThemeWrapperProps extends React.ComponentProps<"div"> {
    defaultTheme?: string
}

export function ThemeWrapper({
    defaultTheme,
    children,
    className,
    ...props
}: ThemeWrapperProps) {
    return (
        <div
            className={cn(
                "customizer",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
