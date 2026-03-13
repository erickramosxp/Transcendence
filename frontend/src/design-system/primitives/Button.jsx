import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/design-system/tokens/colors";


const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        primary: "bg-gradient-btn-primary text-primary-foreground shadow-btn-primary hover:bg-gradient-btn-primary-hover hover:shadow-lg transition-all",
        outline:     "border border-border bg-transparent text-foreground hover:bg-accent",
        secondary:   "bg-card text-foreground border border-border hover:bg-accent",
        ghost:       "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        "nav-active":"bg-primary text-primary-foreground",
        destructive: "bg-transparent border border-border text-destructive hover:bg-destructive/10",
        link: "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto cursor-pointer",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-md",
        sm:      "h-8 px-3 text-sm rounded-lg",
        lg:      "h-12 px-6 rounded-xl",
        icon:    "h-9 w-9 rounded-lg",
        full:    "h-11 sm:h-12 w-full px-4 rounded-md",
        nav:     "h-10 w-full px-3 rounded-lg justify-start",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };

