import api from "@/shared/api/httpClient";

export const CHAT_LIST_PAGE_SIZE = 20;
export const MESSAGE_LIST_PAGE_SIZE = 20;
export const CHAT_PARTICIPANTS_PAGE_SIZE = 20;

export async function getMyChats({ page = 0, size = CHAT_LIST_PAGE_SIZE } = {}) {
	const response = await api.get(`/chats`, { params: { page, size } });
	return response.data;
}

export async function getConversation(conversationId, { page = 0, size = MESSAGE_LIST_PAGE_SIZE }) {
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

export async function getChatParticipants(
	chatId,
	{ page = 0, size = CHAT_PARTICIPANTS_PAGE_SIZE } = {},
) {
	const { data } = await api.get(`/chats/${chatId}/participants`, {
		params: { page, size },
	});
	return data;
}

export async function addChatParticipant(chatId, userId) {
	await api.post(`/chats/${chatId}/participants`, { userId });
}

export async function removeChatParticipant(chatId, userId) {
	await api.delete(`/chats/${chatId}/participants/${userId}`);
}
