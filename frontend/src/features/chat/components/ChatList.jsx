import { useState } from "react";
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
	hasMore = false,
	loadingMore = false,
	onLoadMore,
}) {
	const { t } = useTranslation("chat");
	const [addOpen, setAddOpen] = useState(false);
	const [addTab, setAddTab] = useState(ADD_CONVERSATION_TAB.GROUP);

	function closeAddModal() {
		setAddOpen(false);
		setAddTab(ADD_CONVERSATION_TAB.GROUP);
	}

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
			/>

			<Separator className="mt-6 shrink-0" />

			<ul className="ds-chat-list-scroll" role="list">
				{myChats.map((chat) => (
					<li key={chat?.id}>
						<ChatItem
							chat={chat}
							isSelected={chat.id === selectedChat?.id}
							onClick={() => onSelectChat(chat)}
						/>
					</li>
				))}
			</ul>

			{(hasMore || loadingMore) && (
				<div className="mt-2 shrink-0 px-1 pb-2">
					<Button
						type="button"
						variant="ghost"
						className="h-9 w-full text-muted-foreground"
						disabled={loadingMore || !hasMore}
						aria-busy={loadingMore}
						aria-label={
							loadingMore ? t("loading.messages") : t("list.loadMore")
						}
						onClick={() => onLoadMore?.()}
					>
						{loadingMore ? t("loading.messages") : t("list.loadMore")}
					</Button>
				</div>
			)}
		</div>
	);
}
