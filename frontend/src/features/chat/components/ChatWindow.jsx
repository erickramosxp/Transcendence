import { useEffect, useState, useRef, useCallback } from "react";
import Message from "@/features/chat/components/Message";
import MessageInput from "@/features/chat/components/MessageInput";
import { getMessages, sendMessages, mapApiMessageToUi } from "@/features/chat/chatService";

function readCurrentUserId() {
	try {
		const raw = localStorage.getItem('@trascendence:user');
		if (!raw) return 1;
		const u = JSON.parse(raw);
		return u?.id ?? 1;
	} catch {
			return 1;
	}
}

export default function ChatWindow({ currentChat }) {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [nextCursor, setNextCursor] = useState(null);
	const [loadingOlder, setLoadingOlder] = useState(false);
	const listRef = useRef(null);

	const currentUserId = readCurrentUserId();
	const peerName = currentChat?.name ?? "Contato";

	useEffect(() => {

		if (!currentChat){
			setMessages([]);
			setNextCursor(null);
			setError(null);
			return ;
		}

		const convId = currentChat.id;
		let cancelled = false;

		(async () => {
			setLoading(true);
			setError(null);
			setNextCursor(null);
			try {
				const data = await getMessages(convId, { limit: 50 });
				if (cancelled) return;
				const ui = data.messages.map((m) =>
				mapApiMessageToUi(m, currentUserId, peerName),
				);
				setMessages(ui);
				setNextCursor(data.nextCursor ?? null);
			} catch (e) {
				if (!cancelled) setError(e?.message ?? "Erro ao carregar");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	},[currentChat?.id, currentUserId, peerName]);

	const loadOlder = useCallback(async () =>{
		if (!currentChat || !nextCursor || loadingOlder) return;

		const el = listRef.current;
		const prevH = el?.scrollHeight ?? 0;

		setLoadingOlder(true);
		try {
			const data = await getMessages(currentChat.id, {
				limit: 50,
				before: nextCursor,
			});
			const ui = data.messages.map((m) =>
				mapApiMessageToUi(m, currentUserId, peerName),
		);
		setMessages((prev) => [...ui, ...prev]);
		setNextCursor(data.nextCursor ?? null);
		requestAnimationFrame(() => {
			if (el) el.scrollTop = el.scrollHeight - prevH;
		});
		} finally {
			setLoadingOlder(false);
		}

	}, [currentChat, nextCursor, loadingOlder, currentUserId, peerName]);

	function onScroll(e) {
		if (e.target.scrollTop < 80) loadOlder();
	}

	async function handleSendMessage(text) {
		if (!currentChat) return;
		try {
			const created = await sendMessages(currentChat.id, text, currentUserId);
			const ui = mapApiMessageToUi(created, currentUserId, peerName);
			setMessages((prev) => [...prev, ui]);
			requestAnimationFrame(() => {
				if (listRef.current)
					listRef.current.scrollTop = listRef.current.scrollHeight;
			});
		} catch (e) {
			setError(e?.message ?? "Erro ao enviar mensagem");
		}
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
			{error && <p style={{ color: "crimson" }}>{error}</p>}
			{loading && <p>Carregando...</p>}
			<div
				ref={listRef}
				onScroll={onScroll}
				style={{ flex: 1, overflowY: "auto", marginBottom: 8 }}
			>
			{loadingOlder && <p style={{ textAlign: "center" }}>Carregando mais mensagens...</p>}
			{ messages.length > 0 ? (
					messages.map((msg) => (
						<Message key={msg.id}message={msg} />
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
