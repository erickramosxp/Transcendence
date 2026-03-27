import { useState } from "react";
import ChatWindow from "@/features/chat/components/ChatWindow";
import ChatList from "@/features/chat/components/ChatList";

export function Chat() {
    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <ChatList />

            <ChatWindow />
        </div>
    )
}
