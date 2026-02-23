import { useState } from "react";
import PostList from "../components/ui/PostList";
import PostMenu from "../components/ui/PostMenu";
import { useAuth } from "../app/providers/AuthProvider";

export function Feed() {
    const [posts, setPosts] = useState([]);
    const {user} = useAuth();

    function addPost(postData){
        const newPost = {
            name: user.name,
            username:"user_name",
            userPhoto:"https://kwaksf.com/cdn/shop/files/Swimmer_with_drink_Rubber_Duck.png?v=1749514215&width=990",
            id: Date.now(),
            content: postData.text,
            file: postData.file,
            imageUrl: postData.file ? URL.createObjectURL(postData.file) : null,
            fileType:postData.fileType,
            likes: 0,
            isLiked: false,
            date_time:Date.now(),
        };

        setPosts([newPost, ...posts]);
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
    return (
        <div className="feed-background">
            <div className="container">
                <div className="feed-grid">
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


