import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import i18n from "@/i18n";
import {
	getPostById,
	likePost,
	unlikePost,
} from "@/features/feed/feedService";

export function useMediaPostModal() {
	const [selected, setSelected] = useState(null);
	const [modalLoading, setModalLoading] = useState(false);
	const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
	const [highlightCommentId, setHighlightCommentId] = useState(null);

	const closePost = useCallback(() => {
		setSelected(null);
		setActiveCommentsPostId(null);
		setHighlightCommentId(null);
	}, []);

	const openPost = useCallback(
		async (postId, { commentId = null, openComments = false } = {}) => {
			if (postId == null) return;

			const numericPostId = Number(postId);
			setModalLoading(true);
			setSelected(null);
			setHighlightCommentId(
				commentId != null && !Number.isNaN(Number(commentId))
					? Number(commentId)
					: null,
			);

			try {
				const post = await getPostById(postId);
				setSelected(post);
				const shouldOpenComments =
					openComments || commentId != null;
				setActiveCommentsPostId(
					shouldOpenComments ? numericPostId : null,
				);
			} catch (err) {
				console.error(err);
				toast.error(i18n.t("profile:mediaGrid.getPostError"));
				closePost();
			} finally {
				setModalLoading(false);
			}
		},
		[closePost],
	);

	const handleLike = useCallback(async (postId) => {
		let liked;
		let likeCount;

		setSelected((prev) => {
			if (!prev || prev.id !== postId) return prev;
			liked = prev.likedByMe;
			likeCount = Number(prev.likeCount ?? 0);
			const nextLiked = !liked;
			return {
				...prev,
				likedByMe: nextLiked,
				likeCount: nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1),
			};
		});

		if (liked === undefined) return;

		try {
			if (liked) await unlikePost(postId);
			else await likePost(postId);
		} catch (err) {
			console.error(err);
			toast.error(i18n.t("feed:errors.updateLike"));
			setSelected((prev) =>
				prev?.id === postId
					? { ...prev, likedByMe: liked, likeCount }
					: prev,
			);
		}
	}, []);

	const toggleComments = useCallback((postId) => {
		setActiveCommentsPostId((prev) =>
			prev === postId ? null : Number(postId),
		);
	}, []);

	const incrementCommentCount = useCallback(() => {
		setSelected((prev) =>
			prev
				? {
						...prev,
						commentCount: Number(prev.commentCount ?? 0) + 1,
					}
				: prev,
		);
	}, []);

	return {
		selected,
		modalLoading,
		activeCommentsPostId,
		highlightCommentId,
		openPost,
		closePost,
		handleLike,
		toggleComments,
		incrementCommentCount,
	};
}
