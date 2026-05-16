import { useCallback } from "react";
import { appNavigate } from "@/shared/navigation/appNavigate";
import {
	resolveNotificationNavigationTarget,
	resolvePostModalOpenOptions,
} from "../utils/notificationNavigation";

export function useNotificationActivation({
	notification,
	onMarkRead,
	markingReadId,
	onOpenPost,
}) {
	const unread = notification?.isRead === false;
	const isMarking = markingReadId === notification?.id;

	const activate = useCallback(async () => {
		if (isMarking) return;

		const postModal = resolvePostModalOpenOptions(notification);
		const route = resolveNotificationNavigationTarget(notification);

		if (!postModal && !route) return;

		if (unread && onMarkRead) {
			const ok = await onMarkRead(notification.id);
			if (!ok) return;
		}

		if (postModal && onOpenPost) {
			await onOpenPost(postModal.postId, {
				commentId: postModal.commentId,
				openComments: postModal.openComments,
			});
			return;
		}

		if (route) {
			appNavigate(route);
		}
	}, [isMarking, notification, onMarkRead, onOpenPost, unread]);

	return { activate, isMarking, unread };
}
