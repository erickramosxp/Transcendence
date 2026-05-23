import { useState, useCallback, useRef, useEffect } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { toast } from "react-toastify";
import { likePost, unlikePost, deletePost } from "@/features/feed/feedService";
import { useTranslation } from "react-i18next";
import {
  PROFILE_AUTHOR_NAME_UPDATED,
  mapItemsWithAuthorName,
} from "@/shared/profile/profileAuthorSync";


export function usePostList(fetchFn) {

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const sentinelRef = useRef(null);
  const { t } = useTranslation();

  const loadInitial = useCallback(async () => {
    const data = await fetchFn(0, 9);
    setPosts(data.items);
    setPage(data.page + 1);
    setHasMore(data.hasMore);
  }, [fetchFn]);

  const loadMore = useCallback(async () => {

    if (isLoadingMore || !hasMore)
      return;

    setIsLoadingMore(true);

    try {

      const data = await fetchFn(page, 10);
      setPosts(prev => [...prev, ...data.items]);
      setPage(data.page + 1);
      setHasMore(data.hasMore);
    } catch {
      toast.error(t('feed:list.loadError'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, fetchFn]);

  useInfiniteScroll(sentinelRef, loadMore, {
    enabled: hasMore && !isLoadingMore,
    rootMargin: "200px",
  });

  useEffect(() => {
    const onAuthorNameUpdated = (event) => {
      const { username, name } = event.detail ?? {};
      if (!username || !name) return;

      setPosts((prev) => mapItemsWithAuthorName(prev, username, name));
    };

    window.addEventListener(PROFILE_AUTHOR_NAME_UPDATED, onAuthorNameUpdated);
    return () => {
      window.removeEventListener(PROFILE_AUTHOR_NAME_UPDATED, onAuthorNameUpdated);
    };
  }, []);

  async function handleLike(postId) {
    const liked = posts.find(p => p.id === postId).likedByMe;
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (liked ? -1 : 1) }
          : p
      )
    );
    liked ? await unlikePost(postId) : await likePost(postId);
  }

  function toggleComments(postId) {
    setActiveCommentsPostId(prev => prev === postId ? null : postId);
  }

  function incrementCommentCount(postId) {
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, commentCount: (p.commentCount ?? 0) + 1 } : p)
    );
  }

  async function handleDelete(postId) {

    try {
      await deletePost(postId);

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success(t('feed:posts.deleteSuccess'))
    } catch (err) {
      toast.error(t('feed:errors.deletePost'));
      throw err;
    }
  };

  return {
    posts, setPosts, hasMore, isLoadingMore,
    sentinelRef, activeCommentsPostId, handleDelete,
    loadInitial, handleLike, toggleComments, incrementCommentCount,
    loadMore
  };
}
