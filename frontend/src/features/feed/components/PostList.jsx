import { useState, useRef, useEffect, useCallback } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import PostCard from "@/features/feed/components/PostCard";
import {
    getFeed,
    likePost,
    unlikePost,
} from "@/features/feed/feedService";
import { toast } from "react-toastify";

import { useTranslation } from "react-i18next";
import { Card, Loading } from "@/design-system";


function PostList({ posts, setPosts }) {

    const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoadingInitialFeed, setLoadingFeed] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const sentinelRef = useRef(null);

    const { t } = useTranslation('feed');

    useEffect(() => {
        
        async function loadInitialFeed() {
            try {
                const data = await getFeed(0, 10);
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
        }

        loadInitialFeed();
    }, [setPosts]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);

        try {
            const data = await getFeed(page, 10);
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
    }, [hasMore, isLoadingMore, page, setPosts]);

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
            toast.error("Falha ao atualizar curtida");

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

    if (isLoadingInitialFeed) {
        return <Loading className="py-10" />;
    }

    return (
        <div className="space-y-8">
            {posts && posts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                    {t('list.empty')}
                    <br />
                    {t('list.emptyCta')}
                </div>
            ) : (
                <>
                    {posts &&
                        posts.map((post) => (
                            <Card
                                key={post.id}
                                className="border-border bg-card/90 backdrop-blur-xl shadow-xl"
                            >
                                <PostCard
                                    post={post}
                                    onLike={handleLike}
                                    onToggleComments={toggleComments}
                                    activeCommentsPostId={activeCommentsPostId}
                                    incrementCommentCount={incrementCommentCount}
                                />
                            </Card>
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