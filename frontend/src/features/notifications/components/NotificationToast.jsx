import { Avatar } from "@/design-system";
import { navigateToNotifications } from "@/shared/navigation/appNavigate";
import { Trans, useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { cn } from "@/design-system/tokens/colors";
import {
	resolveCardI18nKey,
	resolveNotificationCardMeta,
} from "../utils/notificationCardMeta";

export function NotificationToast({ notification, closeToast }) {
	const { t } = useTranslation("notifications");
	const meta = resolveNotificationCardMeta(notification.type);
	const Icon = meta.icon;
	const cardKey = resolveCardI18nKey(notification.type, notification);

	const values = {
		name: notification.name?.trim() || t("card.someone"),
		preview: notification.preview ?? "",
		chatName: notification.chatName ?? "",
	};

	const reasonLabel =
		notification.reason?.trim() &&
		t("toast.reason", { reason: notification.reason.trim() });

	function goToNotifications() {
		closeToast?.();
		navigateToNotifications();
	}

	return (
		<div
			role="status"
			className="flex w-[min(100vw-2rem,360px)] overflow-hidden rounded-xl border border-border/40 bg-card shadow-lg"
		>
			<span
				className={cn("w-1 shrink-0", meta.accentClassName)}
				aria-hidden
			/>
			<div className="flex min-w-0 flex-1 items-stretch">
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						goToNotifications();
					}}
					className="flex min-w-0 flex-1 cursor-pointer gap-3 p-3 pr-2 text-left transition-colors hover:bg-accent/40"
					aria-label={t("toast.openNotifications")}
				>
					<Avatar
						className="shrink-0"
						size="md"
						src={notification.avatarUrl}
						name={notification.name}
						username={notification.username}
					/>
					<div className="min-w-0 flex-1">
						<p className="flex items-start gap-2 text-sm leading-snug text-foreground">
							<Icon
								className={cn(
									"mt-0.5 size-4 shrink-0",
									meta.iconClassName,
								)}
								aria-hidden
							/>
							<span>
								<Trans
									ns="notifications"
									i18nKey={cardKey}
									values={values}
									components={{
										bold: (
											<span className="font-semibold text-foreground" />
										),
									}}
								/>
							</span>
						</p>
						{reasonLabel ? (
							<p className="mt-1 pl-6 text-xs text-muted-foreground">
								{reasonLabel}
							</p>
						) : null}
					</div>
				</button>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						closeToast?.();
					}}
					className="shrink-0 self-start rounded p-2.5 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
					aria-label={t("toast.close")}
				>
					<X className="size-4" aria-hidden />
				</button>
			</div>
		</div>
	);
}
