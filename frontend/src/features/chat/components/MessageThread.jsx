import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import Message from "@/features/chat/components/Message";
import ChatDaySeparator from "@/features/chat/components/ChatDaySeparator";
import { resolveReplyQuoteForDisplay } from "@/features/chat/utils/replyQuote";
import {
	formatChatDaySeparatorLabel,
	isSameChatDay,
} from "@/features/chat/utils/formatChatDates";

export default function MessageThread({
	messages,
	currentUserId,
	showSenderName,
	listRef,
	onScroll,
	loadingOlder,
	loading,
	error,
	onReply,
}) {
	const { t } = useTranslation("chat");
	const { currentLanguage } = useLanguage();
	const [touchReplyMessageKey, setTouchReplyMessageKey] = useState(null);

	useEffect(() => {
		const el = listRef?.current;
		const close = () => setTouchReplyMessageKey(null);
		if (el) el.addEventListener("scroll", close, { passive: true });
		window.addEventListener("resize", close);
		return () => {
			if (el) el.removeEventListener("scroll", close);
			window.removeEventListener("resize", close);
		};
	}, [listRef]);

	return (
		<>
			{error && (
				<p
					className="ds-chat-thread-banner ds-chat-thread-banner--error"
					role="alert"
				>
					{error}
				</p>
			)}
			{loading ? (
				<div className="ds-chat-thread-loading" role="status" aria-live="polite">
					<p>{t("loading.messages")}</p>
				</div>
			) : (
				<div
					ref={listRef}
					onScroll={onScroll}
					className="ds-chat-thread-scroll"
				>
					{loadingOlder && (
						<p className="ds-chat-thread-loading-more">{t("loading.older")}</p>
					)}
					{messages.length > 0 ? (
						messages.map((msg, idx) => {
							const prev = messages[idx - 1];
							const showDay =
								idx === 0 ||
								!prev ||
								!isSameChatDay(msg.timestamp, prev.timestamp);
							const dayLabel = showDay
								? formatChatDaySeparatorLabel(
										msg.timestamp,
										currentLanguage,
										{
											today: t("day.today"),
											yesterday: t("day.yesterday"),
										},
									)
								: null;
							const msgKey = msg.clientMessageId ?? msg.id;
							return (
								<Fragment key={msgKey}>
									{showDay && <ChatDaySeparator label={dayLabel} />}
									<Message
										currentUserId={currentUserId}
										message={msg}
										showSenderName={showSenderName}
										replyQuote={resolveReplyQuoteForDisplay(
											messages,
											msg,
										)}
										onReply={onReply}
										touchReplyVisible={
											touchReplyMessageKey != null &&
											String(touchReplyMessageKey) === String(msgKey)
										}
										onTouchReplyReveal={() =>
											setTouchReplyMessageKey(msgKey)
										}
										onTouchReplyDismiss={() =>
											setTouchReplyMessageKey(null)
										}
									/>
								</Fragment>
							);
						})
					) : (
						<p className="ds-chat-thread-empty">{t("thread.empty")}</p>
					)}
				</div>
			)}
		</>
	);
}
