import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import {
    getComments,
    likeComment,
    unlikeComment,
    createComment,
} from "../feedService";
import { getCurrentTime } from "@/shared/getCurrentTime";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

import {
    Button,
    Textarea,
    Avatar,
    TextWithLink,
    Separator,
    Scroll,
    Loading,
    LikeButton
} from "@/design-system";

export default function CommentCard({ postId, incrementCommentCount }) {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(true);

    const { currentLanguage } = useLanguage();

    const { t } = useTranslation('feed');

    async function handleSubmit(e) {
        e.preventDefault();

        const value = commentText.trim();
        if (!value) return;

        try {
            const newComment = await createComment({
                postId,
                text: value,
            });

            setComments((prev) => [...prev, newComment]);
            setCommentText("");
            incrementCommentCount(postId);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const requestComments = async () => {
            setLoadingComments(true);

            try {
                const data = await getComments(postId);
                const resp = data.data ?? data;
                setComments(resp.items ?? []);
            } catch (err) {
                console.log(err);
            } finally {
                setLoadingComments(false);
            }
        };

        requestComments();
    }, [postId]);

    const handleToggleLike = async (commentId) => {
        const targetComment = comments.find((c) => c.id === commentId);
        if (!targetComment) return;

        const liked = targetComment.likedByMe;

        setComments((prev) =>
            prev.map((c) =>
                c.id === commentId
                    ? {
                        ...c,
                        likedByMe: !c.likedByMe,
                        likeCount: c.likedByMe ? c.likeCount - 1 : c.likeCount + 1,
                    }
                    : c
            )
        );

        try {
            if (liked) {
                await unlikeComment(commentId);
            } else {
                await likeComment(commentId);
            }
        } catch (err) {
            console.error(err);

            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId
                        ? {
                            ...c,
                            likedByMe: liked,
                            likeCount: liked ? c.likeCount + 1 : c.likeCount - 1,
                        }
                        : c
                )
            );
        }
    };

    return (
        <div className="space-y-3 pt-2">
            <Separator />
            {loadingComments ? (
                <Loading size="sm" className="min-h-15" />
            ) : comments.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                    {t('comments.empty')}
                </div>
            ) : (
                <Scroll className="max-h-[20rem]">
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <div
                                key={comment.id ?? `${comment.user_id}-${comment.created_at}`}
                                className="rounded-xl bg-muted p-3"
                            >
                                <div className="flex gap-3">
                                    <div>
                                        <Avatar
                                            src={comment.avatarUrl}
                                            username={comment.userName}
                                            name={comment.name}
                                            size="md"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-sm max-w-[200px] sm:max-w-none">
                                            <span className="min-w-10 truncate text-foreground transition-colors hover:text-primary sm:truncate-none">
                                                <Link className="truncate" to={`/${comment.userName}`}>
                                                    {comment.name}
                                                </Link>
                                            </span>

                                            <span className="truncate text-muted-foreground sm:truncate-none">
                                                @{comment.userName}
                                            </span>
                                            <span
                                                title={new Date(comment.created_at).toLocaleString()}
                                                className="truncate text-muted-foreground sm:truncate-none"
                                            >
                                                {getCurrentTime(comment.created_at, currentLanguage)}
                                            </span>
                                        </div>

                                        <div className="mt-2 leading-relaxed text-foreground">
                                            <TextWithLink text={comment.contents} />
                                        </div>

                                        <div className="mt-3 flex items-center gap-6 text-muted-foreground">
                                            <LikeButton 
                                                onClick={() => handleToggleLike(comment.id)}
                                                liked={comment.likedByMe}
                                                count={comment.likeCount}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Scroll>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex items-center justify-end gap-2">
                    <Textarea
                        maxLength={500}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder={t('comments.placeholder')}
                        className="min-h-[40px] resize-none"
                    />

                    <Button type="submit" variant="primary" size="sm">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}