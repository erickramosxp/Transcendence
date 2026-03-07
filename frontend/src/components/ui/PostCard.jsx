import React from "react";
import { yaleBlue } from "../utils/colors";
import { Heart, MessageSquare } from "lucide-react";
import { Avatar } from "../ui/Avatar"
import { TextWithLink } from "../ui/TextWithLink";
import CommentCard from "./CommentCard";
import { getCurrentTime } from "../../shared/getCurrentTime";

function PostCard({ post, onAddComment, onLike, onToggleComments, activeCommentsPostId}) {
	


	return (

		<div className="bg-white rounded-2xl shadow-md p-4">
			<div className="flex gap-4">
				<Avatar
					src={post.userPhoto}
					name={post.name}
					size="lg"
				/>
				<div className="flex-1">
					<div className="flex items-center gap-2 text-sm">
						<span className={yaleBlue.text.hover}>
							{post.name}
						</span>

						<span className="text-slate-500">
							@{post.username}
						</span>

						<span className="text-slate-400">
							{getCurrentTime(post.date_time)}
						</span>
					</div>

					<div className="mt-2 text-stone-700 leading-relaxed">
						<TextWithLink text={post.content} />
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

					{post.imageUrl && (
						post.fileType === "video" ? (
							<video
								src={post.imageUrl}
								controls
								style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px' }}
							/>
						) : (
							<img
								src={post.imageUrl}
								alt="Post attachment"
								style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px' }}
							/>
						)
					)}
					<div className="flex items-center gap-6 mt-3 text-slate-500">
						<button
							onClick={() => onLike(post.id)}
							className={`flex items-center gap-2 text-sm transition-all hover:scale-105 ${post.isLiked
								? 'text-pink-600 dark:text-pink-400'
								: 'text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400'
								}`}
						>
							<Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
							{post.likes}
						</button>
						<button
							onClick={() => onToggleComments(post.id)}
							className={`flex items-center gap-2 text-sm transition-all hover:scale-105 ${activeCommentsPostId
									? "text-[#4a78b5] dark:text-[#6e93c4]"
									: "text-slate-500 dark:text-slate-400 hover:text-[#4a78b5] dark:hover:text-[#6e93c4]"
								}`}						>
							<MessageSquare className="h-5 w-5" />
							<span className="font-medium">{post.countComments}</span>
						</button>
					</div>
				</div>
			</div>
				{activeCommentsPostId === post.id && (
					<div className="px-4 pb-4">
						<CommentCard post={post} onAddComment={onAddComment} />
					</div>
				)}
		</div>
	);
}

export default PostCard;
