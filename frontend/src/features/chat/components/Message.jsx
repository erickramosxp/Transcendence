import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { formatChatBubbleTime } from "@/features/chat/utils/formatChatDates";
import { cn } from "@/design-system/tokens/colors";
import { TextWithLink, Button } from "@/design-system";
import { useMessageLinkPreview } from "@/features/chat/hooks/useMessageLinkPreview";
import { useMessageReplyLongPress } from "@/features/chat/hooks/useMessageReplyLongPress";
import { ChatLinkPreviewCard } from "@/features/chat/components/ChatLinkPreviewCard";
import { Reply } from "lucide-react";

export default function Message({
	currentUserId,
	message,
	showSenderName,
	replyQuote,
	onReply,
	touchReplyVisible = false,
	onTouchReplyReveal,
	onTouchReplyDismiss,
}) {
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
	const canReply = Boolean(onReply && message.id != null);
	const showReplyQuote = Boolean(replyQuote && message.replyToId != null);

	const { touchPrimary, longPressBubbleHandlers } = useMessageReplyLongPress({
		canReply,
		onReveal: onTouchReplyReveal,
	});

	return (
		<div
			className={cn(
				"ds-chat-msg-row",
				isMine ? "ds-chat-msg-row--mine" : "ds-chat-msg-row--theirs",
			)}
		>
			<div
				className={cn(
					"group ds-chat-msg-group",
					isMine && "ds-chat-msg-group--mine",
				)}
			>
				<div
					className={cn(
						"ds-chat-bubble min-w-0",
						touchPrimary && canReply && "ds-chat-msg-longpress-target",
						isMine ? "ds-chat-bubble--mine" : "ds-chat-bubble--theirs",
					)}
					{...longPressBubbleHandlers}
				>
					{showHeading && (
						<div className="ds-chat-bubble-sender ds-chat-bubble-sender--theirs">
							{senderHeading}
						</div>
					)}
					<div className="ds-chat-bubble-body">
						{showReplyQuote && (
							<div
								className={cn(
									"ds-chat-bubble-reply",
									isMine
										? "ds-chat-bubble-reply--mine"
										: "ds-chat-bubble-reply--theirs",
								)}
							>
								<div className="ds-chat-bubble-reply-author">
									{replyQuote.unavailable
										? t("thread.replyUnavailable")
										: replyQuote.senderDisplayName ||
											t("thread.unknownSender")}
								</div>
								{!replyQuote.unavailable && replyQuote.text && (
									<div className="ds-chat-bubble-reply-text">
										{replyQuote.text}
									</div>
								)}
								{!replyQuote.unavailable && !replyQuote.text && (
									<div className="ds-chat-bubble-reply-text ds-chat-bubble-reply-text--muted">
										{t("thread.replyPreviewEmpty")}
									</div>
								)}
							</div>
						)}
						{linkPreviewLoading && !linkPreview && (
							<p
								className={cn(
									"ds-chat-link-preview-loading-line",
									isMine
										? "ds-chat-link-preview-loading-line--mine"
										: "ds-chat-link-preview-loading-line--theirs",
								)}
							>
								{t("linkPreview.loading")}
							</p>
						)}
						<ChatLinkPreviewCard
							preview={linkPreview}
							className={cn(
								"ds-chat-link-preview-slot",
								(showReplyQuote || showHeading) &&
									"ds-chat-link-preview-slot--tight-top",
							)}
						/>

						<div
							className={cn(
								"ds-chat-bubble-text min-w-0",
								isMine && "ds-chat-bubble-text--mine",
							)}
						>
							<TextWithLink
								text={message.text ?? ""}
								linkClassName={
									isMine ? "ds-chat-bubble-inline-link--mine" : undefined
								}
							/>
						</div>

						<div
							className={cn(
								"ds-chat-bubble-meta-row",
								isMine
									? "ds-chat-bubble-meta-row--mine"
									: "ds-chat-bubble-meta-row--theirs",
							)}
						>
							<time
								className="ds-chat-bubble-time tabular-nums"
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
								<span
									className="ds-chat-bubble-status ds-chat-bubble-status--failed"
									role="status"
								>
									{t("thread.sendFailed")}
								</span>
							)}
						</div>
					</div>
				</div>

				{canReply && (
					<div
						className={cn(
							"ds-chat-msg-reply-outside",
							touchPrimary &&
								touchReplyVisible &&
								"ds-chat-msg-reply-outside--revealed",
						)}
					>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={t("thread.reply")}
							className="ds-chat-msg-actions-trigger ds-chat-msg-reply-trigger"
							onClick={() => {
								onReply(message);
								onTouchReplyDismiss?.();
							}}
						>
							<Reply className="size-3.5 sm:size-4" strokeWidth={2} />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
