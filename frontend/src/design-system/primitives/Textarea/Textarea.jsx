import * as React from "react";
import { cn } from "@/design-system/tokens/colors";

export function Textarea({ className, maxLength, ...props }) {
	return (
		<textarea
			data-slot="textarea"
			maxLength={maxLength}
			className={cn(
				"flex min-h-16 w-full resize-none rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			{...props}
		/>
	);
}