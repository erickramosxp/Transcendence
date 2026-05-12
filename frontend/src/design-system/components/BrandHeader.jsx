import { Sparkles } from "lucide-react";
import { cn } from "@/design-system/tokens/colors";

/**
 *  Pode aparecer em outras telas também (loading, erro 404, etc.).
 *
 * Tela	Uso
 * Login (atual)	<BrandHeader slogan="..." />
 * Sidebar do app	<BrandHeader size="sm" layout="inline" /> — logo + nome em linha
 * Página 404	<BrandHeader size="lg" slogan="Página não encontrada" />
 * Loading screen	<BrandHeader size="default" /> — sem slogan
 */

export function BrandHeader({
    slogan,
    size = "default",
    layout = "stack",
    title = "Videa",
    className
}) {
    {/* Logo */ }
    const logoBox = (
        <div
            className={cn(
                "inline-flex shrink-0 items-center justify-center bg-gradient-sparkle text-white",
                /* Mesmo “formato” da home: retângulo com cantos amplos (rounded-3xl).
                   No sm, rounded-3xl num quadrado pequeno vira bolha — usar rounded-2xl proporcional. */
                size === "sm" && "h-10 w-10 rounded-2xl",
                size === "default" && "h-16 w-16 rounded-3xl sm:h-20 sm:w-20",
                size === "md" && "h-16 w-16",
                size === "lg" && "h-24 w-24 rounded-3xl",
                layout === "inline" &&
                "-rotate-[11deg] shadow-md shadow-primary/30 transition-transform hover:-rotate-[15deg]",
                layout === "stack" &&
                "shadow-2xl shadow-primary/50 rotate-6 transition-transform hover:rotate-12",
            )}
        >
            <Sparkles
                className={cn(
                    "text-white",
                    size === "default" && "h-8 w-8 sm:h-10 sm:w-10",
                    size === "sm" && "h-5 w-5",
                    size === "md" && "w-8 h-8",
                    size === "lg" && "h-12 w-12",
                )}
            />
        </div>
    );

    const titleEl = (
        <h1
            className={cn(
                "font-bold bg-gradient-title bg-clip-text text-transparent",
                size === "default" && "text-5xl sm:text-6xl lg:text-7xl xl:text-8xl",
                size === "sm" && (layout === "inline" ? "text-xl leading-tight" : "text-3xl"),
                size === "md" && "text-6xl",
                size === "lg" && "text-8xl",
            )}
        >
            {title}
        </h1>
    );

    if (layout === "inline") {
        return (
            <div className={cn("flex flex-row items-center gap-3", className)}>
                {logoBox}
                {titleEl}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col space-y-6", className)}>
            {logoBox}
            {titleEl}
            {slogan && (
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
                    {slogan}
                </p>
            )}
        </div>
    );
}
