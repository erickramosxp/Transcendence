export function sameChatMessageId(a, b) {
	if (a == null || b == null) return false;
	return Number(a) === Number(b);
}

export function snippetReplyText(text, maxLen = 100) {
	const t = String(text ?? "").trim();
	if (!t) return "";
	return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

export function replyQuoteFromMessageRow(msg) {
	if (!msg || msg.id == null) return null;
	const text = snippetReplyText(msg.text);
	const name = (msg.senderDisplayName ?? msg.sender ?? "").trim() || null;
	return {
		id: msg.id,
		text: text || null,
		senderDisplayName: name,
	};
}

export function resolveReplyQuoteForDisplay(messages, message) {
	const replyToId = message?.replyToId ?? null;
	if (replyToId == null) return null;

	const saved = message?.replyQuote;
	if (saved && sameChatMessageId(saved.id, replyToId)) return saved;

	const parent = messages.find((m) => sameChatMessageId(m.id, replyToId));
	if (parent) return replyQuoteFromMessageRow(parent);

	return {
		id: replyToId,
		text: null,
		senderDisplayName: null,
		unavailable: true,
	};
}
