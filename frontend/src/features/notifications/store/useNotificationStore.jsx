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

export const NOTIFICATION_FILTER = {
	ALL: "all",
	UNREAD: "unread",
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
	filter: NOTIFICATION_FILTER.ALL,
	unreadCount: 0,
	loading: false,
	loadingMore: false,
	errorCode: null,
	markingAllRead: false,
	markingReadId: null,

	setFilter: (filter) => {
		const next =
			filter === NOTIFICATION_FILTER.UNREAD
				? NOTIFICATION_FILTER.UNREAD
				: NOTIFICATION_FILTER.ALL;
		if (get().filter === next) return;
		set({
			filter: next,
			notifications: [],
			page: 0,
			hasMore: false,
			errorCode: null,
		});
		void get().loadNotificationsPage(0);
	},

	loadNotificationsPage: async (
		page = 0,
		size = get().pageSize ?? DEFAULT_NOTIFICATION_PAGE_SIZE,
		{ append = false } = {},
	) => {
		const unreadOnly = get().filter === NOTIFICATION_FILTER.UNREAD;
		set({
			loading: !append,
			loadingMore: append,
			errorCode: null,
		});
		try {
			const data = await fetchNotificationsPage(page, size, { unreadOnly });
			const items = Array.isArray(data?.items) ? data.items : [];
			set((state) => ({
				notifications: append ? mergeUniqueById(state.notifications, items) : items,
				page: data?.page ?? page,
				pageSize: size,
				hasMore: Boolean(data?.hasMore),
				loading: false,
				loadingMore: false,
			}));
			await get().refreshUnreadCount();
		} catch {
			set({
				loading: false,
				loadingMore: false,
				errorCode: NOTIFICATION_ERROR_CODES.LOAD,
			});
		}
	},

	loadMoreNotifications: async () => {
		const { hasMore, loading, loadingMore, page, pageSize } = get();
		if (!hasMore || loading || loadingMore) return;
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
		if (notification.isRead === true) return;

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
		const unreadOnly = get().filter === NOTIFICATION_FILTER.UNREAD;

		const list = unreadOnly
			? snapList.filter((n) => n?.id !== id)
			: snapList.map((n) => (n?.id === id ? { ...n, isRead: true } : n));

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
		const unreadOnly = get().filter === NOTIFICATION_FILTER.UNREAD;

		set({
			markingAllRead: true,
			notifications: unreadOnly
				? []
				: snapList.map((n) => ({ ...n, isRead: true })),
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
