import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getConversation, sendMessages } from "@/features/chat/services/chatService";
import { readCurrentUserId } from "@/features/chat/utils/currentUser";
import { mapMessageSenderData } from "@/features/chat/utils/mapMessageSenderData";
import { useChatStore } from "../store/useChatStore";
import { useSocketStore } from "@/shared/realtime/store/useSocketStore";
import { withChatId } from "@/features/chat/utils/mapMessagesWithChatId.js";
import { WS_SEND_EVENTS } from "@/shared/constants/websocket";

export function useChatConversation(currentChat, options = {}) {
	const { onAfterMessageSent } = options;
	const { t } = useTranslation("chat");
	const listRef = useRef(null);

	// const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [nextOlderPage, setNextOlderPage] = useState(null);
	const [loadingOlder, setLoadingOlder] = useState(false);
	const shouldScrollToBottomRef = useRef(false);

	const currentUserId = readCurrentUserId();
	const peerName =
		(currentChat?.name ?? "").trim() ||
		(currentChat?.type === "direct"
			? (currentChat?.user?.name ?? "").trim() ||
				(currentChat?.user?.username
					? `@${currentChat.user.username}`
					: "")
			: "") ||
		(currentChat?.chatName ?? "").trim() ||
		t("peerFallback");

	const messages = useChatStore(
		(state) => state.messages
	);

	const addMessage = useChatStore(
		(state) => state.addMessage
	);

	const setMessages = useChatStore(
		(state) => state.setMessages
	);

	const prependMessages = useChatStore(
		(state) => state.prependMessages
	);

	const clearCurrentChat = useChatStore(
		(state) => state.clearCurrentChat
	);

	const setActiveChat = useChatStore(
		(state) => state.setActiveChat
	);

	const send = useSocketStore(
		(state) => state.send
	)

	useEffect(() => {
		if (!currentChat) {
			clearCurrentChat();
			setNextOlderPage(null);
			setError(null);
			return;
		}

		const convId = currentChat.id;
		let cancelled = false;

		(async () => {
			setLoading(true);
			setError(null);
			setNextOlderPage(null);
			shouldScrollToBottomRef.current = true;
			setActiveChat(convId);
			send(WS_SEND_EVENTS.CHAT_SUBSCRIBE, {chatId: convId });
			try {
				const data = await getConversation(convId, { page: 0, size: 20 });
				if (cancelled) return;
				const ui = data.messages.map((m) =>
					mapMessageSenderData(m, currentUserId, peerName),
				);
				setMessages(withChatId(ui, convId));
				setNextOlderPage(data.hasMore ? data.page + 1 : null);
			} catch (e) {
				if (!cancelled) setError(e?.message ?? t("errors.load"));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
			send(WS_SEND_EVENTS.CHAT_UNSUBSCRIBE, {chatId: convId });
		};
	}, [currentChat?.id, send, clearCurrentChat, currentUserId, peerName, t]);

	useEffect(() => {
		if (!shouldScrollToBottomRef.current) return;
		if (!listRef.current) return;
		requestAnimationFrame(() => {
			if (listRef.current) {
				listRef.current.scrollTop = listRef.current.scrollHeight;
				shouldScrollToBottomRef.current = false;
			}
		});
	}, [messages]);

	const loadOlder = useCallback(async () => {
		if (!currentChat || !nextOlderPage || loadingOlder) return;

		const el = listRef.current;
		const prevH = el?.scrollHeight ?? 0;

		setLoadingOlder(true);
		try {
			const data = await getConversation(currentChat.id, {
				page: nextOlderPage,
				size: 20,
			});
			const ui = data.messages.map((m) =>
				mapMessageSenderData(m, currentUserId, peerName),
			);
			prependMessages(withChatId(ui, currentChat.id));
			setNextOlderPage(data.hasMore ? data.page + 1 : null);
			requestAnimationFrame(() => {
				if (el) el.scrollTop = el.scrollHeight - prevH;
			});
		} catch (e) {
			setError(e?.message ?? t("errors.load"));
		} finally {
			setLoadingOlder(false);
		}
	}, [currentChat, nextOlderPage, loadingOlder, currentUserId, peerName, t]);

	const onScroll = useCallback(
		(e) => {
			if (e.target.scrollTop < 80) loadOlder();
		},
		[loadOlder],
	);

	const handleSendMessage = useCallback(
		async (text) => {
			if (!currentChat) return;
			try {
				const created = await sendMessages(
					currentChat.id,
					text,
					currentUserId,
				);
				const ui = mapMessageSenderData(created, currentUserId, peerName);
				addMessage({ ...ui, chatId: currentChat.id });
				const createdAt =
					created.createdAt ?? ui.timestamp;
				onAfterMessageSent?.({
					chatId: currentChat.id,
					lastMessage: {
						text: created.text ?? text,
						createdAt,
					},
				});
				requestAnimationFrame(() => {
					if (listRef.current)
						listRef.current.scrollTop = listRef.current.scrollHeight;
				});
			} catch (e) {
				setError(e?.message ?? t("errors.send"));
			}
		},
		[currentChat, currentUserId, peerName, t, onAfterMessageSent],
	);

	return {
		messages,
		loading,
		error,
		loadingOlder,
		listRef,
		onScroll,
		handleSendMessage,
		currentUserId,
	};
}
