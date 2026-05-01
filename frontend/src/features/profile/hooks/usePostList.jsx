import { useState, useCallback, useRef } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { toast } from "react-toastify";
import { likePost, unlikePost, deletePost } from "@/features/feed/feedService";


export function usePostList(fetchFn) {

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const sentinelRef = useRef(null);

  async function loadInitial() {
    const data = await fetchFn(0, 10);
    setPosts(data.items);
    setPage(data.page + 1);
    setHasMore(data.hasMore);
  }

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
      toast.error("Falha ao carregar os posts");
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, fetchFn]);

  useInfiniteScroll(sentinelRef, loadMore, {
    enabled: hasMore && !isLoadingMore,
    rootMargin: "200px",
  });

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
      toast.success("Post deletado !")
    } catch (err) {
      toast.error("Erro ao excluir. Tente novamente.");
      throw err;
    }
  };

  return {
    posts, setPosts, hasMore, isLoadingMore,
    sentinelRef, activeCommentsPostId, handleDelete,
    loadInitial, handleLike, toggleComments, incrementCommentCount,
  };
}
