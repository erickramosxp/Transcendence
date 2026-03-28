import { useState } from "react";
import ChatWindow from "@/features/chat/components/ChatWindow";
import ChatList from "@/features/chat/components/ChatList";

export function Chat() {

    const [selectedChat, setSelectedChat] = useState(null);

    const friendsChat = [
        {id: 1, name: "Maria da Silva", lastMessage: "Hello, how are you?", lastMessageTime: "12:00"},
        {id:2, name: "João Castro", lastMessage: "What are you doing?", lastMessageTime: "13:00"}
    ]

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <ChatList
                friendsChat={friendsChat}
                setSelectedChat={setSelectedChat}
            />
            <ChatWindow friendsChat={friendsChat} currentChat={selectedChat}/>
        </div>
    )
}
