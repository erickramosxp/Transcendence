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
        <div className="ds-chat-layout">
            <aside
                className={cn(
                    "ds-chat-sidebar",
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
                    "ds-chat-main",
                    !selectedChat && "hidden md:flex",
                )}
            >
                <ChatWindow currentChat={selectedChat} onBack={() => setSelectedChat(null)} />
            </main>
        </div>
    );
}
