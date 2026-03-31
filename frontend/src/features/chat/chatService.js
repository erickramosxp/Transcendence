

const mockChats = {
	1: [
	  {
		id: "m-101-a",
		conversationId: 1,
		text: "Oi, tudo bem?",
		senderId: 2,
		createdAt: "2026-03-28T10:00:00.000Z",
	  },
	  {
		id: "m-101-b",
		conversationId: 1,
		text: "Quais são as novidades?",
		senderId: 1,
		createdAt: "2026-03-28T10:01:00.000Z",
	  },
	],
	2: [
	  {
		id: "m-102-a",
		conversationId: 2,
		text: "What are you doing?",
		senderId: 2,
		createdAt: "2026-03-29T08:00:00.000Z",
	  },
	],
  };


function delay (ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

//Simulação do GET mensagem
export async function getMessages(conversationId, {limit = 50, before } = {}) {
	await delay(300);

	let list = [...(mockChats[conversationId] || [])].sort(
		(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
	);
	if (before) {
		const cut = new Date(before);
		list = list.filter((m) => new Date(m.createdAt) < cut);
	}

	const page = list.slice(-limit);
	const oldest = page[0];
	const allOlder = oldest && (mockChats[conversationId] || []).some(
		(m) => new Date(m.createdAt) < new Date(oldest.createdAt)
	);

	const nextCursor = allOlder && page.length === limit ? oldest.createdAt : null;

	return { messages: page, nextCursor };
}

//Simulação do POST Mensagem
export async function sendMessages(conversationId, text, senderId) {

	await delay(200);

	const newMessage = {
		id: `mock-${Date.now()}`,
		conversationId,
		text,
		senderId,
		createdAt: new Date().toISOString(),
	}

	if (!mockChats[conversationId]) mockChats[conversationId] = [];

	mockChats[conversationId].push(newMessage);

	return newMessage;
}


//Converte o formato API para o usado no front <Message/>

export function mapApiMessageToUi(apiMsg, currentUserId, peerName) {
	const isMe = String(apiMsg.senderId) === String(currentUserId);

	return {
		id: apiMsg.id,
		text: apiMsg.text,
		senderId: apiMsg.senderId,
		sender: isMe ? "me" : peerName,
		timestamp: apiMsg.createdAt,
	}
}
