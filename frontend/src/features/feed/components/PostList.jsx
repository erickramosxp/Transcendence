import PostCard from "@/features/feed/components/PostCard";
import { Card } from "@/design-system/primitives/Card";

function PostList({
	posts,
	sentinelRef,
	isLoadingMore,
	hasMore,
	onAddComment,
	onLike,
	onCommentLike,
	onToggleComments,
	activeCommentsPostId,
}) {
	return (
		<div className="space-y-8">
			{posts.length === 0 ? (
				<div className="text-center text-gray-500 dark:text-gray-400 py-8">
					Nada por aqui ainda.<br/>
					Seja o primeiro a compartilhar algo ✨
				</div>
			) : (
				<>
					{posts.map((post) => (
						<Card
							key={post.id}
							className=" border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
						>
							<PostCard
								post={post}
								onLike={onLike}
								onAddComment={onAddComment}
								onCommentLike={onCommentLike}
								onToggleComments={onToggleComments}
								activeCommentsPostId={activeCommentsPostId}
							/>
						</Card>
					))}
					<div ref={sentinelRef} className="h-4" aria-hidden />
					{isLoadingMore && (
						<div className="text-center text-slate-500 dark:text-slate-400 py-4">
							Carregando mais…
						</div>
					)}
					{!hasMore && posts.length > 0 && (
						<div className="text-center text-slate-400 dark:text-slate-500 py-4 text-sm">
							Você chegou ao fim do feed
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default PostList;
