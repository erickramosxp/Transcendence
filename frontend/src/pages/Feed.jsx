import { useState } from "react";
import PostList from "@/features/feed/components/PostList";
import PostMenu from "@/features/feed/PostMenu";
import { createPost } from "@/features/feed/feedService";
import { toast } from 'react-toastify'

import { useTranslation } from "react-i18next";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    UserListItem,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/design-system";
import { usePresenceStore } from "@/features/friends/store/usePresenceStore";
import { getImageDimensions } from "@/shared/getImageDimensions";
import { generateResizedBlob } from "@/shared/generateResizedBlob";
import { MomentNewsCard } from "@/features/editorial/components/MomentNewsCard";

const ONLINE_FRIENDS_MAX_VISIBLE = 5;
const ONLINE_FRIENDS_LIST_MAX_HEIGHT = "max-h-[17.5rem]";

export function Feed() {

    const [socialPosts, setSocialPosts] = useState([]);
    const [feedTab, setFeedTab] = useState("social");
    const usersPresence = usePresenceStore((state) => state.usersPresence);

    const usersOnline = Object.values(usersPresence).filter((user) => user?.online)
    const hasOnlineFriends = usersOnline.length > 0
    const onlineFriendsNeedsScroll = usersOnline.length > ONLINE_FRIENDS_MAX_VISIBLE

    const { t } = useTranslation('feed');


    async function addPost(postData, setLoadingPercent) {

        const formData = new FormData();

        formData.append("text", postData.text);

        if (postData.file) {
            formData.append("file", postData.file);
            if (postData.fileType == "photo") {
                const { width, height } = await getImageDimensions(postData.file);
                formData.append("width", width);
                formData.append("height", height);
                const previewBlob = await generateResizedBlob(postData.file, 400, 400, 0.6);
                formData.append("previewFile", new File([previewBlob], "preview.jpg", { type: 'image/jpeg' }));
                const blurBlob = await generateResizedBlob(postData.file, 20, 20, 0.1);
                formData.append("blurFile", new File([blurBlob], "blur.jpg", { type: 'image/jpeg' }));
            }
        }


        try {

            const resp = await createPost(formData, setLoadingPercent);
            setSocialPosts((prev) => [resp, ...prev]);
            setFeedTab("social");
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

                        <Tabs value={feedTab} onValueChange={setFeedTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="social">
                                    {t('feedTabs.feed')}
                                </TabsTrigger>
                                <TabsTrigger value="news">
                                    {t('feedTabs.news')}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="social" className="mt-6">
                                <PostList
                                    scope="social"
                                    posts={socialPosts}
                                    setPosts={setSocialPosts}
                                />
                            </TabsContent>

                            <TabsContent value="news" className="mt-6">
                                <PostList scope="news" />
                            </TabsContent>
                        </Tabs>
                    </div>
                    <aside className="feed-sidebar space-y-6">
                        <Card className="bg-card/90 backdrop-blur-xl border-border">
                            <CardHeader className="pb-0">
                                <CardTitle>{t('sections.onlineFriends')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hasOnlineFriends ? (
                                    <div
                                        className={
                                            onlineFriendsNeedsScroll
                                                ? `${ONLINE_FRIENDS_LIST_MAX_HEIGHT} overflow-y-auto pr-1`
                                                : undefined
                                        }
                                    >
                                        {usersOnline.map((user) => (
                                            <UserListItem
                                                key={user.userId}
                                                user={user}
                                                onClick={() => { }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                        {t('sections.onlineFriendsEmpty')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <div className="hidden lg:block">
                            <MomentNewsCard />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
