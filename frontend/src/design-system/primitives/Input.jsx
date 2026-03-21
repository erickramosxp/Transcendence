import * as React from "react";

import { cn } from "@/design-system/tokens/colors";

/**
 * // Pode mostra ícone de envelope no campo Email, cadeado na Senha
    <Input icon={<MailIcon />} placeholder="seu@email.com" />
 */

const Input = React.forwardRef(({ className, type, icon, ...props }, ref) => {

  if (icon) {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(inputBase, "pl-9",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(inputBase, className)}
      {...props}
    />
  );
});


const inputBase = [
  "flex h-10 sm:h-11 w-full min-w-0 px-3 py-2",       // layout
  "rounded-lg border border-border",          // forma
  "bg-input-background",                      // cor de fundo
  "text-sm text-foreground placeholder:text-muted-foreground",  // tipografia
  "outline-none transition-all", // comportamento
  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30", // estado foco
  "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20", // estado erro
  "disabled:cursor-not-allowed disabled:opacity-50", // estado desabilitado
  "selection:bg-primary selection:text-primary-foreground", // seleção de texto
].join(" ");

Input.displayName = "Input";

export { Input };
