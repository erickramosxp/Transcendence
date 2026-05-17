import { useCallback, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button, Loading } from "@/design-system";
import { useTranslation } from "react-i18next";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
	useNotificationStore,
	NOTIFICATION_ERROR_CODES,
} from "../store/useNotificationStore";
import { NotificationCard } from "./NotificationCard";
import { useNotificationPostModal } from "../hooks/useNotificationPostModal";
import { MediaPostModal } from "@/features/profile/components/ui/MediaPostModal";

export function NotificationView() {
	const { t } = useTranslation("notifications");
	const sentinelRef = useRef(null);

	const {
		selected,
		resolvingPostId,
		activeCommentsPostId,
		highlightCommentId,
		openPost,
		closePost,
		handleLike,
		toggleComments,
		incrementCommentCount,
	} = useNotificationPostModal();

	const errorCode = useNotificationStore((state) => state.errorCode);
	const loading = useNotificationStore((state) => state.loading);
	const loadingMore = useNotificationStore((state) => state.loadingMore);
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

	const handleLoadMore = useCallback(() => {
		void loadMoreNotifications();
	}, [loadMoreNotifications]);

	useInfiniteScroll(sentinelRef, handleLoadMore, {
		enabled:
			hasMore &&
			!loading &&
			!loadingMore &&
			!markingAllRead &&
			markingReadId == null,
		rootMargin: "200px",
	});

	const showLoadError = errorCode === NOTIFICATION_ERROR_CODES.LOAD;
	const showInitialLoading = loading && notifications.length === 0;
	const showList = !showLoadError && notifications.length > 0;
	const showEmpty =
		!loading && !showLoadError && notifications.length === 0;

	return (
		<>
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

				<section
					className="min-w-0 max-w-full space-y-4"
					aria-label={t("title")}
				>
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

					{showInitialLoading && (
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
										resolvingPostId={resolvingPostId}
										onMarkRead={markOneRead}
										onOpenPost={openPost}
									/>
								</li>
							))}
						</ul>
					)}

					{showList && hasMore && (
						<div
							ref={sentinelRef}
							className="flex justify-center py-4"
							aria-hidden={!loadingMore}
						>
							{loadingMore ? (
								<Loading size="sm" />
							) : (
								<span className="h-4 w-full" />
							)}
						</div>
					)}
				</section>
			</div>

			<MediaPostModal
				open={!!selected}
				onClose={closePost}
				post={selected}
				loading={false}
				onLike={handleLike}
				onToggleComments={toggleComments}
				activeCommentsPostId={activeCommentsPostId}
				incrementCommentCount={incrementCommentCount}
				highlightCommentId={highlightCommentId}
			/>
		</>
	);
}
