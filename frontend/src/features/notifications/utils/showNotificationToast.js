import { createElement } from "react";
import { toast } from "react-toastify";
import { NotificationToast } from "../components/NotificationToast";

const TOAST_ID_PREFIX = "notification-";

export function normalizeNotificationPayload(raw) {
	if (!raw || typeof raw !== "object") return null;

	const notification =
		raw.id != null
			? raw
			: raw.notification?.id != null
				? raw.notification
				: null;

	if (notification?.id == null) return null;

	return notification;
}

export function showNotificationToast(rawNotification) {
	const notification = normalizeNotificationPayload(rawNotification);
	if (!notification) return;

	toast(
		({ closeToast }) =>
			createElement(NotificationToast, {
				notification,
				closeToast,
			}),
		{
			toastId: `${TOAST_ID_PREFIX}${notification.id}`,
			autoClose: 5000,
			hideProgressBar: true,
			closeButton: false,
			closeOnClick: false,
			draggable: true,
			className: "!p-0 !bg-transparent !shadow-none !min-h-0",
			bodyClassName: "!p-0 !m-0",
		},
	);
}
