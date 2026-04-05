import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCirclePlus, Search } from "lucide-react";

import { Button, Input, Separator } from "@/design-system";
import {
	AddConversationModal,
	ADD_CONVERSATION_TAB,
} from "@/features/chat/components/AddConversationModal";
import ChatItem from "@/features/chat/components/ChatItem";

export default function ChatList({ friendsChat, selectedId, onSelectChat }) {
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
				{friendsChat.map((friend) => (
					<li key={friend.id}>
						<ChatItem
							chat={friend}
							isSelected={friend.id === selectedId}
							onClick={() => onSelectChat(friend)}
						/>
					</li>
				))}
			</ul>
		</div>
	);
}
