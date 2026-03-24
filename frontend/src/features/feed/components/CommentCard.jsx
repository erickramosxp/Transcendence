import React, { useEffect, useState } from "react";
import { Heart, Send } from "lucide-react";


import Textarea from "@/design-system/primitives/Textarea";

import { Button } from "@/design-system/primitives/Button";
import { Avatar } from "@/design-system/primitives/Avatar";
import { TextWithLink } from "@/design-system/primitives/TextWithLink";

import { Separator } from "@/design-system/primitives/Separator";

import { Scroll } from "@/design-system/primitives/Scroll";
import { yaleBlue } from "@/design-system/tokens/colors";

import { getCurrentTime } from "@/shared/getCurrentTime";
import { getComments, likeComment, unlikeComment, createComment } from "../feedService";
import { Link } from 'react-router-dom'

// {
//   "items": [
//     {
//       "id": 0,
//       "name": "string",
//       "userName": "string",
//       "contents": "string",
//       "avatarUrl": "string",
//       "likedByMe": true,
//       "likeCount": 0,
//       "created_at": "2022-03-10T12:15:50-04:00"
//     }
//   ]
// }

// definir commnetCout ao fazer um novo comentario

export default function CommentCard({ postId, incrementCommentCount }) {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        const value = commentText.trim();
        if (!value) return;

        handleCreateComment();
    }

    const handleCreateComment = async () => {

        // trocar para definir no frontend primeiro e depois fazer a requisição
        try {

            const newComment = await createComment({postId: postId, text: commentText});

            setComments(prev => [...prev, newComment]);

            setCommentText("");
            incrementCommentCount(postId);

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {

        const requestComments = async () => {
            try {

                const data = await getComments(postId);
                const resp = data.data;
                setComments(resp.items);

            } catch (err) {
                console.log(err);
            }
        }

        requestComments();

    }, []);

    const handleToggleLike = async (commentId) => {

        try {

            const liked = comments.find(c => c.id == commentId).likedByMe;

            setComments(prev =>
                prev.map(c =>
                    c.id === commentId
                        ? {
                            ...c,
                            likedByMe: !c.likedByMe,
                            likeCount: c.likedByMe
                                ? c.likeCount - 1
                                : c.likeCount + 1
                        }
                        : c
                )
            );

            if (liked) {
                await unlikeComment(commentId);
            } else {
                await likeComment(commentId);
            }


        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="pt-2 space-y-3">
            <Separator />
            {comments.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Sem comentários
                </div>
            ) : (
                <Scroll className="max-h-50">
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <div key={comment.id ?? comment.user_id + comment.created_at} className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                                <div className="flex gap-3">
                                    <div>
                                        <Avatar
                                            src={comment.avatarUrl}
                                            username={comment.userName}
                                            name={comment.name}
                                            size="MD"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm max-w-[200px] sm:max-w-none">
                                            <span className={`${yaleBlue.text.hover} truncate min-w-10 sm:truncate-none`}>
                                                <Link className='truncate' to={`/${comment.userName}`}>
                                                    {comment.name}
                                                </Link>
                                            </span>

                                            <span className="text-slate-500 truncate sm:truncate-none">
                                                @{comment.userName}
                                            </span>

                                            <span title={new Date(comment.created_at).toLocaleString()} className="text-slate-400 truncate sm:truncate-none">
                                                {getCurrentTime(comment.created_at)}
                                            </span>
                                        </div>
                                        <div className="mt-2 leading-relaxed">
                                            <TextWithLink text={comment.contents} />
                                        </div>
                                        <div className="flex items-center gap-6 mt-3 text-slate-500">
                                            <button
                                                onClick={() => handleToggleLike(comment.id)}
                                                className={`flex items-center gap-2 text-sm transition-all hover:scale-105 ${comment.likedByMe
                                                    ? 'text-pink-600 dark:text-pink-400'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400'
                                                    }`}
                                            >
                                                <Heart className={`h-5 w-5 ${comment.likedByMe ? 'fill-current' : ''}`} />
                                                {comment.likeCount}
                                            </button>

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
                        placeholder="Escreva um comentário..."
                        className="min-h-[40px] resize-none"
                    />
                    <div>
                        <Button
                            onClick={handleSubmit}
                            size="sm"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
