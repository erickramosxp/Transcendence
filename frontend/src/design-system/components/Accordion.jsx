import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cn } from '../tokens/colors'
import { ChevronDown } from 'lucide-react'


export function Accordion({
  children,
  className,
  ...props
}) {
  return (
    <AccordionPrimitive.Root
      className={cn(
        "w-full rounded-sm border border-border",
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Root>
  )
}

export function AccordionItem({
  children,
  className,
  ...props
}) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "border-b border-border last:border-b-0",
        className)}
      {...props}
    >
      {children}
    </AccordionPrimitive.Item>
  )
}


export function AccordionHeader({
  children,
  className,
  ...props
}) {
  return (
    <AccordionPrimitive.Header
      className={cn("flex", className)}
      {...props}
    >
      {children}
    </AccordionPrimitive.Header>
  )
}


export function AccordionTrigger({
  children,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <AccordionPrimitive.Trigger
      className={cn(
        `
        group
        flex
        flex-1
        items-center
        justify-between
        px-4
        py-4
        text-left
        text-sm
        font-medium
        text-foreground
        transition-colors
        hover:bg-accent
        hover:text-accent-foreground
        data-[state=open]:bg-accent/70
        `,
        className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        
        {Icon && (
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-border
              bg-background
              text-primary
              shadow-sm
              shrink-0
            "
          >
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="flex flex-col">
          {children}
        </div>
      </div>
      <ChevronDown
        className="
          h-4
          w-4
          shrink-0
          text-muted-foreground
          transition-transform
          duration-200
          ease-out
          group-data-[state=open]:rotate-180
        "
        aria-hidden
      />
    </AccordionPrimitive.Trigger>
  )
}

export function AccordionContent({
  children,
  className,
  ...props
}) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        `
        overflow-hidden
        text-sm
        text-muted-foreground
        data-[state=open]:animate-slideDown
        data-[state=closed]:animate-slideUp
        whitespace-pre-line
        `,
        className)}
      {...props}
    >
      <div className="bg-card p-4">
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}