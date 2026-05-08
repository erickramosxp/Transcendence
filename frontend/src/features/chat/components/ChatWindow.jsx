import { Separator } from "@/design-system";
import { useTranslation } from "react-i18next";
import ChatEmptyState from "@/features/chat/components/ChatEmptyState";
import ChatThreadHeader from "@/features/chat/components/ChatThreadHeader";
import ChatTypingIndicator from "@/features/chat/components/ChatTypingIndicator";
import MessageInput from "@/features/chat/components/MessageInput";
import MessageThread from "@/features/chat/components/MessageThread";
import { useChatConversation } from "@/features/chat/hooks/useChatConversation";
import { useSocketStore } from "@/shared/realtime/store/useSocketStore";

export default function ChatWindow({ currentChat, onBack, onAfterMessageSent }) {
	const { t } = useTranslation("chat");
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
					className="ds-chat-thread-banner ds-chat-thread-banner--muted border-b border-border/60"
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
			/>
			<ChatTypingIndicator />
			<div className="ds-chat-composer">
				<MessageInput
					currentChat={currentChat}
					onSendMessage={handleSendMessage}
					realtimeConnected={realtimeConnected}
				/>
			</div>
		</div>
	);
}
