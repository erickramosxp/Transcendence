import { useState } from "react";
import CreatePost from "../components/ui/CreatePost";
import PostList from "../components/ui/PostList";

export function Feed() {
    const [posts, setPosts] = useState([]);

    function addPost(content){
        const newPost = {
            id: Date.now(),
            content: content,
            likes: 0,
            liked: false
        };

        setPosts([newPost, ...posts]);
    }

    function handleLike(postId) {
        const updatePosts = posts.map((post) => {
            if (post.id === postId)
            {
                if (post.liked)
                {
                    return { ...post, likes: post.likes - 1, liked: false};
                }
                else
                {
                    return { ...post, likes: post.likes + 1, liked: true};
                }
            } return post;
        });
        setPosts(updatePosts);
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#edf2f8] via-[#dbe4f0] to-[#b7c9e1] dark:from-slate-950 dark:via-[#0f1824] dark:to-[#1e3048] overflow-hidden relative">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-screen items-center py-20 sm:py-24 lg:py-12">
                <div>
                    <h1>Meu Feed</h1>
                    <CreatePost onAddPost={addPost} />
                    <PostList posts={posts} onLike={handleLike} />
                </div>
                <div>
                    <div>
                        <h1>Amigos Online</h1>
                    </div>
                    <div>
                        <h1>Em Alta</h1>
                    </div>
                </div>
            </div>
        </div>
    );
}


