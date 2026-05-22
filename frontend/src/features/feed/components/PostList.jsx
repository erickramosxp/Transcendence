import { useState, useRef, useEffect, useCallback } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import PostCard from "@/features/feed/components/PostCard";
import {
    getFeed,
    likePost,
    unlikePost,
    deletePost
} from "@/features/feed/feedService";
import { toast } from "react-toastify";

import { useTranslation } from "react-i18next";
import { Loading } from "@/design-system";


function PostList({ scope = "social", posts: controlledPosts, setPosts: controlledSetPosts }) {

    const [internalPosts, setInternalPosts] = useState([]);
    const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoadingInitialFeed, setLoadingFeed] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const sentinelRef = useRef(null);

    const isControlled = controlledPosts !== undefined && controlledSetPosts !== undefined;
    const posts = isControlled ? controlledPosts : internalPosts;
    const setPosts = isControlled ? controlledSetPosts : setInternalPosts;

    const { t } = useTranslation('feed');
    const isNewsScope = scope === "news";

    const loadInitialFeed = useCallback(async () => {
        setLoadingFeed(true);
        try {
            const data = await getFeed(0, 10, scope);
            const resp = data.data ?? data;

            setPosts(resp.items ?? []);
            setPage((resp.page ?? 0) + 1);
            setHasMore(!!resp.hasMore);
        } catch (err) {
            console.error(err);
            toast.error(t('list.loadError'));
        } finally {
            setLoadingFeed(false);
        }
    }, [scope, setPosts, t]);

    useEffect(() => {
        setPage(0);
        setHasMore(false);
        setActiveCommentsPostId(null);
        loadInitialFeed();
    }, [loadInitialFeed]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);

        try {
            const data = await getFeed(page, 10, scope);
            const resp = data.data ?? data;
            const items = resp.items ?? [];

            if (items.length === 0) {
                setHasMore(false);
                return;
            }

            setPosts((prev) => [...prev, ...items]);
            setPage((resp.page ?? page) + 1);
            setHasMore(!!resp.hasMore);
        } catch (err) {
            console.error(err);
            toast.error(t('list.loadError'));
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, page, scope, setPosts, t]);

    useInfiniteScroll(sentinelRef, loadMore, {
        enabled: hasMore && !isLoadingMore,
        rootMargin: "200px",
    });

    async function handleLike(postId) {
        const targetPost = posts.find((p) => p.id === postId);
        if (!targetPost) return;

        const liked = targetPost.likedByMe;

        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? {
                        ...p,
                        likedByMe: !p.likedByMe,
                        likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1,
                    }
                    : p
            )
        );

        try {
            if (liked) {
                await unlikePost(postId);
            } else {
                await likePost(postId);
            }
        } catch (err) {
            console.error(err);
            toast.error(t('errors.updateLike'));

            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? {
                            ...p,
                            likedByMe: liked,
                            likeCount: liked ? p.likeCount + 1 : p.likeCount - 1,
                        }
                        : p
                )
            );
        }
    }

    function toggleComments(postId) {
        setActiveCommentsPostId((prev) => (prev === postId ? null : postId));
    }

    function incrementCommentCount(postId) {
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? { ...p, commentCount: (p.commentCount ?? 0) + 1 }
                    : p
            )
        );
    }

    const handleDelete = async (postId) => {
        try {
            await deletePost(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
            toast.success(t('posts.deleteSuccess'));
        } catch (err) {
            toast.error(t('errors.deletePost'));
            throw err;
        }
    };

    if (isLoadingInitialFeed) {
        return <Loading className="py-10" />;
    }

    const emptyMessage = isNewsScope ? t('list.emptyNews') : t('list.empty');
    const emptyCta = isNewsScope ? null : t('list.emptyCta');

    return (
        <div className="space-y-8">
            {posts && posts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                    {emptyMessage}
                    {emptyCta && (
                        <>
                            <br />
                            {emptyCta}
                        </>
                    )}
                </div>
            ) : (
                <>
                    {posts &&
                        posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={handleLike}
                                onToggleComments={toggleComments}
                                activeCommentsPostId={activeCommentsPostId}
                                incrementCommentCount={incrementCommentCount}
                                onDelete={handleDelete}
                            />
                        ))}

                    <div ref={sentinelRef} className="h-4" aria-hidden />

                    {isLoadingMore && (
                        <div className="py-4 text-center text-muted-foreground">
                            {t('list.loadMore')}
                        </div>
                    )}

                    {!hasMore && posts?.length > 0 && (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                            {t('list.end')}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default PostList;
