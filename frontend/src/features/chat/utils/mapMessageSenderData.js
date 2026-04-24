export function mapMessageSenderData(apiMsg, currentUserId, peerFallback) {
	const sid = apiMsg.senderId ?? apiMsg.sender_id;
	const isMe = String(sid) === String(currentUserId);
	const fromProfile =
		apiMsg.user?.name?.trim() ||
		(apiMsg.user?.username ? `@${apiMsg.user.username}` : null);
	const senderDisplayName = fromProfile ?? (!isMe ? peerFallback : null);

	return {
		id: apiMsg.id,
		text: apiMsg.text,
		senderId: sid,
		sender: isMe ? "me" : (senderDisplayName ?? peerFallback),
		senderDisplayName,
		timestamp: apiMsg.createdAt,
	};
}
