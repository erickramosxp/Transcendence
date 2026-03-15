import React, { useState } from "react";
import { Heart, Send } from "lucide-react";


import Textarea from "@/design-system/primitives/Textarea";

import { Button } from "@/design-system/primitives/Button";
import { Avatar } from "@/design-system/primitives/Avatar";
import { TextWithLink } from "@/design-system/primitives/TextWithLink";

import { Separator } from "@/design-system/primitives/Separator";

import { Scroll } from "@/design-system/primitives/Scroll";
import { yaleBlue } from "@/design-system/tokens/colors";

import { getCurrentTime } from "@/shared/getCurrentTime";


export default function CommentCard({ post, onAddComment, onCommentLike }) {
    const comments = post.comments ?? [];
    const [commentText, setCommentText] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        const value = commentText.trim();
        if (!value) return;

        onAddComment?.(post.id, { text: value });
        setCommentText("");
    }
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
                            <div key={comment.id ?? comment.user_id + comment.date_time} className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                                <div className="flex gap-3">

                                <Avatar
                                    src={comment.user_profile_photo}
                                    name={comment.name}
                                    size="MD"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={yaleBlue.text.hover}>
                                            {comment.name}
                                        </span>

                                        <span className="text-slate-500">
                                            @{comment.user_username}
                                        </span>

                                        <span className="text-slate-400">
                                            {getCurrentTime(post.date_time)}
                                        </span>
                                    </div>
                                    <div className="mt-2 leading-relaxed">
                                        <TextWithLink text={comment.content} />
                                    </div>
                                    <div className="flex items-center gap-6 mt-3 text-slate-500">
                                        <button
                                            onClick={() => onCommentLike?.(post.id, comment.id)}
                                            className={`flex items-center gap-2 text-sm transition-all hover:scale-105 ${comment.likedByMe
                                                ? 'text-pink-600 dark:text-pink-400'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400'
                                                }`}
                                        >
                                            <Heart className={`h-5 w-5 ${comment.likedByMe ? 'fill-current' : ''}`} />
                                            {comment.likes}
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
                            className="bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091] hover:from-[#4a78b5] hover:via-[#3b6091] hover: to[#2c486d] shadow-lg shadow-[#4a78b5]/50 h-9"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
