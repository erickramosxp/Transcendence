import api from "@/shared/api/httpClient";

const baseRoute = "/notifications";

export const DEFAULT_NOTIFICATION_PAGE_SIZE = 20;

export async function listNotifications(
	page = 0,
	size = DEFAULT_NOTIFICATION_PAGE_SIZE,
	{ unreadOnly = false } = {},
) {
	const { data } = await api.get(baseRoute, {
		params: { page, size, unreadOnly },
	});
	return data;
}

export async function getUnreadCount() {
	const { data } = await api.get(`${baseRoute}/unread-count`);
	return data;
}

export async function markRead(id) {
	await api.patch(`${baseRoute}/${id}/read`);
}

export async function markAllRead() {
	await api.patch(`${baseRoute}/read-all`);
}
