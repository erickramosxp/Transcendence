import { useCallback, useEffect, useRef, useState } from "react";

export const MESSAGE_REPLY_LONG_PRESS_MS = 520;
export const MESSAGE_REPLY_LONG_PRESS_MOVE_CANCEL_PX = 14;
const TOUCH_PRIMARY_MQ = "(hover: none), (pointer: coarse)";

export function useTouchPrimary() {
	const [touchPrimary, setTouchPrimary] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia(TOUCH_PRIMARY_MQ).matches;
	});

	useEffect(() => {
		const mq = window.matchMedia(TOUCH_PRIMARY_MQ);
		const sync = () => setTouchPrimary(mq.matches);
		sync();
		mq.addEventListener("change", sync);
		return () => mq.removeEventListener("change", sync);
	}, []);

	return touchPrimary;
}

export function useMessageReplyLongPress({ canReply, onReveal }) {
	const touchPrimary = useTouchPrimary();
	const longPressTimerRef = useRef(null);
	const longPressOriginRef = useRef(null);

	const clearLongPressTimer = useCallback(() => {
		if (longPressTimerRef.current != null) {
			clearTimeout(longPressTimerRef.current);
			longPressTimerRef.current = null;
		}
		longPressOriginRef.current = null;
	}, []);

	const fireReveal = useCallback(() => {
		if (!canReply) return;
		if (typeof navigator !== "undefined" && navigator.vibrate) {
			navigator.vibrate(10);
		}
		onReveal?.();
	}, [canReply, onReveal]);

	useEffect(() => () => clearLongPressTimer(), [clearLongPressTimer]);

	const onTouchStart = useCallback(
		(e) => {
			if (!touchPrimary || !canReply) return;
			const t0 = e.touches[0];
			longPressOriginRef.current = { x: t0.clientX, y: t0.clientY };
			clearLongPressTimer();
			longPressTimerRef.current = setTimeout(() => {
				longPressTimerRef.current = null;
				longPressOriginRef.current = null;
				fireReveal();
			}, MESSAGE_REPLY_LONG_PRESS_MS);
		},
		[touchPrimary, canReply, clearLongPressTimer, fireReveal],
	);

	const onTouchMove = useCallback(
		(e) => {
			if (!longPressOriginRef.current || !touchPrimary || !canReply) return;
			const t0 = e.touches[0];
			const ox = longPressOriginRef.current.x;
			const oy = longPressOriginRef.current.y;
			if (
				Math.abs(t0.clientX - ox) > MESSAGE_REPLY_LONG_PRESS_MOVE_CANCEL_PX ||
				Math.abs(t0.clientY - oy) > MESSAGE_REPLY_LONG_PRESS_MOVE_CANCEL_PX
			) {
				clearLongPressTimer();
			}
		},
		[touchPrimary, canReply, clearLongPressTimer],
	);

	return {
		touchPrimary,
		longPressBubbleHandlers: {
			onTouchStart,
			onTouchMove,
			onTouchEnd: clearLongPressTimer,
			onTouchCancel: clearLongPressTimer,
		},
	};
}
