import React from 'react'
import { cn } from '@/design-system/tokens/colors'

export function LegalSection({children, className}) {
    
  return (
    <div className={cn('mt-5', className)}>
      {children}
    </div>
  )
}
