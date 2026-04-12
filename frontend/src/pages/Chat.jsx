import { useState, useEffect } from "react";
import ChatWindow from "@/features/chat/components/ChatWindow";
import ChatList from "@/features/chat/components/ChatList";
import { cn } from "@/design-system/tokens/colors";
import { getMyChats } from "@/features/chat/services/chatService";
import { Loading } from "@/design-system";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export function Chat() {
	const { t } = useTranslation('chat');
	const [selectedChat, setSelectedChat] = useState(null);
	const [myChats, setMyChats] = useState([]);
	const [chatListPage, setChatListPage] = useState(0);
	const [chatListHasMore, setChatListHasMore] = useState(false);
	const [chatListLoadingMore, setChatListLoadingMore] = useState(false);
	const [loadHeader, setLoadHeader] = useState(true);
	const [notFounded, setNotFounded] = useState(false);

	useEffect(() => {
		const fetchMyChats = async () => {
			try {
				const resp = await getMyChats({ page: 0 });
				setMyChats(resp.items ?? []);
				setChatListPage(0);
				setChatListHasMore(Boolean(resp.hasMore));
				setNotFounded(false);
			} catch (err) {
				console.error(err);
				setNotFounded(true);
				toast.error(t("errors.load"));
			} finally {
				setLoadHeader(false);
			}
		};
		fetchMyChats();
	}, [t]);

	async function loadMoreChats() {
		if (!chatListHasMore || chatListLoadingMore) return;
		const nextPage = chatListPage + 1;
		setChatListLoadingMore(true);
		try {
			const resp = await getMyChats({ page: nextPage });
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
				return merged;
			});
			setChatListPage(nextPage);
			setChatListHasMore(Boolean(resp.hasMore));
		} catch (err) {
			console.error(err);
			toast.error(t("errors.load"));
		} finally {
			setChatListLoadingMore(false);
		}
	}

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
				<ChatWindow currentChat={selectedChat} onBack={() => setSelectedChat(null)} />
			</main>
		</div>
	);
}
