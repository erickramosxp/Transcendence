import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { getCurrentTime } from "@/shared/getCurrentTime";

export function NewsHeadlineItem({ headline, onOpen }) {
	const { currentLanguage } = useLanguage();
	const [imageError, setImageError] = useState(false);

	const timeLabel = headline.publishedAt
		? getCurrentTime(headline.publishedAt, currentLanguage)
		: null;

	const metaParts = [headline.sourceName, timeLabel].filter(Boolean);
	const showImage = headline.imageUrl && !imageError;

	return (
		<button
			type="button"
			onClick={() => onOpen(headline.sourceUrl)}
			className="flex w-full gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
		>
			<div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
				{showImage ? (
					<img
						src={headline.imageUrl}
						alt=""
						className="h-full w-full object-cover"
						loading="lazy"
						onError={() => setImageError(true)}
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
						📰
					</div>
				)}
			</div>
			<div className="min-w-0 flex-1">
				<p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
					{headline.title}
				</p>
				{metaParts.length > 0 && (
					<p className="mt-1 truncate text-xs text-muted-foreground">
						{metaParts.join(" · ")}
					</p>
				)}
			</div>
		</button>
	);
}
