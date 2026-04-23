import { cn } from "@/design-system/tokens/colors";

export function ChatLinkPreviewCard({ preview, className, compact = false }) {
	if (!preview?.url) return null;

	return (
		<a
			href={preview.url}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"mt-2 block min-w-0 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent/40",
				className,
			)}
		>
			<div className={cn("flex gap-3", compact ? "p-2" : "p-3")}>
				{preview.image && (
					<img
						src={preview.image}
						alt={preview.title}
						className={cn(
							"shrink-0 rounded-md object-cover",
							compact ? "h-10 w-10" : "h-20 w-20",
						)}
					/>
				)}

				<div className="min-w-0 flex-1">
					<h3
						className={cn(
							"text-sm font-medium text-foreground",
							compact ? "truncate" : "line-clamp-2",
						)}
					>
						{preview.title}
					</h3>
					{preview.description ? (
						<p
							className={cn(
								"text-sm text-muted-foreground",
								compact ? "line-clamp-1" : "mt-0.5 line-clamp-2",
							)}
						>
							{preview.description}
						</p>
					) : null}
				</div>
			</div>
		</a>
	);
}
