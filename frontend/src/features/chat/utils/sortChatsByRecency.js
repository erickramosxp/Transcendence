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

function chatListFocusRank(chat) {
	return chat?.__chatListFocus === true ? 1 : 0;
}

export function applyChatListFocus(chats, focusChatId) {
	if (!Array.isArray(chats) || chats.length === 0 || focusChatId == null) {
		return Array.isArray(chats) ? chats : [];
	}

	const focusId = Number(focusChatId);
	return chats.map((chat) => {
		const isFocused =
			chat?.id != null && Number(chat.id) === focusId;
		if (!isFocused) return chat;
		return { ...chat, __chatListFocus: true };
	});
}

export function sortChatsByRecency(chats) {
	return [...chats].sort(
		(a, b) =>
			chatListFocusRank(b) - chatListFocusRank(a) ||
			chatRecencyMillis(b) - chatRecencyMillis(a),
	);
}
