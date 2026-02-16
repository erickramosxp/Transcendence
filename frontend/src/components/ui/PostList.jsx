import PostCard from "./PostCard";
import { Card } from "./Card";

function PostList({ posts, onLike }) {
	return (
		<div>
			{posts.map((post) => (
				<Card>
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
