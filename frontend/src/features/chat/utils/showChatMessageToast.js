import { createElement } from "react";
import { toast } from "react-toastify";
import {
	ChatMessageToast,
	truncateChatToastPreview,
} from "@/features/chat/components/ChatMessageToast";
import { shouldSuppressChatMessageToast } from "@/features/chat/utils/shouldSuppressChatMessageToast";

const TOAST_ID_PREFIX = "chat-message-";
const TOAST_AUTO_CLOSE_MS = 5000;

/** @type {Map<number, Set<string>>} */
const seenMessageIdsByChat = new Map();

function toastIdFor(chatId) {
	return `${TOAST_ID_PREFIX}${chatId}`;
}

function clearChatToastSession(chatId) {
	seenMessageIdsByChat.delete(chatId);
}

function resolveSenderLabel(payload) {
	const user = payload?.user;
	return (
		user?.name?.trim() ||
		(user?.username ? `@${user.username}` : null) ||
		""
	);
}

function renderToastContent(state, closeToast) {
	return createElement(ChatMessageToast, {
		...state,
		closeToast,
	});
}

function toastOptions(chatId) {
	return {
		toastId: toastIdFor(chatId),
		autoClose: TOAST_AUTO_CLOSE_MS,
		hideProgressBar: true,
		closeButton: false,
		closeOnClick: false,
		draggable: true,
		className: "!p-0 !bg-transparent !shadow-none !min-h-0",
		bodyClassName: "!p-0 !m-0",
		onClose: () => {
			clearChatToastSession(chatId);
		},
	};
}

function buildToastState(payload, messageCount) {
	const senderName = resolveSenderLabel(payload);
	return {
		chatId: Number(payload.chatId),
		senderName: senderName || "User",
		preview: truncateChatToastPreview(payload.text),
		messageCount,
		avatarUrl: payload.user?.avatarUrl ?? null,
		username: payload.user?.username ?? null,
	};
}

function trackMessage(chatId, payload) {
	const messageId = payload?.id;
	if (messageId == null) return null;

	const toastId = toastIdFor(chatId);
	const toastActive = toast.isActive(toastId);

	if (!toastActive) {
		clearChatToastSession(chatId);
	}

	let seen = seenMessageIdsByChat.get(chatId);
	if (!seen) {
		seen = new Set();
		seenMessageIdsByChat.set(chatId, seen);
	}

	const idKey = String(messageId);
	if (seen.has(idKey)) return null;

	seen.add(idKey);
	return seen.size;
}

export function showChatMessageToast(payload) {
	if (shouldSuppressChatMessageToast(payload)) return;

	const chatId = Number(payload.chatId);
	const messageCount = trackMessage(chatId, payload);
	if (messageCount == null) return;

	const toastId = toastIdFor(chatId);
	const state = buildToastState(payload, messageCount);

	if (toast.isActive(toastId)) {
		toast.update(toastId, {
			render: ({ closeToast }) => renderToastContent(state, closeToast),
			autoClose: TOAST_AUTO_CLOSE_MS,
		});
		return;
	}

	toast(
		({ closeToast }) => renderToastContent(state, closeToast),
		toastOptions(chatId),
	);
}
