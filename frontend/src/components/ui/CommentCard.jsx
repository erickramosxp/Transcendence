import React, { useState } from "react";
import { Button } from "./Button";
import Textarea from "./Textarea";
import { Avatar } from "./Avatar";
import { yaleBlue } from "../utils/colors";
import { TextWithLink } from "./TextWithLink";
import { Send } from "lucide-react";
import { Separator } from "./Separator";
import { getCurrentTime } from "../../shared/getCurrentTime";
import { Scroll } from "./Scroll";


function CommentCard({ post, onAddComment }) {
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
                {comments.map((comment) => (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                        <div className="flex gap-4">

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
                                <div className="mt-2 text-stone-700 leading-relaxed">
                                    <TextWithLink text={comment.content} />
                                </div>

                            </div>
                        </div>
                    </div>
                    ))}
                </Scroll>
            )}
            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex items-center justify-end gap-2">
                    <Textarea
                        maxLength={500}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
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

export default CommentCard;
