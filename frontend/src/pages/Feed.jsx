import { useState } from "react";
import PostList from "@/features/feed/components/PostList";
import PostMenu from "@/features/feed/PostMenu";
import { createPost } from "@/features/feed/feedService";
import {toast} from 'react-toastify'

import { useTranslation } from "react-i18next";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/design-system";

export function Feed() {

    const [posts, setPosts] = useState([]);

    const { t } = useTranslation('feed');

    async function addPost(postData) {

        const formData = new FormData();

        formData.append("text", postData.text);

        if (postData.file) {
            formData.append("file", postData.file);
        }


        try {

            const resp = await createPost(formData);
            setPosts((prev) => [resp, ...prev]);
        } catch (err) {
            const message = err.response?.data?.message || t("common:errors.post.createFailed");
            toast.error(message);
            console.log(err);
        }

    }

    return (
        <div className="">
            <div className="container">
                <div className="feed-grid">
                    <div className="space-y-6 min-w-0 max-w-full overflow-hidden">
                        <PostMenu onAddPost={addPost} />
                        <PostList posts={posts} setPosts={setPosts} />
                    </div>
                    <aside className="feed-sidebar space-y-6">
                        <Card className="bg-card/90 backdrop-blur-xl border-border">
                            <CardHeader className="pb-0">
                                <CardTitle>{t('sections.onlineFriends')}</CardTitle>
                            </CardHeader>
                            <CardContent />
                        </Card>

                        <Card className="bg-card/90 backdrop-blur-xl border-border">
                            <CardHeader className="pb-0">
                                <CardTitle>{t('sections.trending')}</CardTitle>
                            </CardHeader>
                            <CardContent />
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}


