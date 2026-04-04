import { AvatarWithStatus } from "@/design-system";
import { cn } from "@/design-system/tokens/colors";

export default function ChatItem({ chat, isSelected, onClick }) {
    const unread = chat.unreadCount > 0 ? chat.unreadCount : null;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-3.5 rounded-lg border border-transparent px-3 py-3 text-left",
                "transition-[background-color] duration-150 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                isSelected
                    ? "bg-chat-list-item-selected hover:bg-chat-list-item-selected"
                    : "bg-transparent hover:bg-chat-list-item-hover",
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
                    <span
                        className={cn(
                            "min-w-0 truncate text-[0.9375rem] font-bold leading-tight",
                            "text-[var(--yale-blue-900)] dark:text-foreground",
                        )}
                    >
                        {chat.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-medium tabular-nums leading-none text-muted-foreground">
                        {chat.lastMessageTime}
                    </span>
                </div>
                {chat.lastMessage && (
                    <p className="truncate text-[0.8125rem] leading-snug text-muted-foreground">
                        {chat.lastMessage}
                    </p>
                )}
            </div>
            {unread != null && (
                <span
                    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-unread)] text-[10px] font-semibold text-primary-foreground"
                    aria-label={`${unread} não lidas`}
                >
                    {unread > 9 ? "9+" : unread}
                </span>
            )}
        </button>
    );
}
