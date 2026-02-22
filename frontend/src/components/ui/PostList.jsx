import PostCard from "./PostCard";
import { Card } from "./Card";

function PostList({ posts, onLike }) {
	return (
		<div className="space-y-8">
			{posts.map((post) => (

				<Card className=" border-slate-200/50 dark:border-slate-800/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
					<PostCard
						key={post.id}
						post={post}
						onLike={onLike}
					/>

				</Card>

			))}
		</div>
	);
}

export default PostList;
