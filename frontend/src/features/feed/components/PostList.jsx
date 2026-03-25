import { useState, useRef, useEffect, useCallback } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import PostCard from "@/features/feed/components/PostCard";
import { getFeed } from "@/features/feed/feedService";
import { toast } from 'react-toastify';
import { likePost, unlikePost } from "@/features/feed/feedService";

import { Card, Loading } from "@/design-system";

//     {
//   "items": [
//     {
//       "id": 0,
//       "name": "string",
//       "userName": "string",
//       "contents": "string",
//       "avatarUrl": "string",
//       "likedByMe": true,
//       "likeCount": 0,
//       "commentCount": 0,
//       "media": "string",
//       "created_at": "2022-03-10T12:15:50-04:00"
//     }
//   ],
//   "page": 0,
//   "size": 0,
//   "hasMore": true
// }

function PostList({posts, setPosts}) {

    const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoadingInitialFeed, setLoadingFeed] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const sentinelRef = useRef(null);

    useEffect(() => {

        async function loadInitialFeed() {
            try {
                const data = await getFeed(0, 10);
                const resp = data.data;
                setPosts(resp.items);
                setPage(resp.page + 1);
                setHasMore(resp.hasMore);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingFeed(false);
            }
        }
        
        loadInitialFeed();
    }, []);

    const loadMore = useCallback(async () => {

        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);

        try {
            const data = await getFeed(page, 10);
            const items = data.items || data.data?.items || [];

            if (items.length === 0) {
                setHasMore(false);
                return ;
            }
            setPosts(prev => [...prev, ...items]);
            setPage(data.page + 1);
            setHasMore(data.hasMore);

        } catch (err) {
            console.error(err);
            toast.error('Falha ao carregar os posts');
        } finally {
            setIsLoadingMore(false);
        }

    }, [hasMore, isLoadingMore, page]);

    useInfiniteScroll(sentinelRef, loadMore, {
        enabled: hasMore && !isLoadingMore,
        rootMargin: "200px",
    });


//     {
//   "items": [
//     {
//       "id": 0,
//       "name": "string",
//       "userName": "string",
//       "contents": "string",
//       "avatarUrl": "string",
//       "likedByMe": true,
//       "likeCount": 0,
//       "commentCount": 0,
//       "media": "string",
//       "created_at": "2022-03-10T12:15:50-04:00"
//     }
//   ],
//   "page": 0,
//   "size": 0,
//   "hasMore": true
// }

    async function handleLike(postId) {

        const liked = posts.find(p => p.id == postId).likedByMe;

        setPosts(prev =>
                prev.map(p =>
                    p.id === postId
                        ? {
                            ...p,
                            likedByMe: !p.likedByMe,
                            likeCount: p.likedByMe
                                ? p.likeCount - 1
                                : p.likeCount + 1
                        }
                        : p
                )
        );

        if (liked) {
            await unlikePost(postId);
        } else {
            await likePost(postId);
        }
    }


    function toggleComments(postId) {
        console.log("Toggle comments for post", postId);
        setActiveCommentsPostId((prev) => (prev === postId ? null : postId));
    }

	const incrementCommentCount = (postId) => {

		setPosts(prev => 
			prev.map( p => p.id === postId ?
				{ ...p, commentCount: (p.commentCount ?? 0) + 1 }
                : p
			)

		)
	}

    if(isLoadingInitialFeed) {
        return (
            <Loading  className="py-10"/>
        );
    }

	return (
		<div className="space-y-8">
			{posts && posts.length === 0 ? (
				<div className="text-center text-gray-500 dark:text-gray-400 py-8">
					Nada por aqui ainda.<br/>
					Seja o primeiro a compartilhar algo ✨
				</div>
			) : (
				<>
					{posts && posts.map((post) => (
						<Card
							key={post.id}
							className=" border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
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
						<div className="text-center text-slate-500 dark:text-slate-400 py-4">
							Carregando mais…
						</div>
					)}
					{!hasMore && (
						<div className="text-center text-slate-400 dark:text-slate-500 py-4 text-sm">
							Você chegou ao fim do feed
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default PostList;
