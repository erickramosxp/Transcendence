import ChatItem from "@/features/chat/components/ChatItem";
import { Separator, Input } from "@/design-system";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ChatList({ friendsChat, selectedId, onSelectChat }) {
    const { t } = useTranslation("chat");

    return (
        <div className="ds-chat-list-shell">
            <header className="ds-chat-list-head">
                <h2 className="ds-chat-list-title">{t("list.title")}</h2>
            </header>
            <div className="ds-chat-list-search">
                <Input
                    type="search"
                    icon={<Search className="size-4 text-muted-foreground" />}
                    placeholder={t("list.searchPlaceholder")}
                    className="ds-chat-search-field"
                />
            </div>
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
