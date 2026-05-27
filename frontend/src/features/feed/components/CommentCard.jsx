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
import { toast } from "react-toastify";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/design-system/tokens/colors";
import { LIMITS } from "@/shared/validation/limits";

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
import {
    PROFILE_AUTHOR_NAME_UPDATED,
    mapItemsWithAuthorName,
} from "@/shared/profile/profileAuthorSync";

export default function CommentCard({
    postId,
    incrementCommentCount,
    highlightCommentId = null,
    inModal = false,
}) {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(true);

    const { currentLanguage } = useLanguage();

    const { t } = useTranslation(['feed', 'common']);

    async function handleSubmit(e) {
        e.preventDefault();

        const value = commentText.trim();
        if (!value) {
            toast.error(t('common:errors.comment.empty'));
            return;
        }

        if (commentText.length > LIMITS.commentText) {
            toast.error(t('common:errors.post.tooLong', { max: LIMITS.commentText }));
            return;
        }

        try {
            const newComment = await createComment({
                postId,
                text: value,
            });

            setComments((prev) => [newComment, ...prev]);
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

    useEffect(() => {
        const onAuthorNameUpdated = (event) => {
            const { username, name } = event.detail ?? {};
            if (!username || !name) return;

            setComments((prev) => mapItemsWithAuthorName(prev, username, name));
        };

        window.addEventListener(PROFILE_AUTHOR_NAME_UPDATED, onAuthorNameUpdated);
        return () => {
            window.removeEventListener(PROFILE_AUTHOR_NAME_UPDATED, onAuthorNameUpdated);
        };
    }, []);

    useEffect(() => {
        if (!inModal || highlightCommentId == null || loadingComments) return;
        const id = Number(highlightCommentId);
        if (Number.isNaN(id)) return;

        requestAnimationFrame(() => {
            const el = document.getElementById(`comment-${id}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }, [inModal, highlightCommentId, loadingComments, comments]);

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

    const commentList = (
        <div className="space-y-3">
            {comments.map((comment) => (
                <div
                    key={comment.id ?? `${comment.user_id}-${comment.created_at}`}
                    id={
                        inModal && comment.id != null
                            ? `comment-${comment.id}`
                            : undefined
                    }
                    className={cn(
                        "rounded-xl bg-muted p-3",
                        inModal &&
                        highlightCommentId != null &&
                        Number(comment.id) === Number(highlightCommentId) &&
                        "ring-2 ring-inset ring-primary/60",
                    )}
                >
                    <div className="flex gap-3">
                        <div>
                            <Avatar
                                src={comment.avatarUrl}
                                username={comment.username}
                                name={comment.name}
                                size="md"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm max-w-[200px] sm:max-w-none">
                                <span className="min-w-10 truncate text-foreground transition-colors hover:text-primary sm:truncate-none">
                                    <Link className="truncate" to={`/${comment.username}`}>
                                        {comment.name}
                                    </Link>
                                </span>

                                <span className="truncate text-muted-foreground sm:truncate-none">
                                    @{comment.username}
                                </span>
                                <span
                                    title={new Date(comment.created_at).toLocaleString()}
                                    className="truncate text-muted-foreground sm:truncate-none"
                                >
                                    {getCurrentTime(comment.created_at, currentLanguage)}
                                </span>
                            </div>

                            <div className="mt-2 min-w-0 overflow-hidden break-words leading-relaxed text-foreground [overflow-wrap:anywhere]">
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
    );

    return (
        <div className="space-y-3 pt-2">
            <Separator />
            {loadingComments ? (
                <Loading size="sm" className="min-h-15" />
            ) : comments.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                    {t('comments.empty')}
                </div>
            ) : inModal ? (
                <div className="max-h-[min(20rem,50vh)] overflow-x-hidden overflow-y-auto px-1.5 py-1">
                    {commentList}
                </div>
            ) : (
                <Scroll className="max-h-[20rem]">{commentList}</Scroll>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex items-center justify-end gap-2">
                    <Textarea
                        id="comment-content"
                        name="comment"
                        maxLength={LIMITS.commentText}
                        value={commentText}
                        onChange={(e) => {
                            const next = e.target.value;
                            if (next.length > LIMITS.commentText) return;
                            setCommentText(next);
                        }}
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
