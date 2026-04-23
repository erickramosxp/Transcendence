import { useTranslation } from "react-i18next";
import { AvatarWithStatus } from "@/design-system";
import { cn } from "@/design-system/tokens/colors";
import { useLanguage } from "@/hooks/useLanguage";
import { formatChatListTime } from "@/features/chat/utils/formatChatDates";

export default function ChatItem({ chat, isSelected, onClick }) {
	const { t } = useTranslation("chat");
	const { currentLanguage } = useLanguage();
	const unread = chat.unreadCount > 0 ? chat.unreadCount : null;
	const updatedAt = chat.lastMessage?.createdAt ?? chat.lastMessage?.created_at;
	const timeLabel = formatChatListTime(updatedAt, currentLanguage, {
		yesterday: t("day.yesterday"),
	});

	const isDirect = chat.type === "direct";
	const peer = chat.user;
	const groupTitle = (chat.chatName ?? "").trim();
	const directLabel =
		(peer?.name ?? "").trim() || (peer?.username ?? "").trim();
	const rowTitle = isDirect
		? directLabel || t("list.fallbackDm")
		: groupTitle || t("list.fallbackGroup");

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "ds-chat-list-item",
                isSelected && "ds-chat-list-item--selected",
            )}
        >
            <AvatarWithStatus
                src={isDirect ? (peer?.avatarUrl ?? peer?.avatarURL ?? null) : null}
                name={rowTitle}
                // status={chat.status ?? "online"}
                size="sm"
                className="shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="ds-chat-list-peer">{rowTitle}</span>
                    <span className="ds-chat-list-time">{timeLabel}</span>
                </div>
                {chat.lastMessage && (
                    <p className="ds-chat-list-preview">{chat.lastMessage.text}</p>
                )}
            </div>
            {unread != null && (
                <span className="ds-chat-unread-badge">
                    {unread > 9 ? "9+" : unread}
                </span>
            )}
        </button>
    );
}
