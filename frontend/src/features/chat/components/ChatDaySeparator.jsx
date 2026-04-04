import { cn } from "@/design-system/tokens/colors";

export default function ChatDaySeparator({ label }) {
	if (!label) return null;
	return (
		<div
			className={cn("flex justify-center py-3 sm:py-4")}
			role="separator"
			aria-label={label}
		>
			<span
				className={cn(
					"rounded-full bg-muted/90 px-3 py-1 text-[11px] font-medium",
					"text-muted-foreground shadow-sm",
					"sm:px-3.5 sm:text-xs",
				)}
			>
				{label}
			</span>
		</div>
	);
}
