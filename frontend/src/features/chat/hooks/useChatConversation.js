import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	getConversation,
	sendMessages,
	mapApiMessageToUi,
} from "@/features/chat/services/chatService";
import { readCurrentUserId } from "@/features/chat/utils/currentUser";

export function useChatConversation(currentChat) {
	const { t } = useTranslation("chat");
	const listRef = useRef(null);

	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [nextOlderPage, setNextOlderPage] = useState(null);
	const [loadingOlder, setLoadingOlder] = useState(false);

	const currentUserId = readCurrentUserId();
	const peerName = currentChat?.name ?? t("peerFallback");

	useEffect(() => {
		if (!currentChat) {
			setMessages([]);
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
			try {
				const data = await getConversation(convId, { page: 0, size: 20 });
				if (cancelled) return;
				const ui = data.messages.map((m) =>
					mapApiMessageToUi(m, currentUserId, peerName),
				);
				setMessages(ui);
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
	}, [currentChat?.id, currentUserId, peerName, t]);

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
				mapApiMessageToUi(m, currentUserId, peerName),
			);
			setMessages((prev) => [...ui, ...prev]);
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
				const ui = mapApiMessageToUi(created, currentUserId, peerName);
				setMessages((prev) => [...prev, ui]);
				requestAnimationFrame(() => {
					if (listRef.current)
						listRef.current.scrollTop = listRef.current.scrollHeight;
				});
			} catch (e) {
				setError(e?.message ?? t("errors.send"));
			}
		},
		[currentChat, currentUserId, peerName, t],
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
