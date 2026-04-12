
import api from "@/shared/api/httpClient";

export async function getMyChats({ page = 0, size = 20 } = {}) {
	const response = await api.get(`/chats`, {
		params: { page, size },
	});
	return response.data;
}

export async function getConversation(conversationId, {page = 0, size = 20}) {
	const response = await api.get(`/chats/${conversationId}/messages`, {
		params: {
			page: page,
			size: size
		}
	});
	const messages = Array.isArray(response.data.items)
		? [...response.data.items].reverse()
		: [];
	const { items, ...rest } = response.data;
	return { ...rest, messages };
}

export async function sendMessages(conversationId, text, _senderId) {
	const { data } = await api.post(`/chats/${conversationId}/messages`, {
		text,
	});
	return data;
}

// Converte o formato API para o usado no front <Message/>
export function mapApiMessageToUi(apiMsg, currentUserId, peerFallback) {
	const sid = apiMsg.senderId ?? apiMsg.sender_id;
	const isMe = String(sid) === String(currentUserId);
	const user = apiMsg.user;
	const senderLabel =
		user?.name?.trim() ||
		(user?.username ? `@${user.username}` : null) ||
		peerFallback;

	const created =
		apiMsg.createdAt ?? apiMsg.created_at ?? apiMsg.sentAt ?? apiMsg.sent_at;
	return {
		id: apiMsg.id,
		text: apiMsg.text ?? apiMsg.content,
		senderId: sid,
		sender: isMe ? "me" : senderLabel,
		timestamp: created,
	};
}

export async function createDM(directUserId) {
	const { data } = await api.post(`/chats/direct`, {
		directUserId,
	});
	return data;
}

export async function createGroup(chatName, participantIds) {
	const { data } = await api.post(`/chats/group`, {
		chatName,
		participantIds,
	});
	return data;
}


