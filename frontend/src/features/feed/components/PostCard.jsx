import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { getCurrentTime } from "@/shared/getCurrentTime";
import CommentCard from "@/features/feed/components/CommentCard";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/design-system/tokens/colors";

import { Avatar, TextWithLink, Media, LikeButton } from "@/design-system";


function PostCard({
	post,
	onLike,
	onToggleComments,
	activeCommentsPostId,
	incrementCommentCount,
	className,
}) {

	const { currentLanguage } = useLanguage();
	const commentsOpen = activeCommentsPostId === post.id;

	return (
		<div className={cn("rounded-2xl bg-card p-3 shadow-md sm:p-4", className)}>
			<div className="flex min-w-0 gap-3 sm:gap-4">
				<div>
					<Avatar
						src={post.avatarUrl}
						name={post.name}
						username={post.username}
						size="lg"
						className="shrink-0"
					/>
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
						<span className="max-w-[120px] truncate text-foreground transition-colors hover:text-primary sm:max-w-none">
							<Link className="truncate" to={`/${post.username}`}>
								{post.name}
							</Link>
						</span>

						<span
							className="max-w-[100px] truncate text-muted-foreground sm:max-w-none"
							title={`@${post.username}`}
						>
							@{post.username}
						</span>
						<span
							title={new Date(post.created_at).toLocaleString()}
							className="shrink-0 truncate text-muted-foreground"
						>
							{getCurrentTime(post.created_at, currentLanguage)}
						</span>
					</div>

					<div className="mt-2 break-words overflow-hidden leading-relaxed text-foreground">
						<TextWithLink text={post.contents} />
					</div>

					{
						post.linkPreview && (
							<a
								href={post.linkPreview.url}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-2 block overflow-hidden rounded-lg border border-border transition-colors hover:bg-accent/40"
							>
								<div className="flex gap-3 p-3">
									{post.linkPreview.image && (
										<img
											src={post.linkPreview.image}
											alt={post.linkPreview.title}
											className="h-20 w-20 shrink-0 rounded-md object-cover"
										/>
									)}

									<div className="min-w-0 flex-1">
										<h3 className="line-clamp-2 text-sm font-medium text-foreground">
											{post.linkPreview.title}
										</h3>

										{post.linkPreview.description && (
											<p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
												{post.linkPreview.description}
											</p>
										)}
									</div>
								</div>
							</a>
						)
					}

					<Media url={post.media} mimeType={post.mimeType} />

					<div className="mt-3 flex flex-wrap items-center gap-4 text-muted-foreground sm:gap-6">
						<LikeButton
							onClick={() => onLike(post.id)}
							liked={post.likedByMe}
							count={post.likeCount}
						/>
						<button
							onClick={() => onToggleComments(post.id)}
							className={cn(
								"flex items-center gap-2 text-sm transition-all hover:scale-105",
								commentsOpen
									? "text-primary"
									: "text-muted-foreground hover:text-primary"
							)}
						>
							<MessageSquare className="h-5 w-5" />
							<span className="font-medium">
								{post.commentCount ?? post.comments?.length ?? 0}
							</span>
						</button>
					</div>
				</div >
			</div >

			{commentsOpen && (
				<div className="px-4 pb-4">
					<CommentCard
						postId={post.id}
						incrementCommentCount={incrementCommentCount}
					/>
				</div>
			)
			}
		</div >
	);
}

export default PostCard;