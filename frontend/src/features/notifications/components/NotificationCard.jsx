import { Avatar } from "@/design-system";
import { getCurrentTime } from "@/shared/getCurrentTime";
import { Trans, useTranslation } from "react-i18next";
import { cn } from "@/design-system/tokens/colors";
import {
	resolveCardI18nKey,
	resolveNotificationCardMeta,
} from "../utils/notificationCardMeta";
import { useNotificationActivation } from "../hooks/useNotificationActivation";

export function NotificationCard({
	notification,
	markingReadId,
	onMarkRead,
	onOpenPost,
}) {
	const { t, i18n } = useTranslation("notifications");
	const { activate, isMarking, unread } = useNotificationActivation({
		notification,
		onMarkRead,
		markingReadId,
		onOpenPost,
	});

	const meta = resolveNotificationCardMeta(notification.type);
	const Icon = meta.icon;
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
		<article
			className={cn(
				"flex w-full overflow-hidden rounded-xl border border-border/50 bg-card/70 transition-colors",
				unread && "bg-card/95",
				isMarking && "opacity-60",
			)}
		>
			<span
				className={cn("w-1 shrink-0", meta.accentClassName)}
				aria-hidden
			/>
			<div className="flex min-w-0 flex-1 items-center gap-3 p-3">
				<Avatar
					className="shrink-0"
					size="md"
					src={notification.avatarUrl}
					name={notification.name}
					username={notification.username}
				/>

				<button
					type="button"
					className="flex min-w-0 flex-1 items-start gap-2 text-left transition-colors hover:bg-accent/30 rounded-lg -m-1 p-1 disabled:opacity-60"
					disabled={isMarking}
					onClick={activate}
					aria-label={t("card.openTarget")}
				>
					<Icon
						className={cn("mt-0.5 size-4 shrink-0", meta.iconClassName)}
						aria-hidden
					/>

					<div className="min-w-0 flex-1">
						<p className="text-sm leading-snug text-foreground">
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
						</p>
						{timeLabel ? (
							<p className="mt-1 text-xs text-muted-foreground">
								{timeLabel}
							</p>
						) : null}
					</div>
				</button>

				{unread ? (
					<span
						className="size-2.5 shrink-0 rounded-full bg-primary"
						aria-hidden
					/>
				) : (
					<span className="size-2.5 shrink-0" aria-hidden />
				)}
			</div>
		</article>
	);
}
