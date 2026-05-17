import PostCard from "@/features/feed/components/PostCard";
import { Loading, Modal } from "@/design-system";
import { useTranslation } from "react-i18next";

export function MediaPostModal({
	open,
	onClose,
	post,
	loading,
	onLike,
	onToggleComments,
	activeCommentsPostId,
	incrementCommentCount,
	highlightCommentId = null,
}) {
	const { t } = useTranslation("profile");

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={t("mediaGrid.postModalTitle")}
			size="xl"
			scrollMode="dialog"
		>
			{loading ? (
				<div className="flex justify-center py-12">
					<Loading size="md" />
				</div>
			) : post ? (
				<div className="min-w-0 overflow-visible px-1 sm:px-2">
					<PostCard
						post={post}
						onLike={onLike}
						onToggleComments={onToggleComments}
						activeCommentsPostId={activeCommentsPostId}
						incrementCommentCount={incrementCommentCount}
						highlightCommentId={highlightCommentId}
						isModal
					/>
				</div>
			) : null}
		</Modal>
	);
}
