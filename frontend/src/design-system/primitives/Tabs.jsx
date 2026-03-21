import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/design-system/tokens/colors";
import { cva } from "class-variance-authority";

const tabsListVariants = cva(
  "inline-flex h-10 w-full items-center justify-center rounded-md p-1 gap-1",
  {
    variants: {
      variant: {
        // padrão — ativo fica branco (cards internos, perfil)
        default: "bg-muted text-muted-foreground",
        // filled — ativo fica azul (login, amigos)
        filled:  "bg-muted text-muted-foreground",
      }
    },
    defaultVariants: { variant: "default" }
  }
)


const Tabs = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Root
      ref={ref}
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
});
Tabs.displayName = "Tabs";

/**
 * // Variante "filled": ativo = fundo azul + texto branco
  // Variante "underline": ativo = apenas borda inferior azul (para outros contextos)
  <TabsList variant="filled | underline">
 */
const TabsList = React.forwardRef(({ className, variant,...props }, ref) => {
  return (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        // base
        "inline-flex h-8 flex-1 items-center justify-center rounded-lg",
        "px-3 py-2 text-sm font-medium whitespace-nowrap transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        // inativo
        "text-muted-foreground border border-transparent",
        // ativo padrão — fundo branco
        "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        // ativo filled — fundo azul (quando TabsList tem variant=filled)
        "[data-variant=filled]_&:data-[state=active]:bg-primary",
        "[data-variant=filled]_&:data-[state=active]:text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
