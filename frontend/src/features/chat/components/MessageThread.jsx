import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import Message from "@/features/chat/components/Message";
import ChatDaySeparator from "@/features/chat/components/ChatDaySeparator";
import {
	formatChatDaySeparatorLabel,
	isSameChatDay,
} from "@/features/chat/utils/formatChatDates";

export default function MessageThread({
	messages,
	currentUserId,
	listRef,
	onScroll,
	loadingOlder,
	loading,
	error,
}) {
	const { t } = useTranslation("chat");
	const { currentLanguage } = useLanguage();

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
							return (
								<Fragment key={msg.id}>
									{showDay && <ChatDaySeparator label={dayLabel} />}
									<Message currentUserId={currentUserId} message={msg} />
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
