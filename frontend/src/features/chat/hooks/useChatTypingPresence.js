import { useCallback, useEffect, useRef } from "react";
import { useSocketStore } from "@/shared/realtime/store/useSocketStore";
import { WS_SEND_EVENTS } from "@/shared/constants/websocket";

const TYPING_IDLE_MS = 2000;
const TYPING_HEARTBEAT_MS = 2500;

export function useChatTypingPresence(chatId) {
	const send = useSocketStore((s) => s.send);
	const canType = chatId != null;

	const typingHeartbeatRef = useRef(null);
	const typingIdleTimeoutRef = useRef(null);
	const isTypingSessionRef = useRef(false);

	const sendTypingStart = useCallback(() => {
		if (!canType) return;
		send(WS_SEND_EVENTS.TYPING_START, { chatId });
	}, [canType, send, chatId]);

	const sendTypingStop = useCallback(() => {
		if (!canType) return;
		send(WS_SEND_EVENTS.TYPING_STOP, { chatId });
	}, [canType, send, chatId]);

	const clearTypingHeartbeat = useCallback(() => {
		if (typingHeartbeatRef.current != null) {
			clearInterval(typingHeartbeatRef.current);
			typingHeartbeatRef.current = null;
		}
	}, []);

	const clearTypingIdleTimeout = useCallback(() => {
		if (typingIdleTimeoutRef.current != null) {
			clearTimeout(typingIdleTimeoutRef.current);
			typingIdleTimeoutRef.current = null;
		}
	}, []);

	const stopTypingSession = useCallback(() => {
		clearTypingHeartbeat();
		clearTypingIdleTimeout();
		if (isTypingSessionRef.current) {
			sendTypingStop();
			isTypingSessionRef.current = false;
		}
	}, [clearTypingHeartbeat, clearTypingIdleTimeout, sendTypingStop]);

	const scheduleTypingIdleStop = useCallback(() => {
		clearTypingIdleTimeout();
		typingIdleTimeoutRef.current = setTimeout(() => {
			typingIdleTimeoutRef.current = null;
			stopTypingSession();
		}, TYPING_IDLE_MS);
	}, [clearTypingIdleTimeout, stopTypingSession]);

	const startOrContinueTypingSession = useCallback(() => {
		if (!canType) return;

		if (!isTypingSessionRef.current) {
			sendTypingStart();
			isTypingSessionRef.current = true;
		}

		clearTypingHeartbeat();
		typingHeartbeatRef.current = setInterval(() => {
			sendTypingStart();
		}, TYPING_HEARTBEAT_MS);
	}, [canType, clearTypingHeartbeat, sendTypingStart]);

	const notifyDraftChanged = useCallback(
		(next) => {
			const trimmed = (next ?? "").trim();

			if (trimmed.length === 0) {
				stopTypingSession();
				return;
			}
			startOrContinueTypingSession();
			scheduleTypingIdleStop();
		},
		[
			startOrContinueTypingSession,
			scheduleTypingIdleStop,
			stopTypingSession,
		],
	);

	useEffect(() => {
		return () => {
			stopTypingSession();
		};
	}, [chatId, stopTypingSession]);

	return {
		notifyDraftChanged,
		stopTypingSession,
	};
}
