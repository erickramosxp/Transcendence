import { readCurrentUserId } from "@/features/chat/utils/currentUser";
import { useChatStore } from "@/features/chat/store/useChatStore";

const CHAT_PATH = "/chat";

export function shouldSuppressChatMessageToast(payload) {
	if (!payload?.id || payload.chatId == null) return true;

	const myId = readCurrentUserId();
	if (
		myId != null &&
		payload.senderId != null &&
		Number(payload.senderId) === Number(myId)
	) {
		return true;
	}

	if (typeof window === "undefined") return false;

	const onChatPage = window.location.pathname === CHAT_PATH;
	if (!onChatPage) return false;

	const activeId = useChatStore.getState().activeChatId;
	return (
		activeId != null &&
		Number(activeId) === Number(payload.chatId)
	);
}
