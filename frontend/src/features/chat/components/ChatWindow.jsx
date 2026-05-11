import { Separator } from "@/design-system";
import { useTranslation } from "react-i18next";
import ChatEmptyState from "@/features/chat/components/ChatEmptyState";
import ChatThreadHeader from "@/features/chat/components/ChatThreadHeader";
import ChatTypingIndicator from "@/features/chat/components/ChatTypingIndicator";
import MessageInput from "@/features/chat/components/MessageInput";
import MessageThread from "@/features/chat/components/MessageThread";
import { useChatConversation } from "@/features/chat/hooks/useChatConversation";
import { useSocketStore } from "@/shared/realtime/store/useSocketStore";
import { useCallback, useEffect, useState } from "react";
import { replyQuoteFromMessageRow } from "@/features/chat/utils/replyQuote";

export default function ChatWindow({ currentChat, onBack, onAfterMessageSent }) {
	const { t } = useTranslation("chat");
	const [replyTarget, setReplyTarget] = useState(null);

	useEffect(() => {
		setReplyTarget(null);
	}, [currentChat?.id]);

	const {
		messages,
		loading,
		error,
		loadingOlder,
		listRef,
		onScroll,
		handleSendMessage,
		currentUserId,
		realtimeConnected,
	} = useChatConversation(currentChat, { onAfterMessageSent });

	const handleReply = useCallback((message) => {
		setReplyTarget(replyQuoteFromMessageRow(message));
	}, []);

	const sendWithOptionalReply = useCallback(
		async (text) => {
			const rid = replyTarget?.id ?? null;
			const ok = await handleSendMessage(text, {
				replyToId: rid,
			});
			if (ok) setReplyTarget(null);
			return ok;
		},
		[handleSendMessage, replyTarget],
	);

	const wsNavigatorOnline = useSocketStore((s) => s.navigatorOnline);
	const wsConnecting = useSocketStore((s) => s.connecting);
	const wsReconnectAttempts = useSocketStore((s) => s.reconnectAttempts);


	if (!currentChat) {
		return <ChatEmptyState />;
	}

	return (
		<div className="ds-chat-window-surface ds-chat-window-column">
			<ChatThreadHeader
				currentChat={currentChat}
				onBack={onBack}
				realtimeOk={realtimeConnected}
			/>
			<Separator />
			{!realtimeConnected && (
				<p
					className="ds-chat-thread-banner ds-chat-thread-banner--muted ds-chat-thread-banner--sep"
					role="status"
					aria-live="polite"
				>
					{!wsNavigatorOnline
						? t("realtime.barNoNetwork")
						: wsConnecting
							? t("realtime.connecting")
							: t("realtime.barNoWs", { n: wsReconnectAttempts })}
				</p>
			)}
			<MessageThread
				messages={messages}
				currentUserId={currentUserId}
				showSenderName={currentChat?.type === "group"}
				listRef={listRef}
				onScroll={onScroll}
				loadingOlder={loadingOlder}
				loading={loading}
				error={error}
				onReply={handleReply}
			/>
			<ChatTypingIndicator />
			<div className="ds-chat-composer">
				<MessageInput
					currentChat={currentChat}
					onSendMessage={sendWithOptionalReply}
					replyTarget={replyTarget}
					onCancelReply={() => setReplyTarget(null)}
					networkOnline={wsNavigatorOnline}
				/>
			</div>
		</div>
	);
}
