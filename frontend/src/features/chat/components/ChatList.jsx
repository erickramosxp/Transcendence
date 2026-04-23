import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCirclePlus, Search } from "lucide-react";

import { Button, Input, Separator } from "@/design-system";
import {
	AddConversationModal,
	ADD_CONVERSATION_TAB,
} from "@/features/chat/components/modals/AddConversationModal";
import ChatItem from "@/features/chat/components/ChatItem";

function normalizeForSearch(value) {
	return String(value ?? "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.trim();
}

function chatMatchesQuery(chat, needleNorm) {
	if (!needleNorm) return true;
	const isDirect = chat.type === "direct";
	const peer = chat.user;
	const haystackParts = [];

	if (isDirect && peer) {
		const name = (peer.name ?? "").trim();
		const username = (peer.username ?? "").trim();
		if (name) haystackParts.push(name);
		if (username) {
			haystackParts.push(username);
			haystackParts.push(`@${username}`);
		}
	} else {
		const groupTitle = (chat.chatName ?? "").trim();
		if (groupTitle) haystackParts.push(groupTitle);
	}

	const preview = (chat.lastMessage?.text ?? "").trim();
	if (preview) haystackParts.push(preview);

	const haystack = normalizeForSearch(haystackParts.join("\n"));
	return haystack.includes(needleNorm);
}

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
	const [addTab, setAddTab] = useState(ADD_CONVERSATION_TAB.DM);
	const [listSearch, setListSearch] = useState("");
	const listRef = useRef(null);
	const sentinelRef = useRef(null);

	const searchActive = listSearch.trim().length > 0;
	const needleNorm = useMemo(
		() => normalizeForSearch(listSearch),
		[listSearch],
	);

	const filteredChats = useMemo(() => {
		if (!needleNorm) return myChats;
		return myChats.filter((c) => chatMatchesQuery(c, needleNorm));
	}, [myChats, needleNorm]);

	const allowLoadMore = hasMore && !searchActive;

	function closeAddModal() {
		setAddOpen(false);
		setAddTab(ADD_CONVERSATION_TAB.GROUP);
	}

	useEffect(() => {
		const root = listRef.current;
		const target = sentinelRef.current;
		if (!root || !target || !allowLoadMore || !onLoadMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const hit = entries.some((e) => e.isIntersecting);
				if (hit && allowLoadMore && !loadingMore) onLoadMore();
			},
			{ root, rootMargin: "120px", threshold: 0 },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [allowLoadMore, loadingMore, onLoadMore, myChats.length]);

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
					value={listSearch}
					onChange={(e) => setListSearch(e.target.value)}
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
					{filteredChats.map((chat) => (
						<li key={chat?.id}>
							<ChatItem
								chat={chat}
								isSelected={chat.id === selectedChat?.id}
								onClick={() => onSelectChat(chat)}
							/>
						</li>
					))}
					{searchActive && filteredChats.length === 0 && (
						<li className="list-none">
							<p className="px-2 py-6 text-center text-sm text-muted-foreground">
								{t("list.noResults")}
							</p>
						</li>
					)}
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
					{allowLoadMore && (
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
