import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCirclePlus, Search } from "lucide-react";

import { Button, Input, Separator } from "@/design-system";
import {
	AddConversationModal,
	ADD_CONVERSATION_TAB,
} from "@/features/chat/components/AddConversationModal";
import ChatItem from "@/features/chat/components/ChatItem";

export default function ChatList({
	myChats,
	selectedChat,
	onSelectChat,
	onChatCreated,
	hasMore = false,
	loadingMore = false,
	onLoadMore,
}) {
	const { t } = useTranslation("chat");
	const [addOpen, setAddOpen] = useState(false);
	const [addTab, setAddTab] = useState(ADD_CONVERSATION_TAB.GROUP);
	const listRef = useRef(null);
	const sentinelRef = useRef(null);

	function closeAddModal() {
		setAddOpen(false);
		setAddTab(ADD_CONVERSATION_TAB.GROUP);
	}

	useEffect(() => {
		const root = listRef.current;
		const target = sentinelRef.current;
		if (!root || !target || !hasMore || !onLoadMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const hit = entries.some((e) => e.isIntersecting);
				if (hit && hasMore && !loadingMore) onLoadMore();
			},
			{ root, rootMargin: "120px", threshold: 0 },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [hasMore, loadingMore, onLoadMore, myChats.length]);

	return (
		<div className="ds-chat-list-shell">
			<header className="ds-chat-list-head">
				<h2 className="ds-chat-list-title">{t("list.title")}</h2>
			</header>

			<div className="ds-chat-list-search">
				<Input
					type="search"
					aria-label={t("list.searchAriaLabel")}
					icon={<Search className="size-4 text-muted-foreground" />}
					placeholder={t("list.searchPlaceholder")}
					className="ds-chat-search-field min-w-0 flex-1"
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label={t("list.add.openAriaLabel")}
					onClick={() => setAddOpen(true)}
				>
					<MessageCirclePlus className="size-5 text-muted-foreground sm:size-6" />
				</Button>
			</div>

			<AddConversationModal
				open={addOpen}
				onClose={closeAddModal}
				activeTab={addTab}
				onTabChange={setAddTab}
				onChatCreated={onChatCreated}
			/>

			<Separator className="mt-6 shrink-0" />

			<div className="mt-4 flex min-h-0 flex-1 flex-col">
				<ul
					ref={listRef}
					className="ds-chat-list-scroll !mt-0 min-h-0 flex-1"
					role="list"
				>
					{myChats.map((chat) => (
						<li key={chat?.id}>
							<ChatItem
								chat={chat}
								isSelected={chat.id === selectedChat?.id}
								onClick={() => onSelectChat(chat)}
							/>
						</li>
					))}
					{loadingMore && (
						<li className="list-none">
							<div
								className="py-4 text-center text-muted-foreground"
								role="status"
								aria-live="polite"
							>
								{t("list.loadingMore")}
							</div>
						</li>
					)}
					{hasMore && (
						<li
							ref={sentinelRef}
							className="pointer-events-none h-2 shrink-0 list-none p-0"
							aria-hidden
						/>
					)}
				</ul>
			</div>
		</div>
	);
}
