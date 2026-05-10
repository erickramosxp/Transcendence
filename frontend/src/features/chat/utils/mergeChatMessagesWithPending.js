export function mergeChatMessagesWithPending(
	serverMessages,
	previousMessages,
	chatId,
	currentUserId,
) {
	const me = String(currentUserId);
	const pendings = previousMessages.filter(
		(m) =>
			m.clientMessageId &&
			(m.deliveryStatus === "sending" || m.deliveryStatus === "failed") &&
			Number(m.chatId) === Number(chatId),
	);

	const serverTextsFromMe = new Set(
		serverMessages
			.filter((s) => String(s.senderId) === me)
			.map((s) => String(s.text ?? "").trim()),
	);

	const keepPendings = pendings.filter((p) => {
		const t = String(p.text ?? "").trim();
		if (p.deliveryStatus === "failed") return true;
		return !serverTextsFromMe.has(t);
	});

	const combined = [...serverMessages, ...keepPendings];
	combined.sort((a, b) => {
		const ta = new Date(a.timestamp ?? 0).getTime();
		const tb = new Date(b.timestamp ?? 0).getTime();
		return ta - tb;
	});
	return combined;
}
