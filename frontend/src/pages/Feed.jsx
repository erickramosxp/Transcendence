import { useState } from "react";
import PostList from "@/features/feed/components/PostList";
import PostMenu from "@/features/feed/PostMenu";
import { createPost } from "@/features/feed/feedService";
import { useTranslation } from "react-i18next";

export function Feed() {

    const [posts, setPosts] = useState([]);
    // {
    //      "text": "string",
    //      "mediaUrl": "string"
    // }
    const { t } = useTranslation('feed');
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

    return (
        <div className="feed-background">
            <div className="container">
                <div className="feed-grid">
                    <div className="space-y-6 min-w-0 max-w-full overflow-hidden">
                        <PostMenu onAddPost={addPost}/>
                        <PostList posts={posts} setPosts={setPosts}/>
                    </div>
                    <div className="feed-sidebar space-y-6">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg p-4 border border-slate-200/50 dark:border-slate-800/50">
                            <h2 className="text-lg font-semibold mb-4">{t('sections.onlineFriends')}</h2>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg p-4 border border-slate-200/50 dark:border-slate-800/50">
                            <h2 className="text-lg font-semibold mb-4">{t('sections.trending')}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


