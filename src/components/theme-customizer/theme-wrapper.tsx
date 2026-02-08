"use client"

import { cn } from "@/lib/utils"

interface ThemeWrapperProps extends React.ComponentProps<"div"> { }

export function ThemeWrapper({
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
