import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getConversation } from "@/features/chat/services/chatService";
import { readCurrentUserId } from "@/features/chat/utils/currentUser";
import { mapMessageSenderData } from "@/features/chat/utils/mapMessageSenderData";
import { useChatStore } from "../store/useChatStore";
import { useSocketStore } from "@/shared/realtime/store/useSocketStore";
import { withChatId } from "@/features/chat/utils/mapMessagesWithChatId.js";
import { WS_SEND_EVENTS } from "@/shared/constants/websocket";

const NEAR_BOTTOM_PX = 100;

function updateStickToBottom(el) {
	if (!el) return false;
	const { scrollTop, scrollHeight, clientHeight } = el;
	const distanceFromBottom = scrollHeight - clientHeight - scrollTop;
	return distanceFromBottom <= NEAR_BOTTOM_PX;
}

export function useChatConversation(currentChat, options = {}) {
	const { onAfterMessageSent, scrollToBottomOnOpen = true } = options;
	const { t } = useTranslation("chat");
	const listRef = useRef(null);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [nextOlderPage, setNextOlderPage] = useState(null);
	const [loadingOlder, setLoadingOlder] = useState(false);
	const shouldScrollToBottomRef = useRef(false);
	const stickToBottomRef = useRef(true);

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
			if (scrollToBottomOnOpen) {
				shouldScrollToBottomRef.current = true;
				stickToBottomRef.current = true;
			} else {
				shouldScrollToBottomRef.current = false;
				stickToBottomRef.current = false;
			}
			setActiveChat(convId);
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
		};
	}, [
		currentChat?.id,
		clearCurrentChat,
		setActiveChat,
		setMessages,
		currentUserId,
		peerName,
		t,
		scrollToBottomOnOpen,
	]);

	useEffect(() => {
		if (loading) return;
		const el = listRef.current;
		if (!el) return;

		const shouldScroll =
			shouldScrollToBottomRef.current || stickToBottomRef.current;

		if (!shouldScroll) return;

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const node = listRef.current;
				if (!node) return;
				node.scrollTop = node.scrollHeight;
				shouldScrollToBottomRef.current = false;
				stickToBottomRef.current = true;
			});
		});
	}, [messages, loading]);

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
	}, [
		currentChat,
		nextOlderPage,
		loadingOlder,
		currentUserId,
		peerName,
		t,
		prependMessages,
	]);

	const onScroll = useCallback(
		(e) => {
			const el = e.target;
			stickToBottomRef.current = updateStickToBottom(el);
			if (el.scrollTop < 80) loadOlder();
		},
		[loadOlder],
	);

	const handleSendMessage = useCallback(
		(text) => {
			if (!currentChat) return;
			const trimmed = (text ?? "").trim();
			if (!trimmed) return;

			stickToBottomRef.current = true;
			shouldScrollToBottomRef.current = true;

			send(WS_SEND_EVENTS.SEND_MESSAGE, {
				chatId: currentChat.id,
				text: trimmed,
			});

			onAfterMessageSent?.({
				chatId: currentChat.id,
				lastMessage: {
					text: trimmed,
					createdAt: new Date().toISOString(),
				},
			});
		},
		[currentChat, send, onAfterMessageSent],
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
