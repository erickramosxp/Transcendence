import React from 'react'
import { cn } from '@/design-system/tokens/colors'

export function LegalLayout({children, className}) {
    return (
        <div className={cn("max-w-4xl m-auto pb-10", className)}>
            {children}
        </div>
    )
}
