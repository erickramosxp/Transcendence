import { create } from "zustand";
import {
	listNotifications as fetchNotificationsPage,
	getUnreadCount,
	markRead,
	markAllRead,
	DEFAULT_NOTIFICATION_PAGE_SIZE,
} from "../service/notificationService";

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
	error: null,

	loadNotificationsPage: async (
		page = 0,
		size = get().pageSize ?? DEFAULT_NOTIFICATION_PAGE_SIZE,
		{ append = false } = {},
	) => {
		set({ loading: true, error: null });
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
		} catch (e) {
			const message =
				e?.response?.data?.message ?? e?.message ?? "Erro ao carregar notificações";
			set({ loading: false, error: typeof message === "string" ? message : "Erro" });
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

	/** Notificação vinda do WebSocket (`NOTIFICATION_RECEIVED`). Evita duplicar por `id`. */
	prependIncomingNotification: (notification) => {
		if (notification?.id == null) return;
		set((state) => {
			if (state.notifications.some((n) => n?.id === notification.id))
				return state;
			const wasUnread = notification.isRead === false;
			return {
				notifications: [notification, ...state.notifications],
				unreadCount: wasUnread ? state.unreadCount + 1 : state.unreadCount,
			};
		});
	},

	markOneRead: async (id) => {
		const snapList = [...get().notifications];
		const snapUnread = get().unreadCount;
		const list = snapList.map((n) =>
			n?.id === id ? { ...n, isRead: true } : n,
		);
		const unreadLocal = list.filter((n) => !n?.isRead).length;
		set({ notifications: list, unreadCount: unreadLocal });
		try {
			await markRead(id);
			await get().refreshUnreadCount();
		} catch {
			set({ notifications: snapList, unreadCount: snapUnread });
		}
	},

	markEverythingRead: async () => {
		const snapList = [...get().notifications];
		const snapUnread = get().unreadCount;
		set({
			notifications: snapList.map((n) => ({ ...n, isRead: true })),
			unreadCount: 0,
		});
		try {
			await markAllRead();
			await get().refreshUnreadCount();
		} catch {
			set({ notifications: snapList, unreadCount: snapUnread });
		}
	},

	clearError: () => set({ error: null }),
}));
