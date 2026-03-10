import { useState } from "react";
import PostList from "../components/ui/PostList";
import PostMenu from "../components/ui/PostMenu";
import { useAuth } from "../app/providers/AuthProvider";
import CommentsCard from "../components/ui/CommentCard";

export function Feed() {
    const [posts, setPosts] = useState([]);
    const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
    const {user} = useAuth();

    function addPost(postData){
        const newPost = {
            id: Date.now(),
            name: user.name,
            username:"user_name",
            userPhoto:"https://kwaksf.com/cdn/shop/files/Swimmer_with_drink_Rubber_Duck.png?v=1749514215&width=990",
            content: postData.text,
            file: postData.file,
            imageUrl: postData.file ? URL.createObjectURL(postData.file) : null,
            fileType:postData.fileType,
            linkPreview: postData.linkPreview || null,
            likes: 0,
            isLiked: false,
            date_time:Date.now(),
            comments: [],
            countComments: 0,
        };

        setPosts([newPost, ...posts]);
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
                return { ...post, comments: [...post.comments, newComment] };
            }
            return post;
        });
        setPosts(updatePosts);
    }

    function handleLike(postId) {
        const updatePosts = posts.map((post) => {
            if (post.id === postId)
            {
                if (post.isLiked)
                {
                    return { ...post, likes: post.likes - 1, isLiked: false};
                }
                else
                {
                    return { ...post, likes: post.likes + 1, isLiked: true};
                }
            } return post;
        });
        setPosts(updatePosts);
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
                    <div className="space-y-6">
                        <PostMenu onAddPost={addPost}/>
                        <PostList
                            posts={posts}
                            onAddComment={addComment}
                            onLike={handleLike}
                            onCommentLike={handleCommentLike}
                            onToggleComments={toggleComments}
                            activeCommentsPostId={activeCommentsPostId}
                        />
                    </div>
                    <div className="space-y-6">
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


