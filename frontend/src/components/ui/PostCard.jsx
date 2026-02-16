
function PostCard ({ post, onLike }) {
	return (
		<div>
			<p>{post.content}</p>
			<button onClick={() => onLike(post.id)}>
				Curtir ({post.likes})
			</button>
		</div>
	);
}

export default PostCard;
