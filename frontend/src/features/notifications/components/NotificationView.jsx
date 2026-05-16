import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Button, Loading } from "@/design-system";
import { useTranslation } from "react-i18next";
import {
	useNotificationStore,
	NOTIFICATION_ERROR_CODES,
} from "../store/useNotificationStore";
import { NotificationCard } from "./NotificationCard";

export function NotificationView() {
	const { t } = useTranslation("notifications");

	const errorCode = useNotificationStore((state) => state.errorCode);
	const loading = useNotificationStore((state) => state.loading);
	const notifications = useNotificationStore((state) => state.notifications);
	const hasMore = useNotificationStore((state) => state.hasMore);
	const loadNotificationsPage = useNotificationStore(
		(state) => state.loadNotificationsPage,
	);
	const loadMoreNotifications = useNotificationStore(
		(state) => state.loadMoreNotifications,
	);
	const clearError = useNotificationStore((state) => state.clearError);
	const unreadCount = useNotificationStore((state) => state.unreadCount);
	const markingAllRead = useNotificationStore((state) => state.markingAllRead);
	const markingReadId = useNotificationStore((state) => state.markingReadId);
	const markEverythingRead = useNotificationStore(
		(state) => state.markEverythingRead,
	);
	const markOneRead = useNotificationStore((state) => state.markOneRead);

	useEffect(() => {
		loadNotificationsPage(0);
	}, [loadNotificationsPage]);

	const showLoadError = errorCode === NOTIFICATION_ERROR_CODES.LOAD;
	const showList = !loading && !showLoadError && notifications.length > 0;
	const showEmpty =
		!loading && !showLoadError && notifications.length === 0;

	return (
		<div className="max-w-4xl mx-auto px-3 sm:px-4 pb-10 pt-5 sm:pt-10">
			<header className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
				<div className="flex min-w-0 items-start gap-3">
					<Bell
						className="mt-0.5 size-6 shrink-0 text-primary"
						aria-hidden
					/>
					<div className="min-w-0">
						<h1 className="text-base font-bold uppercase tracking-wide text-primary sm:text-lg">
							{t("title")}
						</h1>
					</div>
				</div>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					className="w-full shrink-0 sm:w-auto sm:self-start"
					disabled={
						loading ||
						markingAllRead ||
						markingReadId != null ||
						unreadCount === 0
					}
					aria-busy={markingAllRead}
					onClick={() => markEverythingRead()}
				>
					{t("markAllRead")}
				</Button>
			</header>

			<section className="min-w-0 max-w-full space-y-4" aria-label={t("title")}>
				{showLoadError && (
					<div
						className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
						role="alert"
					>
						<p>{t("errors.load")}</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="mt-3"
							onClick={() => {
								clearError();
								loadNotificationsPage(0);
							}}
						>
							{t("errors.retry")}
						</Button>
					</div>
				)}

				{loading && !showLoadError && (
					<div className="flex justify-center py-12">
						<Loading size="md" />
					</div>
				)}

				{showEmpty && (
					<p className="text-sm text-muted-foreground">{t("empty")}</p>
				)}

				{showList && (
					<ul className="flex flex-col gap-3">
						{notifications.map((notification) => (
							<li key={notification.id}>
								<NotificationCard
									notification={notification}
									markingReadId={markingReadId}
									onMarkRead={markOneRead}
								/>
							</li>
						))}
					</ul>
				)}

				{showList && hasMore && (
					<div className="flex justify-center pt-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={loading || markingAllRead || markingReadId != null}
							onClick={() => loadMoreNotifications()}
						>
							{t("loadMore")}
						</Button>
					</div>
				)}
			</section>
		</div>
	);
}
