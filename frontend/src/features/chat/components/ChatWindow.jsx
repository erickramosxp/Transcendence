import { Separator } from "@/design-system";
import ChatEmptyState from "@/features/chat/components/ChatEmptyState";
import ChatThreadHeader from "@/features/chat/components/ChatThreadHeader";
import MessageInput from "@/features/chat/components/MessageInput";
import MessageThread from "@/features/chat/components/MessageThread";
import { useChatConversation } from "@/features/chat/hooks/useChatConversation";

export default function ChatWindow({ currentChat, onBack, onAfterMessageSent }) {
	const {
		messages,
		loading,
		error,
		loadingOlder,
		listRef,
		onScroll,
		handleSendMessage,
		currentUserId,
	} = useChatConversation(currentChat, { onAfterMessageSent });

	if (!currentChat) {
		return <ChatEmptyState />;
	}

	return (
		<div className="ds-chat-window-surface ds-chat-window-column">
			<ChatThreadHeader currentChat={currentChat} onBack={onBack} />
			<Separator />
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
			<div className="ds-chat-composer">
				<MessageInput onSendMessage={handleSendMessage} />
			</div>
		</div>
	);
}
