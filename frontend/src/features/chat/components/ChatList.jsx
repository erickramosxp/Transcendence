import ChatItem from "@/features/chat/components/ChatItem";
import { Separator, Input } from "@/design-system";
import { Search } from "lucide-react";

import { cn } from "@/design-system/tokens/colors";

export default function ChatList({ friendsChat, selectedId, onSelectChat }) {
    return (
        <div
            className={cn(
                "flex h-full min-h-0 flex-col px-4 pb-4 pt-6 sm:px-5",
            )}
        >
            <header className="shrink-0 space-y-1">
                <h2
                    className={cn(
                        "text-xl font-bold leading-tight tracking-tight sm:text-[1.375rem]",
                        "bg-gradient-title bg-clip-text text-transparent",
                    )}
                >
                    Mensagens
                </h2>
            </header>
            <div className="mt-5 shrink-0">
                <Input
                    type="search"
                    icon={<Search className="size-4 text-muted-foreground" />}
                    placeholder="Buscar conversas..."
                    className="h-10 rounded-xl bg-input-background text-sm sm:h-11"
                    aria-label="Buscar conversas"
                />
            </div>
            <Separator className="mt-6 shrink-0" />
            <ul
                className="mt-4 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:thin]"
                role="list"
            >
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
