import { cn } from "@/design-system/tokens/colors";

export function ChatLinkPreviewCard({ preview, className, compact = false }) {
	if (!preview?.url) return null;

	return (
		<a
			href={preview.url}
			target="_blank"
			rel="noopener noreferrer"
			className={cn("ds-chat-link-preview-card", className)}
		>
			<div
				className={cn(
					"ds-chat-link-preview-card-inner",
					compact && "ds-chat-link-preview-card-inner--compact",
				)}
			>
				{preview.image && (
					<img
						src={preview.image}
						alt={preview.title}
						className={cn(
							"ds-chat-link-preview-thumb",
							compact && "ds-chat-link-preview-thumb--compact",
						)}
					/>
				)}

				<div className="min-w-0 flex-1">
					<h3
						className={cn(
							"ds-chat-link-preview-title",
							compact
								? "ds-chat-link-preview-title--compact"
								: "ds-chat-link-preview-title--multiline",
						)}
					>
						{preview.title}
					</h3>
					{preview.description ? (
						<p
							className={cn(
								"ds-chat-link-preview-desc",
								compact
									? "ds-chat-link-preview-desc--compact"
									: "ds-chat-link-preview-desc--multiline",
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
