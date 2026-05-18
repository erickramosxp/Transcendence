import { useState, useEffect } from "react";
import { usePostList } from "@/features/profile/hooks/usePostList";
import { useMediaPostModal } from "@/features/profile/hooks/useMediaPostModal";
import { getUserMediaPosts } from "@/features/profile/services/profileService";
import { Loading } from "@/design-system";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MediaGridRenderer } from "./midiaThumbnails/MediaGridRenderer";
import { MediaPostModal } from "./MediaPostModal";

export function MediaGrid({ username }) {
	const [loading, setLoading] = useState(true);
	const { t } = useTranslation("profile");

	const { posts, loadInitial } = usePostList((page, size) =>
		getUserMediaPosts(username, page, size),
	);

	const {
		selected,
		modalLoading,
		activeCommentsPostId,
		highlightCommentId,
		openPost,
		closePost,
		handleLike,
		toggleComments,
		incrementCommentCount,
	} = useMediaPostModal();

	useEffect(() => {
		const loadMedia = async () => {
			try {
				await loadInitial();
			} catch (err) {
				console.error(err);
				toast.error(t("mediaGrid.getMidaError"));
			} finally {
				setLoading(false);
			}
		};

		loadMedia();
	}, [username, loadInitial, t]);

	if (loading) return <Loading size="md" className="py-10" />;

	if (posts.length === 0) {
		return (
			<p className="text-center text-muted-foreground py-12 text-sm">
				{t("mediaGrid.empty")}
			</p>
		);
	}

	return (
		<>
			<div className="grid grid-cols-3 gap-1">
				{posts.map((item, index) => (
					<div
						key={`${item.postId}-${index}`}
						className="flex justify-center aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-80 transition-opacity"
						onClick={() => openPost(item.postId)}
					>
						<MediaGridRenderer item={item} />
					</div>
				))}
			</div>

			<MediaPostModal
				open={!!selected}
				onClose={closePost}
				post={selected}
				loading={modalLoading}
				onLike={handleLike}
				onToggleComments={toggleComments}
				activeCommentsPostId={activeCommentsPostId}
				incrementCommentCount={incrementCommentCount}
				highlightCommentId={highlightCommentId}
			/>
		</>
	);
}
