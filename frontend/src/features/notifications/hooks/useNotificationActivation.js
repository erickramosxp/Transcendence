import { useCallback } from "react";
import { toast } from "react-toastify";
import i18n from "@/i18n";
import { appNavigate } from "@/shared/navigation/appNavigate";
import {
	resolveNotificationNavigationTarget,
	resolvePostModalOpenOptions,
} from "../utils/notificationNavigation";

export function useNotificationActivation({
	notification,
	onMarkRead,
	markingReadId,
	resolvingPostId = null,
	onOpenPost,
}) {
	const unread = notification?.isRead === false;
	const isMarking = markingReadId === notification?.id;
	const isResolvingPost =
		resolvingPostId != null &&
		notification.postId != null &&
		Number(resolvingPostId) === Number(notification.postId);

	const activate = useCallback(async () => {
		if (isMarking || isResolvingPost || resolvingPostId != null) return;

		const postModal = resolvePostModalOpenOptions(notification);
		const route = resolveNotificationNavigationTarget(notification);

		if (!postModal && !route) {
			toast.warn(i18n.t("notifications:errors.openTarget"));
			return;
		}

		if (unread && onMarkRead) {
			const ok = await onMarkRead(notification.id);
			if (!ok) return;
		}

		if (postModal) {
			if (!onOpenPost) {
				toast.warn(i18n.t("notifications:errors.openTarget"));
				return;
			}
			await onOpenPost(postModal.postId, {
				commentId: postModal.commentId,
				openComments: postModal.openComments,
			});
			return;
		}

		if (route) {
			appNavigate(route);
		}
	}, [
		isMarking,
		isResolvingPost,
		resolvingPostId,
		notification,
		onMarkRead,
		onOpenPost,
		unread,
	]);

	return { activate, isMarking, isResolvingPost, unread };
}
