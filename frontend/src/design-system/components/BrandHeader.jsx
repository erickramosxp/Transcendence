import { Sparkles } from "lucide-react";
import { cn } from "@/design-system/tokens/colors";

/**
 *  Pode aparecer em outras telas também (loading, erro 404, etc.).
 * 
 * Tela	Uso
    Login (atual)	<BrandHeader slogan="..." />
    Sidebar do app	<BrandHeader size="sm" /> — só logo + nome pequeno
    Página 404	<BrandHeader size="lg" slogan="Página não encontrada" />
    Loading screen	<BrandHeader size="default" /> — sem slogan
 */

export function BrandHeader({
    slogan,
    size = "default",
    className
}) {
    return (
        <div className={cn("flex flex-col space-y-6", className)}>

            {/* Logo */}
            <div className={cn(
                "inline-flex items-center justify-center rounded-3xl",
                "bg-gradient-sparkle shadow-2xl shadow-primary/50",
                "rotate-6 hover:rotate-12 transition-transform",
                size === "default" && "h-16 w-16 sm:h-20 sm:w-20",
                size === "sm" && "h-10 w-10",
                size === "md" && "h-16 w-16",
                size === "lg" && "h-24 w-24",
            )}>
                <Sparkles className={cn(
                    "text-white",
                    size === "default" && "w-8 h-8 sm:h-10 sm:w-10",
                    size === "sm" && "w-5 h-5",
                    size === "md" && "w-8 h-8",
                    size === "lg" && "w-12 h-12",
                )} />
            </div>

            {/* Nome */}
            <h1 className={cn(
                "font-bold bg-gradient-title bg-clip-text text-transparent",
                size === "default" && "text-5xl sm:text-6xl lg:text-7xl xl:text-8xl",
                size === "sm" && "text-3xl",
                size === "md" && "text-6xl",
                size === "lg" && "text-8xl",
            )}>
                Videa
            </h1>

            {/* Slogan — opcional */}
            {slogan && (
                <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                    {slogan}
                </p>
            )}

        </div>
    );
}
