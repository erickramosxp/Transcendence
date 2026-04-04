import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { formatChatBubbleTime } from "@/features/chat/utils/formatChatDates";
import { cn } from "@/design-system/tokens/colors";

export default function Message({ currentUserId, message }) {
	const { currentLanguage } = useLanguage();
	const timeLabel = formatChatBubbleTime(message.timestamp, currentLanguage);
	const isMine =
		String(message.senderId) === String(currentUserId) || message.sender === "me";
	return (
		<div
			className={cn(
				"mb-2 flex px-2 py-1 sm:px-3 sm:py-1.5",
				isMine ? "justify-end" : "justify-start",
			)}
		>
			<div
				className={cn(
					"relative max-w-[min(85%,28rem)] text-left shadow-sm",
					"rounded-[1.125rem] px-4 py-2.5 sm:py-3",
					isMine
						? "rounded-tr-md bg-primary text-primary-foreground"
						: "rounded-tl-md bg-card text-card-foreground ring-1 ring-border",
				)}
			>
				<div className="whitespace-pre-wrap text-sm leading-[1.5]">
					{message.text}
				</div>
				<div
					className={cn(
						"mt-1 flex items-center justify-end gap-1",
						isMine ? "text-primary-foreground/80" : "text-muted-foreground",
					)}
				>
					<time
						className="text-[11px] sm:text-xs tabular-nums"
						dateTime={message.timestamp}
					>
						{timeLabel}
					</time>
					{isMine && (
						<span className="text-xs" aria-hidden>
							&#10003;&#10003;
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
