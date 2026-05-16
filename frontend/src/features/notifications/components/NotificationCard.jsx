import { NotificationItem } from "@/design-system";
import { getCurrentTime } from "@/shared/getCurrentTime";
import { Trans, useTranslation } from "react-i18next";
import {
	resolveCardI18nKey,
	resolveNotificationCardMeta,
} from "../utils/notificationCardMeta";
import { useNotificationActivation } from "../hooks/useNotificationActivation";

export function NotificationCard({
	notification,
	markingReadId,
	resolvingPostId = null,
	onMarkRead,
	onOpenPost,
}) {
	const { t, i18n } = useTranslation("notifications");
	const { activate, isMarking, isResolvingPost, unread } =
		useNotificationActivation({
			notification,
			onMarkRead,
			markingReadId,
			resolvingPostId,
			onOpenPost,
		});

	const isBusy = isMarking || isResolvingPost;

	const meta = resolveNotificationCardMeta(notification.type);
	const cardKey = resolveCardI18nKey(notification.type, notification);

	const values = {
		name: notification.name?.trim() || t("card.someone"),
		preview: notification.preview ?? "",
		chatName: notification.chatName ?? "",
	};

	const timeLabel = notification.createdAt
		? getCurrentTime(notification.createdAt, i18n.language)
		: "";

	return (
		<NotificationItem
			accentClassName={meta.accentClassName}
			icon={meta.icon}
			iconClassName={meta.iconClassName}
			avatar={{
				src: notification.avatarUrl,
				name: notification.name,
				username: notification.username,
			}}
			message={
				<Trans
					i18nKey={cardKey}
					ns="notifications"
					values={values}
					components={{
						bold: (
							<span className="font-semibold text-foreground" />
						),
					}}
				/>
			}
			timeLabel={timeLabel}
			unread={unread}
			disabled={isBusy}
			busy={isResolvingPost}
			onActivate={activate}
			openLabel={t("card.openTarget")}
		/>
	);
}
