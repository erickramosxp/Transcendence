
import { useEffect, useState } from "react";
import Message from "@/features/chat/components/Message";
import MessageInput from "@/features/chat/components/MessageInput";

export default function ChatWindow({ friendsChat, currentChat }) {
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		if (currentChat) {
			const chat = friendsChat.find((c) => c.id === currentChat.id);
			setMessages(chat && Array.isArray(chat.messages) ? chat.messages : []);
		} else {
			setMessages([]);
		}
	}, [currentChat, friendsChat]);

	function handleSendMessage(text) {
		const newMessage = {
			id: Date.now(),
			text,
			sender: "me",
			timestamp: new Date().toISOString()
		};
		setMessages((prev) => [...prev, newMessage]);
	}

	if (!currentChat) {
		return (
			<div>
				<h3>Suas Mensagens</h3>
				<p>Selecione uma conversa para começar a enviar mensagens</p>
			</div>
		);
	}

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
			<div>
				<h3>{currentChat.name}</h3>
			</div>

			<div style={{ flex: 1, overflowY: "auto", marginBottom: 8 }}>
				{messages && messages.length > 0 ? (
					messages.map((msg) => (
						<Message key={msg.id ?? `${msg.sender}-${msg.timestamp}`} message={msg} />
					))
				) : (
					<p style={{ color: "#888", textAlign: "center", marginTop: 32 }}>
						Nenhuma mensagem nesta conversa ainda.
					</p>
				)}
			</div>
			<div>
				<MessageInput onSendMessage={handleSendMessage} />
			</div>
		</div>
	);
}
