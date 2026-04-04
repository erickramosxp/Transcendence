import { useState } from "react";
import ChatWindow from "@/features/chat/components/ChatWindow";
import ChatList from "@/features/chat/components/ChatList";
import { cn } from "@/design-system/tokens/colors";

export function Chat() {
    const [selectedChat, setSelectedChat] = useState(null);

    const friendsChat = [
        {id: 1, name: "Maria da Silva", lastMessage: "Quais são as novidades?", lastMessageTime: "12:00"},
        {id:2, name: "João Castro", lastMessage: "What are you doing?", lastMessageTime: "13:00"}
    ]

    return (
        <div
            className={cn(
                "flex h-full min-h-0 w-full flex-col overflow-hidden bg-background",
                "md:flex-row",
            )}
        >
            <aside
                className={cn(
                    "flex min-h-0 w-full flex-col border-border bg-card md:w-[min(100%,20rem)] md:max-w-[380px] md:shrink-0 md:border-r",
                    selectedChat && "hidden md:flex",
                )}
            >
                <ChatList
                    friendsChat={friendsChat}
                    selectedId={selectedChat?.id ?? null}
                    onSelectChat={setSelectedChat}
                />
            </aside>
            <main
                className={cn(
                    "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                    !selectedChat && "hidden md:flex",
                )}
            >
                <ChatWindow currentChat={selectedChat} onBack={() => setSelectedChat(null)} />
            </main>
        </div>
    );
}
