import { useState } from "react";
import PostList from "../components/ui/PostList";
import PostMenu from "../components/ui/PostMenu";

export function Feed() {
    const [posts, setPosts] = useState([]);

    function addPost(postData){
        const newPost = {
            id: Date.now(),
            content: postData.text,
            file: postData.file,
            imageUrl: postData.file ? URL.createObjectURL(postData.file) : null,
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
        <div className="min-h-screen bg-gradient-to-br from-[#edf2f8] via-[#dbe4f0] to-[#b7c9e1] dark:from-slate-950 dark:via-[#0f1824] dark:to-[#1e3048]">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                    <div className="space-y-6">
                        <PostMenu onAddPost={addPost}/>
                        <PostList posts={posts} onLike={handleLike} />
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


