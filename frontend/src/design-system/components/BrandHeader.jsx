import { Sparkles } from "lucide-react";
import { cn } from "@/design-system/tokens/colors";

/**
 * Identidade visual da marca (logo + nome + slogan opcional).
 * O logo segue o padrão da Home: cantos arredondados, gradiente e inclinação rotate-6.
 *
 * Tela              Uso
 * Home / login      <BrandHeader size="lg" slogan="..." />
 * Sidebar           <BrandHeader size="sm" layout="inline" />
 * 404               <BrandHeader size="md" />
 */

/** Estilo do bloco do logo — igual em todas as telas (padrão Home). */
const LOGO_BRAND_CLASSES =
    "shadow-2xl shadow-primary/50 rotate-6 transition-transform hover:rotate-12";

const LOGO_SIZE_CLASSES = {
    sm: "h-10 w-10 rounded-2xl",
    default: "h-16 w-16 rounded-3xl sm:h-20 sm:w-20",
    md: "h-16 w-16 rounded-3xl",
    lg: "h-24 w-24 rounded-3xl",
};

const ICON_SIZE_CLASSES = {
    sm: "h-5 w-5",
    default: "h-8 w-8 sm:h-10 sm:w-10",
    md: "h-8 w-8",
    lg: "h-12 w-12",
};

export function BrandHeader({
    slogan,
    size = "default",
    layout = "stack",
    title = "Videa",
    className,
}) {
    const logoBox = (
        <div
            className={cn(
                "inline-flex shrink-0 items-center justify-center bg-gradient-sparkle text-white",
                LOGO_SIZE_CLASSES[size],
                LOGO_BRAND_CLASSES,
            )}
        >
            <Sparkles className={cn("text-white", ICON_SIZE_CLASSES[size])} />
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
