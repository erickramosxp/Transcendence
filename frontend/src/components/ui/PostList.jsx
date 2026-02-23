import PostCard from "./PostCard";
import { Card } from "./Card";

function PostList({ posts, onLike }) {
	return (
		<div className="space-y-8">
			{posts.length === 0 ? (
				<div className="text-center text-gray-500 dark:text-gray-400 py-8">
					Nada por aqui ainda.<br/>
					Seja o primeiro a compartilhar algo ✨
				</div>
			) : (
				posts.map((post) => (
					<Card className=" border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
						<PostCard
							key={post.id}
							post={post}
							onLike={onLike}
						/>
					</Card>
				))
			)}
		</div>
	);
}

export default PostList;
