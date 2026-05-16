import { create } from "zustand";
import { toast } from "react-toastify";
import i18n from "@/i18n";
import {
	listNotifications as fetchNotificationsPage,
	getUnreadCount,
	markRead,
	markAllRead,
	DEFAULT_NOTIFICATION_PAGE_SIZE,
} from "../service/notificationService";

export const NOTIFICATION_ERROR_CODES = {
	LOAD: "load",
};

function mergeUniqueById(existing, incoming) {
	const seen = new Set(existing.map((n) => n?.id).filter((id) => id != null));
	const extra = incoming.filter((n) => {
		if (n?.id == null) return false;
		if (seen.has(n.id)) return false;
		seen.add(n.id);
		return true;
	});
	return [...existing, ...extra];
}

export const useNotificationStore = create((set, get) => ({
	notifications: ([]),
	page: 0,
	pageSize: DEFAULT_NOTIFICATION_PAGE_SIZE,
	hasMore: false,
	unreadCount: 0,
	loading: false,
	errorCode: null,
	markingAllRead: false,
	markingReadId: null,

	loadNotificationsPage: async (
		page = 0,
		size = get().pageSize ?? DEFAULT_NOTIFICATION_PAGE_SIZE,
		{ append = false } = {},
	) => {
		set({ loading: true, errorCode: null });
		try {
			const data = await fetchNotificationsPage(page, size);
			const items = Array.isArray(data?.items) ? data.items : [];
			set((state) => ({
				notifications: append ? mergeUniqueById(state.notifications, items) : items,
				page: data?.page ?? page,
				pageSize: size,
				hasMore: Boolean(data?.hasMore),
				loading: false,
			}));
			await get().refreshUnreadCount();
		} catch {
			set({
				loading: false,
				errorCode: NOTIFICATION_ERROR_CODES.LOAD,
			});
		}
	},

	loadMoreNotifications: async () => {
		const { hasMore, loading, page, pageSize } = get();
		if (!hasMore || loading) return;
		await get().loadNotificationsPage(page + 1, pageSize, { append: true });
	},

	refreshUnreadCount: async () => {
		try {
			const { count } = await getUnreadCount();
			set({ unreadCount: typeof count === "number" ? count : 0 });
		} catch {
			/* mantém último unreadCount válido */
		}
	},

	prependIncomingNotification: async (notification) => {
		if (notification?.id == null) return;

		const { notifications } = get();
		if (notifications.some((n) => n?.id === notification.id)) return;

		set({ notifications: [notification, ...notifications] });
		await get().refreshUnreadCount();
	},

	markOneRead: async (id) => {
		const { markingAllRead, markingReadId } = get();
		if (markingAllRead || markingReadId != null) return false;

		const snapList = [...get().notifications];
		const snapUnread = get().unreadCount;
		const target = snapList.find((n) => n?.id === id);
		if (!target) return false;
		if (target.isRead) return true;

		const wasUnread = target.isRead === false;

		const list = snapList.map((n) =>
			n?.id === id ? { ...n, isRead: true } : n,
		);

		set({
			markingReadId: id,
			notifications: list,
			unreadCount: wasUnread ? Math.max(0, snapUnread - 1) : snapUnread,
		});

		try {
			await markRead(id);
			await get().refreshUnreadCount();
			return true;
		} catch {
			set({ notifications: snapList, unreadCount: snapUnread });
			toast.error(i18n.t("notifications:errors.markRead"));
			return false;
		} finally {
			set({ markingReadId: null });
		}
	},

	markEverythingRead: async () => {
		const { markingAllRead, markingReadId, unreadCount } = get();
		if (markingAllRead || markingReadId != null || unreadCount === 0) return;

		const snapList = [...get().notifications];
		const snapUnread = get().unreadCount;

		set({
			markingAllRead: true,
			notifications: snapList.map((n) => ({ ...n, isRead: true })),
			unreadCount: 0,
		});

		try {
			await markAllRead();
			await get().refreshUnreadCount();
		} catch {
			set({ notifications: snapList, unreadCount: snapUnread });
			toast.error(i18n.t("notifications:errors.markAllRead"));
		} finally {
			set({ markingAllRead: false });
		}
	},

	clearError: () => set({ errorCode: null }),
}));
