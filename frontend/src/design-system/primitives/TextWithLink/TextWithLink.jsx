import { parseTextWithLinks } from "@/shared/linkPreview";
import { cn } from "@/design-system/tokens/colors";

export function TextWithLink({ text, className = "", linkClassName }) {
	const parts = parseTextWithLinks(text);

	return (
		<span className={className}>
			{parts.map((part, i) =>
				part.type === "link" ? (
					<a
						key={i}
						href={part.url}
						target="_blank"
						rel="noopener noreferrer"
						className={cn(
							"text-primary hover:opacity-80 hover:underline underline-offset-2 break-all transition-colors",
							linkClassName,
						)}
					>
						{part.content}
					</a>
				) : (
					part.content
				)
			)}
		</span>
	);
}