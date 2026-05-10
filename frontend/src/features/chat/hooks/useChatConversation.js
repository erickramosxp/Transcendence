import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getConversation, sendMessages } from "@/features/chat/services/chatService";
import { readCurrentUserId } from "@/features/chat/utils/currentUser";
import { mapMessageSenderData } from "@/features/chat/utils/mapMessageSenderData";
import { useChatStore } from "../store/useChatStore";
import { useSocketStore } from "@/shared/realtime/store/useSocketStore";
import { withChatId } from "@/features/chat/utils/mapMessagesWithChatId.js";
import { mergeChatMessagesWithPending } from "@/features/chat/utils/mergeChatMessagesWithPending.js";
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

	const addMessage = useChatStore((state) => state.addMessage);
	const dispatchListBump = useChatStore((state) => state.dispatchListBump);
	const addOptimisticOutbound = useChatStore((state) => state.addOptimisticOutbound);
	const completeOutboundWithClientToken = useChatStore(
		(state) => state.completeOutboundWithClientToken,
	);
	const markOutboundFailedByClientId = useChatStore(
		(state) => state.markOutboundFailedByClientId,
	);
	const removeOptimisticByClientId = useChatStore(
		(state) => state.removeOptimisticByClientId,
	);

	const send = useSocketStore(
		(state) => state.send
	)

	const connected = useSocketStore((state) => state.connected)
	const navigatorOnline = useSocketStore((state) => state.navigatorOnline)
	const realtimeConnected = connected && navigatorOnline
	const prevConnectedRef = useRef(connected)

	const fetchFirstPage = useCallback(
		async (convId) => {
			const prev = useChatStore.getState().messages
			const data = await getConversation(convId, { page: 0, size: 20 })
			const ui = data.messages.map((m) =>
				mapMessageSenderData(m, currentUserId, peerName),
			)
			const withIds = withChatId(ui, convId)
			const merged = mergeChatMessagesWithPending(
				withIds,
				prev,
				convId,
				currentUserId,
			)
			setMessages(merged)
			setNextOlderPage(data.hasMore ? data.page + 1 : null)
		},
		[currentUserId, peerName, setMessages],
	)

	useEffect(() => {
		if (!currentChat?.id || !connected) return
		send(WS_SEND_EVENTS.CHAT_SUBSCRIBE, { chatId: currentChat.id })
	}, [currentChat?.id, connected, send])

	useEffect(() => {
		const wasConnected = prevConnectedRef.current
		prevConnectedRef.current = connected

		if (!currentChat?.id) return
		if (!connected || wasConnected) return

		let cancelled = false
		;(async () => {
			setLoading(true)
			setLoadingOlder(false)
			setNextOlderPage(null)
			shouldScrollToBottomRef.current = true
			stickToBottomRef.current = true
			try {
				await fetchFirstPage(currentChat.id)
				if (cancelled) return
				setError(null)
			} catch (e) {
				if (!cancelled) setError(e?.message ?? t("errors.load"))
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()

		return () => {
			cancelled = true
		}
	}, [connected, currentChat?.id, fetchFirstPage, t])

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
			send(WS_SEND_EVENTS.CHAT_SUBSCRIBE, { chatId: convId });
			try {
				await fetchFirstPage(convId);
				if (cancelled) return;
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
	}, [
		currentChat?.id,
		clearCurrentChat,
		setActiveChat,
		fetchFirstPage,
		t,
		send,
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
		async (text) => {
			if (!currentChat) return;
			const trimmed = (text ?? "").trim();
			if (!trimmed) return;

			if (!useSocketStore.getState().navigatorOnline) {
				toast.warning(t("realtime.cannotSendNoNetwork"));
				return;
			}

			stickToBottomRef.current = true;
			shouldScrollToBottomRef.current = true;

			const clientMessageId = crypto.randomUUID();
			addOptimisticOutbound({
				clientMessageId,
				chatId: currentChat.id,
				text: trimmed,
				peerName,
			});

			const socket = useSocketStore.getState().socket;
			const wsOpen = socket?.readyState === WebSocket.OPEN;

			if (wsOpen) {
				const sentViaWs = send(WS_SEND_EVENTS.SEND_MESSAGE, {
					chatId: currentChat.id,
					text: trimmed,
					clientMessageId,
				});

				if (sentViaWs) {

					onAfterMessageSent?.({
						chatId: currentChat.id,
						lastMessage: {
							text: trimmed,
							createdAt: new Date().toISOString(),
						},
					});
					return;
				}
			}

			try {
				const data = await sendMessages(currentChat.id, trimmed);
				const done = completeOutboundWithClientToken(
					clientMessageId,
					data,
					peerName,
				);
				if (!done) {
					removeOptimisticByClientId(clientMessageId);
					const ui = mapMessageSenderData(data, currentUserId, peerName);
					addMessage({
						...ui,
						chatId: data.chatId ?? currentChat.id,
					});
				}
				const createdAt =
					data.createdAt != null
						? String(data.createdAt)
						: new Date().toISOString();
				dispatchListBump({
					chatId: data.chatId ?? currentChat.id,
					lastMessage: {
						text: data.text ?? trimmed,
						createdAt,
					},
				});
				onAfterMessageSent?.({
					chatId: currentChat.id,
					lastMessage: {
						text: data.text ?? trimmed,
						createdAt,
					},
				});
			} catch (e) {
				markOutboundFailedByClientId(clientMessageId);
				const msg =
					e?.response?.data?.message ??
					e?.message ??
					t("errors.send");
				toast.error(msg);
			}
		},
		[
			currentChat,
			send,
			onAfterMessageSent,
			t,
			currentUserId,
			peerName,
			addMessage,
			dispatchListBump,
			addOptimisticOutbound,
			completeOutboundWithClientToken,
			markOutboundFailedByClientId,
			removeOptimisticByClientId,
		],
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
		realtimeConnected,
	};
}
