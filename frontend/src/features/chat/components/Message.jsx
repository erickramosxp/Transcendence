import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { formatChatBubbleTime } from "@/features/chat/utils/formatChatDates";
import { cn } from "@/design-system/tokens/colors";
import { TextWithLink } from "@/design-system";
import { useMessageLinkPreview } from "@/features/chat/hooks/useMessageLinkPreview";
import { ChatLinkPreviewCard } from "@/features/chat/components/ChatLinkPreviewCard";

export default function Message({ currentUserId, message, showSenderName }) {
	const { currentLanguage } = useLanguage();
	const { t } = useTranslation("chat");
	const { preview: linkPreview, loading: linkPreviewLoading } =
		useMessageLinkPreview(message.text);
	const timeLabel = formatChatBubbleTime(message.timestamp, currentLanguage);
	const isMine =
		String(message.senderId) === String(currentUserId) || message.sender === "me";
	const rawName = message.senderDisplayName?.trim();
	const senderHeading =
		rawName || (showSenderName ? t("thread.unknownSender") : null);
	const showHeading = Boolean(showSenderName && !isMine && senderHeading);
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
				{showHeading && (
					<div className="ds-chat-bubble-sender ds-chat-bubble-sender--theirs">
						{senderHeading}
					</div>
				)}
				{linkPreviewLoading && !linkPreview && (
					<p
						className={cn(
							"mb-2 text-[11px] sm:text-xs",
							isMine
								? "text-primary-foreground/75"
								: "text-muted-foreground",
						)}
					>
						{t("linkPreview.loading")}
					</p>
				)}
				<ChatLinkPreviewCard
					preview={linkPreview}
					className={cn("mb-2", showHeading ? "mt-1" : "mt-0")}
				/>
				<div className="ds-chat-bubble-text">
					<TextWithLink
						text={message.text ?? ""}
						linkClassName={
							isMine
								? "text-primary-foreground underline decoration-primary-foreground/70 underline-offset-2 break-all hover:opacity-90"
								: undefined
						}
					/>
				</div>
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
					{isMine && message.deliveryStatus === "sending" && (
						<span className="ds-chat-bubble-status" aria-live="polite">
							{t("thread.sending")}
						</span>
					)}
					{isMine && message.deliveryStatus === "failed" && (
						<span className="ds-chat-bubble-status ds-chat-bubble-status--failed" role="status">
							{t("thread.sendFailed")}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
