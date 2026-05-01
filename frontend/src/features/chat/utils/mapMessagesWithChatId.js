export function withChatId(messages, chatId) {
	return messages.map((m) => ({ ...m, chatId }));
}
