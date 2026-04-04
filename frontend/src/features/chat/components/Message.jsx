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
				"ds-chat-msg-row",
				isMine ? "ds-chat-msg-row--mine" : "ds-chat-msg-row--theirs",
			)}
		>
			<div
				className={cn(
					"ds-chat-bubble",
					isMine ? "ds-chat-bubble--mine" : "ds-chat-bubble--theirs",
				)}
			>
				<div className="ds-chat-bubble-text">{message.text}</div>
				<div
					className={cn(
						"ds-chat-bubble-meta",
						isMine
							? "ds-chat-bubble-meta--mine"
							: "ds-chat-bubble-meta--theirs",
					)}
				>
					<time
						className="ds-chat-bubble-time"
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
