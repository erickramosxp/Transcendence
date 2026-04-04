import { AvatarWithStatus } from "@/design-system";
import { cn } from "@/design-system/tokens/colors";

export default function ChatItem({ chat, isSelected, onClick }) {
    const unread = chat.unreadCount > 0 ? chat.unreadCount : null;

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
                src={chat.avatar}
                name={chat.name}
                status={chat.status ?? "online"}
                size="sm"
                className="shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="ds-chat-list-peer">{chat.name}</span>
                    <span className="ds-chat-list-time">{chat.lastMessageTime}</span>
                </div>
                {chat.lastMessage && (
                    <p className="ds-chat-list-preview">{chat.lastMessage}</p>
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
