import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Trash2 } from "lucide-react";
import { getCurrentTime } from "@/shared/getCurrentTime";
import CommentCard from "@/features/feed/components/CommentCard";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/design-system/tokens/colors";
import { useTranslation } from "react-i18next";

import { Card, Avatar, TextWithLink, Media, LikeButton, Dropdown } from "@/design-system";
import { useAuth } from "@/app/providers/AuthProvider";


function PostCard({
	post,
	onLike,
	onToggleComments,
	activeCommentsPostId,
	incrementCommentCount,
	className,
	isModal = false,
	onDelete
}) {

	const { currentLanguage } = useLanguage();
	const commentsOpen = activeCommentsPostId === post.id;
	const { user } = useAuth();
	const [isDeleting, setIsDeleting] = useState(false);
	const { t } = useTranslation('feed');

	const handleDelete = () => {
		setIsDeleting(true);

		setTimeout(async () => {
			try {
				await onDelete(post.id);

			} catch {
				setIsDeleting(false);
			}
		}, 700);
	};

	const dowpDownItems = [
		user.username === post.username && {
			label: t('posts.dropdown.delete'),
			onClick: handleDelete,
			danger: true,
			icon: <Trash2 size="16" />,
		},
	].filter(Boolean);

	const deleteAnimationClass = isDeleting
		? "opacity-0 blur-md scale-95 max-h-0 !p-0 !m-0 !border-transparent pointer-events-none"
		: "opacity-100 blur-0 scale-100 max-h-[1500px]";

	return (
		<Card
			data-testid="post-card"
			className={cn(
				!isModal && "border-border bg-card/90 backdrop-blur-xl shadow-xl p-3 sm:p-4 ",
				!isModal && "transform-gpu transition-all duration-700 ease-in-out origin-top",
				deleteAnimationClass,
				isModal && "border-none shadow-none bg-transparent",
				className
			)}
		>
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
					<div className="flex items-center">
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
						<div className="ml-auto mr-2">
							{!isModal &&
								<Dropdown
									items={dowpDownItems}
								/>
							}
						</div>
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
		</Card>
	);
}

export default PostCard;