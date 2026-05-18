import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Paperclip, Send, Smile, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useMessageLinkPreview } from "@/features/chat/hooks/useMessageLinkPreview";
import { LIMITS } from "@/shared/validation/limits";
import { toast } from "react-toastify";
import { useChatTypingPresence } from "@/features/chat/hooks/useChatTypingPresence";
import { ChatLinkPreviewCard } from "@/features/chat/components/ChatLinkPreviewCard";

export default function MessageInput({
	currentChat,
	onSendMessage,
	replyTarget = null,
	onCancelReply,
	networkOnline = true,
}) {
	const { t } = useTranslation(["chat", "common"]);
	const [text, setText] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const emojiPickerAreaRef = useRef(null);
	const { preview: draftLinkPreview, loading: draftLinkPreviewLoading } =
		useMessageLinkPreview(text);

	const { notifyDraftChanged, stopTypingSession } = useChatTypingPresence(
		currentChat?.id,
	);

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)");
		const closePickerIfNarrow = () => {
			if (!mq.matches) setShowEmojiPicker(false);
		};
		closePickerIfNarrow();
		mq.addEventListener("change", closePickerIfNarrow);
		return () => mq.removeEventListener("change", closePickerIfNarrow);
	}, []);

	useEffect(() => {
		if (!showEmojiPicker) return;

		function handleClickOutside(event) {
			if (
				emojiPickerAreaRef.current &&
				!emojiPickerAreaRef.current.contains(event.target)
			) {
				setShowEmojiPicker(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showEmojiPicker]);

	async function handleSendMessage(e) {
		e.preventDefault();
		const trimmed = text.trim();
		if (!trimmed) return;
		if (!networkOnline) return;

		if (text.length > LIMITS.chatMessageMax) {
			toast.error(t("common:errors.post.tooLong", { max: LIMITS.chatMessageMax }));
			return;
		}

		stopTypingSession();
		const ok = await onSendMessage(trimmed);
		if (ok !== false) setText("");
	}

	function handleEmojiSelect(emojiData) {
		onTextChange(text + emojiData.emoji);
	}

	function onTextChange(next) {
		if (next.length > LIMITS.chatMessageMax) return;
		setText(next);
		notifyDraftChanged(next);
	}

	const replyName =
		(replyTarget?.senderDisplayName ?? "").trim() || t("thread.unknownSender");
	const replySnippet =
		(replyTarget?.text ?? "").trim() || t("thread.replyPreviewEmpty");

	return (
		<div className="ds-chat-composer-stack">
			{replyTarget && (
				<div className="ds-chat-reply-preview" role="status">
					<div className="min-w-0 flex-1">
						<p className="ds-chat-reply-preview-label">
							{t("thread.replyingTo", { name: replyName })}
						</p>
						<p className="ds-chat-reply-preview-snippet">{replySnippet}</p>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-8 shrink-0"
						aria-label={t("thread.cancelReply")}
						onClick={() => onCancelReply?.()}
					>
						<X className="size-4" />
					</Button>
				</div>
			)}
			{(draftLinkPreviewLoading || draftLinkPreview) && (
				<div className="ds-chat-draft-preview-stack">
					{draftLinkPreviewLoading && (
						<p className="ds-chat-draft-preview-loading">
							{t("linkPreview.loading")}
						</p>
					)}
					<ChatLinkPreviewCard
						preview={draftLinkPreview}
						compact
						className="mt-0"
					/>
				</div>
			)}
			<form onSubmit={handleSendMessage} className="ds-chat-input-form">
				<Button
					variant="outline"
					size="icon"
					type="button"
					className="ds-chat-input-icon-btn"
				>
					<Paperclip className="ds-chat-icon-input" />
				</Button>

				<div className="relative min-w-0 flex-1">
					<Input
						value={text}
						maxLength={LIMITS.chatMessageMax}
						onChange={(e) => onTextChange(e.target.value)}
						onFocus={() => setShowEmojiPicker(false)}
						className="ds-chat-input-field"
						placeholder={
							!networkOnline
								? t("input.placeholderOffline")
								: t("input.placeholder")
						}
						disabled={!networkOnline}
					/>
					<div ref={emojiPickerAreaRef} className="hidden lg:contents">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="ds-chat-input-emoji-btn"
							tabIndex={-1}
							onClick={() => {
								setShowEmojiPicker(!showEmojiPicker);
							}}
						>
							<Smile className="size-4" />
						</Button>
						{showEmojiPicker && (
							<div className="ds-chat-input-emoji-pop">
								<EmojiPicker onEmojiClick={handleEmojiSelect} />
							</div>
						)}
					</div>
				</div>

				<Button
					onClick={handleSendMessage}
					size="icon"
					type="submit"
					className="ds-chat-input-icon-btn"
					disabled={!networkOnline}
				>
					<Send className="ds-chat-icon-input" />
				</Button>
			</form>
		</div>
	);
}
