import { NOTIFICATION_TYPES } from "./notificationTypes";

const POST_MODAL_TYPES = new Set([
	NOTIFICATION_TYPES.LIKE_POST,
	NOTIFICATION_TYPES.LIKE_COMMENT,
	NOTIFICATION_TYPES.COMMENT_POST,
]);

export function isPostModalNotification(notification) {
	return POST_MODAL_TYPES.has(notification?.type);
}


export function resolvePostModalOpenOptions(notification) {
	if (!isPostModalNotification(notification) || notification.postId == null) {
		return null;
	}

	const commentId =
		notification.commentId != null ? Number(notification.commentId) : null;

	const openComments =
		notification.type === NOTIFICATION_TYPES.COMMENT_POST ||
		notification.type === NOTIFICATION_TYPES.LIKE_COMMENT ||
		commentId != null;

	return {
		postId: Number(notification.postId),
		commentId: Number.isNaN(commentId) ? null : commentId,
		openComments,
	};
}

export function resolveNotificationNavigationTarget(notification) {
	if (!notification?.type || isPostModalNotification(notification)) {
		return null;
	}

	const username = notification.username?.trim();

	switch (notification.type) {
		case NOTIFICATION_TYPES.FRIEND_REQUEST:
			return "/friends?tab=requests";

		case NOTIFICATION_TYPES.FRIEND_ACCEPTED:
		case NOTIFICATION_TYPES.FRIEND_REJECTED:
		case NOTIFICATION_TYPES.FRIEND_BROKEN:
			if (username) {
				return `/${encodeURIComponent(username)}`;
			}
			return "/friends";

		case NOTIFICATION_TYPES.ADDED_GROUP:
		case NOTIFICATION_TYPES.REMOVED_GROUP:
			return "/chat";

		default:
			return null;
	}
}
