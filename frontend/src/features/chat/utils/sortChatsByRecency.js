function chatRecencyMillis(chat) {
	const lm = chat?.lastMessage;
	const raw =
		lm?.createdAt ??
		lm?.updatedAt ??
		chat?.updatedAt ??
		chat?.createdAt;
	if (raw == null) return 0;
	const n = new Date(raw).getTime();
	return Number.isFinite(n) ? n : 0;
}

export function sortChatsByRecency(chats) {
	return [...chats].sort(
		(a, b) => chatRecencyMillis(b) - chatRecencyMillis(a),
	);
}
