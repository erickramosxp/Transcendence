import {
	Heart,
	MessageCircle,
	UserMinus,
	UserPlus,
	UserCheck,
	UserX,
	Users,
	Bell,
} from "lucide-react";
import { NOTIFICATION_TYPES, isNotificationType } from "./notificationTypes";

export const NOTIFICATION_CARD_META = {
	[NOTIFICATION_TYPES.LIKE_POST]: {
		icon: Heart,
		iconClassName: "text-pink-500",
		cardKey: "LIKE_POST",
	},
	[NOTIFICATION_TYPES.LIKE_COMMENT]: {
		icon: Heart,
		iconClassName: "text-pink-500",
		cardKey: "LIKE_COMMENT",
	},
	[NOTIFICATION_TYPES.COMMENT_POST]: {
		icon: MessageCircle,
		iconClassName: "text-primary",
		cardKey: "COMMENT_POST",
	},
	[NOTIFICATION_TYPES.FRIEND_REQUEST]: {
		icon: UserPlus,
		iconClassName: "text-orange-500",
		cardKey: "FRIEND_REQUEST",
	},
	[NOTIFICATION_TYPES.FRIEND_ACCEPTED]: {
		icon: UserCheck,
		iconClassName: "text-orange-500",
		cardKey: "FRIEND_ACCEPTED",
	},
	[NOTIFICATION_TYPES.FRIEND_REJECTED]: {
		icon: UserX,
		iconClassName: "text-muted-foreground",
		cardKey: "FRIEND_REJECTED",
	},
	[NOTIFICATION_TYPES.FRIEND_BROKEN]: {
		icon: UserMinus,
		iconClassName: "text-muted-foreground",
		cardKey: "FRIEND_BROKEN",
	},
	[NOTIFICATION_TYPES.ADDED_GROUP]: {
		icon: Users,
		iconClassName: "text-violet-500",
		cardKey: "ADDED_GROUP",
	},
	[NOTIFICATION_TYPES.REMOVED_GROUP]: {
		icon: Users,
		iconClassName: "text-violet-500",
		cardKey: "REMOVED_GROUP",
	},
};

const FALLBACK_META = {
	icon: Bell,
	iconClassName: "text-primary",
	cardKey: "unknown",
};

export function resolveNotificationCardMeta(type) {
	if (isNotificationType(type) && NOTIFICATION_CARD_META[type]) {
		return NOTIFICATION_CARD_META[type];
	}
	return FALLBACK_META;
}

export function resolveCardI18nKey(type, notification) {
	const meta = resolveNotificationCardMeta(type);
	if (
		meta.cardKey === "COMMENT_POST" &&
		!String(notification?.preview ?? "").trim()
	) {
		return "card.COMMENT_POST_noPreview";
	}
	return `card.${meta.cardKey}`;
}
