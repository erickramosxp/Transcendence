import { useState } from "react";
import Message from "@/features/chat/components/Message";
import MessageInput from "@/features/chat/components/MessageInput";

export default function ChatWindow({currentChat}) {
	const [message, setMessage] = useState([]);

	
	function handleSendMessage(text) {
		const newMessage = {
			id: Date.now(),
			text,
			sender: "me",
			timestamp: new Date().toISOString()

		};
		setMessage((prev) => [...prev, newMessage]);
	}

	if (!currentChat) {
		return (
			<div>
				<h3>Suas Mensagens</h3>
				<p>Selecione uma conversa para começar a enviar mensagens</p>
			</div>
		)
	}

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
			<div>
				<h3>{currentChat.name}</h3>
			</div>

			<div style={{ flex: 1 }}>
				{message.map((msg) => (
					<Message key={msg.id} message={msg} />
				))}
			</div>
			<div>
				<MessageInput onSendMessage={handleSendMessage}/>
			</div>
		</div>
	);
}
