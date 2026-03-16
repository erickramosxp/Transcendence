import PostCard from "@/features/feed/components/PostCard";
import { Card } from "@/design-system/primitives/Card";

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
			{posts && posts.length === 0 ? (
				<div className="text-center text-gray-500 dark:text-gray-400 py-8">
					Nada por aqui ainda.<br/>
					Seja o primeiro a compartilhar algo ✨
				</div>
			) : (
				<>
					{posts && posts.map((post) => (
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
					{!hasMore && (
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
