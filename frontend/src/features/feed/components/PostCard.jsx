import React from "react";
import { Link } from 'react-router-dom'
import { Heart, MessageSquare } from "lucide-react";
import { getCurrentTime } from "@/shared/getCurrentTime";
import  CommentCard  from "@/features/feed/components/CommentCard";
import { cn } from "@/design-system/tokens/colors";
import { yaleBlue } from "@/design-system/tokens/colors";

import { Avatar, TextWithLink, Media } from "@/design-system"

//     {
//   "items": [
//     {
//       "id": 0,
//       "name": "string",
//       "userName": "string",
//       "contents": "string",
//       "avatarUrl": "string",
//       "likedByMe": true,
//       "likeCount": 0,
//       "commentCount": 0,
//       "media": "string",
//       "created_at": "2022-03-10T12:15:50-04:00"
//     }
//   ],
//   "page": 0,
//   "size": 0,
//   "hasMore": true
// }

function PostCard({ post, onLike, onToggleComments, activeCommentsPostId, incrementCommentCount, className }) {


	return (

		<div className={cn(
			"bg-card rounded-2xl shadow-md p-3 sm:p-4",
			className)}>
			<div className="flex gap-3 sm:gap-4 min-w-0">
				<div>
					<Avatar
						src={post.avatarUrl}
						name={post.name}
						username={post.userName}
						size="lg"
						className="shrink-0"
					/>
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
						<span className={yaleBlue.text.hover + " truncate max-w-[120px] sm:max-w-none"}>
							<Link className='truncate' to={`/${post.userName}`}>
								{post.name}
							</Link>
						</span>
						<span className="text-slate-500 truncate max-w-[100px] sm:max-w-none" title={`@${post.userName}`}>
							@{post.userName}
						</span>
						<span title={new Date(post.created_at).toLocaleString()} className="text-slate-400 shrink-0 truncate">
							{getCurrentTime(post.created_at)}
						</span>
					</div>

					<div className="mt-2 text-stone-700 dark:text-stone-300 leading-relaxed break-words overflow-hidden">
						<TextWithLink text={post.contents} />
					</div>

					{post.linkPreview && (
						<a
							href={post.linkPreview.url}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-2 block rounded-lg border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
						>
							<div className="flex gap-3 p-3">
								{post.linkPreview.image && (
									<img
										src={post.linkPreview.image}
										alt={post.linkPreview.title}
										className="w-20 h-20 object-cover rounded-md shrink-0"
									/>
								)}
								<div className="min-w-0 flex-1">
									<h3 className="text-sm font-medium text-stone-800 line-clamp-2">
										{post.linkPreview.title}
									</h3>
									{post.linkPreview.description && (
										<p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
											{post.linkPreview.description}
										</p>
									)}
								</div>
							</div>
						</a>
					)}
					<Media 
						url={post.media} 
    					mimeType={post.mimeType} 
					/>
					<div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3 text-slate-500">
						<button
							onClick={() => onLike(post.id)}
							className={`flex items-center gap-2 text-sm transition-all hover:scale-105 ${post.likedByMe
								? 'text-pink-600 dark:text-pink-400'
								: 'text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400'
								}`}
						>
							<Heart className={`h-5 w-5 ${post.likedByMe ? 'fill-current' : ''}`} />
							{post.likeCount}
						</button>
						<button
							onClick={() => onToggleComments(post.id)}
							className={`flex items-center gap-2 text-sm transition-all hover:scale-105 ${activeCommentsPostId
									? "text-[#4a78b5] dark:text-[#6e93c4]"
									: "text-slate-500 dark:text-slate-400 hover:text-[#4a78b5] dark:hover:text-[#6e93c4]"
								}`}						>
							<MessageSquare className="h-5 w-5" />
							<span className="font-medium">{post.commentCount ?? post.comments?.length ?? 0}</span>
						</button>
					</div>
				</div>
			</div>
				{activeCommentsPostId === post.id && (
					<div className="px-4 pb-4">
						<CommentCard postId={post.id} incrementCommentCount={incrementCommentCount}/>
					</div>
				)}
		</div>
	);
}

export default PostCard;
