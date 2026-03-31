import React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/design-system/tokens/colors";

export function LikeButton({
    liked = false,
    count = 0,
    onClick,
    className,
    disabled = false,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "like-button inline-flex items-center gap-2 text-sm transition-all hover:scale-105 disabled:pointer-events-none disabled:opacity-50",
                liked && "like-button--active",
                className
            )}
            aria-pressed={liked}
        >
            <Heart className={cn("h-5 w-5", liked && "fill-current")} />
            <span>{count}</span>
        </button>
    );
}

export default LikeButton;