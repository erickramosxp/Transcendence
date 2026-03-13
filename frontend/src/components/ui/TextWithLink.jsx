import { parseTextWithLinks } from "@/shared/linkPreview";

export function TextWithLink({ text, className = "" }) {
	const parts = parseTextWithLinks(text);

	return (
		<span className={className}>
			{parts.map((part, i) =>
				part.type === "link" ? (
					<a key={i} href={part.url} target="_blank" rel="noopener noreferrer" className="text-[#4a78b5] hover:text-[#3b6091] hover:underline underline-offset-2 break-all">
						{part.content}
					</a>
				) : (
					part.content
				)
			)}
		</span>
	);
}



