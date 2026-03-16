import { useState, useEffect ,useRef, useCallback } from "react";
import PostList from "@/features/feed/components/PostList";
import PostMenu from "@/features/feed/PostMenu";
import { useAuth } from "@/app/providers/AuthProvider";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { getFeed } from "@/features/feed/feedService";
import { toast } from 'react-toastify';
import { likePost, unlikePost, createPost } from "@/features/feed/feedService";

export function Feed() {
    const [posts, setPosts] = useState([]);
    const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const sentinelRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        async function loadInitialFeed() {
            try {
                const data = await getFeed(0, 10);
                const resp = data.data;
                setPosts(resp.items);
                console.log("resp:", resp);
                setPage(resp.page + 1);
                setHasMore(resp.hasMore);
            } catch (err) {
                console.error(err);
            }
        }
        
        loadInitialFeed();
    }, []);

    const loadMore = useCallback(async () => {

        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);

        try {
            const data = await getFeed(page, 10);

            setPosts(prev => [...prev, ...data.items]);
            setPage(data.page + 1);
            setHasMore(data.hasMore);

        } catch (err) {
            console.error(err);
            toast.error('Falha ao carregar os posts');
            
        }

        setIsLoadingMore(false);
        // TODO: chamar API paginada (ex.: GET /posts?page=N), depois:
        // setIsLoadingMore(true);
        // fetch(...).then((newPosts) => { setPosts(prev => [...prev, ...newPosts]); setHasMore(conforme resposta); setIsLoadingMore(false); });
    }, [isLoadingMore, hasMore, page]);

    useInfiniteScroll(sentinelRef, loadMore, {
        enabled: hasMore && !isLoadingMore,
        rootMargin: "200px",
    });

    // {
    // "text": "string",
    // "mediaUrl": "string"
    // }
    async function addPost(postData){

        const newPost = {
            text: postData.text,
            mediaUrl: postData.file ? URL.createObjectURL(postData.file) : null
        };
        
        try {
            
            const resp = await createPost(newPost);
            setPosts((prev) => [resp, ...prev]);
            
        } catch (err) {
            console.log(err);
        }
        

    }

    function addComment(postId, commentData){
        const updatePosts = posts.map((post) => {
            if (post.id === postId)
            {
                const newComment = {
                    id: Date.now(),
                    user_id: user.id,
                    name: user.name,
                    user_username: "user_name",
                    user_profile_photo:null,
                    content: commentData.text,
                    date_time: Date.now(),
                    likes: 0,
                    likedByMe: false
                };
                const updatedComments = [...(post.comments ?? []), newComment];
                return { ...post, comments: updatedComments, countComments: updatedComments.length };
            }
            return post;
        });
        setPosts(updatePosts);
    }

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

    function handleCommentLike(postId, commentId) {
        const updatePosts = posts.map((post) => {
            if (post.id !== postId) return post;
            const comments = (post.comments ?? []).map((comment) => {
                if (comment.id !== commentId) return comment;
                const likedByMe = !comment.likedByMe;
                const likes = likedByMe ? comment.likes + 1 : comment.likes - 1;
                return { ...comment, likedByMe, likes };
            });
            return { ...post, comments };
        });
        setPosts(updatePosts);
    }

    function toggleComments(postId) {
        console.log("Toggle comments for post", postId);
        setActiveCommentsPostId((prev) => (prev === postId ? null : postId));
    }

    return (
        <div className="feed-background">
            <div className="container">
                <div className="feed-grid">
                    <div className="space-y-6 min-w-0 max-w-full overflow-hidden">
                        <PostMenu onAddPost={addPost}/>
                        <PostList
                            posts={posts}
                            sentinelRef={sentinelRef}
                            isLoadingMore={isLoadingMore}
                            hasMore={hasMore}
                            onAddComment={addComment}
                            onLike={handleLike}
                            onCommentLike={handleCommentLike}
                            onToggleComments={toggleComments}
                            activeCommentsPostId={activeCommentsPostId}
                        />
                    </div>
                    <div className="feed-sidebar space-y-6">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg p-4 border border-slate-200/50 dark:border-slate-800/50">
                            <h2 className="text-lg font-semibold mb-4">Amigos Online</h2>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg p-4 border border-slate-200/50 dark:border-slate-800/50">
                            <h2 className="text-lg font-semibold mb-4">Em Alta</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


