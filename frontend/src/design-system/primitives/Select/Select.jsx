import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/design-system/tokens/colors";

const fieldBase = [
    "flex h-10 sm:h-11 w-full min-w-0",
    "rounded-lg border border-border",

    "bg-input-background",

    "px-3 py-2",

    "text-sm text-foreground",
    "placeholder:text-muted-foreground",

    "outline-none transition-all",

    "focus-visible:border-primary",
    "focus-visible:ring-2",
    "focus-visible:ring-primary/30",

    "aria-invalid:border-destructive",
    "aria-invalid:ring-2",
    "aria-invalid:ring-destructive/20",

    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
].join(" ");

const Select = React.forwardRef(
    (
        {
            className,
            icon,
            children,
            ...props
        },
        ref
    ) => {

        const hasIcon = Boolean(icon);

        return (
            <div className="relative w-full">

                {hasIcon && (
                    <span
                        className="
                        absolute
                        left-3
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-muted-foreground
                        pointer-events-none
                        "
                    >
                        {icon}
                    </span>
                )}

                <select
                    ref={ref}
                    data-slot="select"
                    className={cn(
                        fieldBase,

                        "appearance-none",

                        hasIcon
                            ? "pl-10 pr-10"
                            : "pr-10",

                        className
                    )}
                    {...props}
                >
                    {children}
                </select>

                <ChevronDown
                    size={18}
                    className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2

            text-muted-foreground

            pointer-events-none
          "
                />
            </div>
        );
    }
);

Select.displayName = "Select";

export { Select };