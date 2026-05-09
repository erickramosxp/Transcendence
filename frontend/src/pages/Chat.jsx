import { useState, useEffect, useCallback, useRef } from "react";
import ChatWindow from "@/features/chat/components/ChatWindow";
import ChatList from "@/features/chat/components/ChatList";
import { cn } from "@/design-system/tokens/colors";
import { getMyChats, CHAT_LIST_PAGE_SIZE } from "@/features/chat/services/chatService";
import { sortChatsByRecency, applyChatListFocus } from "@/features/chat/utils/sortChatsByRecency";
import { Loading } from "@/design-system";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useChatStore } from "@/features/chat/store/useChatStore";
import { useSocketStore } from "@/shared/realtime/store/useSocketStore";

export function Chat() {
	const { t } = useTranslation("chat");
	const [selectedChat, setSelectedChat] = useState(null);
	const [myChats, setMyChats] = useState([]);
	const [chatListHasMore, setChatListHasMore] = useState(false);
	const [chatListLoadingMore, setChatListLoadingMore] = useState(false);
	const [loadHeader, setLoadHeader] = useState(true);
	const [notFounded, setNotFounded] = useState(false);

	const listFetchRef = useRef({
		page: 0,
		hasMore: false,
		loading: false,
	});
	const initialChatListLoadedRef = useRef(false);
	const prevWsConnectedRef = useRef(useSocketStore.getState().connected);

	const wsConnected = useSocketStore((s) => s.connected);
	const listBumpSeq = useChatStore((s) => s.listBumpSeq ?? 0);

	const resetAndFetchChats = useCallback(async (options = {}) => {
		const { listFocusChatId } = options;
		const resp = await getMyChats({ page: 0, size: CHAT_LIST_PAGE_SIZE });
		const rawItems = resp.items ?? [];
		const items = applyChatListFocus(rawItems, listFocusChatId);
		const sorted = sortChatsByRecency(items);
		const more = Boolean(resp.hasMore);
		setMyChats(sorted);
		setChatListHasMore(more);
		listFetchRef.current = { page: 0, hasMore: more, loading: false };
		return { response: resp, sortedChats: sorted };
	}, []);

	useEffect(() => {
		const fetchMyChats = async () => {
			try {
				await resetAndFetchChats();
				setNotFounded(false);
			} catch (err) {
				console.error(err);
				setNotFounded(true);
				toast.error(t("errors.load"));
			} finally {
				initialChatListLoadedRef.current = true;
				setLoadHeader(false);
			}
		};
		fetchMyChats();
	}, [t, resetAndFetchChats]);

	useEffect(() => {
		const wasConnected = prevWsConnectedRef.current;
		prevWsConnectedRef.current = wsConnected;

		if (!initialChatListLoadedRef.current || notFounded) return;
		if (!wsConnected || wasConnected) return;

		resetAndFetchChats({
			listFocusChatId: selectedChat?.id,
		}).catch((err) => {
			console.error(err);
			toast.error(t("errors.load"));
		});
	}, [wsConnected, notFounded, resetAndFetchChats, t, selectedChat?.id]);

	const loadMoreChats = useCallback(async () => {
		const s = listFetchRef.current;
		if (!s.hasMore || s.loading) return;
		s.loading = true;
		setChatListLoadingMore(true);
		const nextPage = s.page + 1;
		try {
			const resp = await getMyChats({
				page: nextPage,
				size: CHAT_LIST_PAGE_SIZE,
			});
			const newItems = resp.items ?? [];
			setMyChats((prev) => {
				const seen = new Set(prev.map((c) => c?.id).filter(Boolean));
				const merged = [...prev];
				for (const c of newItems) {
					if (c?.id != null && !seen.has(c.id)) {
						seen.add(c.id);
						merged.push(c);
					}
				}
				return sortChatsByRecency(merged);
			});
			s.page = nextPage;
			s.hasMore = Boolean(resp.hasMore);
			setChatListHasMore(s.hasMore);
		} catch (err) {
			console.error(err);
			toast.error(t("errors.load"));
		} finally {
			s.loading = false;
			setChatListLoadingMore(false);
		}
	}, [t]);

	const bumpChatAfterMessage = useCallback(
		({ chatId, lastMessage }) => {
			setMyChats((prev) => {
				const idx = prev.findIndex(
					(c) => c?.id != null && Number(c.id) === Number(chatId),
				);
				if (idx < 0) {
					resetAndFetchChats({ listFocusChatId: chatId }).catch((err) =>
						console.error(err),
					);
					return prev;
				}
				const next = prev.map((c, i) =>
					i === idx ? { ...c, lastMessage } : c,
				);
				return sortChatsByRecency(next);
			});
			setSelectedChat((sel) => {
				if (sel?.id == null || Number(sel.id) !== Number(chatId)) return sel;
				return { ...sel, lastMessage };
			});
		},
		[resetAndFetchChats],
	);

	useEffect(() => {
		if (!listBumpSeq) return;
		const batch = useChatStore.getState().drainListBumpQueue();
		batch.forEach((p) => bumpChatAfterMessage(p));
	}, [listBumpSeq, bumpChatAfterMessage]);

	const handleChatCreated = useCallback(
		async (apiChat, meta) => {
			let sortedChats;
			try {
				({ sortedChats } = await resetAndFetchChats({
					listFocusChatId: apiChat?.id,
				}));
			} catch (e) {
				console.error(e);
				toast.error(t("errors.load"));
				return;
			}
			const fromList = sortedChats.find(
				(c) => c?.id != null && Number(c.id) === Number(apiChat?.id),
			);
			const name = meta?.peerLabel ?? apiChat?.chatName ?? undefined;
			if (fromList) {
				setSelectedChat(fromList);
			} else {
				setSelectedChat(name != null ? { ...apiChat, name } : apiChat);
			}
			toast.success(t("list.add.createSuccess"));
		},
		[resetAndFetchChats, t],
	);

	if (loadHeader) {
		return <Loading size="lg" full={true} />;
	}

    if (notFounded) {
        return <div className="flex flex-1 items-center justify-center h-full">
            <p className="text-muted-foreground text-3xl text-center">
                {t("errors.load")}
            </p>
        </div>
    }
	return (
		<div className="ds-chat-layout">
			<aside
				className={cn(
					"ds-chat-sidebar",
					selectedChat && "hidden md:flex",
				)}
			>
				<ChatList
					myChats={myChats}
					selectedChat={selectedChat}
					onSelectChat={setSelectedChat}
					onChatCreated={handleChatCreated}
					hasMore={chatListHasMore}
					loadingMore={chatListLoadingMore}
					onLoadMore={loadMoreChats}
				/>
			</aside>
			<main
				className={cn(
					"ds-chat-main",
					!selectedChat && "hidden md:flex",
				)}
			>
				<ChatWindow
					currentChat={selectedChat}
					onBack={() => setSelectedChat(null)}
					onAfterMessageSent={bumpChatAfterMessage}
				/>
			</main>
		</div>
	);
}
