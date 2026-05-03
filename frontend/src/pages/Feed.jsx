import { useEffect, useState } from "react";
import PostList from "@/features/feed/components/PostList";
import PostMenu from "@/features/feed/PostMenu";
import { createPost } from "@/features/feed/feedService";
import { toast } from 'react-toastify'
import { getListOnlineFriends } from "@/features/friends/service/friendService";

import { useTranslation } from "react-i18next";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Loading,
    UserListItem
} from "@/design-system";
import { usePresenceStore } from "@/features/friends/store/usePresenceStore";

export function Feed() {

    const [posts, setPosts] = useState([]);
    // const [usersOnline, setUsersOnline] = useState(null);
    const [loadingUsersOnline, setLoadingUsersOnline] = useState(true);
    const usersPresence = usePresenceStore((state) => state.usersPresence);

    const usersOnline = Object.values(usersPresence)

    const { t } = useTranslation('feed');

    // useEffect(() => {

    //     // const getOnlineUsers = async () => {

    //     //     // :{"userId":6,"name":"teste2","username":"teste2","avatarUrl":null,"online":true,"lastSeenAt":"2026-04-24T19:40:22.388376212Z"}
    //     //     try {
    //     //         const resp = await getListOnlineFriends();
    //     //         setUsersOnline(resp.data.items);
    //     //     } finally {
    //     //         setLoadingUsersOnline(false);
    //     //     }
    //     // }

    //     // getOnlineUsers();

    //     setUsersOnline(Object.values(usersPresence));
    //     setLoadingUsersOnline(false)

    // }, [usersPresence]);

    async function addPost(postData, setLoadingPercent) {

        const formData = new FormData();

        formData.append("text", postData.text);

        if (postData.file) {
            formData.append("file", postData.file);
        }


        try {

            const resp = await createPost(formData, setLoadingPercent);
            setPosts((prev) => [resp, ...prev]);
        } catch (err) {
            let message = t("common:errors.post.createFailed");

            if (err.response) {
                const code = err.response.status;
                message = t(`common:errors.network.${code}`, {
                    defaultValue: t("common:errors.network.500")
                });
            } else if (err.request) {
                message = t(`common:errors.network.generic`);
            }
            toast.error(message);
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
                            <CardContent>
                                {usersOnline && usersOnline.map((user, index) => (
                                    <UserListItem 
                                        key={user?.userId + index}
                                        user={user}
                                        onClick={() => {}}
                                    />
                                ))}
                            </CardContent>
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


