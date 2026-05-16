import { Avatar } from "@/design-system";
import { getCurrentTime } from "@/shared/getCurrentTime";
import { useTranslation } from "react-i18next";
import { cn } from "@/design-system/tokens/colors";

export function NotificationCard({
	notification,
	markingReadId,
	onMarkRead,
}) {
	const { t, i18n } = useTranslation("notifications");
	const isMarking = markingReadId === notification.id;
	const unread = notification.isRead === false;

	const typeKey = notification.type
		? `types.${notification.type}`
		: "types.unknown";
	const typeLabel = t(typeKey, { defaultValue: notification.type ?? "" });

	const timeLabel = notification.createdAt
		? getCurrentTime(notification.createdAt, i18n.language)
		: "";

	return (
		<article
			className={cn(
				"flex w-full items-start gap-3 rounded-xl border border-border/60 bg-card/80 px-3 py-3 text-left transition-colors",
				unread && "bg-card",
				isMarking && "opacity-60",
			)}
		>
			<Avatar
				className="shrink-0"
				size="md"
				src={notification.avatarUrl}
				name={notification.name}
				username={notification.username}
			/>

			<button
				type="button"
				className="min-w-0 flex-1 text-left"
				disabled={isMarking || !unread}
				onClick={() => onMarkRead?.(notification.id)}
			>
				<p className="text-sm leading-snug">
					{notification.name ? (
						<span className="font-semibold text-foreground">
							{notification.name}{" "}
						</span>
					) : null}
					<span className="text-foreground">{typeLabel}</span>
				</p>
				{notification.preview ? (
					<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
						&ldquo;{notification.preview}&rdquo;
					</p>
				) : null}
				{notification.chatName ? (
					<p className="mt-1 text-sm text-muted-foreground">
						{notification.chatName}
					</p>
				) : null}
				{timeLabel ? (
					<p className="mt-1 text-xs text-muted-foreground">{timeLabel}</p>
				) : null}
			</button>

			{unread ? (
				<span
					className="mt-2 size-2.5 shrink-0 rounded-full bg-primary"
					aria-hidden
				/>
			) : (
				<span className="mt-2 size-2.5 shrink-0" aria-hidden />
			)}
		</article>
	);
}
